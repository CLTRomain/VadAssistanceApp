import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { GetContractDetails } from '../../src/requests/get';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const ORANGE_VAD = '#f97316';

const getDomainIcon = (domain: string) => {
  switch (domain.toLowerCase()) {
    case 'plomberie': return 'water-pump';
    case 'electricite': return 'flash';
    case 'gaz': return 'fire';
    case 'electromenager': return 'tools';
    default: return 'shield-check';
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
      if (result && result.success) {
        setData(result.data);
      }
      setLoading(false);
    };
    loadData();
  }, [id]);

  const getStatusStyle = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'waiting':
      case 'pending':
        return { bg: '#FEF9C3', text: '#854D0E', label: 'En attente' };
      case 'processing':
        return { bg: '#DCFCE7', text: '#166534', label: 'En cours' };
      case 'closed':
        return { bg: '#FEE2E2', text: '#991B1B', label: 'Clôturé' };
      default:
        return { bg: '#F3F4F6', text: '#374151', label: status };
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={ORANGE_VAD} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 60 }}>
      {/* Bouton Retour dirigé vers le Profil */}
      <TouchableOpacity 
        onPress={() => router.push('/profile')} 
        style={styles.backButton}
      >
        <Ionicons name="arrow-back" size={20} color="#4B5563" />
        <Text style={styles.backText}>Retour</Text>
      </TouchableOpacity>

      {/* 1. Mes demandes récentes */}
      <View style={styles.whiteCard}>
        <Text style={styles.cardTitle}>Mes demandes récentes</Text>
        {data?.supportRequestContacts?.length > 0 ? (
          <View style={{ maxHeight: 220 }}>
            <ScrollView nestedScrollEnabled={true} showsVerticalScrollIndicator={true}>
              {data.supportRequestContacts.map((request: any, index: number) => {
                const status = getStatusStyle(request.status);
                return (
                  <View key={index} style={[styles.requestItem, index === 0 && { borderTopWidth: 0 }]}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.requestSubject}>{request.subject}</Text>
                      <Text style={styles.requestDesc} numberOfLines={2}>
                        {request.description || "Pas de description"}
                      </Text>
                      <Text style={styles.requestDate}>
                        Soumis le : {new Date(request.created_at).toLocaleDateString('fr-FR')}
                      </Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
                      <Text style={[styles.statusText, { color: status.text }]}>{status.label}</Text>
                    </View>
                  </View>
                );
              })}
            </ScrollView>
          </View>
        ) : (
          <Text style={styles.emptyText}>Aucune demande récente.</Text>
        )}
      </View>

      <TouchableOpacity style={styles.actionBtn}>
        <Text style={styles.actionBtnText}>Demande d'intervention</Text>
        <Ionicons name="add" size={20} color="white" />
      </TouchableOpacity>

      {/* 2. Les Forfaits */}
      <View style={styles.grid}>
        {data?.finalResults?.map((domain: any, index: number) => {
          const progress = domain.cumul > 0 ? Math.min(100, (domain.totalSinistres / domain.cumul) * 100) : 0;
          return (
            <View key={index} style={styles.forfaitCard}>
              <View style={styles.forfaitHeader}>
                <View style={styles.iconContainer}>
                  <MaterialCommunityIcons name={getDomainIcon(domain.domain)} size={22} color="#4B5563" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.domainLabel} numberOfLines={1}>
                    {domain.domain.charAt(0).toUpperCase() + domain.domain.slice(1)}
                  </Text>
                  <Text style={styles.subLabel}>Forfait</Text>
                </View>
              </View>
              <Text style={styles.amount}>{domain.totalSinistres}€</Text>
              <View style={styles.progressBg}>
                <View style={[styles.progressFill, { width: `${progress}%` }]} />
              </View>
            </View>
          );
        })}
      </View>

      {/* 3. Historique d'intervention */}
      <View style={styles.whiteCard}>
        <Text style={styles.cardTitle}>Historique d'intervention</Text>
        <View style={{ maxHeight: 280 }}>
          <ScrollView nestedScrollEnabled={true} showsVerticalScrollIndicator={true}>
            {data?.finalResults?.map((domain: any) => 
              domain.sinistresDetails?.map((s: any, i: number) => (
                <View key={`${domain.domain}-${i}`} style={styles.interventionRow}>
                  <View style={styles.iconContainerSmall}>
                     <MaterialCommunityIcons name={getDomainIcon(domain.domain)} size={18} color="#4B5563" />
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.interName}>{s.skill_name}</Text>
                    <Text style={styles.interDest} numberOfLines={1}>{s.payment_dest || "Intervention VAD"}</Text>
                    <View style={styles.interMeta}>
                        <Text style={styles.dateTag}>{s.payment_date}</Text>
                        <Text style={styles.priceTag}>{s.payment_amount}€</Text>
                    </View>
                  </View>
                </View>
              ))
            )}
          </ScrollView>
        </View>
      </View>

      {/* 4. Bouton Résiliation */}
      <TouchableOpacity style={styles.resilierBtn}>
        <Ionicons name="trash-outline" size={18} color="white" />
        <Text style={styles.resilierBtnText}>Résilier mon contrat</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB', padding: 20, marginVertical: 30 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  backButton: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, marginTop: 40 },
  backText: { marginLeft: 8, color: '#4B5563', fontWeight: '500' },
  whiteCard: { backgroundColor: 'white', borderRadius: 16, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.05, elevation: 2 },
  cardTitle: { fontSize: 17, fontWeight: '700', color: '#111827', marginBottom: 12 },
  requestItem: { paddingVertical: 12, borderTopWidth: 1, borderTopColor: '#F3F4F6', flexDirection: 'row', alignItems: 'center' },
  requestSubject: { fontWeight: '600', color: '#1F2937', fontSize: 14 },
  requestDesc: { fontSize: 12, color: '#6B7280', marginVertical: 2 },
  requestDate: { fontSize: 10, color: '#9CA3AF', marginTop: 2 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 99 },
  statusText: { fontSize: 11, fontWeight: '700' },
  actionBtn: { backgroundColor: ORANGE_VAD, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 14, borderRadius: 12, marginBottom: 20 },
  actionBtnText: { color: 'white', fontWeight: '700', marginRight: 8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  forfaitCard: { backgroundColor: 'white', width: '48%', padding: 14, borderRadius: 16, marginBottom: 16, elevation: 2 },
  forfaitHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  iconContainer: { padding: 6, backgroundColor: '#F3F4F6', borderRadius: 8, marginRight: 8 },
  domainLabel: { fontSize: 12, fontWeight: '700', color: '#374151' },
  subLabel: { fontSize: 10, color: '#9CA3AF' },
  amount: { fontSize: 22, fontWeight: '800', color: '#111827' },
  progressBg: { height: 5, backgroundColor: '#F3F4F6', borderRadius: 3, marginTop: 8 },
  progressFill: { height: 5, backgroundColor: ORANGE_VAD, borderRadius: 3 },
  interventionRow: { paddingVertical: 12, borderTopWidth: 1, borderTopColor: '#F3F4F6', flexDirection: 'row' },
  iconContainerSmall: { padding: 8, backgroundColor: '#F3F4F6', borderRadius: 8, height: 36, justifyContent: 'center' },
  interName: { fontWeight: '600', color: '#1F2937', fontSize: 14 },
  interDest: { fontSize: 12, color: '#9CA3AF' },
  interMeta: { flexDirection: 'row', marginTop: 8 },
  dateTag: { backgroundColor: '#FFEDD5', color: '#EA580C', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, fontSize: 10, fontWeight: '700', marginRight: 8 },
  priceTag: { backgroundColor: '#DCFCE7', color: '#166534', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, fontSize: 10, fontWeight: '700' },
  resilierBtn: { backgroundColor: '#DC2626', flexDirection: 'row', padding: 14, borderRadius: 30, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  resilierBtnText: { color: 'white', fontWeight: '700', marginLeft: 8 },
  emptyText: { color: '#9CA3AF', fontSize: 13, fontStyle: 'italic', textAlign: 'center', paddingVertical: 10 }
});