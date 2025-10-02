#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Chemin vers le dossier des fonctions
const FUNCTIONS_DIR = path.join(__dirname, '../supabase/functions');

// Fonction pour déployer une Edge Function
function deployFunction(functionName) {
  const functionPath = path.join(FUNCTIONS_DIR, functionName);
  
  // Vérifier si le dossier de la fonction existe
  if (!fs.existsSync(functionPath)) {
    console.error(`La fonction ${functionName} n'existe pas dans ${FUNCTIONS_DIR}`);
    process.exit(1);
  }

  try {
    // Se déplacer dans le dossier de la fonction
    process.chdir(functionPath);
    
    // Déployer la fonction avec Supabase CLI
    console.log(`📤 Déploiement de la fonction ${functionName}...`);
    execSync('supabase functions deploy ' + functionName, { stdio: 'inherit' });
    
    console.log(`✅ La fonction ${functionName} a été déployée avec succès !`);
  } catch (error) {
    console.error('❌ Erreur lors du déploiement:', error.message);
    process.exit(1);
  }
}

// Récupérer le nom de la fonction à déployer depuis les arguments
const functionName = process.argv[2];

if (!functionName) {
  console.error('❌ Veuillez spécifier le nom de la fonction à déployer');
  console.log('Usage: node deploy-function.js <nom-de-la-fonction>');
  process.exit(1);
}

deployFunction(functionName);