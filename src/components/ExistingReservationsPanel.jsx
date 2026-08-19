const ExistingReservationsPanel = ({
  reservations,
  tours,
  isEnglish,
  isProcessing,
  errorMessage,
  onBack,
  onCreateNew
}) => {
  const copy = {
    title: isEnglish ? 'You already have reservations' : 'Ya tienes reservas registradas',
    subtitle: isEnglish
      ? 'We found these reservations linked to your phone number. Review them before creating a new one.'
      : 'Encontramos estas reservas asociadas a tu número. Revísalas antes de crear una nueva.',
    reservation: isEnglish ? 'Reservation' : 'Reserva',
    experience: isEnglish ? 'Experience' : 'Experiencia',
    people: isEnglish ? 'People' : 'Personas',
    requested: isEnglish ? 'Requested' : 'Solicitada',
    approved: isEnglish ? 'Approved' : 'Aprobada',
    pending: isEnglish ? 'Pending confirmation' : 'Pendiente de confirmación',
    back: isEnglish ? 'Back' : 'Volver',
    newReservation: isEnglish ? 'Create a new reservation' : 'Hacer una nueva reserva',
    processing: isEnglish ? 'Processing...' : 'Procesando...'
  };

  const formatDate = (value) => {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '—';
    return new Intl.DateTimeFormat(isEnglish ? 'en-US' : 'es-CO', {
      day: '2-digit', month: 'short', year: 'numeric'
    }).format(date);
  };

  const planName = (reservation) => {
    const plan = tours.find((tour) => String(tour.id) === String(reservation.id_plan));
    return plan?.name || `${copy.experience} #${reservation.id_plan ?? '—'}`;
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="text-center space-y-2">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-brand-primary/10 text-brand-primary flex items-center justify-center text-2xl">✓</div>
        <h2 className="text-2xl md:text-3xl font-black text-brand-text-main dark:text-dark-text-main uppercase tracking-tight">
          {copy.title}
        </h2>
        <p className="text-sm text-brand-text-secondary dark:text-dark-text-secondary font-medium">
          {copy.subtitle}
        </p>
      </div>

      <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
        {reservations.map((reservation) => (
          <div
            key={reservation.id_reserva}
            className="rounded-3xl border-2 border-brand-border dark:border-dark-border bg-brand-light/25 dark:bg-dark-bg-main/40 p-5 shadow-sm"
          >
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.18em] font-black text-brand-text-secondary dark:text-dark-text-secondary">
                  {copy.reservation}
                </p>
                <p className="text-lg font-black text-brand-text-main dark:text-dark-text-main">
                  {reservation.codigo_reserva || `#${reservation.id_reserva}`}
                </p>
              </div>
              <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ${reservation.aprobado ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'}`}>
                {reservation.aprobado ? copy.approved : copy.pending}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-[9px] uppercase font-black tracking-wider text-brand-text-secondary/70 dark:text-dark-text-secondary/70">{copy.experience}</p>
                <p className="font-bold text-brand-text-main dark:text-dark-text-main leading-tight">{planName(reservation)}</p>
              </div>
              <div>
                <p className="text-[9px] uppercase font-black tracking-wider text-brand-text-secondary/70 dark:text-dark-text-secondary/70">{copy.people}</p>
                <p className="font-bold text-brand-text-main dark:text-dark-text-main">{reservation.cantidad_personas ?? '—'}</p>
              </div>
              <div className="col-span-2">
                <p className="text-[9px] uppercase font-black tracking-wider text-brand-text-secondary/70 dark:text-dark-text-secondary/70">{copy.requested}</p>
                <p className="font-bold text-brand-text-main dark:text-dark-text-main">{formatDate(reservation.fecha_solicitud)}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {errorMessage && <p className="text-sm font-bold text-red-500 text-center">{errorMessage}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          type="button"
          onClick={onBack}
          disabled={isProcessing}
          className="w-full px-5 py-4 rounded-full border-2 border-brand-border dark:border-dark-border text-brand-text-main dark:text-dark-text-main font-black uppercase tracking-wider text-xs hover:border-brand-primary transition-colors disabled:opacity-50"
        >
          {copy.back}
        </button>
        <button
          type="button"
          onClick={onCreateNew}
          disabled={isProcessing}
          className="w-full px-5 py-4 rounded-full bg-brand-primary text-white font-black uppercase tracking-wider text-xs shadow-lg hover:brightness-105 transition-all disabled:opacity-50"
        >
          {isProcessing ? copy.processing : copy.newReservation}
        </button>
      </div>
    </div>
  );
};

export default ExistingReservationsPanel;
