/**
 * Convertit un montant de FCFA en EUR
 * @param {number} amountCFA - Le montant en FCFA
 * @returns {number} Le montant en EUR
 */
export const convertCFAtoEUR = (amountCFA) => {
  // Taux de conversion : 1 EUR = 655.957 FCFA (taux fixe)
  const RATE_CFA_TO_EUR = 655.957;
  return amountCFA / RATE_CFA_TO_EUR;
};

/**
 * Formate un montant en FCFA avec le séparateur de milliers
 * @param {number} amount - Le montant à formater
 * @returns {string} Le montant formaté
 */
export const formatCFA = (amount) => {
  return new Intl.NumberFormat('fr-FR').format(amount);
};

/**
 * Formate un montant en EUR avec le séparateur de milliers et 2 décimales
 * @param {number} amount - Le montant à formater
 * @returns {string} Le montant formaté
 */
export const formatEUR = (amount) => {
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};