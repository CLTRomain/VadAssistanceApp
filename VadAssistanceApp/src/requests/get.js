import { saveToken , getToken } from '../auth/authStorage'; // Ton fichier SecureStore

var ip = "localhost"; 
var port = "8888"

export const GetProfile = async (email, password) => {

  try {
    // ⚠️ Remplace par l'IP de ton serveur ou l'URL de ton API
    // Si tu testes sur un simulateur iOS : use 127.0.0.1
    // Si tu testes sur un appareil physique ou Android : utilise l'IP de ton PC
const API_URL = `http://${ip}:${port}/getprofile`;
const token = await getToken(); // On récupère le token de 14 jours

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });

   // --- CAS N°2 : GESTION DU REFRESH (Session Glissante) ---
    // On vérifie si le serveur a envoyé un nouveau token dans le header
    const newToken = response.headers.get('X-New-Token');
    if (newToken) {
      console.log('🔄 Session prolongée : Nouveau token reçu et sauvegardé.');
      await saveToken(newToken);
    }

    // --- CAS N°3 : TOKEN EXPIRE OU INVALIDE (401) ---
    if (response.status === 401) {
      console.warn('⚠️ Session expirée. Redirection vers le login.');
      await deleteToken(); 
      router.replace('/login');
      return null;
    }

    const result = await response.json();

    // --- CAS N°1 : TOKEN VALIDE ---
    if (response.ok && result.success) {
      console.log('✅ Profil récupéré avec succès');
      return result; 
    }

    return result;

  } catch (error) {
    console.error('❌ Erreur réseau ou serveur:', error);
    throw error;
  }
};