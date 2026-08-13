import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

const getTimeValueStr = (timeValue) => {
  if (!timeValue) return '';
  if (typeof timeValue === 'string') return timeValue;
  return timeValue.value || timeValue.hora_reserva || timeValue.hora || timeValue.label || '';
};

const formatTime = (timeStr) => {
  const raw = getTimeValueStr(timeStr);
  if (!raw) return "";
  const parts = raw.split(':');
  if (parts.length >= 2) return `${parts[0]}:${parts[1]}`;
  return raw;
};

const getHourNumber = (timeStr) => {
  const raw = getTimeValueStr(timeStr);
  const [h] = (raw || '').split(':');
  const hour = Number.parseInt(h, 10);
  return Number.isNaN(hour) ? null : hour;
};

const getMeridiem = (timeStr) => {
  const hour = getHourNumber(timeStr);
  if (hour === null) return '';
  return hour < 12 ? 'AM' : 'PM';
};

const getPeriod = (timeStr) => {
  const hour = getHourNumber(timeStr);
  if (hour === null) return '';
  return hour < 12 ? 'mañana' : 'tarde';
};

const TimeSelectionSection = ({ onSelect, selectedTime, schedules = [], loading = false, errors, sectionRef, tipoHora = 'varias_horas' }) => {
  const { t } = useTranslation();
  
  const shouldRender = tipoHora !== 'sin_hora';

  const normalizedSchedules = useMemo(() => {
    if (!shouldRender) return [];
    return (schedules || []).map((s) => {
      const valueStr = getTimeValueStr(s);
      const labelStr = s?.label || valueStr;
      const period = s?.period || getPeriod(valueStr);
      return { ...s, value: s?.value || valueStr, label: labelStr, period };
    });
  }, [schedules, shouldRender]);

  const morningSchedules = normalizedSchedules.filter(s => s.period === 'mañana');
  const afternoonSchedules = normalizedSchedules.filter(s => s.period === 'tarde');

  const selectedValueStr = getTimeValueStr(selectedTime);
  const fixedSchedule = tipoHora === 'hora_fija' ? normalizedSchedules[0] : null;
  const fixedValueStr = fixedSchedule ? getTimeValueStr(fixedSchedule) : '';

  useEffect(() => {
    if (!shouldRender) return;
    if (tipoHora !== 'hora_fija') return;
    if (loading) return;
    if (!fixedSchedule) return;
    if (selectedValueStr && selectedValueStr === fixedValueStr) return;
    onSelect(fixedSchedule);
  }, [fixedSchedule, fixedValueStr, loading, onSelect, selectedValueStr, shouldRender, tipoHora]);

  const handleTimeSelect = (time) => {
    if (tipoHora === 'hora_fija') return; // No permitir cambios si es hora fija
    onSelect(time);
  };

  if (!shouldRender) return null;

  return (
    <div 
      ref={sectionRef}
      className={`card-premium ${errors.time ? 'border-red-400 ring-2 ring-red-50' : ''}`}
    >
      <div className={`card-accent-line ${errors.time ? 'bg-red-400' : ''}`}></div>
      
      <div className="px-6 py-8 md:px-10 md:py-10 space-y-6">
        <div className="space-y-8">
          {loading ? (
            <div className="py-10 text-center">
              <div className="w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-sm text-brand-text-secondary font-medium italic uppercase tracking-widest opacity-60">{t('sections.loading_hours')}</p>
            </div>
          ) : tipoHora === 'hora_fija' ? (
            fixedSchedule ? (
              <div className="w-full">
                <div className="bg-brand-light/30 dark:bg-dark-bg-main/40 border border-brand-primary/20 rounded-[2rem] p-6 shadow-sm space-y-3">
                  <p className="text-[10px] uppercase tracking-widest font-black text-brand-primary">
                    {t('sections.fixed_time_label')}
                  </p>
                  <p className="text-sm text-brand-text-secondary dark:text-dark-text-secondary font-medium leading-relaxed">
                    {t('sections.fixed_time_notice')}
                  </p>
                  <p className="text-brand-text-main dark:text-dark-text-main font-black text-2xl md:text-3xl">
                    {formatTime(fixedValueStr)}
                    <span className="ml-2 text-[10px] font-black uppercase text-brand-text-secondary/50 dark:text-dark-text-secondary/50 tracking-widest">
                      {getMeridiem(fixedValueStr)}
                    </span>
                  </p>
                </div>
              </div>
            ) : (
              <div className="py-10 text-center bg-gray-50 dark:bg-dark-bg-main/20 rounded-3xl border-2 border-dashed border-gray-200 dark:border-dark-border">
                <p className="text-sm text-brand-text-secondary font-medium italic">{t('sections.no_hours_available_plan')}</p>
              </div>
            )
          ) : normalizedSchedules.length > 0 ? (
            <>
              {/* Morning Section */}
              {morningSchedules.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-brand-text-secondary/60 dark:text-dark-text-secondary/60 whitespace-nowrap">{t('sections.morning')}</span>
                    <div className="h-[1px] flex-1 bg-brand-border/60 dark:bg-dark-border/60"></div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full">
                    {morningSchedules.map((time) => (
                      <button
                        key={time.id || time.value || time.hora || time.label}
                        type="button"
                        disabled={tipoHora === 'hora_fija'}
                        onClick={() => handleTimeSelect(time)}
                        className={`py-4 px-2 rounded-full text-sm md:text-base font-bold transition-all duration-300 border-2 w-full flex items-center justify-center ${
                          selectedValueStr && selectedValueStr === getTimeValueStr(time)
                            ? 'bg-brand-primary border-brand-primary text-white shadow-lg shadow-brand-primary/20 scale-105'
                            : tipoHora === 'hora_fija' 
                              ? 'bg-gray-100 dark:bg-dark-bg-main/30 border-brand-border dark:border-dark-border text-gray-400 cursor-not-allowed'
                              : 'bg-brand-light/20 dark:bg-dark-bg-main/50 border-brand-border dark:border-dark-border text-brand-text-main dark:text-dark-text-main hover:border-brand-primary/50'
                        }`}
                      >
                        {formatTime(time)}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Afternoon Section */}
              {afternoonSchedules.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-brand-text-secondary/60 dark:text-dark-text-secondary/60 whitespace-nowrap">{t('sections.afternoon')}</span>
                    <div className="h-[1px] flex-1 bg-brand-border/60 dark:bg-dark-border/60"></div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full">
                    {afternoonSchedules.map((time) => (
                      <button
                        key={time.id || time.value || time.hora || time.label}
                        type="button"
                        disabled={tipoHora === 'hora_fija'}
                        onClick={() => handleTimeSelect(time)}
                        className={`py-4 px-2 rounded-full text-sm md:text-base font-bold transition-all duration-300 border-2 w-full flex items-center justify-center ${
                          selectedValueStr && selectedValueStr === getTimeValueStr(time)
                            ? 'bg-brand-primary border-brand-primary text-white shadow-lg shadow-brand-primary/20 scale-105'
                            : tipoHora === 'hora_fija' 
                              ? 'bg-gray-100 dark:bg-dark-bg-main/30 border-brand-border dark:border-dark-border text-gray-400 cursor-not-allowed'
                              : 'bg-brand-light/20 dark:bg-dark-bg-main/50 border-brand-border dark:border-dark-border text-brand-text-main dark:text-dark-text-main hover:border-brand-primary/50'
                        }`}
                      >
                        {formatTime(time)}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="py-10 text-center bg-gray-50 dark:bg-dark-bg-main/20 rounded-3xl border-2 border-dashed border-gray-200 dark:border-dark-border">
              <p className="text-sm text-brand-text-secondary font-medium italic">{t('sections.no_hours_available_plan')}</p>
            </div>
          )}

          {/* Selection Summary Card */}
          <div className="space-y-4">
            {tipoHora !== 'hora_fija' && selectedValueStr ? (
              <div className="animate-in fade-in slide-in-from-top-2 duration-300 w-full">
                <div className="bg-brand-light/30 dark:bg-dark-bg-main/40 border border-brand-primary/20 rounded-[2rem] p-6 flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white dark:bg-dark-bg-card rounded-2xl border border-brand-primary/10 shadow-sm flex items-center justify-center text-brand-primary">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-widest font-black text-brand-primary">{t('sections.time_selected_label')}</p>
                      <p className="text-brand-text-main dark:text-dark-text-main font-black text-xl md:text-2xl mt-0.5">
                        {formatTime(selectedValueStr)}
                        <span className="ml-2 text-[10px] font-black uppercase text-brand-text-secondary/50 dark:text-dark-text-secondary/50 tracking-widest">
                          {getMeridiem(selectedValueStr)}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              tipoHora !== 'hora_fija' ? (
                <div className="bg-brand-light/10 dark:bg-dark-bg-main/30 border-2 border-dashed border-brand-border dark:border-dark-border rounded-[2.5rem] p-8 text-center w-full">
                  <p className="text-sm text-brand-text-secondary/60 dark:text-dark-text-secondary/60 font-medium italic">
                    {t('sections.time_not_selected')}
                  </p>
                </div>
              ) : null
            )}
            {errors.time && <p className="text-[10px] text-red-500 mt-1 ml-6 font-bold uppercase tracking-wider text-center">{errors.time}</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimeSelectionSection;
