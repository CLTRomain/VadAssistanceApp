import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { ArrowLeft, Mail, Lock } from 'lucide-react-native';


// --- IMPORT DE TA FONCTION ---
import { Login } from '../../src/requests/post'; 

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false); // Pour afficher un spinner

  const handleLogin = async () => {

    console.log('handleLogin appelé avec email:', email, 'et password:', password)
    // 1. Validation simple
    if (!email || !password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs.');
      return;
    }

    setIsLoading(true);

    try {
      // 2. Appel de ta fonction dans (request)/post.js
      const result = await Login(email, password);

      if (result && result.success) {
        // 3. Si CakePHP répond success: true
        console.log('Connexion réussie:', result.data);
        router.replace('/profile'); // Redirection vers l'accueil
      } else {
        // 4. Si CakePHP répond success: false (mauvais pass, etc.)
        Alert.alert('Échec', result.message || 'Identifiants incorrects');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de contacter le serveur.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={styles.inner}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft color="#f97316" size={28} />
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.title}>Connexion</Text>
          <Text style={styles.subtitle}>Ravis de vous revoir !</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Mail color="#9ca3af" size={20} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!isLoading}
            />
          </View>

          <View style={styles.inputContainer}>
            <Lock color="#9ca3af" size={20} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Mot de passe"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              editable={!isLoading}
            />
          </View>

          <Link href="/reset-password" asChild>
            <TouchableOpacity style={styles.forgotPassword} activeOpacity={0.7}>
                <Text style={styles.forgotText}>Mot de passe oublié ?</Text>
            </TouchableOpacity>
          </Link>

          <TouchableOpacity 
            style={[styles.loginButton, isLoading && { backgroundColor: '#fdba74' }]} 
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.loginButtonText}>SE CONNECTER</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  inner: {
    flex: 1,
    paddingHorizontal: 30,
  },
  backButton: {
    marginTop: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  header: {
    marginTop: 40,
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 5,
  },
  form: {
    gap: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 60,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: '#1f2937',
    fontSize: 16,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
  },
  forgotText: {
    color: '#f97316',
    fontWeight: '600',
  },
  loginButton: {
    backgroundColor: '#f97316',
    paddingVertical: 18,
    borderRadius: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
// ... (Garder tes styles identiques)