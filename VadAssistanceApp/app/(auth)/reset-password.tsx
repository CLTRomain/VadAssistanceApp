import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  SafeAreaView, 
  KeyboardAvoidingView, 
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Send } from 'lucide-react-native';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');

  const handleReset = () => {
    if (!email) {
      Alert.alert("Erreur", "Veuillez entrer votre adresse email.");
      return;
    }
    console.log('Demande de reset pour :', email);
    // Ici, appel à ton API CakePHP pour envoyer l'email
    Alert.alert("Succès", "Si ce compte existe, un email de récupération a été envoyé.");
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
          style={styles.inner}
        >
          {/* Bouton Retour */}
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <ArrowLeft color="#f97316" size={30} />
          </TouchableOpacity>

          <View style={styles.headerBox}>
            <Text style={styles.title}>Mot de passe oublié</Text>
            <Text style={styles.subtitle}>
              Entrez votre email pour recevoir les instructions de réinitialisation.
            </Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.label}>Adresse Email</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="votre@email.com"
                placeholderTextColor="#9ca3af"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoFocus={true}
              />
            </View>

            <TouchableOpacity style={styles.resetBtn} onPress={handleReset}>
              <Text style={styles.resetBtnText}>ENVOYER LE LIEN</Text>
              <Send color="#fff" size={18} style={styles.iconRight} />
            </TouchableOpacity>
          </View>

        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  inner: {
    flex: 1,
    paddingHorizontal: 25,
  },
  backBtn: {
    marginTop: 10,
    width: 50,
    height: 50,
    justifyContent: 'center',
  },
  headerBox: {
    marginVertical: 30,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 10,
    lineHeight: 22,
  },
  form: {
    width: '100%',
  },
  label: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
    marginLeft: 4,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    padding: 18,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    color: '#000',
  },
  resetBtn: {
    backgroundColor: '#f97316',
    paddingVertical: 18,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 25,
    shadowColor: '#f97316',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  resetBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  iconRight: {
    marginLeft: 10,
  },
});