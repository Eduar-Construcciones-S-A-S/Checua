import { supabase } from '../lib/supabase'
export const getTours = async () => {
  try {
    const { data, error } = await supabase
      .from('plan')
      .select('id_plan, nombre_plan, precio_plan, descripcion_basica, tipo_fecha, tipo_hora, imagen_url, numero_plan')
      .order('id_plan', { ascending: true })

    if (error) {
      console.error('--- ERROR DE SUPABASE ---', error.message);
      return []
    }

    if (!data || data.length === 0) {
      return []
    }

    // Mapeamos los nombres de la DB a los nombres que usa el Frontend
    return data.map(item => ({
      id: item.id_plan,
      name: item.nombre_plan,
      price: item.precio_plan,
      description: item.descripcion_basica,
      tipo_fecha: item.tipo_fecha,
      tipo_hora: item.tipo_hora,
      imagen_url: item.imagen_url,
      numero_plan: item.numero_plan
    }))
  } catch (err) {
    console.error('--- ERROR INESPERADO ---', err);
    return []
  }
}

/**
 * Obtiene las fechas específicas de un plan
 * @param {string|number} planId 
 * @returns {Promise<Array>}
 */
export const getPlanDates = async (planId) => {
  try {
    const { data, error } = await supabase
      .from('plan_fechas')
      .select('fecha')
      .eq('id_plan', planId);

    if (error) throw error;
    return data.map(d => d.fecha);
  } catch (err) {
    console.error('Error al cargar fechas del plan:', err);
    return [];
  }
};

/**
 * Obtiene las horas específicas de un plan
 * @param {string|number} planId 
 * @returns {Promise<Array>}
 */
export const getPlanHours = async (planId) => {
  try {
    const { data, error } = await supabase
      .from('plan_horas')
      .select('hora')
      .eq('id_plan', planId);

    if (error) throw error;
    return data.map(item => {
      const hourPart = item.hora.split(':')[0];
      const hour = parseInt(hourPart);
      return {
        id: item.id_hora,
        value: item.hora,
        label: item.hora,
        period: hour >= 12 ? 'tarde' : 'mañana'
      };
    });
  } catch (err) {
    console.error('Error al cargar horas del plan:', err);
    return [];
  }
};

/**
 * Obtiene los horarios disponibles desde la base de datos
 * @returns {Promise<Array>}
 */
export const getSchedules = async () => {
  try {
    const { data, error } = await supabase
      .from('horario')
      .select('id_horario, hora, periodo')
      .order('hora', { ascending: true })

    if (error) {
      console.error('--- ERROR AL CARGAR HORARIOS ---', error.message);
      return []
    }

    return data.map(item => ({
      id: item.id_horario,
      label: item.hora,
      value: item.hora, // Podría ser un formato HH:mm
      period: item.periodo // 'mañana' o 'tarde'
    }))
  } catch (err) {
    console.error('--- ERROR INESPERADO EN HORARIOS ---', err);
    return []
  }
}
