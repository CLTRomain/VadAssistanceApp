import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getToken } from '../src/auth/authStorage'; // Assure-toi d'avoir ton helper pour AsyncStorage

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const segments = useSegments(); // Permet de savoir sur quelle page on est
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const token = await getToken();

      console.log("Token trouvé au lancement de l'app:", token); // Debug pour voir le token
      
      // On regarde si l'utilisateur essaie d'accéder à une page protégée (dans (tabs))
      const inTabsGroup = segments[0] === '(tabs)';

      if (!token && inTabsGroup) {
        // Pas de token et veut aller sur le profil -> Direction Login
        router.replace('/(auth)/login');
      } else if (token && segments[0] === '(auth)') {
        // Déjà connecté mais sur la page login -> Direction le profil
        router.replace('/(tabs)/profile');
      }
      setIsReady(true);
    };

    checkAuth();
  }, [segments]); // Se relance à chaque changement de page

  if (!isReady) return null; // On peut mettre un écran de chargement ici

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        {/* L'ordre ici définit la priorité de chargement */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}