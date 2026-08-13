import { supabase } from '../lib/supabase'

export const createReservation = async (reservation) => {
  try {
    const payload = {
      id_plan: reservation.id_plan,
      telefono_cliente: reservation.telefono_cliente,
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
