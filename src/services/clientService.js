import { supabase } from '../lib/supabase'

const normalizePhone = (phone) => {
  if (!phone) return ''
  const digits = String(phone).replace(/\D/g, '')
  return digits ? `+${digits}` : ''
}

/**
 * Busca un cliente por su número de teléfono.
 * Usa maybeSingle + limit(1) para tolerar duplicados históricos sin romper el flujo.
 */
export const findClientByPhone = async (phone) => {
  try {
    const normalizedPhone = normalizePhone(phone)
    if (!normalizedPhone) {
      return { data: null, error: null }
    }

    const { data, error } = await supabase
      .from('cliente')
      .select('*')
      .eq('telefono', normalizedPhone)
      .limit(1)
      .maybeSingle()

    return { data, error }
  } catch (err) {
    return { data: null, error: err }
  }
}

/**
 * Crea un nuevo cliente en la base de datos.
 */
export const createClient = async (phone) => {
  try {
    const normalizedPhone = normalizePhone(phone)
    if (!normalizedPhone) {
      return { data: null, error: new Error('Número de teléfono inválido') }
    }

    const { data, error } = await supabase
      .from('cliente')
      .insert([
        {
          telefono: normalizedPhone,
          atencion_humana: false,
          etapaconversacion: 'saludo'
        }
      ])
      .select()
      .single()

    return { data, error }
  } catch (err) {
    return { data: null, error: err }
  }
}

/**
 * Busca un cliente y solo lo crea si realmente no existe.
 * Esta función debe ejecutarse al confirmar/continuar, nunca mientras se escribe el teléfono.
 */
export const findOrCreateClient = async (phone) => {
  const normalizedPhone = normalizePhone(phone)
  if (!normalizedPhone) {
    return { data: null, status: 'error', error: new Error('Número de teléfono inválido') }
  }

  const { data: existingClient, error: findError } = await findClientByPhone(normalizedPhone)

  if (findError) {
    return { data: null, status: 'error', error: findError }
  }

  if (existingClient) {
    return { data: existingClient, status: 'found', error: null }
  }

  const { data: newClient, error: createError } = await createClient(normalizedPhone)

  // Si en la base de datos existe una restricción UNIQUE y otra petición ganó la carrera,
  // recuperamos el registro existente en lugar de crear/mostrar un error al usuario.
  if (createError?.code === '23505') {
    const { data: racedClient, error: racedError } = await findClientByPhone(normalizedPhone)
    if (racedClient && !racedError) {
      return { data: racedClient, status: 'found', error: null }
    }
  }

  if (createError) {
    return { data: null, status: 'error', error: createError }
  }

  return { data: newClient, status: 'created', error: null }
}

/**
 * Actualiza el plan seleccionado por un cliente.
 */
export const updateClientPlan = async (phone, planId) => {
  try {
    const normalizedPhone = normalizePhone(phone)
    const { data, error } = await supabase
      .from('cliente')
      .update({ id_plan: planId })
      .eq('telefono', normalizedPhone)
      .select()
      .limit(1)
      .maybeSingle()

    return { data, error }
  } catch (err) {
    return { data: null, error: err }
  }
}
