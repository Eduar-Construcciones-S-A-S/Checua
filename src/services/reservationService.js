import { supabase } from '../lib/supabase'

const normalizePhone = (phone) => {
  if (!phone) return ''
  const digits = String(phone).replace(/\D/g, '')
  return digits ? `+${digits}` : ''
}

const resolveDateId = async (planId, selectedDate) => {
  if (!planId || !selectedDate) return { id: null, error: null }

  const dateValue = String(selectedDate).slice(0, 10)

  // La función SECURITY DEFINER de Supabase valida el plan y la fecha,
  // devuelve el id_fecha existente o crea la relación si todavía no existe.
  // Esto evita hacer INSERT directo desde el navegador y chocar con RLS.
  const { data, error } = await supabase.rpc('get_or_create_plan_fecha', {
    p_plan_id: Number(planId),
    p_fecha: dateValue
  })

  return {
    id: data ?? null,
    error
  }
}

const resolveHourId = async (planId, selectedTime) => {
  if (!planId || !selectedTime) return { id: null, error: null }

  // Postgres TIME normalmente se serializa como HH:mm:ss. Si el front
  // conserva HH:mm, normalizamos antes de comparar.
  const rawTime = String(selectedTime).trim()
  const timeValue = /^\d{1,2}:\d{2}$/.test(rawTime) ? `${rawTime}:00` : rawTime

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
    if (!normalizedPhone) return { data: [], error: null }

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
    const selectedDate = reservation.fecha_reserva ?? null
    const selectedTime = reservation.hora_reserva ?? null

    if (!selectedDate) {
      return { data: null, error: new Error('La reserva no contiene fecha_reserva') }
    }

    if (!selectedTime) {
      return { data: null, error: new Error('La reserva no contiene hora_reserva') }
    }

    const { id: idFecha, error: dateError } = await resolveDateId(
      reservation.id_plan,
      selectedDate
    )

    if (dateError || !idFecha) {
      const error = dateError || new Error('No se pudo obtener id_fecha para la reserva')
      console.error('Error al resolver la fecha de la reserva:', error)
      return { data: null, error }
    }

    const { id: idHora, error: hourError } = await resolveHourId(
      reservation.id_plan,
      selectedTime
    )

    if (hourError || !idHora) {
      const error = hourError || new Error('No se encontró id_hora para la hora seleccionada')
      console.error('Error al resolver la hora de la reserva:', error)
      return { data: null, error }
    }

    const payload = {
      id_plan: Number(reservation.id_plan),
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
