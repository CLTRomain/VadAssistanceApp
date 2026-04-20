import { saveToken , getToken } from '../auth/authStorage'; // Ton fichier SecureStore
import { Platform } from 'react-native';

// var ip = process.env.EXPO_PUBLIC_API_IP || "localhost";
// var port = process.env.EXPO_PUBLIC_API_PORT || "80";


 var ip = "localhost";
 var port =  "8888";

 console.log('🌐 IP utilisée:', ip, '| Port:', port);


export const Login = async (email, password) => {
  try {
    const API_URL = `http://${ip}:${port}/login`;
   // const API_URL_LOCAL = `http://localhost:${port}/login`;

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    // On extrait les données ici et on ne touche plus à "response" après
    const result = await response.json();

    console.log('Réponse du serveur:', result);

    if (result.success) {
      console.log('Login réussi, token reçu:', result.token);

      const isSaved = await saveToken(result.token);

      if (!isSaved) {
        console.error('Erreur lors de la sauvegarde du token.');
      }

      // ✅ On retourne l'objet déjà lu.
      return result;
    }

    return result; // Retourne l'erreur du serveur (ex: mauvais mot de passe)

  } catch (error) {
    console.error('Erreur réseau:', error);
    throw error;
  }
};

export const CreateInterventionRequest = async ({ subject, description, contractSubscriberId }) => {
  try {
    const API_URL = `http://${ip}:${port}/demandsInterventions`;
    const token = await getToken();

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ subject, description, contract_subscriber_id: contractSubscriberId }),
    });

    return await response.json();
  } catch (error) {
    console.error('Erreur CreateInterventionRequest:', error);
    return null;
  }
};

export const AskToEndContract = async (contractSubscriberId) => {
  try {
    const API_URL = `http://${ip}:${port}/askToEndContract`;
    const token = await getToken();

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ contract_subscriber_id: contractSubscriberId }),
    });

    return await response.json();
  } catch (error) {
    console.error('Erreur AskToEndContract:', error);
    return null;
  }
};

export const UpdateSubscriber = async (data) => {
  try {
    const API_URL = `http://${ip}:${port}/editinfo`;
    const token = await getToken();

const formData = new FormData();
    Object.keys(data).forEach(key => {
      // On vérifie aussi que la valeur n'est pas undefined
      if (data[key] !== undefined) {
        formData.append(key, String(data[key]));
      }
    });

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: formData,
      });

    return await response.json()

  } catch (error) {
    console.error('Erreur Update API:', error);
    return null;
  }
};