import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  Alert,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Mail } from 'lucide-react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ForgotPassword } from '../../src/requests/post';

const ORANGE = '#f97316';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleReset = async () => {
    if (!email) {
      Alert.alert('Erreur', 'Veuillez entrer votre adresse email.');
      return;
    }
    setIsLoading(true);
    try {
      const result = await ForgotPassword(email);
      // On affiche toujours le même message pour ne pas révéler si l'email existe
      setSent(true);
    } catch {
      Alert.alert('Erreur', 'Impossible de contacter le serveur.');
    } finally {
      setIsLoading(false);
    }
  };

  if (sent) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <StatusBar barStyle="light-content" backgroundColor={ORANGE} />
        <View style={styles.topSection}>
          <View style={styles.circleTopRight} />
        </View>
        <View style={[styles.bottomSheet, { justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 }]}>
          <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: '#DCFCE7', justifyContent: 'center', alignItems: 'center', marginBottom: 20 }}>
            <MaterialCommunityIcons name="email-check-outline" size={36} color="#16A34A" />
          </View>
          <Text style={{ fontSize: 22, fontWeight: '800', color: '#111827', marginBottom: 10 }}>Email envoyé !</Text>
          <Text style={{ fontSize: 14, color: '#6B7280', textAlign: 'center', lineHeight: 22, marginBottom: 32 }}>
            Si ce compte existe, vous recevrez un lien de réinitialisation dans quelques instants.
          </Text>
          <TouchableOpacity style={styles.resetBtn} onPress={() => router.replace('/login')} activeOpacity={0.85}>
            <Text style={styles.resetBtnText}>Retour à la connexion</Text>
            <View style={styles.resetArrow}>
              <MaterialCommunityIcons name="arrow-right" size={16} color={ORANGE} />
            </View>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor={ORANGE} />

      {/* ── HAUT ORANGE ── */}
      <View style={styles.topSection}>
        <View style={styles.circleTopRight} />
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <ArrowLeft color="#FFF" size={22} />
        </TouchableOpacity>
        <View style={styles.topContent}>
          <Text style={styles.topTitle}>Mot de passe{'\n'}oublié ?</Text>
          <Text style={styles.topSub}>On s'occupe de ça.</Text>
        </View>
      </View>

      {/* ── BAS BLANC ── */}
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.bottomSheet}
        >
          <View style={styles.form}>

            <Text style={styles.instructions}>
              Entrez votre adresse email, nous vous enverrons un lien pour réinitialiser votre mot de passe.
            </Text>

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
                  autoFocus
                />
              </View>
            </View>

            {/* Bouton */}
            <TouchableOpacity
              style={[styles.resetBtn, isLoading && { opacity: 0.7 }]}
              onPress={handleReset}
              disabled={isLoading}
              activeOpacity={0.85}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <>
                  <Text style={styles.resetBtnText}>Envoyer le lien</Text>
                  <View style={styles.resetArrow}>
                    <MaterialCommunityIcons name="send" size={16} color={ORANGE} />
                  </View>
                </>
              )}
            </TouchableOpacity>

          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
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
  topTitle: { fontSize: 30, fontWeight: '800', color: '#FFF', lineHeight: 38 },
  topSub: { fontSize: 14, color: 'rgba(255,255,255,0.75)', marginTop: 6 },

  // Bottom sheet
  bottomSheet: {
    flex: 1,
    backgroundColor: '#FFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -20,
  },
  form: {
    paddingHorizontal: 24,
    paddingTop: 32,
    gap: 20,
  },

  instructions: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 22,
  },

  // Champ
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

  // Bouton
  resetBtn: {
    backgroundColor: ORANGE,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 17,
    paddingHorizontal: 20,
    borderRadius: 16,
    marginTop: 4,
    shadowColor: ORANGE,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  resetBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
  },
  resetArrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
