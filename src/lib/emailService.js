import emailjs from '@emailjs/browser';

// Constantes pour EmailJS
const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

/**
 * Envoie un message de contact via EmailJS
 * @param {Object} formData - Les données du formulaire
 * @param {string} formData.name - Nom de l'expéditeur
 * @param {string} formData.email - Email de l'expéditeur
 * @param {string} formData.phone - Numéro de téléphone (optionnel)
 * @param {string} formData.subject - Sujet du message
 * @param {string} formData.message - Contenu du message
 */
export const sendContactMessage = async (formData) => {
  try {
    const templateParams = {
      to_email: 'contact@nomadimmo.org',
      from_name: formData.name,
      from_email: formData.email,
      phone: formData.phone || 'Non spécifié',
      subject: formData.subject,
      message: formData.message
    };

    const result = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      templateParams,
      EMAILJS_PUBLIC_KEY
    );

    if (result.status === 200) {
      return {
        success: true,
        message: 'Votre message a été envoyé avec succès !'
      };
    } else {
      throw new Error('Erreur lors de l\'envoi du message');
    }
  } catch (error) {
    console.error('Erreur EmailJS:', error);
    return {
      success: false,
      error: error.text || error.message,
      message: 'Impossible d\'envoyer votre message. Veuillez réessayer ou nous contacter directement à contact@nomadimmo.org'
    };
  }
};
