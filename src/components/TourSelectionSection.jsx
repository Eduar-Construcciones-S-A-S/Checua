import { useTranslation } from 'react-i18next';

const TourSelectionSection = ({ selectedTourId, sectionRef, tours = [], loading = false }) => {
  const { t } = useTranslation();
  const selectedTour = tours.find(tour => tour.id.toString() === selectedTourId);

  return (
    <div 
      ref={sectionRef}
      className="card-premium"
    >
      <div className="card-accent-line"></div>
      
      <div className="px-6 py-8 md:px-10 md:py-10 space-y-6">
        <div className="space-y-4">
          {/* Read-only Selection Display */}
          {loading ? (
            <div className="bg-brand-light/20 dark:bg-dark-bg-main/30 border-2 border-dashed border-brand-primary/20 rounded-[2.5rem] p-8 text-center animate-pulse">
              <div className="w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-sm text-brand-text-secondary dark:text-dark-text-secondary font-medium">{t('sections.loading_plan_details')}</p>
            </div>
          ) : selectedTour ? (
            <div className="animate-in fade-in duration-300">
              <div className="bg-brand-light/30 dark:bg-dark-bg-main/30 border-2 border-brand-primary/20 rounded-[2rem] p-6 md:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-brand-primary/5 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-110"></div>
                
                <div className="relative">
                  <p className="text-[10px] uppercase tracking-[0.2em] font-black text-brand-primary mb-1">{t('sections.selected_plan')}</p>
                  <p className="text-brand-text-main dark:text-dark-text-main font-black text-lg md:text-xl leading-tight">{selectedTour.name}</p>
                </div>
                
                <div className="relative md:text-right border-t md:border-t-0 md:border-l border-brand-primary/10 pt-4 md:pt-0 md:pl-8">
                  <p className="text-[10px] uppercase tracking-[0.2em] font-black text-brand-primary mb-1">{t('sections.price_per_person_label')}</p>
                  <p className="text-brand-dark dark:text-brand-primary font-black text-2xl">
                    ${selectedTour.price.toLocaleString('es-CO')}
                    <span className="text-xs ml-1.5 font-bold text-brand-text-secondary dark:text-dark-text-secondary uppercase">COP</span>
                  </p>
                </div>
              </div>
              <p className="text-[10px] text-brand-text-secondary/50 dark:text-dark-text-secondary/50 mt-3 font-medium italic text-center md:text-left ml-6">
                {t('sections.change_tour_hint')}
              </p>
            </div>
          ) : (
            <div className="bg-brand-light/10 dark:bg-dark-bg-main/30 border-2 border-dashed border-brand-border dark:border-dark-border rounded-[2.5rem] p-8 text-center">
              <p className="text-sm text-brand-text-secondary/60 dark:text-dark-text-secondary/60 font-medium italic">{t('sections.no_tour_selected')}</p>
            </div>
          )}

          {/* Hidden input for backend compatibility */}
          <input 
            type="hidden" 
            name="id_plan" 
            value={selectedTour ? selectedTour.id : ''} 
          />
        </div>
      </div>
    </div>
  );
};

export default TourSelectionSection;
