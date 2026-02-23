import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Mail, Phone, MapPin, LogOut, ChevronRight, UserCircle } from 'lucide-react-native';
import React, { useState, useEffect } from 'react';

// Importe tes outils de sécurité
import { GetProfile } from '../../src/requests/get'; 
import { removeToken } from '../../src/auth/authStorage';

export default function ProfileScreen() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // 1. On fait la requête GET sécurisée
        const response = await GetProfile("user@example.com", "password123"); // Remplace par les vraies valeurs
        
        if (response && response.success) {
          setUser(response.user);
        }
      } catch (error) {
        console.error("Erreur lors de la récupération du profil:", error);
        // L'apiCall gère déjà la redirection 401, donc on ne gère que les erreurs visuelles ici
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleLogout = async () => {
    Alert.alert("Déconnexion", "Êtes-vous sûr de vouloir vous déconnecter ?", [
      { text: "Annuler", style: "cancel" },
      { 
        text: "Déconnexion", 
        style: "destructive", 
        onPress: async () => {
          // On nettoie le token via notre utilitaire
          await removeToken(); 
          router.replace('/login');
        } 
      }
    ]);
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#f97316" />
        <Text style={{ marginTop: 10, color: '#8E8E93' }}>Chargement du profil...</Text>
      </View>
    );
  }

  // Si pas d'utilisateur après le chargement
  if (!user) return null;

  return (
    <ScrollView style={styles.container}>
      {/* Header avec Avatar */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
            <UserCircle size={80} color="#f97316" />
        </View>
        <Text style={styles.userName}>{user.firstname} {user.lastname}</Text>
        <Text style={styles.userId}>Client n° {user.id || 'N/A'}</Text>
      </View>

      {/* Section Informations Personneles */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Mes informations</Text>
        
        <InfoItem icon={<Mail size={20} color="#666" />} label="Email" value={user.email} />
        <InfoItem icon={<Phone size={20} color="#666" />} label="Téléphone" value={user.phone} />
        <InfoItem icon={<MapPin size={20} color="#666" />} label="Adresse" value={user.address ? `${user.address}, ${user.city}` : null} />
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