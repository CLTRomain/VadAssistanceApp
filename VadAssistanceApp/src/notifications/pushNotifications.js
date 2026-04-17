import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { getToken } from '../auth/authStorage';

var ip = process.env.EXPO_PUBLIC_API_IP || "localhost";
var port = "8888";

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
 * Retourne le token ou null si refusé / simulateur
 */
export const registerForPushNotifications = async () => {
  if (!Device.isDevice) {
    console.log('Push notifications non disponibles sur simulateur');
    return null;
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
  return tokenData.data;
};

/**
 * Envoie le push token au backend pour le stocker
 */
export const savePushTokenToBackend = async (pushToken) => {
  try {
    const authToken = await getToken();
    const response = await fetch(`http://${ip}:${port}/save-push-token`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify({ push_token: pushToken }),
    });
    return await response.json();
  } catch (error) {
    console.error('Erreur sauvegarde push token:', error);
    return null;
  }
};
