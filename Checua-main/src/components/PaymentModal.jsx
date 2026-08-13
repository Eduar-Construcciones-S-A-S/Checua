import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PAYMENT_CONFIG } from '../config/paymentConfig';

const PaymentModal = ({ isOpen, onClose, experience, participants, totalAmount, formatCurrency }) => {
  const { t } = useTranslation();
  const [copiedField, setCopiedField] = useState(null);

  if (!isOpen) return null;

  const handleCopy = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleWhatsApp = () => {
    const message = encodeURIComponent(t('summary.payment.whatsapp_message'));
    window.open(`https://wa.me/${PAYMENT_CONFIG.whatsapp.official_number}?text=${message}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-brand-dark/40 dark:bg-black/60 backdrop-blur-md animate-in fade-in duration-300 overflow-y-auto">
      <div className="w-full max-w-lg bg-white dark:bg-dark-bg-card rounded-[2.5rem] shadow-2xl relative border border-brand-border dark:border-dark-border animate-in zoom-in-95 duration-300 my-auto">
        {/* Header Accent */}
        <div className="h-2 w-full bg-brand-primary rounded-t-[2.5rem] shrink-0"></div>
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 w-11 h-11 flex items-center justify-center text-brand-text-secondary dark:text-dark-text-secondary hover:text-red-500 dark:hover:text-red-400 transition-all duration-300 hover:scale-110 active:scale-95 z-10"
        >
          <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="px-6 pt-16 pb-8 md:px-10 md:pb-10 space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl md:text-3xl font-black text-brand-text-main dark:text-dark-text-main uppercase tracking-tight">
              {t('summary.payment.title')}
            </h2>
          </div>

          {/* Resumen Rápido */}
          <div className="bg-brand-light/30 dark:bg-dark-bg-main/30 rounded-[2rem] p-5 border border-brand-primary/10 space-y-2">
            <p className="text-xs font-black text-brand-primary uppercase tracking-widest opacity-60">
              {t('summary.payment.experience')}
            </p>
            <p className="text-brand-text-main dark:text-dark-text-main font-black text-base md:text-lg leading-tight break-words whitespace-normal">
              {experience}
            </p>
            <div className="flex justify-between items-end pt-2 border-t border-brand-primary/10">
              <div>
                <p className="text-[10px] font-bold text-brand-text-secondary dark:text-dark-text-secondary uppercase tracking-widest">
                  {t('summary.payment.participants')}: <span className="text-brand-text-main dark:text-dark-text-main">{participants}</span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-xl md:text-2xl font-black text-brand-primary leading-none">
                  ${formatCurrency(totalAmount)}
                </p>
                <span className="text-[9px] font-black text-brand-primary/40 uppercase tracking-widest">COP</span>
              </div>
            </div>
          </div>

          {/* Métodos de Pago */}
          <div className="space-y-4">
            {/* Bancolombia */}
            <div className="p-4 bg-white dark:bg-dark-bg-card border-2 border-brand-border dark:border-dark-border rounded-3xl space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white dark:bg-dark-bg-card rounded-xl flex items-center justify-center p-1 overflow-hidden border border-brand-border dark:border-dark-border">
                  <img 
                    src={PAYMENT_CONFIG.bancolombia.logo} 
                    alt="Bancolombia" 
                    className="w-full h-full object-contain"
                    loading="lazy"
                  />
                </div>
                <h3 className="font-black text-brand-text-main dark:text-dark-text-main uppercase text-sm tracking-wider">
                  {t('summary.payment.bancolombia_title')}
                </h3>
              </div>
              <div className="flex items-center justify-between gap-3 bg-brand-light/20 dark:bg-dark-bg-main/20 p-3 rounded-2xl min-w-0">
                <span className="font-mono font-bold text-brand-text-main dark:text-dark-text-main min-w-0 break-all">
                  {PAYMENT_CONFIG.bancolombia.account_number}
                </span>
                <button 
                  onClick={() => handleCopy(PAYMENT_CONFIG.bancolombia.account_number, 'bc')}
                  className="px-4 py-2 bg-brand-primary text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:scale-105 transition-transform shrink-0"
                >
                  {copiedField === 'bc' ? t('summary.payment.copied') : t('summary.payment.copy_number')}
                </button>
              </div>
            </div>

            {/* Nequi */}
            <div className="p-4 bg-white dark:bg-dark-bg-card border-2 border-brand-border dark:border-dark-border rounded-3xl space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white dark:bg-dark-bg-card rounded-xl flex items-center justify-center p-1 overflow-hidden border border-brand-border dark:border-dark-border">
                  <img 
                    src={PAYMENT_CONFIG.nequi.logo} 
                    alt="Nequi" 
                    className="w-full h-full object-contain"
                    loading="lazy"
                  />
                </div>
                <h3 className="font-black text-brand-text-main dark:text-dark-text-main uppercase text-sm tracking-wider">
                  {t('summary.payment.nequi_title')}
                </h3>
              </div>
              <div className="flex items-center justify-between gap-3 bg-brand-light/20 dark:bg-dark-bg-main/20 p-3 rounded-2xl min-w-0">
                <span className="font-mono font-bold text-brand-text-main dark:text-dark-text-main min-w-0 break-all">
                  {PAYMENT_CONFIG.nequi.number}
                </span>
                <button 
                  onClick={() => handleCopy(PAYMENT_CONFIG.nequi.number, 'nq')}
                  className="px-4 py-2 bg-brand-primary text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:scale-105 transition-transform shrink-0"
                >
                  {copiedField === 'nq' ? t('summary.payment.copied') : t('summary.payment.copy_number')}
                </button>
              </div>
            </div>

            {/* Bre-B */}
            <div className="p-4 bg-white dark:bg-dark-bg-card border-2 border-brand-border dark:border-dark-border rounded-3xl space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white dark:bg-dark-bg-card rounded-xl flex items-center justify-center p-1 overflow-hidden border border-brand-border dark:border-dark-border">
                  <img 
                    src={PAYMENT_CONFIG.breb.logo} 
                    alt="Bre-B" 
                    className="w-full h-full object-contain"
                    loading="lazy"
                  />
                </div>
                <h3 className="font-black text-brand-text-main dark:text-dark-text-main uppercase text-sm tracking-wider">
                  {t('summary.payment.breb_title')}
                </h3>
              </div>
              <div className="flex items-center justify-between gap-3 bg-brand-light/20 dark:bg-dark-bg-main/20 p-3 rounded-2xl min-w-0">
                <span className="font-mono font-bold text-brand-text-main dark:text-dark-text-main min-w-0 break-all">
                  {PAYMENT_CONFIG.breb.key}
                </span>
                <button 
                  onClick={() => handleCopy(PAYMENT_CONFIG.breb.key, 'breb')}
                  className="px-4 py-2 bg-brand-primary text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:scale-105 transition-transform shrink-0"
                >
                  {copiedField === 'breb' ? t('summary.payment.copied') : t('summary.payment.copy_key')}
                </button>
              </div>
            </div>
          </div>

          {/* Beneficiario */}
          <div className="text-center space-y-1">
            <p className="text-[10px] font-bold text-brand-text-secondary dark:text-dark-text-secondary uppercase tracking-widest">
              {t('summary.payment.beneficiary_hint')}
            </p>
            <p className="text-lg font-black text-brand-primary uppercase">
              {PAYMENT_CONFIG.beneficiary.name}
            </p>
          </div>

          {/* Instrucción WhatsApp */}
          <div className="bg-brand-primary/5 border border-brand-primary/20 rounded-[2rem] p-5 space-y-4">
            <p className="text-xs font-bold text-brand-dark dark:text-brand-primary text-center leading-relaxed">
              {t('summary.payment.whatsapp_instruction')}
            </p>
            <button
              onClick={handleWhatsApp}
              className="w-full py-4 bg-[#25D366] text-white font-black text-xs uppercase tracking-widest rounded-full shadow-lg hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
            >
              <img 
                src={PAYMENT_CONFIG.whatsapp.logo} 
                alt="WhatsApp" 
                className="w-6 h-6 object-contain"
                loading="lazy"
              />
              {t('summary.payment.send_whatsapp')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
