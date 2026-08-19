import { supabase } from '../lib/supabase'

const normalizePhone = (phone) => {
  if (!phone) return ''
  const digits = String(phone).replace(/\D/g, '')
  return digits ? `+${digits}` : ''
}

export const getReservationsByPhone = async (phone) => {
  try {
    const normalizedPhone = normalizePhone(phone)
    if (!normalizedPhone) {
      return { data: [], error: null }
    }

    const { data, error } = await supabase
      .from('reserva')
      .select('id_reserva, codigo_reserva, id_plan, cantidad_personas, aprobado, fecha_solicitud, fecha_aprobacion, telefono_cliente')
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
    const payload = {
      id_plan: reservation.id_plan,
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
