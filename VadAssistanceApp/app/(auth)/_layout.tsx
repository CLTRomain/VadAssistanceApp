import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        // C'est cette ligne qui va enlever le "(auth)/login" en haut
        headerShown: false, 
        // Optionnel : tu peux définir une animation de transition sympa
        animation: 'fade', 
      }}
    >
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
    </Stack>
  );
}