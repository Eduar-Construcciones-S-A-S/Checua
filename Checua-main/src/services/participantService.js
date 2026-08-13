import { supabase } from '../lib/supabase'

/**
 * Inserta múltiples participantes en la tabla 'participante'
 * @param {Array<Object>} participants Lista de participantes formateados para Supabase
 * @returns {Promise<{data: any, error: any}>}
 */
export const createParticipants = async (participants) => {
  try {
    const { data, error } = await supabase
      .from('participante')
      .insert(participants)
      .select()

    return { data, error }
  } catch (err) {
    console.error('Error in createParticipants service:', err)
    return { data: null, error: err }
  }
}

export const saveParticipants = async (participants) => {
  try {
    const results = []

    for (const participant of participants) {
      const { data: updatedData, error: updateError } = await supabase
        .from('participante')
        .update(participant)
        .eq('telefono_cliente', participant.telefono_cliente)
        .eq('numero_documento', participant.numero_documento)
        .select()

      if (updateError) {
        return { data: null, error: updateError }
      }

      if (updatedData && updatedData.length > 0) {
        results.push(...updatedData)
        continue
      }

      const { data: insertedData, error: insertError } = await supabase
        .from('participante')
        .insert(participant)
        .select()

      if (insertError) {
        return { data: null, error: insertError }
      }

      if (insertedData) results.push(...insertedData)
    }

    return { data: results, error: null }
  } catch (err) {
    console.error('Error in saveParticipants service:', err)
    return { data: null, error: err }
  }
}

export const saveParticipantsForReservation = async (participants, reservationId) => {
  try {
    const participantsWithReservation = participants.map(p => ({
      ...p,
      id_reserva: reservationId
    }))

    const { data, error } = await supabase
      .from('participante')
      .insert(participantsWithReservation)
      .select()

    if (!error) return { data, error: null }

    if (error?.code !== '23505') {
      return { data: null, error }
    }

    const results = []

    for (const participant of participantsWithReservation) {
      const { data: updatedData, error: updateError } = await supabase
        .from('participante')
        .update(participant)
        .eq('id_reserva', participant.id_reserva)
        .eq('numero_documento', participant.numero_documento)
        .select()

      if (updateError) {
        return { data: null, error: updateError }
      }

      if (updatedData) results.push(...updatedData)
    }

    return { data: results, error: null }
  } catch (err) {
    console.error('Error in saveParticipantsForReservation service:', err)
    return { data: null, error: err }
  }
}
