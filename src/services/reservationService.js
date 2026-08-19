import { supabase } from '../lib/supabase'

const normalizePhone = (phone) => {
  if (!phone) return ''
  const digits = String(phone).replace(/\D/g, '')
  return digits ? `+${digits}` : ''
}

const getCurrentReservationSelection = () => {
  if (typeof window === 'undefined') return null
  return window.__CHECUA_RESERVATION_DATA__ || null
}

const resolveDateId = async (planId, selectedDate) => {
  if (!planId || !selectedDate) return { id: null, error: null }

  const dateValue = String(selectedDate).slice(0, 10)

  const { data: existingDate, error: lookupError } = await supabase
    .from('plan_fechas')
    .select('id_fecha')
    .eq('id_plan', planId)
    .eq('fecha', dateValue)
    .maybeSingle()

  if (lookupError) {
    return { id: null, error: lookupError }
  }

  if (existingDate?.id_fecha) {
    return { id: existingDate.id_fecha, error: null }
  }

  const { data: createdDate, error: createError } = await supabase
    .from('plan_fechas')
    .insert({
      id_plan: planId,
      fecha: dateValue
    })
    .select('id_fecha')
    .single()

  return {
    id: createdDate?.id_fecha ?? null,
    error: createError
  }
}

const resolveHourId = async (planId, selectedTime) => {
  if (!planId || !selectedTime) return { id: null, error: null }

  const timeValue = String(selectedTime)

  const { data: existingHour, error } = await supabase
    .from('plan_horas')
    .select('id_hora')
    .eq('id_plan', planId)
    .eq('hora', timeValue)
    .maybeSingle()

  return {
    id: existingHour?.id_hora ?? null,
    error
  }
}

export const getReservationsByPhone = async (phone) => {
  try {
    const normalizedPhone = normalizePhone(phone)
    if (!normalizedPhone) {
      return { data: [], error: null }
    }

    const { data, error } = await supabase
      .from('reserva')
      .select('id_reserva, codigo_reserva, id_plan, id_fecha, id_hora, cantidad_personas, aprobado, fecha_solicitud, fecha_aprobacion, telefono_cliente')
      .eq('telefono_cliente', normalizedPhone)
      .order('fecha_solicitud', { ascending: false })

    return { data: data || [], error }
  } catch (err) {
    console.error('Error in getReservationsByPhone service:', err)
    return { data: [], error: err }
  }
}

export const createReservation = async (reservation) => {
  try {
    const currentSelection = getCurrentReservationSelection()
    const selectedDate = reservation.fecha_reserva ?? currentSelection?.date?.fecha_reserva ?? null
    const selectedTime = reservation.hora_reserva ?? currentSelection?.time?.hora_reserva ?? null

    const { id: idFecha, error: dateError } = await resolveDateId(
      reservation.id_plan,
      selectedDate
    )

    if (dateError) {
      console.error('Error al resolver la fecha de la reserva:', dateError)
      return { data: null, error: dateError }
    }

    const { id: idHora, error: hourError } = await resolveHourId(
      reservation.id_plan,
      selectedTime
    )

    if (hourError) {
      console.error('Error al resolver la hora de la reserva:', hourError)
      return { data: null, error: hourError }
    }

    const payload = {
      id_plan: reservation.id_plan,
      id_fecha: idFecha,
      id_hora: idHora,
      telefono_cliente: normalizePhone(reservation.telefono_cliente),
      cantidad_personas: reservation.cantidad_personas ?? null,
      aprobado: reservation.aprobado ?? false,
      fecha_solicitud: reservation.fecha_solicitud ?? new Date().toISOString(),
      fecha_aprobacion: reservation.fecha_aprobacion ?? null
    }

    const { data, error } = await supabase
      .from('reserva')
      .insert(payload)
      .select()
      .single()

    return { data, error }
  } catch (err) {
    console.error('Error in createReservation service:', err)
    return { data: null, error: err }
  }
}
