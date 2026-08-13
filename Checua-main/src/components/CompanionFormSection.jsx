import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { COUNTRIES, findCountry, getCountryName } from '../utils/countries';
import { CountryFlagImg } from '../utils/CountryFlagImg.jsx';

const CompanionFormSection = ({ 
  companions, 
  onCompanionChange, 
  onRemoveCompanion, 
  onAddCompanion, 
  errors 
}) => {
  const { t } = useTranslation();
  const [activeDropdown, setActiveDropdown] = useState(null); // { index: number, type: 'doc' | 'nationality' }
  const [nationalitySearches, setNationalitySearches] = useState({}); // { [index]: 'search' }
  const [dropdownPosition, setDropdownPosition] = useState('down');
  const dropdownRef = useRef(null);

  const DOCUMENT_TYPES = [
    t('doc_types.cc'),
    t('doc_types.ti'),
    t('doc_types.ce'),
    t('doc_types.pas'),
    t('doc_types.ppt'),
    t('doc_types.dni'),
    t('doc_types.other')
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        if (activeDropdown?.type === 'nationality') {
          setNationalitySearches(prev => {
            const newState = { ...prev };
            delete newState[activeDropdown.index];
            return newState;
          });
        }
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activeDropdown]);

  const handleDropdownToggle = (index, type, event) => {
    if (activeDropdown?.index === index && activeDropdown?.type === type) {
      if (type === 'nationality') {
        setNationalitySearches(prev => {
          const newState = { ...prev };
          delete newState[index];
          return newState;
        });
      }
      setActiveDropdown(null);
    } else {
      const rect = event.currentTarget.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      setDropdownPosition(spaceBelow < 300 ? 'up' : 'down');
      setActiveDropdown({ index, type });
    }
  };

  const formatNumber = (num) => {
    if (!num) return '';
    return num.toString().replace(/\D/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ".");
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

  const handleInputChange = (index, field, value) => {
    let cleanValue = value;
    
    if (field === 'numero_documento' || field === 'telefono') {
      cleanValue = value.replace(/\D/g, '');
    }
    
    if (field === 'nombre') {
      cleanValue = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
    }
    
    onCompanionChange(index, field, cleanValue);
  };

  const handleNationalitySearchChange = (index, value) => {
    setNationalitySearches(prev => ({
      ...prev,
      [index]: value
    }));
  };

  return (
    <div id="companions-section" className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {companions.map((companion, index) => {
        const selectedCountry = findCountry(companion.nacionalidad);
        const displayedNationalityName = getCountryName(companion.nacionalidad);
        const nationalitySearch = nationalitySearches[index] || '';
        const filteredCountries = COUNTRIES.filter(c =>
          c.name.toLowerCase().includes(nationalitySearch.toLowerCase()) ||
          c.code.toLowerCase().includes(nationalitySearch.toLowerCase())
        );
        const isNatActive = activeDropdown?.index === index && activeDropdown?.type === 'nationality';
        const isDocActive = activeDropdown?.index === index && activeDropdown?.type === 'doc';

        return (
          <div key={index} className="card-premium relative overflow-visible">
            <div className="card-accent-line bg-brand-primary/40"></div>
            
            {/* Header del Acompañante */}
            <div className="px-6 pt-6 md:px-10 flex justify-between items-center">
              <h3 className="text-xs font-black text-brand-primary uppercase tracking-[0.2em] flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-brand-primary text-white flex items-center justify-center text-[10px] shadow-sm">
                  {index + 1}
                </span>
                Acompañante {index + 1}
              </h3>
              <button
                onClick={() => onRemoveCompanion(index)}
                className="p-2 text-brand-text-secondary/40 hover:text-red-500 transition-colors duration-300 rounded-full hover:bg-red-50"
                title="Eliminar acompañante"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>

            <div className="px-6 py-8 md:px-10 md:pb-10 space-y-4">
              {/* Nombre Completo */}
              <div className="relative group">
                <input
                  type="text"
                  placeholder={t('sections.full_name')}
                  value={companion.nombre}
                  onChange={(e) => handleInputChange(index, 'nombre', e.target.value)}
                  className={`input-premium !py-3.5 sm:!py-4 text-sm sm:text-base ${errors[`companion_${index}_nombre`] ? 'border-red-200 focus:border-red-400' : ''}`}
                />
                {errors[`companion_${index}_nombre`] && (
                  <p className="text-[10px] text-red-500 mt-1.5 ml-6 font-bold uppercase tracking-wider">
                    {errors[`companion_${index}_nombre`]}
                  </p>
                )}
              </div>

              {/* Fila: Tipo y Número de Documento */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Tipo de Documento */}
                <div className="relative" ref={isDocActive ? dropdownRef : null}>
                  <button
                    type="button"
                    onClick={(e) => handleDropdownToggle(index, 'doc', e)}
                    className={`input-premium !py-3.5 sm:!py-4 text-sm sm:text-base text-left flex items-center justify-between group ${
                      isDocActive ? 'border-brand-primary ring-4 ring-brand-primary/5' : errors[`companion_${index}_tipo_documento`] ? 'border-red-200' : ''
                    }`}
                  >
                    <span className={`truncate ${companion.tipo_documento ? '' : 'text-brand-text-secondary/40'}`}>
                      {companion.tipo_documento || t('sections.doc_type')}
                    </span>
                    <svg 
                      className={`w-5 h-5 text-brand-primary transition-transform duration-300 ${isDocActive ? 'rotate-180' : ''}`} 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor" 
                      strokeWidth="3"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {isDocActive && (
                    <div className={`absolute left-0 right-0 ${dropdownPosition === 'up' ? 'bottom-full mb-3 animate-in fade-in slide-in-from-bottom-2' : 'top-full mt-3 animate-in fade-in slide-in-from-top-2'} bg-white dark:bg-dark-bg-card border-2 border-brand-border dark:border-dark-border rounded-[1.5rem] shadow-2xl z-[50] overflow-hidden duration-200`}>
                      <div className="max-h-[200px] overflow-y-auto custom-scrollbar">
                        {DOCUMENT_TYPES.map((type) => (
                          <button
                            key={type}
                            type="button"
                            onClick={() => {
                              onCompanionChange(index, 'tipo_documento', type);
                              setActiveDropdown(null);
                            }}
                            className={`w-full px-6 py-4 text-left text-sm font-bold transition-colors hover:bg-brand-light/50 dark:hover:bg-dark-bg-main/50 border-b border-brand-light dark:border-dark-border last:border-0 ${
                              companion.tipo_documento === type ? 'text-brand-primary bg-brand-primary/5' : 'text-brand-text-main dark:text-dark-text-main'
                            }`}
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {errors[`companion_${index}_tipo_documento`] && (
                    <p className="text-[10px] text-red-500 mt-1.5 ml-6 font-bold uppercase tracking-wider">
                      {errors[`companion_${index}_tipo_documento`]}
                    </p>
                  )}
                </div>

                {/* Número de Documento */}
                <div className="relative group">
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder={t('sections.doc_number')}
                    value={formatNumber(companion.numero_documento)}
                    onChange={(e) => handleInputChange(index, 'numero_documento', e.target.value)}
                    className={`input-premium !py-3.5 sm:!py-4 text-sm sm:text-base ${errors[`companion_${index}_numero_documento`] ? 'border-red-200 focus:border-red-400' : ''}`}
                  />
                  {errors[`companion_${index}_numero_documento`] && (
                    <p className="text-[10px] text-red-500 mt-1.5 ml-6 font-bold uppercase tracking-wider">
                      {errors[`companion_${index}_numero_documento`]}
                    </p>
                  )}
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
                    value={companion.fecha_nacimiento}
                    onChange={(e) => handleInputChange(index, 'fecha_nacimiento', e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                    className={`input-premium !py-3.5 sm:!py-4 text-sm sm:text-base pr-28 sm:pr-36 ${errors[`companion_${index}_fecha_nacimiento`] ? 'border-red-200 focus:border-red-400 focus:ring-red-400/5' : ''}`}
                  />
                  <div className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    {calculateAge(companion.fecha_nacimiento) !== null ? (
                      <div className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-gradient-to-r from-brand-primary/10 to-brand-primary/20 border border-brand-primary/30 animate-in fade-in zoom-in duration-300">
                        <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-[10px] sm:text-xs font-black text-brand-primary uppercase tracking-wider">
                          {calculateAge(companion.fecha_nacimiento)} {t('sections.age_suffix')}
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
                {errors[`companion_${index}_fecha_nacimiento`] && (
                  <p className="text-[10px] text-red-500 mt-1.5 ml-6 font-bold uppercase tracking-wider">
                    {errors[`companion_${index}_fecha_nacimiento`]}
                  </p>
                )}
              </div>

              {/* Nacionalidad con selector de banderas */}
              <div className="relative group" ref={isNatActive ? dropdownRef : null}>
                <label className="text-[8px] sm:text-[9px] font-black text-brand-primary uppercase tracking-widest mb-1.5 block opacity-70 ml-6">
                  {t('sections.nationality')}
                </label>
                <button
                  type="button"
                  onClick={(e) => handleDropdownToggle(index, 'nationality', e)}
                  className={`input-premium !py-3.5 sm:!py-4 text-sm sm:text-base text-left flex items-center justify-between group ${
                    isNatActive ? 'border-brand-primary ring-4 ring-brand-primary/5' : errors[`companion_${index}_nacionalidad`] ? 'border-red-200' : ''
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
                    ) : companion.nacionalidad ? (
                      <>
                        <CountryFlagImg value={companion.nacionalidad} size="w40" alt="" className="!w-6 !h-6 sm:!w-7 sm:!h-7 rounded-full" />
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
                    className={`w-5 h-5 text-brand-primary transition-transform duration-300 shrink-0 ml-2 ${isNatActive ? 'rotate-180' : ''}`} 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor" 
                    strokeWidth="3"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isNatActive && (
                  <div className={`absolute left-0 right-0 ${dropdownPosition === 'up' ? 'bottom-full mb-3 animate-in fade-in slide-in-from-bottom-2' : 'top-full mt-3 animate-in fade-in slide-in-from-top-2'} bg-white dark:bg-dark-bg-card border-2 border-brand-border dark:border-dark-border rounded-[1.5rem] shadow-2xl z-[50] overflow-hidden duration-200`}>
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
                          onChange={(e) => handleNationalitySearchChange(index, e.target.value)}
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
                            onClick={() => {
                              onCompanionChange(index, 'nacionalidad', country.name);
                              setNationalitySearches(prev => {
                                const newState = { ...prev };
                                delete newState[index];
                                return newState;
                              });
                              setActiveDropdown(null);
                            }}
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
                {errors[`companion_${index}_nacionalidad`] && (
                  <p className="text-[10px] text-red-500 mt-1.5 ml-6 font-bold uppercase tracking-wider">
                    {errors[`companion_${index}_nacionalidad`]}
                  </p>
                )}
              </div>

              {/* Fila: Teléfono y Correo */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Teléfono */}
                <div className="relative group">
                  <input
                    type="text"
                    inputMode="tel"
                    placeholder="Teléfono"
                    value={companion.telefono}
                    onChange={(e) => handleInputChange(index, 'telefono', e.target.value)}
                    className={`input-premium !py-3.5 sm:!py-4 text-sm sm:text-base ${errors[`companion_${index}_telefono`] ? 'border-red-200 focus:border-red-400' : ''}`}
                  />
                  {errors[`companion_${index}_telefono`] && (
                    <p className="text-[10px] text-red-500 mt-1.5 ml-6 font-bold uppercase tracking-wider">
                      {errors[`companion_${index}_telefono`]}
                    </p>
                  )}
                </div>

                {/* Correo Electrónico */}
                <div className="relative group">
                  <input
                    type="email"
                    placeholder={t('sections.email')}
                    value={companion.correo}
                    onChange={(e) => handleInputChange(index, 'correo', e.target.value)}
                    className={`input-premium !py-3.5 sm:!py-4 text-sm sm:text-base ${errors[`companion_${index}_correo`] ? 'border-red-200 focus:border-red-400' : ''}`}
                  />
                  {errors[`companion_${index}_correo`] && (
                    <p className="text-[10px] text-red-500 mt-1.5 ml-6 font-bold uppercase tracking-wider">
                      {errors[`companion_${index}_correo`]}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Botón para añadir otro acompañante más */}
      <button
        onClick={onAddCompanion}
        className="w-full py-6 border-2 border-dashed border-brand-primary/30 rounded-[2.5rem] flex items-center justify-center gap-3 text-brand-primary font-black uppercase tracking-widest hover:bg-brand-primary/5 hover:border-brand-primary transition-all duration-300 group"
      >
        <div className="w-8 h-8 rounded-full bg-brand-primary text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        </div>
        Añadir otro acompañante
      </button>
    </div>
  );
};

export default CompanionFormSection;
