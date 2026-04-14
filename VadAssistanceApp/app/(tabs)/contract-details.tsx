import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GetContractDetails } from '../../src/requests/get';
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
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const result = await GetContractDetails(id || '96212');
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
          <Text style={styles.headerTitle}>Mon Contrat</Text>
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
        <TouchableOpacity style={styles.ctaButton} activeOpacity={0.85}>
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
            <ScrollView nestedScrollEnabled style={{ maxHeight: 260 }} showsVerticalScrollIndicator={false}>
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
                <Text style={styles.forfaitAmount}>{domain.totalSinistres}€</Text>
                <Text style={styles.forfaitSub}>sur {domain.cumul}€ de forfait</Text>
                <View style={styles.progressTrack}>
                  <View style={[styles.progressBar, { width: `${progress}%` as any, backgroundColor: cfg.color }]} />
                </View>
                <Text style={styles.progressPct}>{Math.round(progress)}% utilisé</Text>
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
        <TouchableOpacity style={styles.resilierBtn} activeOpacity={0.8}>
          <Ionicons name="close-circle-outline" size={20} color="#DC2626" />
          <Text style={styles.resilierText}>Résilier mon contrat</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
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
