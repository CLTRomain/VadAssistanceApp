import { saveToken , getToken } from '../auth/authStorage'; // Ton fichier SecureStore
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';

var ip = "localhost"; 
var port = "8888"

export const GetProfile = async () => {

  try {
    // ⚠️ Remplace par l'IP de ton serveur ou l'URL de ton API
    // Si tu testes sur un simulateur iOS : use 127.0.0.1
    // Si tu testes sur un appareil physique ou Android : utilise l'IP de ton PC
const API_URL = `http://${ip}:${port}/getprofile`;
const token = await getToken(); // On récupère le token de 14 jours

    const response = await fetch(API_URL, {
      method: 'GET',
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
      await removeToken(); // Utilise removeToken au lieu de deleteToken
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

export const GetDownload = async (filePath) => {
  try {
    const API_URL = `http://${ip}:${port}/download/${filePath}`;
    const token = await getToken();
    const fileUri = FileSystem.documentDirectory + "mon_contrat.pdf";

    const response = await fetch(API_URL, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    });

    if (response.ok) {
      const blob = await response.blob();
      const reader = new FileReader();
      
      reader.onloadend = async () => {
        const base64data = reader.result.split(',')[1];
        const fileUri = FileSystem.documentDirectory + " VAD Document.pdf";

        // Cette méthode fonctionnera maintenant grâce à l'import legacy
        await FileSystem.writeAsStringAsync(fileUri, base64data, {
          encoding: 'base64', 
        });


          await Sharing.shareAsync(fileUri);

      };
      reader.readAsDataURL(blob);
    }
  } catch (error) {
    console.error('Erreur lors du téléchargement:', error);
  }
};