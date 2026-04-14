import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  StatusBar,
} from 'react-native';
import { useRouter, Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Mail, Lock } from 'lucide-react-native';
import { Login } from '../../src/requests/post';

const ORANGE = '#f97316';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs.');
      return;
    }
    setIsLoading(true);
    try {
      const result = await Login(email, password);
      if (result?.success) {
        router.replace('/profile');
      } else {
        Alert.alert('Échec', result.message || 'Identifiants incorrects');
      }
    } catch {
      Alert.alert('Erreur', 'Impossible de contacter le serveur.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor={ORANGE} />

      {/* ── HAUT ORANGE ── */}
      <View style={styles.topSection}>
        <View style={styles.circleTopRight} />
        <TouchableOpacity
          onPress={() => router.replace('/')}
          style={styles.backBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <ArrowLeft color="#FFF" size={22} />
        </TouchableOpacity>
        <View style={styles.topContent}>
          <Text style={styles.topTitle}>Connexion</Text>
          <Text style={styles.topSub}>Ravis de vous revoir !</Text>
        </View>
      </View>

      {/* ── BAS BLANC ── */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.bottomSheet}
      >
        <View style={styles.form}>

          {/* Email */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Adresse email</Text>
            <View style={styles.inputRow}>
              <Mail color="#9CA3AF" size={18} style={{ marginRight: 10 }} />
              <TextInput
                style={styles.input}
                placeholder="exemple@email.com"
                placeholderTextColor="#D1D5DB"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!isLoading}
              />
            </View>
          </View>

          {/* Mot de passe */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Mot de passe</Text>
            <View style={styles.inputRow}>
              <Lock color="#9CA3AF" size={18} style={{ marginRight: 10 }} />
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor="#D1D5DB"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                editable={!isLoading}
              />
            </View>
          </View>

          {/* Mot de passe oublié */}
          <Link href="/reset-password" asChild>
            <TouchableOpacity activeOpacity={0.7} style={styles.forgotRow}>
              <Text style={styles.forgotText}>Mot de passe oublié ?</Text>
            </TouchableOpacity>
          </Link>

          {/* Bouton */}
          <TouchableOpacity
            style={[styles.loginBtn, isLoading && { opacity: 0.7 }]}
            onPress={handleLogin}
            disabled={isLoading}
            activeOpacity={0.85}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.loginBtnText}>Se connecter</Text>
            )}
          </TouchableOpacity>

        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },

  // Top orange
  topSection: {
    backgroundColor: ORANGE,
    paddingHorizontal: 22,
    paddingTop: 10,
    paddingBottom: 32,
    overflow: 'hidden',
  },
  circleTopRight: {
    position: 'absolute',
    top: -60,
    right: -60,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  topContent: {},
  topTitle: { fontSize: 30, fontWeight: '800', color: '#FFF' },
  topSub: { fontSize: 14, color: 'rgba(255,255,255,0.75)', marginTop: 4 },

  // Bottom sheet
  bottomSheet: {
    flex: 1,
    backgroundColor: '#FFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  form: {
    paddingHorizontal: 24,
    paddingTop: 32,
    gap: 20,
  },

  // Champs
  fieldGroup: { gap: 6 },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 56,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#111827',
  },

  // Mot de passe oublié
  forgotRow: { alignSelf: 'flex-end' },
  forgotText: { color: ORANGE, fontWeight: '700', fontSize: 13 },

  // Bouton
  loginBtn: {
    backgroundColor: ORANGE,
    paddingVertical: 17,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 4,
    shadowColor: ORANGE,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  loginBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
  },
});
