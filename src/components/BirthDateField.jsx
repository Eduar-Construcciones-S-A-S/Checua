import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

const parseDate = (value) => {
  if (!value) return { day: '', month: '', year: '' };
  const [year = '', month = '', day = ''] = String(value).split('-');
  return { day, month, year };
};

const BirthDateField = ({ value = '', onChange, hasError = false }) => {
  const { t, i18n } = useTranslation();
  const [parts, setParts] = useState(() => parseDate(value));
  const currentYear = new Date().getFullYear();

  const years = useMemo(
    () => Array.from({ length: 121 }, (_, index) => currentYear - index),
    [currentYear]
  );

  const months = useMemo(
    () =>
      Array.from({ length: 12 }, (_, index) => {
        const label = new Intl.DateTimeFormat(
          i18n.language?.startsWith('en') ? 'en-US' : 'es-CO',
          { month: 'long', timeZone: 'UTC' }
        ).format(new Date(Date.UTC(2024, index, 1)));

        return {
          value: String(index + 1).padStart(2, '0'),
          label: label.charAt(0).toUpperCase() + label.slice(1)
        };
      }),
    [i18n.language]
  );

  const daysInMonth = useMemo(() => {
    if (!parts.month) return 31;
    const safeYear = Number(parts.year) || 2000;
    return new Date(safeYear, Number(parts.month), 0).getDate();
  }, [parts.month, parts.year]);

  const computedAge = useMemo(() => {
    if (!value) return null;
    const birthDate = new Date(`${value}T00:00:00`);
    if (Number.isNaN(birthDate.getTime())) return null;

    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();

    if (
      monthDifference < 0 ||
      (monthDifference === 0 && today.getDate() < birthDate.getDate())
    ) {
      age -= 1;
    }

    return age >= 0 ? age : null;
  }, [value]);

  const updatePart = (field, nextValue) => {
    const nextParts = { ...parts, [field]: nextValue };

    if (field === 'month' || field === 'year') {
      const safeYear = Number(nextParts.year) || 2000;
      const maxDay = nextParts.month
        ? new Date(safeYear, Number(nextParts.month), 0).getDate()
        : 31;

      if (Number(nextParts.day) > maxDay) {
        nextParts.day = String(maxDay).padStart(2, '0');
      }
    }

    setParts(nextParts);

    if (nextParts.day && nextParts.month && nextParts.year) {
      onChange(`${nextParts.year}-${nextParts.month}-${nextParts.day}`);
    } else if (value) {
      onChange('');
    }
  };

  const selectClass = `w-full min-w-0 appearance-none rounded-2xl border-2 bg-brand-light/30 dark:bg-dark-bg-main/50 px-3 py-3.5 pr-8 text-sm font-black outline-none transition-all duration-300 focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/5 text-brand-text-main dark:text-dark-text-main ${
    hasError ? 'border-red-200' : 'border-brand-border dark:border-dark-border'
  }`;

  return (
    <div className="relative">
      <div className="mb-2 flex items-end justify-between gap-3 px-1 sm:px-2">
        <label className="text-[8px] sm:text-[9px] font-black text-brand-primary uppercase tracking-widest opacity-70">
          {t('sections.birth_date')}
        </label>

        <div className="shrink-0">
          {computedAge !== null ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-primary/30 bg-brand-primary/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-brand-primary">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {computedAge} {t('sections.age_suffix')}
            </span>
          ) : (
            <span className="inline-flex rounded-full border border-brand-border/50 dark:border-dark-border/50 bg-brand-light/40 dark:bg-dark-bg-main/40 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-brand-text-secondary/40 dark:text-dark-text-secondary/40">
              -- {t('sections.age_suffix')}
            </span>
          )}
        </div>
      </div>

      <div className="rounded-[1.5rem] border-2 border-brand-border/70 dark:border-dark-border bg-white/40 dark:bg-dark-bg-main/20 p-2.5 sm:p-3">
        <div className="grid grid-cols-[0.8fr_1.35fr_1fr] gap-2">
          <div className="relative min-w-0">
            <select
              value={parts.day}
              onChange={(event) => updatePart('day', event.target.value)}
              className={selectClass}
              aria-label={i18n.language?.startsWith('en') ? 'Day' : 'Día'}
            >
              <option value="">{i18n.language?.startsWith('en') ? 'Day' : 'Día'}</option>
              {Array.from({ length: daysInMonth }, (_, index) => {
                const day = String(index + 1).padStart(2, '0');
                return <option key={day} value={day}>{day}</option>;
              })}
            </select>
            <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-brand-primary">⌄</span>
          </div>

          <div className="relative min-w-0">
            <select
              value={parts.month}
              onChange={(event) => updatePart('month', event.target.value)}
              className={selectClass}
              aria-label={i18n.language?.startsWith('en') ? 'Month' : 'Mes'}
            >
              <option value="">{i18n.language?.startsWith('en') ? 'Month' : 'Mes'}</option>
              {months.map((month) => (
                <option key={month.value} value={month.value}>{month.label}</option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-brand-primary">⌄</span>
          </div>

          <div className="relative min-w-0">
            <select
              value={parts.year}
              onChange={(event) => updatePart('year', event.target.value)}
              className={selectClass}
              aria-label={i18n.language?.startsWith('en') ? 'Year' : 'Año'}
            >
              <option value="">{i18n.language?.startsWith('en') ? 'Year' : 'Año'}</option>
              {years.map((year) => (
                <option key={year} value={String(year)}>{year}</option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-brand-primary">⌄</span>
          </div>
        </div>

        <p className="mt-2 px-1 text-[9px] font-bold text-brand-text-secondary/50 dark:text-dark-text-secondary/50">
          {i18n.language?.startsWith('en')
            ? 'Select day, month and year.'
            : 'Selecciona el día, el mes y el año.'}
        </p>
      </div>
    </div>
  );
};

export default BirthDateField;
