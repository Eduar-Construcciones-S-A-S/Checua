import { useState, useEffect, useRef, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import PhoneInputPkg from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { isValidPhoneNumber } from 'libphonenumber-js';
import { findOrCreateClient, updateClientPlan } from '../services/clientService';

const PhoneInput = PhoneInputPkg.default || PhoneInputPkg;

const WelcomeModal = ({ isOpen, onComplete, onClose, tours = [], loading = false, initialPhone = '', initialTourId = '', theme, toggleTheme }) => {
  const { t, i18n } = useTranslation();
  const [phone, setPhone] = useState(initialPhone);
  const [selectedCountry, setSelectedCountry] = useState(initialPhone ? undefined : 'co');
  const [selectedTourId, setSelectedTourId] = useState(initialTourId);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isTourDropdownOpen, setIsTourDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);
  const phoneContainerRef = useRef(null);
  const [phoneDropdownPosition, setPhoneDropdownPosition] = useState('down');

  const phoneWithPlus = useMemo(() => {
    if (!phone) return '';
    return phone.startsWith('+') ? phone : `+${phone}`;
  }, [phone]);

  const isValid = useMemo(() => {
    if (!phoneWithPlus) return false;
    try {
      return isValidPhoneNumber(phoneWithPlus);
    } catch {
      return false;
    }
  }, [phoneWithPlus]);

  // Detectar espacio para el dropdown de teléfono
  const handlePhoneDropdownClick = () => {
    if (phoneContainerRef.current) {
      const rect = phoneContainerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      const dropdownHeight = 300; // Altura aproximada del dropdown

      if (spaceBelow < dropdownHeight && spaceAbove > dropdownHeight) {
        setPhoneDropdownPosition('up');
      } else {
        setPhoneDropdownPosition('down');
      }
    }
  };

  // Filtrado de tours optimizado
  const filteredTours = useMemo(() => {
    if (!searchTerm.trim()) return tours;
    
    const term = searchTerm.toLowerCase().trim();
    return tours.filter(tour => {
      const nameMatch = tour.name?.toLowerCase().includes(term);
      const descMatch = tour.description?.toLowerCase().includes(term);
      const categoryMatch = tour.category?.toLowerCase().includes(term);
      return nameMatch || descMatch || categoryMatch;
    });
  }, [tours, searchTerm]);

  // Enfocar el buscador al abrir el dropdown
  useEffect(() => {
    if (isTourDropdownOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [isTourDropdownOpen]);

  // Estados para la verificación del cliente
  const [clientStatus, setClientStatus] = useState(initialPhone ? 'found' : 'idle'); // idle, checking, found, created, error
  const [clientData, setClientData] = useState(null);
  const debounceTimer = useRef(null);
  const latestLookupRef = useRef('');

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsTourDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handlePhoneChange = (nextPhone, countryData = {}) => {
    const normalizedPhone = String(nextPhone || '').replace(/\D/g, '');
    const dialCode = String(countryData?.dialCode || '');
    const hasSelectedPrefix = Boolean(dialCode) && normalizedPhone.startsWith(dialCode);

    setPhone(normalizedPhone);
    setSelectedCountry(
      normalizedPhone && hasSelectedPrefix && countryData?.countryCode
        ? countryData.countryCode
        : null
    );

    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    const nextPhoneWithPlus = normalizedPhone && hasSelectedPrefix ? `+${normalizedPhone}` : '';
    let nextIsValid = false;
    if (nextPhoneWithPlus) {
      try {
        nextIsValid = isValidPhoneNumber(nextPhoneWithPlus);
      } catch {
        nextIsValid = false;
      }
    }

    if (!nextIsValid) {
      setClientStatus('idle');
      setClientData(null);
      latestLookupRef.current = '';
      return;
    }

    setClientStatus('checking');
    latestLookupRef.current = nextPhoneWithPlus;
    debounceTimer.current = setTimeout(async () => {
      const lookupPhone = latestLookupRef.current;
      if (!lookupPhone) return;
      const { data, status } = await findOrCreateClient(lookupPhone);
      if (latestLookupRef.current !== lookupPhone) return;

      if (status === 'error') {
        setClientStatus('error');
        return;
      }

      setClientStatus(status);
      setClientData(data);

      if (data && data.id_plan) {
        setSelectedTourId(data.id_plan.toString());
      }
    }, 800);
  };

  // El botón se activa solo si hay teléfono válido, plan seleccionado y términos aceptados
  const canContinue = acceptedTerms && isValid && selectedTourId;

  const handleContinue = async () => {
    if (canContinue) {
      const tour = tours.find(t => t.id.toString() === selectedTourId);

      // Actualizar el plan del cliente en la base de datos si es necesario
      try {
        await updateClientPlan(phoneWithPlus, selectedTourId);
      } catch (err) {
        console.error("Error al actualizar el plan del cliente:", err);
      }

      // IMPORTANTE: Aquí NO cerramos el modal directamente.
      // onComplete en App.jsx se encarga de llamar a handleTourSelect (async)
      // y luego cerrar el modal.
      await onComplete({
        phone: phoneWithPlus,
        tour,
        client: clientData
      });
    }
  };

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  const selectedTour = tours.find(t => t.id.toString() === selectedTourId);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-brand-dark/40 dark:bg-black/60 backdrop-blur-md animate-in fade-in duration-300 overflow-y-auto">
      <div className="w-full max-w-lg bg-white dark:bg-dark-bg-card rounded-[2.5rem] shadow-2xl relative border border-brand-border dark:border-dark-border animate-in zoom-in-95 duration-300 my-auto">
        {/* Header Accent */}
        <div className="h-2 w-full bg-brand-primary rounded-t-[2.5rem] shrink-0"></div>
        
        {/* Selectors and Close Button Container */}
        <div className="absolute top-6 right-6 flex items-center gap-4 z-20">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className={`w-11 h-11 flex items-center justify-center rounded-2xl transition-all duration-300 shadow-sm border-2 ${
              theme === 'light' 
                ? 'bg-white border-brand-border text-amber-500 hover:border-amber-400 hover:bg-amber-50/50' 
                : 'bg-dark-bg-main border-dark-border text-brand-primary hover:border-brand-primary/50 hover:bg-brand-primary/10'
            }`}
            title={theme === 'light' ? t('welcome.switch_dark') || 'Cambiar a modo oscuro' : t('welcome.switch_light') || 'Cambiar a modo claro'}
          >
            {theme === 'light' ? (
              // Icono Sol para modo claro
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M16.243 17.657l-.707-.707M7.05 7.05l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
              </svg>
            ) : (
              // Icono Luna para modo oscuro
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>

          {/* Language Selector */}
          <div className="flex bg-brand-light/50 dark:bg-dark-bg-main/50 p-1.5 rounded-2xl border-2 border-brand-border dark:border-dark-border gap-1.5">
            <button 
              onClick={() => changeLanguage('es')}
              className={`px-4 py-2 rounded-xl text-[11px] font-black transition-all duration-300 uppercase tracking-wider ${
                i18n.language.startsWith('es') 
                  ? 'bg-brand-primary text-white shadow-lg scale-105' 
                  : 'text-brand-text-secondary dark:text-dark-text-secondary hover:text-brand-primary dark:hover:text-brand-primary'
              }`}
            >
              ES
            </button>
            <button 
              onClick={() => changeLanguage('en')}
              className={`px-4 py-2 rounded-xl text-[11px] font-black transition-all duration-300 uppercase tracking-wider ${
                i18n.language.startsWith('en') 
                  ? 'bg-brand-primary text-white shadow-lg scale-105' 
                  : 'text-brand-text-secondary dark:text-dark-text-secondary hover:text-brand-primary dark:hover:text-brand-primary'
              }`}
            >
              EN
            </button>
          </div>

          {/* Close Button (only if already has data) */}
          {initialPhone && (
            <button 
              onClick={onClose}
              className="w-11 h-11 flex items-center justify-center text-brand-text-secondary dark:text-dark-text-secondary hover:text-red-500 dark:hover:text-red-400 transition-all duration-300 hover:scale-110 active:scale-95"
            >
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        <div className="px-6 pt-20 pb-8 md:pt-24 md:pb-10 md:px-10 space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl md:text-3xl font-black text-brand-text-main dark:text-dark-text-main uppercase tracking-tight">
              {t('welcome.title')}
            </h2>
            <p className="text-sm md:text-base text-brand-text-secondary dark:text-dark-text-secondary font-medium">
              {t('welcome.subtitle')}
            </p>
          </div>

          <div className="space-y-6">
            {/* Phone Field */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-brand-primary uppercase tracking-[0.2em] ml-4">
                {t('welcome.phone_label')}
              </label>
              <div 
                ref={phoneContainerRef}
                onClick={handlePhoneDropdownClick}
                className={`relative welcome-phone-input-v2 ${phoneDropdownPosition === 'up' ? 'drop-up' : ''}`}
              >
                <PhoneInput
                  country={selectedCountry}
                  value={phone}
                  onChange={handlePhoneChange}
                  disableCountryGuess={true}
                  enableSearch={true}
                  searchPlaceholder={t('welcome.search_placeholder')}
                  searchNotFound={t('welcome.search_not_found') || "..."}
                  placeholder={t('welcome.phone_placeholder')}
                  containerClass="!w-full !font-sans"
                  inputClass="!w-full !h-auto !py-4 !pl-[70px] !pr-5 !bg-brand-light/30 dark:!bg-dark-bg-main/50 !border-2 !border-brand-border dark:!border-dark-border !rounded-full !text-brand-text-main dark:!text-dark-text-main !font-bold !text-base focus:!border-brand-primary focus:!ring-4 focus:!ring-brand-primary/5 !transition-all !duration-300"
                  buttonClass="!bg-transparent !border-none !rounded-l-full !pl-4 hover:!bg-brand-primary/5 !transition-colors"
                  dropdownClass={`welcome-phone-dropdown ${phoneDropdownPosition === 'up' ? 'open-up' : ''}`}
                  searchClass="welcome-phone-search"
                />
              </div>
              <div className="flex justify-between items-center px-4">
                <div className="flex flex-col gap-0.5">
                  <p className="text-[10px] text-brand-text-secondary/70 dark:text-dark-text-secondary font-medium italic">
                    {t('welcome.phone_hint')}
                  </p>
                  {/* Estados Visuales de Verificación */}
                  {phone && isValid && (
                    <div className="flex items-center gap-1.5 animate-in fade-in slide-in-from-left-2 duration-300">
                      {clientStatus === 'checking' && (
                        <>
                          <div className="w-2 h-2 border-2 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
                          <span className="text-[9px] font-bold text-brand-primary uppercase tracking-wider">{t('welcome.verifying')}</span>
                        </>
                      )}
                      {clientStatus === 'found' && (
                        <>
                          <svg className="w-3 h-3 text-brand-primary" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span className="text-[9px] font-black text-brand-primary uppercase tracking-wider">{t('welcome.client_found')}</span>
                        </>
                      )}
                      {clientStatus === 'created' && (
                        <>
                          <svg className="w-3 h-3 text-brand-primary" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span className="text-[9px] font-black text-brand-primary uppercase tracking-wider text-balance">{t('welcome.client_created')}</span>
                        </>
                      )}
                      {clientStatus === 'error' && (
                        <>
                          <svg className="w-3 h-3 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                          <span className="text-[9px] font-bold text-red-500 uppercase tracking-wider">{t('welcome.client_error')}</span>
                        </>
                      )}
                    </div>
                  )}
                </div>
                {phone && (
                  <span className={`text-[9px] font-black uppercase tracking-widest ${isValid ? 'text-brand-primary' : 'text-red-400'}`}>
                    {isValid ? t('welcome.phone_valid') : t('welcome.phone_invalid')}
                  </span>
                )}
              </div>
            </div>

            {/* Tour Selection Field */}
            <div className={`space-y-2 transition-all duration-500 ease-in-out ${isTourDropdownOpen ? 'pb-[320px]' : 'pb-0'}`} ref={dropdownRef}>
              <label className="text-[10px] font-black text-brand-primary uppercase tracking-[0.2em] ml-4">
                {t('welcome.experience_label')}
              </label>
              
              <div className="relative">
                {/* Custom Trigger */}
                <button
                  type="button"
                  onClick={() => setIsTourDropdownOpen(!isTourDropdownOpen)}
                  className={`w-full px-6 py-4 bg-brand-light/30 dark:bg-dark-bg-main/50 border-2 rounded-full text-left transition-all duration-300 flex items-center justify-between group ${
                    isTourDropdownOpen ? 'border-brand-primary ring-4 ring-brand-primary/5' : 'border-brand-border dark:border-dark-border hover:border-brand-primary/50'
                  }`}
                >
                  {selectedTour ? (
                    <div className="flex flex-col">
                      <span className="text-brand-text-main dark:text-dark-text-main font-bold text-sm md:text-base leading-tight">
                        {selectedTour.name}
                      </span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-brand-primary font-black text-sm">
                          ${selectedTour.price.toLocaleString('es-CO')}
                        </span>
                        <span className="text-[9px] uppercase font-bold text-brand-text-secondary/60 dark:text-dark-text-secondary/60">
                          {t('welcome.price_per_person')}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <span className="text-brand-text-secondary/60 dark:text-dark-text-secondary/60 font-bold text-sm md:text-base">
                      {t('welcome.experience_placeholder')}
                    </span>
                  )}
                  <svg 
                    className={`w-5 h-5 text-brand-primary transition-transform duration-300 ${isTourDropdownOpen ? 'rotate-180' : ''}`} 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor" 
                    strokeWidth="3"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Custom Dropdown Options */}
                {isTourDropdownOpen && (
                  <div className="absolute left-0 right-0 mt-3 bg-white dark:bg-dark-bg-card border-2 border-brand-border dark:border-dark-border rounded-[1.5rem] shadow-2xl z-[1001] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 flex flex-col">
                    {/* Search Input inside Dropdown */}
                    <div className="p-3 border-b border-brand-light dark:border-dark-border bg-white dark:bg-dark-bg-card sticky top-0 z-10">
                      <div className="relative">
                        <svg 
                          className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-text-secondary/50 dark:text-dark-text-secondary/50" 
                          fill="none" 
                          viewBox="0 0 24 24" 
                          stroke="currentColor" 
                          strokeWidth="3"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                          ref={searchInputRef}
                          type="text"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          placeholder={t('welcome.search_tour_placeholder') || "🔍 Buscar experiencia..."}
                          className="w-full pl-11 pr-4 py-2.5 bg-brand-light/30 dark:bg-dark-bg-main/50 border-2 border-transparent focus:border-brand-primary/30 rounded-xl text-sm font-bold text-brand-text-main dark:text-dark-text-main placeholder:text-brand-text-secondary/40 dark:placeholder:text-dark-text-secondary/40 transition-all outline-none"
                        />
                        {searchTerm && (
                          <button 
                            onClick={() => setSearchTerm('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-brand-light dark:hover:bg-dark-bg-main rounded-full transition-colors"
                          >
                            <svg className="w-3 h-3 text-brand-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="max-h-[300px] md:max-h-[350px] overflow-y-auto welcome-tour-list">
                      {loading ? (
                        <div className="p-10 text-center">
                          <div className="w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                          <p className="text-xs font-bold text-brand-text-secondary dark:text-dark-text-secondary uppercase tracking-widest">{t('welcome.loading_tours')}</p>
                        </div>
                      ) : filteredTours.length > 0 ? (
                        filteredTours.map((tour) => (
                          <button
                            key={tour.id}
                            type="button"
                            onClick={() => {
                              setSelectedTourId(tour.id.toString());
                              setIsTourDropdownOpen(false);
                              setSearchTerm(''); // Limpiar búsqueda al seleccionar
                            }}
                            className={`w-full px-6 py-4 text-left transition-all duration-200 border-b border-brand-light dark:border-dark-border last:border-0 flex flex-col gap-1 group ${
                              selectedTourId === tour.id.toString() 
                                ? 'bg-brand-primary/10 border-l-4 border-l-brand-primary pl-5' 
                                : 'hover:bg-brand-light/50 dark:hover:bg-dark-bg-main/50 border-l-4 border-l-transparent'
                            }`}
                          >
                            <span className={`font-bold text-sm md:text-base transition-colors ${
                              selectedTourId === tour.id.toString() ? 'text-brand-primary' : 'text-brand-text-main dark:text-dark-text-main'
                            }`}>
                              {tour.name}
                            </span>
                            {tour.description && (
                              <p className="text-[10px] md:text-xs text-brand-text-secondary/70 dark:text-dark-text-secondary/70 line-clamp-1 font-medium italic mb-1">
                                {tour.description}
                              </p>
                            )}
                            <div className="flex items-center justify-between">
                              <div className="flex flex-col">
                                <span className="text-brand-primary font-black text-base md:text-lg">
                                  ${tour.price.toLocaleString('es-CO')}
                                </span>
                                <span className="text-[10px] uppercase font-bold text-brand-text-secondary/60 dark:text-dark-text-secondary/60 tracking-wider">
                                  {t('welcome.price_per_person')}
                                </span>
                              </div>
                              {selectedTourId === tour.id.toString() && (
                                <div className="bg-brand-primary text-white p-1 rounded-full">
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                  </svg>
                                </div>
                              )}
                            </div>
                          </button>
                        ))
                      ) : (
                        <div className="p-10 text-center space-y-3">
                          <div className="w-12 h-12 bg-brand-light/50 dark:bg-dark-bg-main/50 rounded-full flex items-center justify-center mx-auto">
                            <svg className="w-6 h-6 text-brand-text-secondary/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                          </div>
                          <p className="text-sm font-bold text-brand-text-secondary dark:text-dark-text-secondary italic px-4">
                            {t('welcome.no_tours_found') || "No encontramos experiencias que coincidan con tu búsqueda."}
                          </p>
                          <button 
                            onClick={() => setSearchTerm('')}
                            className="text-xs font-black text-brand-primary uppercase tracking-widest hover:underline"
                          >
                            {t('welcome.clear_search') || "Ver todas"}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Terms Checkbox */}
            <div className="space-y-4 pt-2">
              <p className="text-[11px] text-brand-text-secondary dark:text-dark-text-secondary leading-relaxed ml-1">
                {t('welcome.terms_authorize')}
              </p>
              <label className="flex items-start gap-3 cursor-pointer group">
                <div className="relative flex items-center mt-0.5">
                  <input
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border-2 border-brand-border dark:border-dark-border transition-all checked:border-brand-primary checked:bg-brand-primary"
                  />
                  <svg className="absolute h-3.5 w-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-xs font-bold text-brand-text-main dark:text-dark-text-main group-hover:text-brand-primary transition-colors">
                  {t('welcome.terms_accept')}
                </span>
              </label>
            </div>
          </div>

          <button
            onClick={handleContinue}
            disabled={!canContinue}
            className="btn-animate-continue w-full"
          >
            <div className="dots_border"></div>
            <svg
              className="sparkle"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                className="path"
                d="M12 2L14.5 9L22 11.5L14.5 14L12 21L9.5 14L2 11.5L9.5 9L12 2Z"
              ></path>
            </svg>
            <span className="text_button">{t('welcome.continue')}</span>
            <svg
              className="sparkle"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                className="path"
                d="M12 2L14.5 9L22 11.5L14.5 14L12 21L9.5 14L2 11.5L9.5 9L12 2Z"
              ></path>
            </svg>
          </button>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        /* Contenedor del Dropdown */
        .react-tel-input .country-list {
          background-color: white !important;
          border-radius: 1.5rem !important;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25) !important;
          border: 2px solid #E5E7EB !important;
          margin-top: 10px !important;
          width: min(430px, calc(100vw - 3rem)) !important;
          max-width: calc(100vw - 3rem) !important;
          max-height: 280px !important; /* Altura máxima requerida */
          z-index: 1000 !important;
          scrollbar-width: thin;
          scrollbar-color: #8CC915 #F3F4F6;
          overflow-x: hidden !important; /* Eliminar scroll horizontal */
          left: 0 !important;
        }

        /* Clase para abrir hacia arriba */
        .react-tel-input .country-list.open-up {
          bottom: 100% !important;
          top: auto !important;
          margin-top: 0 !important;
          margin-bottom: 10px !important;
          box-shadow: 0 -25px 50px -12px rgba(0, 0, 0, 0.25) !important;
        }

        .dark .react-tel-input .country-list.open-up {
          box-shadow: 0 -25px 50px -12px rgba(0, 0, 0, 0.5) !important;
        }

        .dark .react-tel-input .country-list {
          background-color: #1E293B !important;
          border-color: #334155 !important;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5) !important;
        }

        /* Responsive para móviles */
        @media (max-width: 480px) {
          .react-tel-input .country-list {
            width: calc(100vw - 3rem) !important;
            max-width: calc(100vw - 3rem) !important;
            left: 0 !important;
            max-height: 250px !important;
          }
        }

        /* Buscador interno de la librería */
        .react-tel-input .search {
          padding: 12px !important;
          background: white !important;
          border-bottom: 1px solid #F3F4F6 !important;
          position: sticky !important;
          top: 0 !important;
          z-index: 10 !important;
          display: flex !important;
        }

        .dark .react-tel-input .search {
          background: #1E293B !important;
          border-bottom-color: #334155 !important;
        }

        .react-tel-input .search-box {
          width: 100% !important;
          margin: 0 !important;
          padding: 10px 12px 10px 35px !important; /* Espacio para el icono */
          background-color: #F9FAFB !important;
          border: 2px solid #E5E7EB !important;
          border-radius: 12px !important; /* Bordes redondeados */
          font-size: 14px !important;
          font-weight: 700 !important;
          color: #172033 !important;
        }

        /* Icono de búsqueda simulado */
        .react-tel-input .search::before {
          content: "🔍";
          position: absolute;
          left: 22px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 14px;
          z-index: 11;
          opacity: 0.6;
        }

        .dark .react-tel-input .search-box {
          background-color: #0F172A !important;
          border-color: #334155 !important;
          color: #F8FAFC !important;
        }

        /* Elemento de la lista (País) */
        .react-tel-input .country {
          padding: 12px 15px !important;
          display: flex !important;
          align-items: center !important;
          gap: 12px !important;
          transition: background-color 0.2s !important;
          overflow: hidden !important;
          min-height: 44px !important;
        }

        .react-tel-input .country:hover {
          background-color: #F7FBEF !important;
        }

        .dark .react-tel-input .country:hover {
          background-color: rgba(140, 201, 21, 0.1) !important;
        }

        .react-tel-input .country.highlight {
          background-color: #F0F9E6 !important;
        }

        .dark .react-tel-input .country.highlight {
          background-color: rgba(140, 201, 21, 0.2) !important;
        }

        /* Forzar visibilidad de banderas */
        .react-tel-input .country .flag {
          display: inline-block !important;
          margin: 0 !important;
          position: static !important;
          flex-shrink: 0 !important;
          transform: none !important;
          width: 16px !important;
          min-width: 16px !important;
        }

        /* Nombre del país */
        .react-tel-input .country .country-name {
          font-size: 13px !important;
          font-weight: 700 !important;
          color: #172033 !important;
          white-space: nowrap !important;
          overflow: hidden !important;
          text-overflow: ellipsis !important;
          flex: 1 !important; /* Toma el espacio disponible */
          min-width: 0 !important;
        }

        .dark .react-tel-input .country .country-name {
          color: #F8FAFC !important;
        }

        /* Código de área */
        .react-tel-input .country .dial-code {
          font-size: 13px !important;
          font-weight: 800 !important;
          color: #8CC915 !important;
          flex-shrink: 0 !important;
        }

        /* Scrollbar */
        .react-tel-input .country-list::-webkit-scrollbar {
          width: 6px;
        }
        .react-tel-input .country-list::-webkit-scrollbar-track {
          background: transparent;
        }
        .react-tel-input .country-list::-webkit-scrollbar-thumb {
          background-color: #8CC915;
          border-radius: 20px;
        }

        /* Ajuste de la bandera seleccionada */
        .react-tel-input .selected-flag {
          width: 60px !important;
          padding-left: 15px !important;
          background: transparent !important;
        }
        
        .react-tel-input .selected-flag .arrow {
          left: 39px !important;
          border-top-color: #8CC915 !important;
        }
        
        .react-tel-input .selected-flag .arrow.up {
          border-bottom-color: #8CC915 !important;
        }

        /* Estilos para el scrollbar del selector de tours */
        .welcome-tour-list::-webkit-scrollbar {
          width: 6px;
        }
        .welcome-tour-list::-webkit-scrollbar-track {
          background: #F9FAFB;
        }
        .welcome-tour-list::-webkit-scrollbar-thumb {
          background-color: #8CC915;
          border-radius: 20px;
        }
      `}} />
    </div>
  );
};

export default WelcomeModal;
