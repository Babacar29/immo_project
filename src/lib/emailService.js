// Service d'envoi d'emails via Firebase Functions
import { httpsCallable } from 'firebase/functions';
import { functions } from './firebaseConfig';

// Fonction pour envoyer un email de contact
export const sendContactEmail = async (formData) => {
  try {
    // Référence à la Cloud Function
    const sendEmail = httpsCallable(functions, 'sendContactEmail');
    
    // Données à envoyer
    const emailData = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone || '',
      subject: formData.subject,
      message: formData.message,
      timestamp: new Date().toISOString(),
      to: 'contact@nomadimmo.org'
    };

    // Appel de la fonction
    const result = await sendEmail(emailData);
    
    return {
      success: true,
      data: result.data,
      message: 'Email envoyé avec succès'
    };

  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email:', error);
    
    return {
      success: false,
      error: error.message,
      message: 'Erreur lors de l\'envoi de l\'email'
    };
  }
};

// Fonction pour sauvegarder le message dans Firestore (backup)
export const saveContactMessage = async (formData) => {
  try {
    const saveMessage = httpsCallable(functions, 'saveContactMessage');
    
    const messageData = {
      ...formData,
      timestamp: new Date().toISOString(),
      status: 'received'
    };

    const result = await saveMessage(messageData);
    
    return {
      success: true,
      data: result.data
    };

  } catch (error) {
    console.error('Erreur lors de la sauvegarde:', error);
    return {
      success: false,
      error: error.message
    };
  }
};