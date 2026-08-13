import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { getTours, getPlanDates, getPlanHours } from './services/tourService';
import HomePage from './pages/HomePage';

function App() {
  const { t } = useTranslation();
  
  // --- ESTADO DEL TEMA ---
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // --- ESTADO DEL MODAL ---
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [tours, setTours] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  // --- CARGAR DATOS (TOURS) ---
  useEffect(() => {
    const fetchData = async () => {
      setLoadingData(true);
      try {
        const [toursData] = await Promise.all([getTours()]);
        setTours(toursData);
      } catch (error) {
        console.error("Error al cargar datos iniciales:", error);
      } finally {
        setLoadingData(false);
      }
    };
    fetchData();
  }, []);

  // --- ESTADO GLOBAL DEL FORMULARIO ---
  const [reservationData, setReservationData] = useState({
    contact: {
      nombre_jefe_reserva: '',
      telefono_cliente: '',
      correo_contacto: '',
      tipo_documento: '',
      numero_documento: '',
      fecha_nacimiento: '',
      nacionalidad: ''
    },
    tour: {
      tour_reserva: '',
      precio_por_persona: null,
      id_plan: null,
      tipo_fecha: 'cualquier_dia',
      tipo_hora: 'sin_hora',
      availableDates: [], // Fechas habilitadas si tipo_fecha === 'fechas_especificas'
      availableHours: []  // Horas disponibles si tipo_hora === 'varias_horas' o 'hora_fija'
    },
    date: {
      fecha_reserva: '',
      es_fin_de_semana: false,
      es_festivo_colombia: false,
      puede_variar_precio: false,
      rawDate: null
    },
    time: {
      hora_reserva: '',
      periodo: '',
      label: ''
    },
    companions: []
  });

  // --- ESTADO DE VALIDACIÓN ---
  const [errors, setErrors] = useState({});
  const [showSummary, setShowSummary] = useState(false);
  const [, setShowCompanionsSection] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  // --- REFS PARA SCROLL ---
  const contactRef = useRef(null);
  const tourRef = useRef(null);
  const dateRef = useRef(null);
  const timeRef = useRef(null);

  // --- MANEJADORES DE CAMBIOS ---
  const handleContactChange = (field, value) => {
    setReservationData(prev => ({
      ...prev,
      contact: { ...prev.contact, [field]: value }
    }));
    
    if (errors[field] || errors.contact) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        const contactFields = ['nombre_jefe_reserva', 'telefono_cliente', 'correo_contacto', 'tipo_documento', 'numero_documento', 'fecha_nacimiento', 'nacionalidad'];
        const hasMoreContactErrors = contactFields.some(f => f !== field && newErrors[f]);
        if (!hasMoreContactErrors) delete newErrors.contact;
        return newErrors;
      });
    }
  };

  const handleTourSelect = async (tour) => {
    setLoadingData(true);
    try {
      const [dates, hours] = await Promise.all([
        tour.tipo_fecha === 'fechas_especificas' ? getPlanDates(tour.id) : Promise.resolve([]),
        tour.tipo_hora !== 'sin_hora' ? getPlanHours(tour.id) : Promise.resolve([])
      ]);

      setReservationData(prev => {
        const newTourData = {
          tour_reserva: tour.name,
          precio_por_persona: tour.price,
          id_plan: tour.id.toString(),
          tipo_fecha: tour.tipo_fecha,
          tipo_hora: tour.tipo_hora,
          availableDates: dates,
          availableHours: hours
        };

        // Si es hora fija, seleccionamos automáticamente la única hora disponible
        let newTimeData = { hora_reserva: '', periodo: '', label: '' };
        if (tour.tipo_hora === 'hora_fija' && hours.length > 0) {
          newTimeData = {
            hora_reserva: hours[0].value,
            periodo: hours[0].period,
            label: hours[0].label
          };
        }

        // Limpiar fecha si ya no es válida para el nuevo plan
        let newDateData = prev.date;
        if (tour.tipo_fecha === 'fechas_especificas' && prev.date.fecha_reserva) {
          if (!dates.includes(prev.date.fecha_reserva)) {
            newDateData = { fecha_reserva: '', es_fin_de_semana: false, es_festivo_colombia: false, puede_variar_precio: false, rawDate: null };
          }
        }

        return {
          ...prev,
          tour: newTourData,
          time: newTimeData,
          date: newDateData
        };
      });
    } catch (error) {
      console.error("Error al cargar detalles del tour:", error);
    } finally {
      setLoadingData(false);
    }

    if (errors.tour) setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.tour;
      return newErrors;
    });
  };

  const handleDateSelect = (date, meta) => {
    setReservationData(prev => ({
      ...prev,
      date: {
        ...meta,
        rawDate: date
      }
    }));
    if (errors.date) setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.date;
      return newErrors;
    });
  };

  const handleTimeSelect = (time) => {
    setReservationData(prev => ({
      ...prev,
      time: {
        hora_reserva: time.value,
        periodo: time.period,
        label: time.label
      }
    }));
    if (errors.time) setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.time;
      return newErrors;
    });
  };

  const handleCompanionChange = (index, field, value) => {
    setReservationData(prev => {
      const newCompanions = [...prev.companions];
      newCompanions[index] = { ...newCompanions[index], [field]: value };
      return { ...prev, companions: newCompanions };
    });

    // Limpiar errores del acompañante específico
    const errorKey = `companion_${index}_${field}`;
    if (errors[errorKey]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[errorKey];
        return newErrors;
      });
    }
  };

  const addCompanion = () => {
    setReservationData(prev => ({
      ...prev,
      companions: [
        ...prev.companions,
        {
          nombre: '',
          tipo_documento: '',
          numero_documento: '',
          fecha_nacimiento: '',
          telefono: '',
          correo: '',
          nacionalidad: ''
        }
      ]
    }));
    setShowCompanionsSection(true);
  };

  const removeCompanion = (index) => {
    setReservationData(prev => ({
      ...prev,
      companions: prev.companions.filter((_, i) => i !== index)
    }));
    // Limpiar errores asociados a este acompañante
    setErrors(prev => {
      const newErrors = { ...prev };
      Object.keys(newErrors).forEach(key => {
        if (key.startsWith(`companion_${index}_`)) {
          delete newErrors[key];
        }
      });
      return newErrors;
    });
  };

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

  // --- VALIDACIÓN POR PASOS ---
  const validateStep1 = () => {
    const newErrors = {};
    const { contact, tour, date, time } = reservationData;

    if (!contact.nombre_jefe_reserva.trim()) {
      newErrors.nombre_jefe_reserva = t('errors.required_name');
      newErrors.nombre_jefe_reserva_key = 'required_name';
      newErrors.contact = true;
    } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(contact.nombre_jefe_reserva)) {
      newErrors.nombre_jefe_reserva = t('errors.only_letters');
      newErrors.nombre_jefe_reserva_key = 'only_letters';
      newErrors.contact = true;
    }

    if (!contact.telefono_cliente.trim()) {
      newErrors.telefono_cliente = t('errors.required_phone');
      newErrors.telefono_cliente_key = 'required_phone';
      newErrors.contact = true;
    } else if (!/^\+?\d+$/.test(contact.telefono_cliente)) {
      newErrors.telefono_cliente = t('errors.invalid_phone');
      newErrors.telefono_cliente_key = 'invalid_phone';
      newErrors.contact = true;
    }

    if (!contact.correo_contacto.trim()) {
      newErrors.correo_contacto = t('errors.required_email');
      newErrors.correo_contacto_key = 'required_email';
      newErrors.contact = true;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.correo_contacto)) {
      newErrors.correo_contacto = t('errors.invalid_email');
      newErrors.correo_contacto_key = 'invalid_email';
      newErrors.contact = true;
    }

    if (!contact.tipo_documento) {
      newErrors.tipo_documento = t('errors.required_doc_type');
      newErrors.tipo_documento_key = 'required_doc_type';
      newErrors.contact = true;
    }

    if (!contact.numero_documento) {
      newErrors.numero_documento = t('errors.required_doc_number');
      newErrors.numero_documento_key = 'required_doc_number';
      newErrors.contact = true;
    }

    if (!contact.nacionalidad) {
      newErrors.nacionalidad = t('errors.required_nationality');
      newErrors.nacionalidad_key = 'required_nationality';
      newErrors.contact = true;
    }

    if (!contact.fecha_nacimiento) {
      newErrors.fecha_nacimiento = t('errors.required_birth_date');
      newErrors.fecha_nacimiento_key = 'required_birth_date';
      newErrors.contact = true;
    } else {
      const age = calculateAge(contact.fecha_nacimiento);
      if (age === null) {
        newErrors.fecha_nacimiento = t('errors.invalid_birth_date');
        newErrors.fecha_nacimiento_key = 'invalid_birth_date';
        newErrors.contact = true;
      } else if (age < 1 || age > 120) {
        newErrors.fecha_nacimiento = t('errors.invalid_age');
        newErrors.fecha_nacimiento_key = 'invalid_age';
        newErrors.contact = true;
      }
    }

    if (!tour.tour_reserva) {
      newErrors.tour = t('errors.required_tour');
      newErrors.tour_key = 'required_tour';
    }
    if (!date.fecha_reserva) {
      newErrors.date = t('errors.required_date');
      newErrors.date_key = 'required_date';
    }

    if (tour.tipo_hora === 'varias_horas' || tour.tipo_hora === 'hora_fija') {
      if (!time.hora_reserva) {
        newErrors.time = t('errors.required_time');
        newErrors.time_key = 'required_time';
      }
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      if (newErrors.contact) contactRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      else if (newErrors.tour) tourRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      else if (newErrors.date) dateRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      else if (newErrors.time) timeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    const newErrors = {};

    reservationData.companions.forEach((companion, index) => {
      if (!companion.nombre.trim()) {
        newErrors[`companion_${index}_nombre`] = t('errors.required_name');
      }
      if (!companion.tipo_documento) {
        newErrors[`companion_${index}_tipo_documento`] = t('errors.required_doc_type');
      }
      if (!companion.numero_documento) {
        newErrors[`companion_${index}_numero_documento`] = t('errors.required_doc_number');
      }
      if (!companion.telefono.trim()) {
        newErrors[`companion_${index}_telefono`] = t('errors.required_phone');
      } else if (!/^\+?\d+$/.test(companion.telefono)) {
        newErrors[`companion_${index}_telefono`] = t('errors.invalid_phone');
      }
      if (companion.correo.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(companion.correo)) {
        newErrors[`companion_${index}_correo`] = t('errors.invalid_email');
      }
      if (!companion.nacionalidad) {
        newErrors[`companion_${index}_nacionalidad`] = t('errors.required_nationality');
      }
      if (!companion.fecha_nacimiento) {
        newErrors[`companion_${index}_fecha_nacimiento`] = t('errors.required_birth_date');
      } else {
        const age = calculateAge(companion.fecha_nacimiento);
        if (age === null) {
          newErrors[`companion_${index}_fecha_nacimiento`] = t('errors.invalid_birth_date');
        } else if (age < 1 || age > 120) {
          newErrors[`companion_${index}_fecha_nacimiento`] = t('errors.invalid_age');
        }
      }
    });

    setErrors(prev => ({ ...prev, ...newErrors }));

    if (Object.keys(newErrors).length > 0) {
      document.getElementById('companions-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return false;
    }
    return true;
  };

  const handleEditInformation = () => {
    setShowSummary(false);
    setCurrentStep(1);
    setShowCompanionsSection(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStep1ReserveAlone = () => {
    if (validateStep1()) {
      setReservationData(prev => ({ ...prev, companions: [] }));
      setShowCompanionsSection(false);
      setCurrentStep(3);
      setShowSummary(true);
      setTimeout(() => {
        document.getElementById('reservation-summary')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  };

  const handleStep1AddCompanions = () => {
    if (validateStep1()) {
      setCurrentStep(2);
      setShowCompanionsSection(true);
      if (reservationData.companions.length === 0) {
        addCompanion();
      }
      setTimeout(() => {
        document.getElementById('companions-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  };

  const handleAddCompanions = () => {
    addCompanion();
    setTimeout(() => {
      document.getElementById('companions-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleStep2Continue = () => {
    if (reservationData.companions.length === 0 || validateStep2()) {
      setShowSummary(true);
      setCurrentStep(3);
      setTimeout(() => {
        document.getElementById('reservation-summary')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } else {
      setShowSummary(false);
    }
  };

  const onModalComplete = async (data) => {
    // 1. Primero actualizamos el tour seleccionado (esto carga fechas/horas dinámicas)
    if (data.tour) {
      await handleTourSelect(data.tour);
    }

    // 2. Actualizamos el resto de los datos del contacto
    setReservationData(prev => ({
      ...prev,
      contact: {
        ...prev.contact,
        telefono_cliente: data.phone,
        nombre_jefe_reserva: data.client?.nombre_cliente || prev.contact.nombre_jefe_reserva
      }
    }));

    // 3. Cerramos el modal después de que handleTourSelect termine de cargar todo
    setIsModalOpen(false);
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <Router>
      <Routes>
        <Route 
          path="/" 
          element={
            <HomePage 
              isModalOpen={isModalOpen}
              onModalComplete={onModalComplete}
              onCloseModal={handleCloseModal}
              onOpenModal={handleOpenModal}
              theme={theme}
              toggleTheme={toggleTheme}
              tours={tours}
              loadingData={loadingData}
              reservationData={reservationData}
              handleContactChange={handleContactChange}
              handleTourSelect={handleTourSelect}
              handleDateSelect={handleDateSelect}
              handleTimeSelect={handleTimeSelect}
              handleStep1AddCompanions={handleStep1AddCompanions}
              handleStep1ReserveAlone={handleStep1ReserveAlone}
              handleStep2Continue={handleStep2Continue}
              showSummary={showSummary}
              setShowSummary={setShowSummary}
              handleEditInformation={handleEditInformation}
              handleAddCompanions={handleAddCompanions}
              setShowCompanionsSection={setShowCompanionsSection}
              addCompanion={addCompanion}
              removeCompanion={removeCompanion}
              handleCompanionChange={handleCompanionChange}
              errors={errors}
              contactRef={contactRef}
              tourRef={tourRef}
              dateRef={dateRef}
              timeRef={timeRef}
              currentStep={currentStep}
              setCurrentStep={setCurrentStep}
            />
          } 
        />
        {/* Fallback para cualquier otra ruta */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
