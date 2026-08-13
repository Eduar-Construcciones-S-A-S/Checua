import { supabase } from '../lib/supabase'

/**
 * Busca un cliente por su número de teléfono
 * @param {string} phone Número de teléfono con indicativo
 * @returns {Promise<{data: any, error: any}>}
 */
export const findClientByPhone = async (phone) => {
  try {
    const { data, error } = await supabase
      .from('cliente')
      .select('*')
      .eq('telefono', phone)
      .single()

    return { data, error }
  } catch (err) {
    return { data: null, error: err }
  }
}

/**
 * Crea un nuevo cliente en la base de datos
 * @param {string} phone Número de teléfono con indicativo
 * @returns {Promise<{data: any, error: any}>}
 */
export const createClient = async (phone) => {
  try {
    const { data, error } = await supabase
      .from('cliente')
      .insert([
        { 
          telefono: phone,
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
 * Busca un cliente y si no existe lo crea (Lógica Atómica)
 * @param {string} phone Número de teléfono con indicativo
 * @returns {Promise<{data: any, status: 'found' | 'created' | 'error', error: any}>}
 */
export const findOrCreateClient = async (phone) => {
  // 1. Intentar buscar
  const { data: existingClient, error: findError } = await findClientByPhone(phone)

  if (existingClient) {
    return { data: existingClient, status: 'found', error: null }
  }

  // Si el error no es "PGRST116" (no se encontraron resultados), es un error real de conexión/permisos
  if (findError && findError.code !== 'PGRST116') {
    return { data: null, status: 'error', error: findError }
  }

  // 2. Si no existe, crear
  const { data: newClient, error: createError } = await createClient(phone)

  if (createError) {
    return { data: null, status: 'error', error: createError }
  }

  return { data: newClient, status: 'created', error: null }
}

/**
 * Actualiza el plan seleccionado por un cliente
 * @param {string} phone Número de teléfono con indicativo
 * @param {string|number} planId ID del plan seleccionado
 * @returns {Promise<{data: any, error: any}>}
 */
export const updateClientPlan = async (phone, planId) => {
  try {
    const { data, error } = await supabase
      .from('cliente')
      .update({ id_plan: planId })
      .eq('telefono', phone)
      .select()
      .single()

    return { data, error }
  } catch (err) {
    return { data: null, error: err }
  }
}
