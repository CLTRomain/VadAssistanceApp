import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';
import { Link } from 'expo-router';

// Assure-toi d'avoir le logo en .png dans ce dossier
const logo = require('../../assets/images/logo-vad.png'); 

export default function WelcomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      {/* Cercle décoratif Orange clair en haut à droite */}
      <View style={styles.decorativeCircle} />

      <View style={styles.mainContent}>
        {/* Logo VAD */}
        <Image source={logo} style={styles.logo} resizeMode="contain" />
        
        <Text style={styles.welcomeText}>
          Votre assistance à portée de main
        </Text>
        <Text style={styles.tagline}>
          Accédez rapidement à tous vos services.
        </Text>
      </View>

      {/* Bloc Footer avec les deux boutons bien distincts */}
      <View style={styles.footer}>
        {/* Bouton de Connexion - Plein Orange */}
        <Link href="/login" asChild>
          <TouchableOpacity style={styles.loginButton} activeOpacity={0.8}>
            <Text style={styles.loginButtonText}>SE CONNECTER</Text>
          </TouchableOpacity>
        </Link>

        {/* Bouton d'Inscription - Contour Orange */}
        <Link href="/register" asChild>
          <TouchableOpacity style={styles.registerButton} activeOpacity={0.7}>
            <Text style={styles.registerButtonText}>CRÉER UN COMPTE</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden', // Pour que le cercle ne dépasse pas du container
  },
  decorativeCircle: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 300,
    height: 300,
    borderRadius: '100%',
    backgroundColor: '#f97316', // Orange très clair (orange-50)
    zIndex: -1, // Derrière le contenu
  },
  mainContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  logo: {
    width: 220,
    height: 110,
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 28,
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 10,
  },
  tagline: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    paddingHorizontal: 10,
  },
  footer: {
    paddingHorizontal: 30,
    paddingBottom: 40, // Espace important pour ne pas chevaucher la barre d'onglets
  },
  loginButton: {
    backgroundColor: '#f97316', // Orange-500 (VAD)
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    // Ombre pour faire ressortir le bouton
    shadowColor: '#f97316',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  registerButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#f97316',
  },
  registerButtonText: {
    color: '#f97316',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
});