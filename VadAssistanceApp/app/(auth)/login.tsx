import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter, Link } from 'expo-router'; // <--- LE LINK VIENT D'ICI
import { ArrowLeft, Mail, Lock } from 'lucide-react-native'; // <--- PAS DE LINK ICI

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    console.log('Tentative de connexion avec:', email, password);
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
            />
          </View>

          {/* Maintenant ce Link fonctionnera car c'est le bon composant */}
          <Link href="/reset-password" asChild>
            <TouchableOpacity style={styles.forgotPassword} activeOpacity={0.7}>
                <Text style={styles.forgotText}>Mot de passe oublié ?</Text>
            </TouchableOpacity>
          </Link>

          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <Text style={styles.loginButtonText}>SE CONNECTER</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ... Tes styles restent identiques
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  decorativeCircle: {
    position: 'absolute',
    top: -80,
    left: -80,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#FFF7ED',
    zIndex: -1,
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
    shadowColor: '#f97316',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});