import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { getToken, savePushToken } from '../auth/authStorage';

var ip = process.env.EXPO_PUBLIC_API_IP || "localhost";
var port = process.env.EXPO_PUBLIC_API_PORT || "8888";

// Configure comment les notifications s'affichent quand l'app est ouverte
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Demande la permission et récupère le push token Expo
 * Retourne le token ou null si refusé
 */
export const registerForPushNotifications = async () => {
  if (!Device.isDevice) {
    const fakeToken = `ExponentPushToken[SIMULATOR-TEST]`;
    console.log('🧪 Simulateur — token de test:', fakeToken);
    return fakeToken;
  }

  // Vérifie / demande la permission
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Permission notifications refusée');
    return null;
  }

  // Canal Android obligatoire
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'VAD Assistance',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#f97316',
    });
  }

  const tokenData = await Notifications.getExpoPushTokenAsync({
    projectId: 'd6624a84-8206-476a-bb25-56793a26d7db',
  });
  const token = tokenData.data;
  console.log('🔔 Push Token:', token);
  return token;
};

/**
 * Envoie le push token au backend pour le stocker
 */
export const savePushTokenToBackend = async (pushToken) => {
  try {
    const authToken = await getToken();
    const API_URL = `http://${ip}:${port}/subscribers/save-push-token`;

    console.log('📤 [pushToken] Envoi vers:', API_URL);
    console.log('📤 [pushToken] Token push:', pushToken);
    console.log('📤 [pushToken] JWT présent:', !!authToken);

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify({ push_token: pushToken }),
    });

    console.log('📥 [pushToken] Status HTTP:', response.status);
    const result = await response.json();
    console.log('📥 [pushToken] Réponse backend:', result);
    if (result?.success) {
      await savePushToken(pushToken);
      console.log('💾 Push token sauvegardé localement');
    }
    return result;
  } catch (error) {
    console.error('❌ [pushToken] Erreur réseau:', error);
    return null;
  }
};
