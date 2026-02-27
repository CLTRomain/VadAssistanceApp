import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Alert, 
  ActivityIndicator,
  Modal,
  TextInput
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Mail, 
  Phone, 
  Cake, 
  MapPin, 
  LogOut, 
  ChevronRight, 
  UserCircle, 
  FileText, 
  Download,
  X,
  Check
} from 'lucide-react-native';

import { GetProfile, GetDownload } from '../../src/requests/get'; 
import { removeToken } from '../../src/auth/authStorage';
import {UpdateSubscriber} from '../../src/requests/post';

export default function ProfileScreen() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditModalVisible, setEditModalVisible] = useState(false);
  
  // States pour le formulaire de modification
  const [editData, setEditData] = useState({
    email: '',
    phone: '',
    address: ''
  });

  const router = useRouter();

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      const response = await GetProfile();
      if (response && response.success) {
        setUser(response.user_info);
        setEditData({
          email: response.user_info.email,
          phone: response.user_info.phone,
          address: response.user_info.address
        });
      }
    } catch (error) {
      console.error("Erreur profil:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    const result = await UpdateSubscriber(editData);

    setUser({ ...user, ...editData });
    setEditModalVisible(false);
  };

  const handleDownload = async (filePath: string) => {
    console.log("Téléchargement", `Ouverture de : ${filePath}`);
    const Dowload = await GetDownload(filePath);

    console.log("URL de téléchargement:", Dowload);
  };

  const handleLogout = async () => {
    Alert.alert("Déconnexion", "Souhaitez-vous vous déconnecter ?", [
      { text: "Annuler", style: "cancel" },
      { text: "Déconnexion", style: "destructive", onPress: async () => {
          await removeToken(); 
          router.replace('/login');
      }}
    ]);
  };

  if (loading) return <View style={styles.loadingContainer}><ActivityIndicator size="large" color="#f97316" /></View>;
  if (!user) return null;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <UserCircle size={80} color="#f97316" strokeWidth={1.5} />
          </View>
          <Text style={styles.userName}>{user.first_name} {user.last_name}</Text>
          <Text style={styles.userSub}>{user.contract_name}</Text>
        </View>

        {/* BOUTON PRINCIPAL */}
        <View style={styles.mainActionContainer}>
          <TouchableOpacity 
            style={styles.mainContractButton}
            onPress={() => {
              const firstFile = user.contract_subscriber_files?.[0];
              if (firstFile) handleDownload(firstFile.id);
            }}
          >
            <View style={styles.mainContractLeft}>
              <FileText size={22} color="#FFF" />
              <Text style={styles.mainContractText}>Consulter mon contrat</Text>
            </View>
            <ChevronRight size={20} color="#FFF" />
          </TouchableOpacity>
        </View>

        {/* SECTION : DOCUMENTS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mes Documents</Text>
          {user.contract_subscriber_files?.map((file: any) => (
            <View key={file.id} style={styles.fileRow}>
              <View style={styles.fileInfo}>
                <FileText size={20} color="#666" />
                <Text style={styles.fileName} numberOfLines={1}>{file.name}</Text>
              </View>
              <TouchableOpacity style={styles.downloadIconBtn} onPress={() => handleDownload(file.download_path)}>
                <Download size={18} color="#f97316" />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* SECTION : COORDONNÉES + BOUTON MODIFIER */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Mes coordonnées</Text>
            <TouchableOpacity onPress={() => setEditModalVisible(true)}>
              <Text style={styles.editActionText}>Modifier</Text>
            </TouchableOpacity>
          </View>
          
          <InfoItem icon={<Mail size={18} color="#8E8E93" />} label="Email" value={user.email} />
          <InfoItem icon={<Phone size={18} color="#8E8E93" />} label="Téléphone" value={user.phone} />
          <InfoItem 
            icon={<Cake size={18} color="#8E8E93" />} 
            label="Date de naissance" 
            value={user.date_of_birth ? new Date(user.date_of_birth).toLocaleDateString('fr-FR') : "N/A"} 
          />
          <InfoItem icon={<MapPin size={18} color="#8E8E93" />} label="Adresse" value={user.address} isLast />
        </View>

        {/* LOGOUT */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <LogOut size={20} color="#FF3B30" />
          <Text style={styles.logoutText}>Se déconnecter</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* MODAL DE MODIFICATION */}
      <Modal visible={isEditModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Modifier mes infos</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <X size={24} color="#1C1C1E" />
              </TouchableOpacity>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput 
                style={styles.input} 
                value={editData.email} 
                onChangeText={(t) => setEditData({...editData, email: t})}
                keyboardType="email-address"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>Téléphone</Text>
              <TextInput 
                style={styles.input} 
                value={editData.phone} 
                onChangeText={(t) => setEditData({...editData, phone: t})}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>Adresse</Text>
              <TextInput 
                style={styles.input} 
                value={editData.address} 
                onChangeText={(t) => setEditData({...editData, address: t})}
              />
            </View>

            <TouchableOpacity style={styles.saveButton} onPress={handleUpdateProfile}>
              <Check size={20} color="#FFF" />
              <Text style={styles.saveButtonText}>Enregistrer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function InfoItem({ icon, label, value, isLast }: any) {
  return (
    <View style={[styles.infoRow, isLast && { borderBottomWidth: 0 }]}>
      <View style={styles.infoIcon}>{icon}</View>
      <View>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value || "Non renseigné"}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F2F2F7' },
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { alignItems: 'center', paddingVertical: 25, backgroundColor: '#FFF', borderBottomWidth: 1, borderColor: '#E5E5EA' },
  avatarContainer: { marginBottom: 10 },
  userName: { fontSize: 22, fontWeight: 'bold', color: '#1C1C1E' },
  userSub: { fontSize: 14, color: '#f97316', marginTop: 4, fontWeight: '500' },
  mainActionContainer: { paddingHorizontal: 16, marginTop: 20 },
  mainContractButton: { 
    backgroundColor: '#f97316', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', 
    padding: 18, borderRadius: 15, elevation: 5
  },
  mainContractLeft: { flexDirection: 'row', alignItems: 'center', },
  mainContractText: { color: '#FFF', fontSize: 17, fontWeight: 'bold', marginLeft: 12 },
  section: { backgroundColor: '#FFF', marginTop: 20,  padding: 16, borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#E5E5EA' },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, marginBottom: 8 },
  sectionTitle: { fontSize: 13, color: '#8E8E93', textTransform: 'uppercase' },
  editActionText: { fontSize: 14, color: '#f97316', fontWeight: 'bold' },
  fileRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, borderBottomWidth: 0.5, borderColor: '#E5E5EA' },
  fileInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  fileName: { fontSize: 15, color: '#1C1C1E', marginLeft: 12, flexShrink: 1 },
  downloadIconBtn: { padding: 8 },
  infoRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 0.5, borderColor: '#E5E5EA' },
  infoIcon: { width: 35 },
  infoLabel: { fontSize: 12, color: '#8E8E93' },
  infoValue: { fontSize: 15, color: '#1C1C1E', marginTop: 2 },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFF', marginTop: 30, paddingVertical: 16, borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#E5E5EA' },
  logoutText: { color: '#FF3B30', fontSize: 16, fontWeight: 'bold', marginLeft: 10 },
  
  // MODAL STYLES
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFF', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, paddingBottom: 40 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#1C1C1E' },
  formGroup: { marginBottom: 15 },
  inputLabel: { fontSize: 14, color: '#8E8E93', marginBottom: 5 },
  input: { backgroundColor: '#F2F2F7', padding: 12, borderRadius: 10, fontSize: 16 },
  saveButton: { backgroundColor: '#f97316', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, borderRadius: 12, marginTop: 10 },
  saveButtonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold', marginLeft: 8 }
});