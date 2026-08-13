import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import PhoneInputPkg from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { COUNTRIES, findCountry, getCountryName } from '../utils/countries';
import { CountryFlagImg } from '../utils/CountryFlagImg.jsx';

const PhoneInput = PhoneInputPkg.default || PhoneInputPkg;

const ReservationContactSection = ({ data, onChange, errors, sectionRef }) => {
  const { t } = useTranslation();
  const [isDocTypeOpen, setIsDocTypeOpen] = useState(false);
  const [isNationalityOpen, setIsNationalityOpen] = useState(false);
  const [nationalitySearch, setNationalitySearch] = useState('');
  const [nationalityDropdownPosition, setNationalityDropdownPosition] = useState('down');
  const [docDropdownPosition, setDocDropdownPosition] = useState('down');
  const dropdownRef = useRef(null);
  const nationalityDropdownRef = useRef(null);

  useEffect(() => {
    if (isNationalityOpen && nationalityDropdownRef.current) {
      const rect = nationalityDropdownRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      if (spaceBelow < 300) {
        setNationalityDropdownPosition('up');
      } else {
        setNationalityDropdownPosition('down');
      }
    }
  }, [isNationalityOpen]);

  useEffect(() => {
    if (isDocTypeOpen && dropdownRef.current) {
      const rect = dropdownRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      if (spaceBelow < 250) {
        setDocDropdownPosition('up');
      } else {
        setDocDropdownPosition('down');
      }
    }
  }, [isDocTypeOpen]);

  const DOCUMENT_TYPES = [
    t('doc_types.cc'),
    t('doc_types.ti'),
    t('doc_types.ce'),
    t('doc_types.pas'),
    t('doc_types.ppt'),
    t('doc_types.dni'),
    t('doc_types.other')
  ];

  const filteredCountries = COUNTRIES.filter(c =>
    c.name.toLowerCase().includes(nationalitySearch.toLowerCase()) ||
    c.code.toLowerCase().includes(nationalitySearch.toLowerCase())
  );

  const selectedCountry = findCountry(data.nacionalidad);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDocTypeOpen(false);
      }
      if (nationalityDropdownRef.current && !nationalityDropdownRef.current.contains(event.target)) {
        setIsNationalityOpen(false);
        setNationalitySearch('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let cleanValue = value;
    
    if (name === 'nombre_jefe_reserva') {
      cleanValue = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
    }

    if (name === 'numero_documento') {
      cleanValue = value.replace(/\D/g, '');
    }

    onChange(name, cleanValue);
  };

  const formatNumber = (num) => {
    if (!num) return '';
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
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

  const computedAge = calculateAge(data.fecha_nacimiento);

  const handleDocTypeSelect = (type) => {
    onChange('tipo_documento', type);
    setIsDocTypeOpen(false);
  };

  const handleNationalitySelect = (country) => {
    onChange('nacionalidad', country.name);
    setIsNationalityOpen(false);
    setNationalitySearch('');
  };

  const displayedNationalityName = getCountryName(data.nacionalidad);

  return (
    <div 
      ref={sectionRef}
      className={`card-premium ${errors.contact ? 'border-red-400 ring-2 ring-red-50' : ''}`}
      style={{ zIndex: isDocTypeOpen || isNationalityOpen ? 50 : 1 }}
    >
      <div className={`card-accent-line ${errors.contact ? 'bg-red-400' : ''}`}></div>
      
      <div className="px-6 py-8 md:px-10 md:py-10 space-y-6">
          <div className="space-y-4">
            <div className="relative group">
              <input
                type="text"
                name="nombre_jefe_reserva"
                placeholder={t('sections.full_name')}
                value={data.nombre_jefe_reserva}
                onChange={handleChange}
                className={`input-premium ${errors.nombre_jefe_reserva ? 'border-red-200 focus:border-red-400 focus:ring-red-400/5' : ''}`}
              />
              {errors.nombre_jefe_reserva && <p className="text-[10px] text-red-500 mt-1.5 ml-6 font-bold uppercase tracking-wider">{t(`errors.${errors.nombre_jefe_reserva_key || 'required_name'}`)}</p>}
            </div>

            {/* Fila para Tipo y Número de Documento */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Tipo de Documento */}
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsDocTypeOpen(!isDocTypeOpen)}
                  className={`input-premium text-left flex items-center justify-between group ${
                    isDocTypeOpen ? 'border-brand-primary ring-4 ring-brand-primary/5' : errors.tipo_documento ? 'border-red-200' : ''
                  }`}
                >
                  <span className={`truncate ${data.tipo_documento ? '' : 'text-brand-text-secondary/40'}`}>
                    {data.tipo_documento || t('sections.doc_type')}
                  </span>
                  <svg 
                    className={`w-5 h-5 text-brand-primary transition-transform duration-300 ${isDocTypeOpen ? 'rotate-180' : ''}`} 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor" 
                    strokeWidth="3"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isDocTypeOpen && (
                  <div className={`absolute left-0 right-0 ${docDropdownPosition === 'up' ? 'bottom-full mb-3 animate-in fade-in slide-in-from-bottom-2' : 'top-full mt-3 animate-in fade-in slide-in-from-top-2'} bg-white dark:bg-dark-bg-card border-2 border-brand-border dark:border-dark-border rounded-[1.5rem] shadow-2xl z-[50] overflow-hidden duration-200`}>
                    <div className="max-h-[250px] overflow-y-auto custom-scrollbar">
                      {DOCUMENT_TYPES.map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => handleDocTypeSelect(type)}
                          className={`w-full px-6 py-4 text-left text-sm md:text-base font-bold transition-colors hover:bg-brand-light/50 dark:hover:bg-dark-bg-main/50 border-b border-brand-light dark:border-dark-border last:border-0 ${
                            data.tipo_documento === type ? 'text-brand-primary bg-brand-primary/5' : 'text-brand-text-main dark:text-dark-text-main'
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {errors.tipo_documento && <p className="text-[10px] text-red-500 mt-1.5 ml-6 font-bold uppercase tracking-wider">{errors.tipo_documento}</p>}
              </div>

              {/* Número de Documento */}
              <div className="relative group">
                <input
                  type="text"
                  inputMode="numeric"
                  name="numero_documento"
                  placeholder={t('sections.doc_number')}
                  value={formatNumber(data.numero_documento)}
                  onChange={handleChange}
                  className={`input-premium ${errors.numero_documento ? 'border-red-200 focus:border-red-400 focus:ring-red-400/5' : ''}`}
                />
                {errors.numero_documento && <p className="text-[10px] text-red-500 mt-1.5 ml-6 font-bold uppercase tracking-wider">{errors.numero_documento}</p>}
              </div>
            </div>

            {/* Fecha de Nacimiento + Edad calculada */}
            <div className="relative group">
              <label className="text-[8px] sm:text-[9px] font-black text-brand-primary uppercase tracking-widest mb-1.5 block opacity-70 ml-6">
                {t('sections.birth_date')}
              </label>
              <div className="relative">
                <input
                  type="date"
                  name="fecha_nacimiento"
                  value={data.fecha_nacimiento}
                  onChange={handleChange}
                  max={new Date().toISOString().split('T')[0]}
                  className={`input-premium !py-3.5 sm:!py-4 pr-28 sm:pr-36 ${errors.fecha_nacimiento ? 'border-red-200 focus:border-red-400 focus:ring-red-400/5' : ''}`}
                />
                <div className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  {computedAge !== null ? (
                    <div className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-gradient-to-r from-brand-primary/10 to-brand-primary/20 border border-brand-primary/30 animate-in fade-in zoom-in duration-300">
                      <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-[10px] sm:text-xs font-black text-brand-primary uppercase tracking-wider">
                        {computedAge} {t('sections.age_suffix')}
                      </span>
                    </div>
                  ) : (
                    <div className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-brand-light/40 dark:bg-dark-bg-main/40 border border-brand-border/50 dark:border-dark-border/50">
                      <span className="text-[10px] sm:text-xs font-bold text-brand-text-secondary/40 dark:text-dark-text-secondary/40 uppercase tracking-wider">
                        -- {t('sections.age_suffix')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              {errors.fecha_nacimiento && <p className="text-[10px] text-red-500 mt-1.5 ml-6 font-bold uppercase tracking-wider">{errors.fecha_nacimiento}</p>}
            </div>

            {/* Nacionalidad con selector de banderas */}
            <div className="relative group" ref={nationalityDropdownRef}>
              <label className="text-[8px] sm:text-[9px] font-black text-brand-primary uppercase tracking-widest mb-1.5 block opacity-70 ml-6">
                {t('sections.nationality')}
              </label>
              <button
                type="button"
                onClick={() => setIsNationalityOpen(!isNationalityOpen)}
                className={`input-premium !py-3.5 sm:!py-4 text-left flex items-center justify-between group ${
                  isNationalityOpen ? 'border-brand-primary ring-4 ring-brand-primary/5' : errors.nacionalidad ? 'border-red-200' : ''
                }`}
              >
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  {selectedCountry ? (
                    <>
                      <CountryFlagImg value={selectedCountry.code} size="w40" alt="" className="!w-6 !h-6 sm:!w-7 sm:!h-7 rounded-full" />
                      <span className="truncate text-sm sm:text-base font-bold text-brand-text-main dark:text-dark-text-main">
                        {displayedNationalityName}
                      </span>
                    </>
                  ) : data.nacionalidad ? (
                    <>
                      <CountryFlagImg value={data.nacionalidad} size="w40" alt="" className="!w-6 !h-6 sm:!w-7 sm:!h-7 rounded-full" />
                      <span className="truncate text-sm sm:text-base font-bold text-brand-text-main dark:text-dark-text-main">
                        {displayedNationalityName}
                      </span>
                    </>
                  ) : (
                    <span className="text-brand-text-secondary/40 text-sm sm:text-base">
                      {t('sections.nationality_placeholder')}
                    </span>
                  )}
                </div>
                <svg 
                  className={`w-5 h-5 text-brand-primary transition-transform duration-300 shrink-0 ml-2 ${isNationalityOpen ? 'rotate-180' : ''}`} 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor" 
                  strokeWidth="3"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isNationalityOpen && (
                <div className={`absolute left-0 right-0 ${nationalityDropdownPosition === 'up' ? 'bottom-full mb-3 animate-in fade-in slide-in-from-bottom-2' : 'top-full mt-3 animate-in fade-in slide-in-from-top-2'} bg-white dark:bg-dark-bg-card border-2 border-brand-border dark:border-dark-border rounded-[1.5rem] shadow-2xl z-[50] overflow-hidden duration-200`}>
                  <div className="p-3 border-b border-brand-light dark:border-dark-border">
                    <div className="relative">
                      <svg className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-brand-text-secondary/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <input
                        type="text"
                        autoFocus
                        placeholder={t('welcome.search_placeholder')}
                        value={nationalitySearch}
                        onChange={(e) => setNationalitySearch(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 text-sm font-bold rounded-full bg-brand-light/40 dark:bg-dark-bg-main/40 border-2 border-transparent focus:border-brand-primary/30 text-brand-text-main dark:text-dark-text-main placeholder:text-brand-text-secondary/40 outline-none transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  </div>
                  <div className="max-h-[280px] overflow-y-auto custom-scrollbar">
                    {filteredCountries.length === 0 ? (
                      <div className="px-6 py-6 text-center text-sm text-brand-text-secondary/50 font-medium italic">
                        {t('sections.no_countries_found')}
                      </div>
                    ) : (
                      filteredCountries.map((country) => (
                        <button
                          key={country.code}
                          type="button"
                          onClick={() => handleNationalitySelect(country)}
                          className={`w-full px-5 sm:px-6 py-3.5 sm:py-4 text-left flex items-center gap-3 sm:gap-4 transition-colors hover:bg-brand-light/50 dark:hover:bg-dark-bg-main/50 border-b border-brand-light dark:border-dark-border last:border-0 ${
                            (selectedCountry && selectedCountry.code === country.code)
                              ? 'text-brand-primary bg-brand-primary/5'
                              : 'text-brand-text-main dark:text-dark-text-main'
                          }`}
                        >
                          <CountryFlagImg value={country.code} size="w40" alt="" className="!w-7 !h-7 sm:!w-8 sm:!h-8 rounded-full" fallbackEmoji={country.code === 'other' ? '🌍' : '🏳️'} />
                          <span className="text-sm sm:text-base font-bold truncate">{country.name}</span>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
              {errors.nacionalidad && <p className="text-[10px] text-red-500 mt-1.5 ml-6 font-bold uppercase tracking-wider">{errors.nacionalidad}</p>}
            </div>

            <div className="relative group verified-phone-display">
              <div className="relative">
                <PhoneInput
                  country={'co'}
                  value={data.telefono_cliente}
                  disabled={true}
                  containerClass="!w-full !opacity-100"
                  inputClass="!w-full !h-auto !py-4 !pl-[70px] !pr-24 !bg-brand-light/30 dark:!bg-dark-bg-main/30 !border-2 !border-brand-border dark:!border-dark-border !rounded-full !text-brand-text-secondary/70 dark:!text-dark-text-secondary/70 !font-bold !text-base !cursor-not-allowed"
                  buttonClass="!bg-transparent !border-none !rounded-l-full !pl-4 !cursor-not-allowed"
                />
                <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
                  <span className="hidden sm:inline-block text-[9px] font-black text-brand-primary uppercase tracking-widest bg-white dark:bg-dark-bg-card px-2 py-1 rounded-md border border-brand-primary/20 shadow-sm">{t('sections.verified')}</span>
                  <svg className="w-5 h-5 text-brand-primary" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <p className="text-[10px] text-brand-text-secondary/50 dark:text-dark-text-secondary/50 mt-1.5 ml-6 font-medium italic">{t('sections.verified_hint')}</p>
            </div>

            <div className="relative group">
              <input
                type="email"
                name="correo_contacto"
                placeholder={t('sections.email')}
                value={data.correo_contacto}
                onChange={handleChange}
                className={`input-premium ${errors.correo_contacto ? 'border-red-200 focus:border-red-400 focus:ring-red-400/5' : ''}`}
              />
              {errors.correo_contacto && <p className="text-[10px] text-red-500 mt-1.5 ml-6 font-bold uppercase tracking-wider">{errors.correo_contacto}</p>}
            </div>
          </div>
      </div>
    </div>
  );
};

export default ReservationContactSection;
