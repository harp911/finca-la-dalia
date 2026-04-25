import { format, startOfWeek, endOfWeek, getISOWeek, getISOWeekYear, parseISO, startOfISOWeek, endOfISOWeek } from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * Retorna el número de semana en formato "S01" a "S52"
 * @param {Date|string} date 
 */
export const getWeekNumber = (date) => {
  const d = typeof date === 'string' ? parseISO(date) : date;
  if (!d || isNaN(d.getTime())) return '';
  const week = getISOWeek(d);
  return `S${week.toString().padStart(2, '0')}`;
};

/**
 * Retorna el rango de fechas de una semana específica
 * @param {string} weekNumber Formato "S01"
 * @param {number} year 
 */
export const getWeekRange = (weekNumber, year) => {
  const week = parseInt(weekNumber.replace('S', ''), 10);
  const date = startOfISOWeek(new Date(year, 0, 1 + (week - 1) * 7));
  
  // Ajustar al año correcto si el cálculo inicial cae en el anterior
  const start = startOfISOWeek(date);
  const end = endOfISOWeek(date);

  return `${format(start, 'eeee dd/MM', { locale: es })} al ${format(end, 'eeee dd/MM', { locale: es })}`;
};

/**
 * Retorna la semana actual en formato "S01"
 */
export const getCurrentWeek = () => {
  return getWeekNumber(new Date());
};

/**
 * Retorna el año ISO actual
 */
export const getCurrentYear = () => {
  return getISOWeekYear(new Date());
};
