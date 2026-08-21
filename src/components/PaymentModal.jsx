import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PAYMENT_CONFIG } from '../config/paymentConfig';

const PaymentModal = ({
  isOpen,
  onClose,
  experience,
  participants,
  totalAmount,
  formatCurrency,
  subjectToAdvisor = false
}) => {
  const { t, i18n } = useTranslation();
  const [copiedField, setCopiedField] = useState(null);

  if (!isOpen) return null;

  const depositAmount = Math.round(totalAmount * 0.3);
  const isEnglish = i18n.language?.startsWith('en');

  const advisorPriceTitle = isEnglish
    ? 'Price defined with your advisor'
    : 'Precio definido con tu asesor';

  const advisorPriceText = isEnglish
    ? 'For this weekday date, the price is subject to the conditions previously agreed with the advisor. No automatic total, deposit or remaining balance is shown.'
    : 'Para esta fecha entre semana, el precio está sujeto a las condiciones previamente definidas con el asesor. No se muestra un total, abono ni saldo automático.';

  const advisorPaymentInstruction = isEnglish
    ? 'Send the payment receipt for the amount or remaining balance indicated or agreed with your advisor so we can validate your reservation.'
    : 'Envía el comprobante de pago del valor o saldo que nuestro asesor te haya indicado o que hayas pactado para validar tu reserva.';

  const handleCopy = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleWhatsApp = () => {
    const defaultMessage = subjectToAdvisor
      ? (isEnglish
          ? 'Hello, I am sending the payment receipt for the amount agreed with the advisor for my Desierto de Checua reservation.'
          : 'Hola, envío el comprobante de pago del valor acordado con el asesor para mi reserva en el Desierto de Checua.')
      : t('summary.payment.whatsapp_message');

    const message = encodeURIComponent(defaultMessage);
    window.open(`https://wa.me/${PAYMENT_CONFIG.whatsapp.official_number}?text=${message}`, '_blank');
  };

  const CopyButton = ({ value, field, label }) => (
    <button
      type="button"
      onClick={() => handleCopy(value, field)}
      className="w-full sm:w-auto px-4 py-2.5 bg-brand-primary text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:scale-[1.02] active:scale-95 transition-transform shrink-0"
    >
      {copiedField === field ? t('summary.payment.copied') : label}
    </button>
  );

  const PaymentRow = ({ label, value, field, copyLabel }) => (
    <div className="rounded-2xl bg-brand-light/20 dark:bg-dark-bg-main/25 border border-brand-primary/10 p-4 sm:p-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-5">
        <div className="min-w-0">
          <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.16em] text-brand-text-secondary dark:text-dark-text-secondary mb-1.5">
            {label}
          </p>
          <p className="font-mono font-black text-sm sm:text-base text-brand-text-main dark:text-dark-text-main break-all leading-relaxed">
            {value}
          </p>
        </div>
        <CopyButton value={value} field={field} label={copyLabel} />
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[1000] flex items-start sm:items-center justify-center bg-brand-dark/40 dark:bg-black/60 backdrop-blur-md animate-in fade-in duration-300 overflow-y-auto p-2 sm:p-5">
      <div className="w-full max-w-2xl bg-white dark:bg-dark-bg-card rounded-[1.75rem] sm:rounded-[2.5rem] shadow-2xl relative border border-brand-border dark:border-dark-border animate-in zoom-in-95 duration-300 my-2 sm:my-6 overflow-hidden">
        <div className="h-2 w-full bg-brand-primary shrink-0"></div>

        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 sm:top-6 sm:right-6 w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center text-brand-text-secondary dark:text-dark-text-secondary hover:text-red-500 dark:hover:text-red-400 transition-all duration-300 hover:scale-110 active:scale-95 z-10"
        >
          <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="px-4 sm:px-7 md:px-10 pt-14 sm:pt-16 pb-6 sm:pb-10 space-y-5 sm:space-y-7">
          <div className="text-center px-8 sm:px-12">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-brand-text-main dark:text-dark-text-main uppercase tracking-tight leading-tight">
              {t('summary.payment.title')}
            </h2>
          </div>

          <div className="bg-brand-light/30 dark:bg-dark-bg-main/30 rounded-[1.5rem] sm:rounded-[2rem] p-4 sm:p-6 border border-brand-primary/10 space-y-4">
            <div>
              <p className="text-[10px] sm:text-xs font-black text-brand-primary uppercase tracking-widest opacity-70 mb-1">
                {t('summary.payment.experience')}
              </p>
              <p className="text-brand-text-main dark:text-dark-text-main font-black text-base sm:text-lg leading-snug break-words">
                {experience}
              </p>
            </div>

            <div className="pt-3 border-t border-brand-primary/10">
              <p className="text-[10px] font-bold text-brand-text-secondary dark:text-dark-text-secondary uppercase tracking-widest mb-3">
                {t('summary.payment.participants')}: <span className="text-brand-text-main dark:text-dark-text-main">{participants}</span>
              </p>

              {subjectToAdvisor ? (
                <div className="rounded-[1.25rem] sm:rounded-[1.5rem] border-2 border-amber-400/35 bg-amber-400/10 p-4 sm:p-6 text-center">
                  <div className="mx-auto mb-3 w-10 h-10 rounded-full bg-amber-400/15 flex items-center justify-center text-xl" aria-hidden="true">
                    ⚠️
                  </div>
                  <p className="text-[10px] sm:text-xs font-black text-amber-600 dark:text-amber-300 uppercase tracking-[0.16em]">
                    {advisorPriceTitle}
                  </p>
                  <p className="mt-3 text-sm sm:text-base font-bold text-brand-text-main dark:text-dark-text-main leading-relaxed">
                    {advisorPriceText}
                  </p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="rounded-2xl border border-brand-primary/15 bg-white/50 dark:bg-dark-bg-card/40 p-4 sm:p-5">
                      <p className="text-[9px] font-black text-brand-text-secondary dark:text-dark-text-secondary uppercase tracking-wider">
                        Valor total de la reserva
                      </p>
                      <p className="mt-2 text-lg sm:text-xl font-black text-brand-text-main dark:text-dark-text-main break-words">
                        {formatCurrency(totalAmount)} COP
                      </p>
                    </div>

                    <div className="rounded-2xl border-2 border-brand-primary/40 bg-brand-primary/10 p-4 sm:p-5 shadow-[0_10px_25px_-18px_rgba(140,201,21,0.9)]">
                      <p className="text-[9px] font-black text-brand-primary uppercase tracking-wider">
                        Abono para confirmar (30 %)
                      </p>
                      <p className="mt-2 text-xl sm:text-2xl font-black text-brand-primary break-words">
                        {formatCurrency(depositAmount)} COP
                      </p>
                    </div>
                  </div>

                  <p className="mt-3 text-[10px] font-bold text-brand-text-secondary dark:text-dark-text-secondary text-center leading-relaxed">
                    Paga el abono mínimo para confirmar tu cupo.
                  </p>
                </>
              )}
            </div>
          </div>

          <div className="space-y-4 sm:space-y-5">
            <div className="p-4 sm:p-6 bg-white dark:bg-dark-bg-card border-2 border-brand-border dark:border-dark-border rounded-[1.5rem] sm:rounded-3xl space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-11 sm:h-11 bg-white dark:bg-dark-bg-card rounded-xl flex items-center justify-center p-1 overflow-hidden border border-brand-border dark:border-dark-border shrink-0">
                  <img src={PAYMENT_CONFIG.bancolombia.logo} alt="Bancolombia" className="w-full h-full object-contain" loading="lazy" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-black text-brand-text-main dark:text-dark-text-main uppercase text-sm sm:text-base tracking-wider leading-tight">
                    Bancolombia
                  </h3>
                  <p className="text-[9px] sm:text-[10px] font-bold text-brand-text-secondary dark:text-dark-text-secondary uppercase tracking-wider mt-1">
                    Carlos Humberto Parra Franco
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                <PaymentRow
                  label="Cuenta de ahorros"
                  value={PAYMENT_CONFIG.bancolombia.account_number}
                  field="bc-account"
                  copyLabel="Copiar cuenta"
                />
                <PaymentRow
                  label="Llave Bancolombia"
                  value={PAYMENT_CONFIG.bancolombia.key}
                  field="bc-key"
                  copyLabel="Copiar llave"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
              <div className="p-4 sm:p-5 bg-white dark:bg-dark-bg-card border-2 border-brand-border dark:border-dark-border rounded-[1.5rem] sm:rounded-3xl space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white dark:bg-dark-bg-card rounded-xl flex items-center justify-center p-1 overflow-hidden border border-brand-border dark:border-dark-border shrink-0">
                    <img src={PAYMENT_CONFIG.nequi.logo} alt="Nequi" className="w-full h-full object-contain" loading="lazy" />
                  </div>
                  <div>
                    <h3 className="font-black text-brand-text-main dark:text-dark-text-main uppercase text-sm tracking-wider">Nequi</h3>
                    <p className="text-[9px] font-bold text-brand-text-secondary dark:text-dark-text-secondary uppercase tracking-wider mt-1">Orlando Acosta</p>
                  </div>
                </div>
                <PaymentRow label="Número Nequi" value={PAYMENT_CONFIG.nequi.number} field="nq" copyLabel="Copiar número" />
              </div>

              <div className="p-4 sm:p-5 bg-white dark:bg-dark-bg-card border-2 border-brand-border dark:border-dark-border rounded-[1.5rem] sm:rounded-3xl space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white dark:bg-dark-bg-card rounded-xl flex items-center justify-center p-1 overflow-hidden border border-brand-border dark:border-dark-border shrink-0">
                    <img src={PAYMENT_CONFIG.breb.logo} alt="Daviplata" className="w-full h-full object-contain" loading="lazy" />
                  </div>
                  <div>
                    <h3 className="font-black text-brand-text-main dark:text-dark-text-main uppercase text-sm tracking-wider">Daviplata</h3>
                    <p className="text-[9px] font-bold text-brand-text-secondary dark:text-dark-text-secondary uppercase tracking-wider mt-1">Orlando Acosta</p>
                  </div>
                </div>
                <PaymentRow label="Número Daviplata" value={PAYMENT_CONFIG.breb.key} field="daviplata" copyLabel="Copiar número" />
              </div>
            </div>
          </div>

          <div className="bg-brand-primary/5 border border-brand-primary/20 rounded-[1.5rem] sm:rounded-[2rem] p-4 sm:p-6 space-y-4">
            <p className="text-xs font-bold text-brand-dark dark:text-brand-primary text-center leading-relaxed">
              {subjectToAdvisor ? advisorPaymentInstruction : t('summary.payment.whatsapp_instruction')}
            </p>
            <button
              type="button"
              onClick={handleWhatsApp}
              className="w-full px-5 py-4 bg-[#25D366] text-white font-black text-xs uppercase tracking-widest rounded-full shadow-lg hover:scale-[1.01] active:scale-95 transition-all"
            >
              <span className="mx-auto inline-flex max-w-full items-center justify-center gap-2.5">
                <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12.04 2a9.84 9.84 0 00-8.43 14.92L2 22l5.22-1.54A9.98 9.98 0 1012.04 2zm0 17.99a8.1 8.1 0 01-4.13-1.13l-.3-.18-3.1.91.93-3.02-.2-.31a8.02 8.02 0 116.8 3.73zm4.45-6.03c-.24-.12-1.44-.71-1.66-.79-.22-.08-.38-.12-.54.12-.16.24-.63.79-.77.95-.14.16-.28.18-.52.06-.24-.12-1.03-.38-1.96-1.21a7.3 7.3 0 01-1.36-1.69c-.14-.24-.02-.37.1-.49.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.54-1.3-.74-1.78-.2-.47-.4-.4-.54-.41h-.46c-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2s.86 2.32.98 2.48c.12.16 1.69 2.58 4.1 3.62.57.25 1.02.4 1.37.51.58.18 1.1.16 1.51.1.46-.07 1.44-.59 1.64-1.16.2-.57.2-1.06.14-1.16-.06-.1-.22-.16-.46-.28z" />
                </svg>
                <span className="min-w-0 text-center leading-tight">{t('summary.payment.send_whatsapp')}</span>
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
