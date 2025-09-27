// Configuration EmailJS pour Nomad'immo
// Remplacez ces valeurs par vos vraies clés EmailJS

export const emailConfig = {
  serviceId: 'service_xhq70h7',
  templateId: 'template_58ldi7j', 
  publicKey: 'GQdKIsPXBrHyZEme5'
};

// Instructions de configuration :
// 1. Créez un compte sur https://www.emailjs.com/
// 2. Créez un service email (Gmail, Outlook, etc.)
// 3. Créez un template avec les variables suivantes :
//    - {{from_name}} : Nom de l'expéditeur
//    - {{from_email}} : Email de l'expéditeur
//    - {{phone}} : Téléphone (optionnel)
//    - {{subject}} : Sujet du message
//    - {{message}} : Corps du message
//    - {{to_email}} : Email de destination (contact@nomadimmo.org)
// 4. Récupérez votre Service ID, Template ID et Public Key
// 5. Remplacez les valeurs ci-dessus

// Exemple de template EmailJS :
/*
Nouveau message de contact depuis Nomad'immo

De: {{from_name}} ({{from_email}})
Téléphone: {{phone}}
Sujet: {{subject}}

Message:
{{message}}

---
Ce message a été envoyé depuis le formulaire de contact de nomadimmo.org
*/