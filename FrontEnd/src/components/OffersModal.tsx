import React from 'react';
import { View, Text, StyleSheet, Modal, Pressable, SafeAreaView, Linking, ScrollView, ActivityIndicator } from 'react-native';
import { MarketType } from '../types/entities'; 

type OffersModalProps = {
  market: MarketType | null; 
  onClose: () => void;     
  isLoading: boolean;       
};

const OffersModal = ({ market, onClose, isLoading }: OffersModalProps) => {
  if (!market) {
    return null;
  }

  const handleOpenMaps = () => {
    const url = `google.navigation:q=${market.latitude},${market.longitude}`;
    Linking.openURL(url);
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={market !== null} 
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        {}
        <SafeAreaView style={styles.modalContent}>
          {/* Cabeçalho do Modal */}
          <View style={styles.header}>
            <Text style={styles.marketName}>{market.name}</Text>
            <Pressable onPress={onClose}>
              <Text style={styles.closeButtonText}>X</Text>
            </Pressable>
          </View>
          
          {}
          <ScrollView style={styles.contentScrollView}>
            {}
            {isLoading ? (
              <ActivityIndicator size="large" color="#4CAF50" style={{ marginTop: 20 }}/>
            ) : (
              
              <Text style={styles.offersText}>
                {}
                {market.offersText || "Nenhuma oferta encontrada ou ocorreu um erro ao buscar."}
              </Text>
            )}
          </ScrollView>

          {}
          <Pressable style={styles.mapsButton} onPress={handleOpenMaps}>
            <Text style={styles.mapsButtonText}>Ver Rotas no Google Maps</Text>
          </Pressable>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    height: '60%',
    backgroundColor: 'white',
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 10,
    marginBottom: 10,
  },
  marketName: {
    fontSize: 22,
    fontWeight: 'bold',
    flex: 1, 
  },
  closeButtonText: {
    fontSize: 24,
    color: '#888',
    marginLeft: 10,
  },
  contentScrollView: {
    flex: 1,
  },
  offersText: {
    fontSize: 16,
    lineHeight: 24, 
    color: '#333',
  },
  mapsButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 50,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  mapsButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default OffersModal;

