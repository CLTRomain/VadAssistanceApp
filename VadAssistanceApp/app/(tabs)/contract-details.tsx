import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  StatusBar,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GetContractDetails } from '../../src/requests/get';
import { CreateInterventionRequest, AskToEndContract } from '../../src/requests/post';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const ORANGE = '#f97316';
const ORANGE_LIGHT = '#FFEDD5';
const ORANGE_DARK = '#ea580c';
const BG = '#F2F2F7';

type DomainConfig = {
  icon: string;
  bg: string;
  color: string;
};

const DOMAIN_CONFIG: Record<string, DomainConfig> = {
  plomberie:      { icon: 'water-pump', bg: '#DBEAFE', color: '#1D4ED8' },
  electricite:    { icon: 'flash',      bg: '#FEF9C3', color: '#B45309' },
  gaz:            { icon: 'fire',       bg: '#FEE2E2', color: '#B91C1C' },
  electromenager: { icon: 'tools',      bg: '#D1FAE5', color: '#065F46' },
};

const getDomainConfig = (domain: string): DomainConfig =>
  DOMAIN_CONFIG[domain.toLowerCase()] ?? { icon: 'shield-check', bg: '#F3F4F6', color: '#4B5563' };

type StatusConfig = {
  bg: string;
  text: string;
  dot: string;
  label: string;
};

const getStatusConfig = (status: string): StatusConfig => {
  switch (status?.toLowerCase()) {
    case 'waiting':
    case 'pending':
      return { bg: '#FEF9C3', text: '#854D0E', dot: '#F59E0B', label: 'En attente' };
    case 'processing':
      return { bg: '#DCFCE7', text: '#166534', dot: '#22C55E', label: 'En cours' };
    case 'closed':
      return { bg: '#FEE2E2', text: '#991B1B', dot: '#EF4444', label: 'Clôturé' };
    default:
      return { bg: '#F3F4F6', text: '#374151', dot: '#9CA3AF', label: status };
  }
};

export default function ContractDetailsScreen() {
  const { id, name, subscriberId } = useLocalSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [resilierVisible, setResilierVisible] = useState(false);
  const [toastConfig, setToastConfig] = useState({ message: '', success: true });
  const toastOpacity = useRef(new Animated.Value(0)).current;

  const showToast = (message: string, success: boolean = true) => {
    setToastConfig({ message, success });
    Animated.sequence([
      Animated.timing(toastOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.delay(2500),
      Animated.timing(toastOpacity, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start();
  };

  const handleResilier = async () => {
    setResilierVisible(false);
    const result = await AskToEndContract(subscriberId as string);
    if (result?.success) {
      showToast('Votre demande de résiliation a été prise en compte', true);
    } else {
      showToast(result?.message || 'Une erreur est survenue.', false);
    }
  };

  const handleSubmitIntervention = async () => {
    if (!subject.trim() || !description.trim()) return;

    const newRequest = {
      subject: subject.trim(),
      description: description.trim(),
      status: 'pending',
      created_at: new Date().toISOString(),
    };

    // Mise à jour optimiste immédiate
    setData((prev: any) => ({
      ...prev,
      supportRequestContacts: [newRequest, ...(prev?.supportRequestContacts ?? [])],
    }));
    setSubject('');
    setDescription('');
    setModalVisible(false);

    // Envoi au backend
    await CreateInterventionRequest({ subject: newRequest.subject, description: newRequest.description, contractSubscriberId: subscriberId as string });
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const result = await GetContractDetails(id || '21');
      if (result?.success) setData(result.data);
      setLoading(false);
    };
    loadData();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={ORANGE} />
        <Text style={styles.loaderText}>Chargement du contrat...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={ORANGE} />

      {/* ── HEADER ORANGE ── */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.push('/profile')}
          style={styles.backBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="chevron-back" size={22} color="#FFF" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{name || 'Mon Contrat'}</Text>
          <Text style={styles.headerSub}>Détails & interventions</Text>
        </View>
        <View style={styles.headerIcon}>
          <MaterialCommunityIcons name="shield-check" size={26} color="rgba(255,255,255,0.85)" />
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── BOUTON DEMANDE D'INTERVENTION ── */}
        <TouchableOpacity style={styles.ctaButton} activeOpacity={0.85} onPress={() => setModalVisible(true)}>
          <View style={styles.ctaLeft}>
            <View style={styles.ctaIconBg}>
              <Ionicons name="add" size={20} color={ORANGE} />
            </View>
            <Text style={styles.ctaText}>Demande d'intervention</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#FFF" />
        </TouchableOpacity>

        {/* ── MES DEMANDES RÉCENTES ── */}
        <Text style={styles.sectionLabel}>Mes demandes récentes</Text>
        <View style={styles.card}>
          {data?.supportRequestContacts?.length > 0 ? (
            <ScrollView nestedScrollEnabled style={{ maxHeight: 240 }} showsVerticalScrollIndicator={false}>
              {data.supportRequestContacts.map((req: any, i: number) => {
                const s = getStatusConfig(req.status);
                return (
                  <View key={i} style={[styles.requestRow, i === 0 && { borderTopWidth: 0 }]}>
                    <View style={[styles.statusDot, { backgroundColor: s.dot }]} />
                    <View style={{ flex: 1 }}>
                      <View style={styles.requestTopRow}>
                        <Text style={styles.requestSubject} numberOfLines={1}>{req.subject}</Text>
                        <View style={[styles.badge, { backgroundColor: s.bg }]}>
                          <Text style={[styles.badgeText, { color: s.text }]}>{s.label}</Text>
                        </View>
                      </View>
                      <Text style={styles.requestDesc} numberOfLines={2}>
                        {req.description || 'Pas de description'}
                      </Text>
                      <Text style={styles.requestDate}>
                        Soumis le {new Date(req.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </ScrollView>
          ) : (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="inbox-outline" size={32} color="#D1D5DB" />
              <Text style={styles.emptyText}>Aucune demande récente</Text>
            </View>
          )}
        </View>

        {/* ── MES FORFAITS ── */}
        <Text style={styles.sectionLabel}>Mes forfaits</Text>
        <View style={styles.grid}>
          {data?.finalResults?.map((domain: any, i: number) => {
            const cfg = getDomainConfig(domain.domain);
            const progress = domain.cumul > 0
              ? Math.min(100, (domain.totalSinistres / domain.cumul) * 100)
              : 0;
            const domainName = domain.domain.charAt(0).toUpperCase() + domain.domain.slice(1);
            return (
              <View key={i} style={styles.forfaitCard}>
                <View style={styles.forfaitHeader}>
                  <View style={[styles.forfaitIconBg, { backgroundColor: cfg.bg }]}>
                    <MaterialCommunityIcons name={cfg.icon as any} size={20} color={cfg.color} />
                  </View>
                  <Text style={styles.forfaitName} numberOfLines={1}>{domainName}</Text>
                </View>
                <Text style={styles.forfaitAmount}>{Number.isInteger(domain.totalSinistres) ? domain.totalSinistres : domain.totalSinistres.toFixed(2)}€</Text>
                <Text style={styles.forfaitSub}>sur {Number.isInteger(domain.cumul) ? domain.cumul : domain.cumul.toFixed(2)}€ de forfait</Text>
                <View style={styles.progressTrack}>
                  <View style={[styles.progressBar, { width: `${progress}%` as any, backgroundColor: cfg.color }]} />
                </View>
                <Text style={styles.progressPct}>{Number.isInteger(Math.round(progress * 100) / 100) ? Math.round(progress) : (Math.round(progress * 100) / 100).toFixed(2)}% utilisé</Text>
              </View>
            );
          })}
        </View>

        {/* ── HISTORIQUE D'INTERVENTIONS ── */}
        <Text style={styles.sectionLabel}>Historique d'interventions</Text>
        <View style={styles.card}>
          {data?.finalResults?.some((d: any) => d.sinistresDetails?.length) ? (
            <ScrollView nestedScrollEnabled style={{ maxHeight: 320 }} showsVerticalScrollIndicator={false}>
              {data.finalResults.map((domain: any, di: number) =>
                domain.sinistresDetails?.map((s: any, i: number) => {
                  const cfg = getDomainConfig(domain.domain);
                  const isFirst = di === 0 && i === 0;
                  return (
                    <View key={`${domain.domain}-${i}`} style={[styles.histRow, isFirst && { borderTopWidth: 0 }]}>
                      <View style={[styles.histIconBg, { backgroundColor: cfg.bg }]}>
                        <MaterialCommunityIcons name={cfg.icon as any} size={18} color={cfg.color} />
                      </View>
                      <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text style={styles.histName}>{s.skill_name}</Text>
                        <Text style={styles.histDest} numberOfLines={1}>
                          {s.payment_dest || 'Intervention VAD'}
                        </Text>
                        <View style={styles.histTags}>
                          <View style={styles.dateTag}>
                            <Ionicons name="calendar-outline" size={10} color={ORANGE_DARK} style={{ marginRight: 3 }} />
                            <Text style={styles.dateTagText}>{s.payment_date}</Text>
                          </View>
                          <View style={styles.priceTag}>
                            <Text style={styles.priceTagText}>{s.payment_amount}€</Text>
                          </View>
                        </View>
                      </View>
                    </View>
                  );
                })
              )}
            </ScrollView>
          ) : (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="history" size={32} color="#D1D5DB" />
              <Text style={styles.emptyText}>Aucune intervention enregistrée</Text>
            </View>
          )}
        </View>

        {/* ── BOUTON RÉSILIATION ── */}
        <TouchableOpacity style={styles.resilierBtn} activeOpacity={0.8} onPress={() => setResilierVisible(true)}>
          <Ionicons name="close-circle-outline" size={20} color="#DC2626" />
          <Text style={styles.resilierText}>Résilier mon contrat</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* ── MODAL DEMANDE D'INTERVENTION ── */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />

            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Nouvelle demande</Text>
                <Text style={styles.modalSub}>Décrivez votre besoin d'intervention</Text>
              </View>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.modalCloseBtn}>
                <Ionicons name="close" size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {/* Objet */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Objet</Text>
              <TextInput
                style={styles.inputSingle}
                placeholder="Ex : Fuite d'eau, panne électrique..."
                placeholderTextColor="#D1D5DB"
                value={subject}
                onChangeText={setSubject}
                maxLength={100}
              />
            </View>

            {/* Description */}
            <View style={styles.fieldGroup}>
              <View style={styles.fieldLabelRow}>
                <Text style={styles.fieldLabel}>Description</Text>
                <Text style={[styles.charCount, description.length >= 500 && { color: '#EF4444' }]}>
                  {description.length}/500
                </Text>
              </View>
              <TextInput
                style={styles.inputMulti}
                placeholder="Décrivez le problème en détail..."
                placeholderTextColor="#D1D5DB"
                value={description}
                onChangeText={setDescription}
                maxLength={500}
                multiline
                textAlignVertical="top"
              />
            </View>

            <TouchableOpacity
              style={[styles.submitBtn, (!subject.trim() || !description.trim()) && { opacity: 0.5 }]}
              onPress={handleSubmitIntervention}
              disabled={!subject.trim() || !description.trim()}
              activeOpacity={0.85}
            >
              <Text style={styles.submitBtnText}>Envoyer la demande</Text>
              <View style={styles.submitArrow}>
                <MaterialCommunityIcons name="send" size={16} color={ORANGE} />
              </View>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ── POPUP RÉSILIATION ── */}
      <Modal visible={resilierVisible} animationType="fade" transparent>
        <View style={styles.popupOverlay}>
          <View style={styles.popupBox}>
            <View style={styles.popupIconWrap}>
              <Ionicons name="warning-outline" size={32} color="#DC2626" />
            </View>
            <Text style={styles.popupTitle}>Demande de résiliation</Text>
            <Text style={styles.popupBody}>
              Êtes-vous sûr d'envoyer votre demande de résiliation ? Vous serez recontacté par notre équipe.
            </Text>
            <View style={styles.popupActions}>
              <TouchableOpacity style={styles.popupBtnNo} onPress={() => setResilierVisible(false)} activeOpacity={0.8}>
                <Text style={styles.popupBtnNoText}>Non</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.popupBtnYes} onPress={handleResilier} activeOpacity={0.8}>
                <Text style={styles.popupBtnYesText}>Oui, résilier</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ── TOAST ── */}
      <Animated.View style={[styles.toast, { opacity: toastOpacity }]} pointerEvents="none">
        <Ionicons
          name={toastConfig.success ? 'checkmark-circle' : 'alert-circle'}
          size={18}
          color={toastConfig.success ? '#22C55E' : '#EF4444'}
        />
        <Text style={styles.toastText}>{toastConfig.message}</Text>
      </Animated.View>

    </SafeAreaView>
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
    paddingVertical: 14,
    paddingBottom: 18,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: { flex: 1, marginLeft: 12 },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#FFF' },
  headerSub: { fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 1 },
  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
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

  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8E8E93',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
    marginLeft: 4,
  },

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

  // Demandes
  requestRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginTop: 5, marginRight: 10 },
  requestTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  requestSubject: { fontSize: 14, fontWeight: '700', color: '#111827', flex: 1, marginRight: 8 },
  requestDesc: { fontSize: 13, color: '#6B7280', lineHeight: 18 },
  requestDate: { fontSize: 11, color: '#9CA3AF', marginTop: 6 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 99 },
  badgeText: { fontSize: 11, fontWeight: '700' },

  emptyState: { paddingVertical: 28, alignItems: 'center' },
  emptyText: { marginTop: 10, color: '#9CA3AF', fontSize: 13, fontStyle: 'italic' },

  // Forfaits
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 8 },
  forfaitCard: {
    backgroundColor: '#FFF',
    width: '48%',
    padding: 14,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  forfaitHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  forfaitIconBg: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 8 },
  forfaitName: { fontSize: 13, fontWeight: '700', color: '#1F2937', flex: 1 },
  forfaitAmount: { fontSize: 24, fontWeight: '800', color: '#111827' },
  forfaitSub: { fontSize: 10, color: '#9CA3AF', marginTop: 1, marginBottom: 8 },
  progressTrack: { height: 6, backgroundColor: '#F3F4F6', borderRadius: 3 },
  progressBar: { height: 6, borderRadius: 3 },
  progressPct: { fontSize: 10, color: '#9CA3AF', marginTop: 5, textAlign: 'right' },

  // Historique
  histRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  histIconBg: { width: 38, height: 38, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  histName: { fontSize: 14, fontWeight: '600', color: '#111827' },
  histDest: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },
  histTags: { flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 8 },
  dateTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ORANGE_LIGHT,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  dateTagText: { fontSize: 10, fontWeight: '700', color: ORANGE_DARK },
  priceTag: { backgroundColor: '#DCFCE7', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  priceTagText: { fontSize: 10, fontWeight: '700', color: '#166534' },

  // Modal intervention
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
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#111827' },
  modalSub: { fontSize: 12, color: '#9CA3AF', marginTop: 3 },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fieldGroup: { marginBottom: 16 },
  fieldLabelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  charCount: { fontSize: 11, fontWeight: '600', color: '#9CA3AF' },
  inputSingle: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 15,
    color: '#111827',
  },
  inputMulti: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#111827',
    height: 120,
  },
  submitBtn: {
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
  submitBtnText: { color: '#FFF', fontSize: 16, fontWeight: '800' },
  submitArrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Popup résiliation
  popupOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  popupBox: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
  },
  popupIconWrap: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  popupTitle: { fontSize: 17, fontWeight: '800', color: '#111827', marginBottom: 10, textAlign: 'center' },
  popupBody: { fontSize: 14, color: '#6B7280', textAlign: 'center', lineHeight: 21, marginBottom: 24 },
  popupActions: { flexDirection: 'row', gap: 12, width: '100%' },
  popupBtnNo: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  popupBtnNoText: { fontSize: 15, fontWeight: '700', color: '#374151' },
  popupBtnYes: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#DC2626',
    alignItems: 'center',
  },
  popupBtnYesText: { fontSize: 15, fontWeight: '700', color: '#FFF' },

  // Toast
  toast: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    backgroundColor: '#111827',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  toastText: { color: '#FFF', fontSize: 13, fontWeight: '600', flex: 1 },

  // Résiliation
  resilierBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
    borderWidth: 1.5,
    borderColor: '#FECACA',
    borderRadius: 14,
    paddingVertical: 14,
    marginBottom: 10,
    gap: 8,
  },
  resilierText: { color: '#DC2626', fontWeight: '700', fontSize: 15 },
});
