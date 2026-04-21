import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'key_token';
const PUSH_TOKEN_KEY = 'key_push_token';

// Sauvegarder le token
export const saveToken = async (token) => {
if (!token || token === "") {
    console.error("Le token est vide ou invalide");
    return false;
  }
  
  try {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
    return true;
  } catch (error) {
    console.error("Erreur lors de la sauvegarde du token", error);
    return false;
  }
};

// Récupérer le token
export const getToken = async () => {
  try {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  } catch (error) {
    console.error("Erreur lors de la récupération du token", error);
    return null;
  }
};

// Supprimer le token (Déconnexion)
export const removeToken = async () => {
  try {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  } catch (error) {
    console.error("Erreur lors de la suppression du token", error);
  }
};

// Sauvegarder le push token
export const savePushToken = async (token) => {
  try {
    await SecureStore.setItemAsync(PUSH_TOKEN_KEY, token);
  } catch (error) {
    console.error("Erreur lors de la sauvegarde du push token", error);
  }
};

// Récupérer le push token
export const getPushToken = async () => {
  try {
    return await SecureStore.getItemAsync(PUSH_TOKEN_KEY);
  } catch (error) {
    console.error("Erreur lors de la récupération du push token", error);
    return null;
  }
};

// Supprimer le push token
export const removePushToken = async () => {
  try {
    await SecureStore.deleteItemAsync(PUSH_TOKEN_KEY);
  } catch (error) {
    console.error("Erreur lors de la suppression du push token", error);
  }
};