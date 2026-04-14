import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const logo = require('../../assets/images/logo-vad.png');

const ORANGE = '#f97316';

export default function WelcomeScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor={ORANGE} />

      {/* Cercles décoratifs */}
      <View style={styles.circleTopRight} />
      <View style={styles.circleBottomLeft} />

      {/* ── CENTRE : Logo + Tagline ── */}
      <View style={styles.center}>
        <Image source={logo} style={styles.logo} resizeMode="contain" />
        <Text style={styles.tagline}>
          L'assistance qui{'\n'}vous accompagne.
        </Text>
      </View>

      {/* ── BAS : Bouton ── */}
      <View style={styles.footer}>
        <Link href="/login" asChild>
          <TouchableOpacity style={styles.loginBtn} activeOpacity={0.85}>
            <Text style={styles.loginBtnText}>Se connecter</Text>
            <View style={styles.arrow}>
              <MaterialCommunityIcons name="arrow-right" size={20} color={ORANGE} />
            </View>
          </TouchableOpacity>
        </Link>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ORANGE,
  },

  circleTopRight: {
    position: 'absolute',
    top: -80,
    right: -80,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  circleBottomLeft: {
    position: 'absolute',
    bottom: -100,
    left: -100,
    width: 340,
    height: 340,
    borderRadius: 170,
    backgroundColor: 'rgba(255,255,255,0.07)',
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  logo: {
    width: 200,
    height: 100,
    marginBottom: 40,
  },
  tagline: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFF',
    textAlign: 'center',
    lineHeight: 42,
  },

  footer: {
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  loginBtn: {
    backgroundColor: '#FFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 18,
  },
  loginBtnText: {
    color: ORANGE,
    fontSize: 17,
    fontWeight: '800',
  },
  arrow: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: ORANGE_LIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

const ORANGE_LIGHT = '#FFEDD5';
