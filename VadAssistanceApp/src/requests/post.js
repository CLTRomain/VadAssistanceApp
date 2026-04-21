import { saveToken, getToken, removeToken, getPushToken, removePushToken } from '../auth/authStorage';
import { Platform } from 'react-native';

 var ip = process.env.EXPO_PUBLIC_API_IP;
 var port = process.env.EXPO_PUBLIC_API_PORT




 console.log('🌐 IP utilisée:', ip, '| Port:', port);


export const Login = async (email, password) => {
  try {
    const API_URL = `http://${ip}:${port}/subscribers/login`;
   // const API_URL_LOCAL = `http://localhost:${port}/login`;


   console.log('Tentative de connexion à:', API_URL);

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

    console.log('URL de l\'API:', result);
    throw error;
  }
};

export const CreateInterventionRequest = async ({ subject, description, contractSubscriberId }) => {
  try {
    const API_URL = `http://${ip}:${port}/support-request-contacts/demands-interventions`;
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
    const API_URL = `http://${ip}:${port}/demands/ask-to-end-contract`;
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

export const Logout = async () => {
  try {
    const authToken = await getToken();
    const pushToken = await getPushToken();
    const API_URL = `http://${ip}:${port}/subscribers/logout`;

    console.log('🚪 [logout] Envoi vers:', API_URL);
    console.log('🚪 [logout] Push token à supprimer:', pushToken);

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify({ push_token: pushToken }),
    });

    const result = await response.json();
    console.log('📥 [logout] Réponse backend:', result);
  } catch (error) {
    console.error('❌ [logout] Erreur réseau:', error);
  } finally {
    // Toujours nettoyer en local même si le backend échoue
    await removeToken();
    await removePushToken();
    console.log('🧹 JWT et push token supprimés localement');
  }
};

export const ForgotPassword = async (email) => {
  try {
    const API_URL = `http://${ip}:${port}/subscribers/forgot-password`;
    console.log('📧 [forgot-password] Envoi vers:', API_URL, '| email:', email);

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    console.log('📥 [forgot-password] Status HTTP:', response.status);
    const rawText = await response.text();
    console.log('📥 [forgot-password] Réponse brute:', rawText);

    try {
      return JSON.parse(rawText);
    } catch {
      console.error('❌ [forgot-password] Réponse non-JSON (PHP error ou 404)');
      return null;
    }
  } catch (error) {
    console.error('❌ [forgot-password] Erreur réseau:', error);
    return null;
  }
};

export const UpdateSubscriber = async (data) => {
  try {
    const API_URL = `http://${ip}:${port}/subscribers/editinfo`;
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