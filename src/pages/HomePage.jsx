import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ReservationContactSection from '../components/ReservationContactSection';
import TourSelectionSection from '../components/TourSelectionSection';
import DateSelectionSection from '../components/DateSelectionSection';
import TimeSelectionSection from '../components/TimeSelectionSection';
import CompanionFormSection from '../components/CompanionFormSection';
import PaymentModal from '../components/PaymentModal';
import WelcomeModal from '../components/WelcomeModal';
import { saveParticipantsForReservation } from '../services/participantService';
import { createReservation } from '../services/reservationService';
import { getCountryName } from '../utils/countries';
import { CountryFlagImg } from '../utils/CountryFlagImg.jsx';

const HomePage = ({
  isModalOpen,
  onModalComplete,
  onCloseModal,
  onOpenModal,
  theme,
  toggleTheme,
  tours,
  loadingData,
  reservationData,
  handleContactChange,
  handleTourSelect,
  handleDateSelect,
  handleTimeSelect,
  handleStep1AddCompanions,
  handleStep1ReserveAlone,
  handleStep2Continue,
  showSummary,
  setShowSummary,
  handleEditInformation,
  handleAddCompanions,
  setShowCompanionsSection,
  addCompanion,
  removeCompanion,
  handleCompanionChange,
  errors,
  contactRef,
  tourRef,
  dateRef,
  timeRef,
  currentStep,
  setCurrentStep
}) => {
  const { t, i18n } = useTranslation();
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const calculateAge = (birthDateStr) => {
    if (!birthDateStr) return null;
    const birthDate = new Date(birthDateStr);
    if (isNaN(birthDate.getTime())) return null;
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age >= 0 ? age : null;
  };

  const handleProceedToPayment = async () => {
    setIsSaving(true);
    try {
      const normalizePhoneForParticipant = (phone) => {
        if (!phone) return ''
        return phone.toString().replace(/\s+/g, '').replace(/^\+/, '')
      }

      const totalParticipants = 1 + (reservationData.companions?.length || 0);
      const totalPrice = (reservationData.tour.precio_por_persona || 0) * totalParticipants;

      const reservationPayload = {
        id_plan: reservationData.tour.id_plan,
        fecha_reserva: reservationData.date.fecha_reserva,
        hora_reserva: reservationData.time.hora_reserva,
        telefono_cliente: reservationData.contact.telefono_cliente,
        cantidad_personas: totalParticipants,
        aprobado: false,
        fecha_solicitud: new Date().toISOString(),
        fecha_aprobacion: null
      };

      const { data: reservationCreated, error: reservationError } = await createReservation(reservationPayload);

      if (reservationError) {
        console.error('Error al crear la reserva en Supabase:', reservationError);
        alert('Hubo un error al crear la reserva. Por favor intenta de nuevo.');
        return;
      }

      const reservationId = reservationCreated?.id_reserva
      if (!reservationId) {
        console.error('Reserva creada sin id_reserva:', reservationCreated);
        alert('No se pudo obtener el identificador de la reserva. Por favor intenta de nuevo.');
        return;
      }

      const headParticipant = {
        telefono_cliente: reservationData.contact.telefono_cliente,
        nombre: reservationData.contact.nombre_jefe_reserva,
        tipo_documento: reservationData.contact.tipo_documento,
        numero_documento: reservationData.contact.numero_documento,
        telefono_participante: normalizePhoneForParticipant(reservationData.contact.telefono_cliente),
        correo: reservationData.contact.correo_contacto,
        nacionalidad: reservationData.contact.nacionalidad,
        edad: calculateAge(reservationData.contact.fecha_nacimiento)
      };

      const companionsParticipants = (reservationData.companions || []).map(companion => ({
        telefono_cliente: reservationData.contact.telefono_cliente,
        nombre: companion.nombre,
        tipo_documento: companion.tipo_documento,
        numero_documento: companion.numero_documento,
        telefono_participante: companion.telefono,
        correo: companion.correo,
        nacionalidad: companion.nacionalidad,
        edad: calculateAge(companion.fecha_nacimiento)
      }));

      const participantsToSave = [headParticipant, ...companionsParticipants];

      const { data, error } = await saveParticipantsForReservation(participantsToSave, reservationId);

      if (error) {
        console.error('Error al guardar participantes en Supabase:', error);
        alert('Hubo un error al guardar la información de los participantes. Por favor intenta de nuevo.');
        return;
      }

      console.log('Reserva creada:', reservationCreated);
      console.log('Participantes guardados:', data);
      console.log('Total:', totalPrice);

      setIsPaymentModalOpen(true);
    } catch (err) {
      console.error('Error inesperado al procesar participantes:', err);
      alert('Ocurrió un error inesperado. Por favor intenta de nuevo.');
    } finally {
      setIsSaving(false);
    }
  };

  const totalParticipants = 1 + (reservationData.companions?.length || 0);
  const totalPrice = (reservationData.tour.precio_por_persona || 0) * totalParticipants;
  const depositAmount = Math.round(totalPrice * 0.3);
  const remainingAmount = totalPrice - depositAmount;

  const formatCurrency = (amount) => {
    return amount?.toLocaleString('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).replace('COP', '').trim();
  };

  const formatCOP = (amount) => {
    const safeAmount = typeof amount === 'number' && !Number.isNaN(amount) ? amount : 0;
    return `$${safeAmount.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} COP`;
  };

  const getTimeParts = (timeStr) => {
    if (!timeStr) return null;
    const raw = String(timeStr).trim();
    const [h, m] = raw.split(':');
    const hour = Number.parseInt(h, 10);
    const minute = Number.parseInt(m ?? '0', 10);
    if (Number.isNaN(hour) || Number.isNaN(minute)) return null;
    return { hour, minute };
  };

  const formatTime12h = (timeStr) => {
    const parts = getTimeParts(timeStr);
    if (!parts) return '';
    const hour12 = parts.hour % 12 === 0 ? 12 : parts.hour % 12;
    const mm = String(parts.minute).padStart(2, '0');
    return `${hour12}:${mm}`;
  };

  const getMeridiem = (timeStr) => {
    const parts = getTimeParts(timeStr);
    if (!parts) return '';
    return parts.hour < 12 ? 'AM' : 'PM';
  };

  const getPlanEmoji = (planName) => {
    const name = (planName || '').toLowerCase();
    if (name.includes('sender')) return '🌵';
    if (name.includes('desiert')) return '🏜️';
    if (name.includes('atv') || name.includes('cuatrimoto')) return '🏍️';
    if (name.includes('cabalg')) return '🐎';
    if (name.includes('camin') || name.includes('trek')) return '🥾';
    return '✨';
  };

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className={`min-h-screen bg-gradient-to-b from-white to-brand-light/40 dark:from-dark-bg-main dark:to-dark-bg-main py-3 sm:py-8 px-4 sm:px-6 lg:px-8 flex flex-col items-center transition-colors duration-300 ${isModalOpen ? 'overflow-hidden h-screen' : ''}`}>
      {isModalOpen ? (
        <WelcomeModal 
          isOpen={isModalOpen} 
          onComplete={onModalComplete} 
          onClose={onCloseModal}
          tours={tours}
          loading={loadingData}
          initialPhone={reservationData.contact.telefono_cliente}
          initialTourId={reservationData.tour.id_plan}
          theme={theme}
          toggleTheme={toggleTheme}
        />
      ) : null}
      
      {!isModalOpen && (
        <>
          <div className="w-full max-w-xl text-center mb-6 sm:mb-10 pt-2 sm:pt-16 md:pt-20 relative">
            <div className="flex items-center justify-center gap-3 flex-wrap mb-4 sm:mb-0 sm:absolute sm:top-0 sm:right-0">
              <button onClick={toggleTheme} className={`w-11 h-11 flex items-center justify-center rounded-2xl transition-all duration-300 shadow-sm border-2 ${theme === 'light' ? 'bg-white border-brand-border text-amber-500 hover:border-amber-400 hover:bg-amber-50/50' : 'bg-dark-bg-card border-dark-border text-brand-primary hover:border-brand-primary/50 hover:bg-brand-primary/10'}`} title={theme === 'light' ? t('welcome.switch_dark') || 'Cambiar a modo oscuro' : t('welcome.switch_light') || 'Cambiar a modo claro'}>
                {theme === 'light' ? <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M16.243 17.657l-.707-.707M7.05 7.05l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" /></svg> : <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>}
              </button>
              <div className="flex bg-white/50 dark:bg-dark-bg-card/50 p-1.5 rounded-2xl border-2 border-brand-border dark:border-dark-border gap-1.5">
                <button onClick={() => changeLanguage('es')} className={`px-4 py-2 rounded-xl text-[11px] font-black transition-all duration-300 uppercase tracking-wider ${i18n.language.startsWith('es') ? 'bg-brand-primary text-white shadow-lg scale-105' : 'text-brand-text-secondary dark:text-dark-text-secondary hover:text-brand-primary dark:hover:text-brand-primary'}`}>ES</button>
                <button onClick={() => changeLanguage('en')} className={`px-4 py-2 rounded-xl text-[11px] font-black transition-all duration-300 uppercase tracking-wider ${i18n.language.startsWith('en') ? 'bg-brand-primary text-white shadow-lg scale-105' : 'text-brand-text-secondary dark:text-dark-text-secondary hover:text-brand-primary dark:hover:text-brand-primary'}`}>EN</button>
              </div>
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-brand-text-main dark:text-dark-text-main uppercase leading-none">{t('home.title')}</h1>
            <div className="mt-2 flex items-center justify-center gap-3"><div className="h-[1px] w-6 bg-brand-primary opacity-60"></div><h2 className="text-base md:text-lg font-bold tracking-[0.2em] text-brand-dark dark:text-brand-primary uppercase">{t('home.subtitle')}</h2><div className="h-[1px] w-6 bg-brand-primary opacity-60"></div></div>
          </div>

          <div className="w-full max-w-xl space-y-6">
            {!isModalOpen && <div className="flex justify-start"><button onClick={onOpenModal} className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-brand-primary hover:text-brand-dark transition-colors group">← {t('welcome.change_plan')}</button></div>}

            <div className="mb-5 sm:mb-8 md:mb-12 px-2"><div className="max-w-3xl mx-auto relative"><div className="flex items-center justify-between z-10 relative">{[{ n: 1, label: t('steps.step1_title') || 'Plan & Cliente' },{ n: 2, label: t('steps.step2_title') || 'Participantes' },{ n: 3, label: t('steps.step3_title') || 'Resumen' }].map(step => { const isActive = currentStep === step.n; const isCompleted = currentStep > step.n; return <div key={step.n} className="flex flex-col items-center gap-2 flex-1 relative"><button type="button" onClick={() => { if (step.n === 1) { setCurrentStep(1); setShowSummary(false); } else if (step.n === 2 && currentStep >= 2) { setCurrentStep(2); setShowSummary(false); setShowCompanionsSection(true); } else if (step.n === 3 && currentStep === 3) { setCurrentStep(3); } }} disabled={step.n > currentStep} className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center font-black text-sm md:text-base border-2 transition-all duration-300 z-10 ${isCompleted ? 'bg-brand-primary border-brand-primary text-white shadow-lg scale-105' : isActive ? 'bg-white dark:bg-dark-bg-card border-brand-primary text-brand-primary shadow-xl ring-4 ring-brand-primary/20 scale-110' : 'bg-white/50 dark:bg-dark-bg-card/50 border-brand-border/50 dark:border-dark-border/50 text-brand-text-secondary/40 dark:text-dark-text-secondary/40 cursor-not-allowed'}`}>{isCompleted ? '✓' : step.n}</button><p className={`text-[10px] md:text-xs font-black uppercase tracking-wider text-center max-w-[120px] ${isActive || isCompleted ? 'text-brand-primary' : 'text-brand-text-secondary/40'}`}>{step.label}</p></div>})}</div></div></div>

            {currentStep === 1 && <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
              <div className="section-container"><label className="section-title-premium">{t('sections.responsible_info')}</label><ReservationContactSection sectionRef={contactRef} data={reservationData.contact} onChange={handleContactChange} errors={errors} /></div>
              <div className="section-container"><label className="section-title-premium">{t('sections.tour')}</label><TourSelectionSection sectionRef={tourRef} selectedTourId={reservationData.tour.id_plan} onSelect={handleTourSelect} errors={errors} tours={tours} loading={loadingData} /></div>
              <div className="section-container"><label className="section-title-premium">{t('sections.date')}</label><DateSelectionSection sectionRef={dateRef} selectedDate={reservationData.date.rawDate} onSelect={handleDateSelect} errors={errors} availableDates={reservationData.tour.availableDates} tipoFecha={reservationData.tour.tipo_fecha} /></div>
              <div className="section-container"><label className="section-title-premium">{t('sections.time')}</label><TimeSelectionSection sectionRef={timeRef} selectedTime={reservationData.time} onSelect={handleTimeSelect} schedules={reservationData.tour.availableHours} loading={loadingData} errors={errors} tipoHora={reservationData.tour.tipo_hora} /></div>
              <div className="pt-4 grid gap-3 md:grid-cols-2"><button onClick={handleStep1AddCompanions} className="rounded-[1.25rem] px-6 py-4 md:py-5 font-black text-sm md:text-base uppercase tracking-wider border-2 border-brand-primary/40 text-brand-primary bg-brand-primary/5">{t('steps.step1_add_companion') || 'Añadir acompañante'}</button><button onClick={handleStep1ReserveAlone} className="btn-animate-continue w-full"><span className="text_button">{t('steps.step1_reserve_alone') || 'Reservar'}</span></button></div>
            </div>}

            {currentStep === 2 && <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6"><div className="section-container" id="companions-section"><div className="flex items-center justify-between mb-4"><label className="section-title-premium !mb-0">{t('steps.step2_section_title') || 'Información de participantes'}</label><span className="text-[10px] md:text-xs font-black uppercase px-3 py-1.5 rounded-full bg-brand-primary text-white">+{reservationData.companions.length}</span></div><CompanionFormSection companions={reservationData.companions} onCompanionChange={handleCompanionChange} onRemoveCompanion={removeCompanion} onAddCompanion={addCompanion} errors={errors} /></div><div className="pt-2 grid gap-3 md:grid-cols-2"><button onClick={() => setCurrentStep(1)} className="rounded-[1.25rem] px-6 py-4 md:py-5 font-black text-sm md:text-base uppercase tracking-wider border-2 border-brand-primary/20 text-brand-primary">{t('steps.back_step1') || 'Volver al plan'}</button><button onClick={handleAddCompanions} className="rounded-[1.25rem] px-6 py-4 md:py-5 font-black text-sm md:text-base uppercase tracking-wider border-2 border-brand-primary/40 text-brand-primary">{t('steps.add_participant') || 'Añadir participante'}</button></div><button onClick={handleStep2Continue} className="btn-animate-continue w-full mt-2"><span className="text_button">{t('steps.step2_continue') || 'Continuar con la reserva'}</span></button></div>}

            {showSummary && <div id="reservation-summary" className="animate-in fade-in slide-in-from-bottom-4 duration-500 pt-10"><div className="card-premium p-6 md:p-10 space-y-8"><div className="card-accent-line"></div><div className="text-center relative pt-4"><h3 className="text-2xl md:text-3xl font-black text-brand-text-main dark:text-dark-text-main uppercase tracking-tight">{t('summary.title')}</h3><div className="h-1.5 w-16 bg-brand-primary mx-auto mt-3 rounded-full"></div></div><div className="grid gap-8"><div className="space-y-4"><p className="section-title-premium !ml-0">{t('summary.responsible')}</p><div className="bg-brand-light/30 dark:bg-dark-bg-main/30 rounded-[2rem] p-6 border border-brand-primary/10"><p className="text-brand-text-main dark:text-dark-text-main font-black text-lg md:text-xl mb-3">{reservationData.contact.nombre_jefe_reserva}</p></div></div><div className="space-y-8"><div className="space-y-4"><p className="section-title-premium !ml-0">{t('summary.experience')}</p><div className="bg-brand-light/30 dark:bg-dark-bg-main/30 rounded-[2rem] p-6 border border-brand-primary/10 space-y-5"><p className="text-brand-text-main dark:text-dark-text-main font-black text-base sm:text-lg md:text-xl"><span className="mr-2">{getPlanEmoji(reservationData.tour.tour_reserva)}</span>{reservationData.tour.tour_reserva}</p><div className="rounded-[1.5rem] border-2 border-brand-primary/30 bg-brand-primary/10 p-5 text-center"><p className="text-[10px] sm:text-xs font-black text-brand-primary uppercase">ABONO MÍNIMO PARA CONFIRMAR</p><p className="mt-2 text-2xl sm:text-3xl font-black text-brand-primary">{formatCOP(depositAmount)}</p></div><div className="space-y-3 rounded-[1.5rem] bg-white/50 dark:bg-dark-bg-card/40 border border-brand-primary/10 p-5"><p className="text-[10px] font-black uppercase">RESUMEN DEL PAGO</p><p className="text-2xl sm:text-3xl font-black">{formatCOP(totalPrice)}</p><p>Saldo para el día del evento: {formatCOP(remainingAmount)}</p></div></div></div><div className="space-y-4"><p className="section-title-premium !ml-0">{t('summary.date_time')}</p><div className="bg-brand-light/30 dark:bg-dark-bg-main/30 rounded-[2rem] p-6 border border-brand-primary/10 space-y-3"><p className="text-brand-text-main dark:text-dark-text-main font-black text-sm sm:text-base md:text-lg capitalize">{reservationData.date.rawDate?.toLocaleDateString(i18n.language === 'en' ? 'en-US' : 'es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}</p>{reservationData.time?.label ? <div className="flex items-baseline gap-2"><p className="text-brand-primary font-black text-xl md:text-2xl">{formatTime12h(reservationData.time.label)}</p><span className="text-[10px] font-black uppercase">{getMeridiem(reservationData.time.label)}</span></div> : null}</div></div></div></div><div className="flex flex-col sm:flex-row gap-4 pt-4"><button onClick={handleEditInformation} className="flex-1 py-4 px-6 border-2 border-brand-border dark:border-dark-border rounded-full">{t('steps.edit_all') || t('summary.edit')}</button><button onClick={() => { setShowSummary(false); setCurrentStep(2); setShowCompanionsSection(true); }} className="flex-1 py-4 px-6 bg-brand-light dark:bg-dark-bg-main border-2 border-brand-primary/20 rounded-full">{t('steps.edit_participants') || t('summary.add_companions')}</button></div><div className="pt-6 border-t border-brand-light dark:border-dark-border mt-8"><button onClick={handleProceedToPayment} disabled={isSaving} className={`btn-animate-continue w-full !bg-brand-primary ${isSaving ? 'opacity-70 cursor-not-allowed' : ''}`}><span className="text_button !text-white">{isSaving ? 'Procesando...' : t('summary.proceed_to_payment')}</span></button></div></div></div>}
          </div>

          <PaymentModal isOpen={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} experience={reservationData.tour.tour_reserva} participants={totalParticipants} totalAmount={totalPrice} formatCurrency={formatCurrency} />
        </>
      )}
      <p className="mt-10 text-[10px] text-brand-text-secondary uppercase tracking-[0.2em] font-bold opacity-40">{t('home.experience_adrenaline')}</p>
    </div>
  );
};

export default HomePage;
