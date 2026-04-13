import { saveToken , getToken, removeToken } from '../auth/authStorage'; // Ton fichier SecureStore
import { router } from 'expo-router';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';

var ip = "localhost"; 
var port = "8888"

export const GetProfile = async () => {
  try {
    const API_URL = `http://${ip}:${port}/getprofile`;
    const token = await getToken();

    const response = await fetch(API_URL, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });

    // 1. On récupère d'abord le texte BRUT
    const rawText = await response.text();

    // 2. Gestion du nouveau token (identique)
    const newToken = response.headers.get('X-New-Token');
    if (newToken) {
      await saveToken(newToken);
    }

    // 3. Si le serveur renvoie une erreur (401, 500, 404...)
    if (!response.ok) {
      if (response.status === 401) {
        console.warn('⚠️ Session expirée.');
        await removeToken();
        router.replace('/login');
        return null;
      }

      // SI ERREUR 500 : On affiche le HTML dans la console pour débugger le PHP
      console.log("--- CONTENU REÇU DU SERVEUR (ERREUR) ---");
      console.log(rawText); 
      console.log("-----------------------------------------");
      console.log(response.status);
      console.log(API_URL);
      throw new Error(`Erreur serveur ${response.status}`);
    }

    // 4. Si OK, on tente de parser le JSON
    try {
      const result = JSON.parse(rawText);
      console.log('✅ Profil récupéré avec succès');
      return result;
    } catch (parseError) {
      console.error("❌ Le serveur a répondu 'OK' mais le contenu n'est pas du JSON :");
      console.log(rawText);
      throw parseError;
    }

  } catch (error) {
    console.error('❌ Erreur réseau ou serveur:', error);
    throw error;
  }
};

export const GetContractDetails = async (contractId) => {
  try {
    const token = await getToken();
    const API_URL = `http://${ip}:${port}/contracts-subscribers/get-contract-details/${contractId}`;

    const response = await fetch(API_URL, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });

    const result = await response.json();
    return result; // Retourne l'objet { success: true, data: { ... } }
  } catch (error) {
    console.error("Erreur appel contrat:", error);
    return null;
  }
};

export const GetDownload = async (filePath) => {
  try {
    const API_URL = `http://${ip}:${port}/download/${filePath}`;
    const token = await getToken();

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