import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { useRouter } from 'expo-router';
import { User, Mail, Phone, MapPin, LogOut, ChevronRight, UserCircle } from 'lucide-react-native';

export default function ProfileScreen() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    // Récupérer les données stockées lors du login
    const loadUserData = async () => {
      const userData = await AsyncStorage.getItem('user_data');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    };
    loadUserData();
  }, []);

  const handleLogout = async () => {
    Alert.alert("Déconnexion", "Êtes-vous sûr de vouloir vous déconnecter ?", [
      { text: "Annuler", style: "cancel" },
      { 
        text: "Déconnexion", 
        style: "destructive", 
        onPress: async () => {
          await AsyncStorage.clear();
          await SecureStore.deleteItemAsync('userToken');
          router.replace('/login');
        } 
      }
    ]);
  };

  if (!user) return <View style={styles.container}><Text>Chargement...</Text></View>;

  return (
    <ScrollView style={styles.container}>
      {/* Header avec Avatar */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
            <UserCircle size={80} color="#007AFF" />
        </View>
        <Text style={styles.userName}>{user.first_name} {user.last_name}</Text>
        <Text style={styles.userId}>Client n° {user.customer_number}</Text>
      </View>

      {/* Section Informations Personneles */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Mes informations</Text>
        
        <InfoItem icon={<Mail size={20} color="#666" />} label="Email" value={user.email} />
        <InfoItem icon={<Phone size={20} color="#666" />} label="Téléphone" value={user.phone} />
        <InfoItem icon={<MapPin size={20} color="#666" />} label="Adresse" value={`${user.address}, ${user.city}`} />
      </View>

      {/* Section Actions */}
      <View style={styles.section}>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionText}>Modifier mon profil</Text>
          <ChevronRight size={20} color="#CCC" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LogOut size={20} color="#FF3B30" />
          <Text style={styles.logoutText}>Se déconnecter</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

// Petit composant réutilisable pour les lignes d'info
function InfoItem({ icon, label, value }: any) {
  return (
    <View style={styles.infoRow}>
      {icon}
      <View style={styles.infoTextContainer}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value || "Non renseigné"}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  header: { alignItems: 'center', padding: 30, backgroundColor: '#FFF', marginBottom: 20 },
  avatarContainer: { marginBottom: 15 },
  userName: { fontSize: 22, fontWeight: 'bold', color: '#1C1C1E' },
  userId: { fontSize: 14, color: '#8E8E93', marginTop: 5 },
  section: { backgroundColor: '#FFF', paddingHorizontal: 16, marginBottom: 20, borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#E5E5EA' },
  sectionTitle: { fontSize: 13, color: '#8E8E93', textTransform: 'uppercase', marginVertical: 10, marginLeft: 0 },
  infoRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 0.5, borderColor: '#E5E5EA' },
  infoTextContainer: { marginLeft: 15 },
  infoLabel: { fontSize: 12, color: '#8E8E93' },
  infoValue: { fontSize: 16, color: '#1C1C1E', marginTop: 2 },
  actionButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 15 },
  actionText: { fontSize: 16, color: '#007AFF' },
  logoutButton: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, marginTop: 5 },
  logoutText: { fontSize: 16, color: '#FF3B30', marginLeft: 10, fontWeight: '600' },
});