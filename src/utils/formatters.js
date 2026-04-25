/**
 * Formatea un número como moneda COP: $ 1.250.000
 * @param {number} value 
 */
export const formatCOP = (value) => {
  if (value === undefined || value === null) return '$ 0';
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value).replace('$', '$ ');
};

/**
 * Formatea un número como peso en Kg: 1.250 kg
 * @param {number} value 
 */
export const formatKg = (value) => {
  if (value === undefined || value === null) return '0 kg';
  return new Intl.NumberFormat('es-CO', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  }).format(value) + ' kg';
};

/**
 * Formatea una fecha simple: DD/MM/YYYY
 */
export const formatDate = (date) => {
  const d = typeof date === 'string' ? new Date(date) : date;
  if (!d || isNaN(d.getTime())) return '';
  return new Intl.DateTimeFormat('es-CO').format(d);
};
