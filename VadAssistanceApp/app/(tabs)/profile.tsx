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
  TextInput,
  StatusBar,
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
  FileText,
  Download,
  X,
  Check,
  Edit3,
} from 'lucide-react-native';

import { GetProfile, GetDownload } from '../../src/requests/get';
import { UpdateSubscriber, Logout } from '../../src/requests/post';
import { registerForPushNotifications, savePushTokenToBackend } from '../../src/notifications/pushNotifications';

const ORANGE = '#f97316';
const ORANGE_LIGHT = '#FFEDD5';
const BG = '#F2F2F7';

export default function ProfileScreen() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [editData, setEditData] = useState({ email: '', phone: '', address: '' });
  const router = useRouter();

  useEffect(() => {
    fetchProfileData();
    setupPushNotifications();
  }, []);

  const setupPushNotifications = async () => {
    const pushToken = await registerForPushNotifications();
    console.log('🔔 Push Token:', pushToken);
    if (pushToken) await savePushTokenToBackend(pushToken);
  };

  const fetchProfileData = async () => {
    try {
      const response = await GetProfile();
      if (response?.success) {
        setUser(response.user_info);
        setEditData({
          email: response.user_info.email,
          phone: response.user_info.phone,
          address: response.user_info.address,
        });
      }
    } catch (error) {
      console.error('Erreur profil:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    await UpdateSubscriber(editData);
    setUser({ ...user, ...editData });
    setEditModalVisible(false);
  };

  const handleDownload = async (filePath: string) => {
    const download = await GetDownload(filePath);
    console.log('URL de téléchargement:', download);
  };

  const handleLogout = () => {
    Alert.alert('Déconnexion', 'Souhaitez-vous vous déconnecter ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Déconnexion',
        style: 'destructive',
        onPress: async () => {
          await Logout(); // Appelle le backend + nettoie JWT et push token
          router.replace('/login');
        },
      },
    ]);
  };

  const handlePressConsulter = (contractId: string, contractName: string, subscriberId: number) => {
    router.push({ pathname: '/contract-details', params: { id: contractId, name: contractName, subscriberId: String(subscriberId) } });
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={ORANGE} />
        <Text style={styles.loaderText}>Chargement du profil...</Text>
      </View>
    );
  }

  if (!user) return null;

  const initials = `${user.first_name?.[0] ?? ''}${user.last_name?.[0] ?? ''}`.toUpperCase();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={ORANGE} />

      {/* ── HEADER ORANGE ── */}
      <View style={styles.header}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarInitials}>{initials}</Text>
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.headerName}>{user.first_name} {user.last_name}</Text>
          <Text style={styles.headerSub}>{user.contracts?.[0]?.contract_name ?? ''}</Text>
        </View>
        <TouchableOpacity
          onPress={handleLogout}
          style={styles.logoutIconBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <LogOut size={20} color="rgba(255,255,255,0.85)" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── MES CONTRATS ── */}
        <Text style={styles.sectionLabel}>Mes contrats</Text>
        <View style={styles.card}>
          {user.contracts?.length > 0 ? (
            user.contracts.map((contract: any, i: number) => {
              // Parse DD/MM/YYYY
              const [day, month, year] = (contract.signed_at ?? '').split('/');
              const signedDate = day && month && year
                ? new Date(`${year}-${month}-${day}`).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
                : null;
              return (
                <TouchableOpacity
                  key={contract.contract_id ?? i}
                  style={[styles.contractRow, i === 0 && { borderTopWidth: 0 }]}
                  onPress={() => handlePressConsulter(String(contract.contract_id), contract.contract_name, contract.contract_subscriber_id)}
                  activeOpacity={0.75}
                >
                  <View style={styles.contractIconBg}>
                    <FileText size={18} color={ORANGE} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.contractName}>{contract.contract_name}</Text>
                    {signedDate && (
                      <Text style={styles.contractDate}>Depuis le {signedDate}</Text>
                    )}
                  </View>
                  <ChevronRight size={18} color="#D1D5DB" />
                </TouchableOpacity>
              );
            })
          ) : (
            <View style={styles.emptyState}>
              <FileText size={28} color="#D1D5DB" />
              <Text style={styles.emptyText}>Aucun contrat actif</Text>
            </View>
          )}
        </View>

        {/* ── MES DOCUMENTS ── */}
        <View style={styles.docSectionHeader}>
          <FileText size={16} color={ORANGE} />
          <Text style={[styles.sectionLabel, { marginBottom: 0 }]}>Mes documents</Text>
        </View>
        {user.contracts?.length > 0 ? (
          user.contracts.map((contract: any, ci: number) => (
            <View key={contract.contract_id ?? ci} style={{ marginBottom: 16 }}>
              {/* Nom du contrat */}
              <View style={styles.docContractHeader}>
                <View style={styles.docContractDot} />
                <Text style={styles.docContractTitle}>{contract.contract_name}</Text>
              </View>
              <View style={styles.card}>
                {contract.files?.length > 0 ? (
                  contract.files.map((file: any, i: number) => (
                    <View key={file.id ?? i} style={[styles.fileRow, i === 0 && { borderTopWidth: 0 }]}>
                      <View style={styles.fileIconBg}>
                        <FileText size={18} color={ORANGE} />
                      </View>
                      <Text style={styles.fileName} numberOfLines={1}>{file.name}</Text>
                      <TouchableOpacity style={styles.downloadBtn} onPress={() => handleDownload(file.download_path)}>
                        <Download size={18} color={ORANGE} />
                      </TouchableOpacity>
                    </View>
                  ))
                ) : (
                  <View style={styles.emptyState}>
                    <FileText size={28} color="#D1D5DB" />
                    <Text style={styles.emptyText}>Aucun document disponible</Text>
                  </View>
                )}
              </View>
            </View>
          ))
        ) : (
          <View style={[styles.card, { marginBottom: 24 }]}>
            <View style={styles.emptyState}>
              <FileText size={28} color="#D1D5DB" />
              <Text style={styles.emptyText}>Aucun document disponible</Text>
            </View>
          </View>
        )}

        {/* ── MES COORDONNÉES ── */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionLabel}>Mes coordonnées</Text>
          <TouchableOpacity onPress={() => setEditModalVisible(true)} style={styles.editBtn}>
            <Edit3 size={13} color={ORANGE} />
            <Text style={styles.editBtnText}>Modifier</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.card}>
          <InfoRow icon={<Mail size={18} color="#8E8E93" />} label="Email" value={user.email} />
          <InfoRow icon={<Phone size={18} color="#8E8E93" />} label="Téléphone" value={user.phone} />
          <InfoRow
            icon={<Cake size={18} color="#8E8E93" />}
            label="Date de naissance"
            value={user.date_of_birth ? new Date(user.date_of_birth).toLocaleDateString('fr-FR') : 'N/A'}
          />
          <InfoRow icon={<MapPin size={18} color="#8E8E93" />} label="Adresse" value={user.address} isLast />
        </View>

        {/* ── DÉCONNEXION ── */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
          <LogOut size={18} color="#DC2626" />
          <Text style={styles.logoutText}>Se déconnecter</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* ── MODAL MODIFICATION ── */}
      <Modal visible={isEditModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />

            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Modifier mes infos</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)} style={styles.modalCloseBtn}>
                <X size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={styles.input}
                value={editData.email}
                onChangeText={(t) => setEditData({ ...editData, email: t })}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>Téléphone</Text>
              <TextInput
                style={styles.input}
                value={editData.phone}
                onChangeText={(t) => setEditData({ ...editData, phone: t })}
                keyboardType="phone-pad"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>Adresse</Text>
              <TextInput
                style={styles.input}
                value={editData.address}
                onChangeText={(t) => setEditData({ ...editData, address: t })}
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <TouchableOpacity style={styles.saveBtn} onPress={handleUpdateProfile} activeOpacity={0.85}>
              <Check size={20} color="#FFF" />
              <Text style={styles.saveBtnText}>Enregistrer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function InfoRow({
  icon,
  label,
  value,
  isLast,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  isLast?: boolean;
}) {
  return (
    <View style={[styles.infoRow, isLast && { borderBottomWidth: 0 }]}>
      <View style={styles.infoIconWrap}>{icon}</View>
      <View style={{ flex: 1 }}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value || 'Non renseigné'}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: ORANGE },

  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: BG },
  loaderText: { marginTop: 12, color: '#6B7280', fontSize: 14 },

  // Header
  header: {
    backgroundColor: ORANGE,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 20,
  },
  avatarCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  avatarInitials: { fontSize: 20, fontWeight: '800', color: '#FFF' },
  headerInfo: { flex: 1, marginLeft: 12 },
  headerName: { fontSize: 18, fontWeight: '800', color: '#FFF' },
  headerSub: { fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  logoutIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  scroll: { flex: 1, backgroundColor: BG },
  scrollContent: { paddingHorizontal: 16, paddingTop: 20 },

  // CTA
  ctaButton: {
    backgroundColor: ORANGE,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: ORANGE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  ctaLeft: { flexDirection: 'row', alignItems: 'center' },
  ctaIconBg: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  ctaText: { color: '#FFF', fontSize: 16, fontWeight: '700' },

  // Section labels
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8E8E93',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
    marginLeft: 4,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginRight: 4,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 10,
  },
  editBtnText: { fontSize: 13, fontWeight: '700', color: ORANGE },

  // Card
  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },

  // Documents
  fileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  fileIconBg: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: ORANGE_LIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  fileName: { flex: 1, fontSize: 14, fontWeight: '500', color: '#1C1C1E' },
  downloadBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: ORANGE_LIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },

  emptyState: { paddingVertical: 28, alignItems: 'center' },

  docSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  docContractHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    marginLeft: 4,
    gap: 8,
  },
  docContractDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: ORANGE,
  },
  docContractTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
  },

  // Contrats
  contractRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  contractIconBg: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: ORANGE_LIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contractName: { fontSize: 14, fontWeight: '700', color: '#111827' },
  contractDate: { fontSize: 11, color: '#9CA3AF', marginTop: 2 },
  emptyText: { marginTop: 10, color: '#9CA3AF', fontSize: 13, fontStyle: 'italic' },

  // Info rows
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  infoIconWrap: { width: 32, marginRight: 12 },
  infoLabel: { fontSize: 11, color: '#9CA3AF', marginBottom: 2 },
  infoValue: { fontSize: 15, color: '#1C1C1E', fontWeight: '500' },

  // Logout
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
    borderWidth: 1.5,
    borderColor: '#FECACA',
    borderRadius: 14,
    paddingVertical: 14,
    gap: 8,
  },
  logoutText: { color: '#DC2626', fontSize: 15, fontWeight: '700' },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 40,
  },
  modalHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E5E7EB',
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#111827' },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  formGroup: { marginBottom: 16 },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: '#111827',
  },
  saveBtn: {
    backgroundColor: ORANGE,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 14,
    marginTop: 8,
    gap: 8,
    shadowColor: ORANGE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});
