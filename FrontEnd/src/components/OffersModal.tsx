import React from 'react';
import { View, Text, StyleSheet, Modal, Pressable, FlatList, SafeAreaView, Linking } from 'react-native';

import { MarketType, OfferType } from '../types/entities'; 

type OffersModalProps = {
  market: MarketType | null; 
  onClose: () => void;     
};

const OfferItem = ({ item }: { item: OfferType }) => (
  <View style={styles.offerItem}>
    <Text style={styles.offerProduct}>{item.product_name}</Text>
    <Text style={styles.offerPrice}>R$ {item.price}</Text>
  </View>
);

const OffersModal = ({ market, onClose }: OffersModalProps) => {
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
        <SafeAreaView style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.marketName}>{market.name}</Text>
            <Pressable onPress={onClose}>
              <Text style={styles.closeButtonText}>X</Text>
            </Pressable>
          </View>
          
          <FlatList
            data={market.offers}
            renderItem={({ item }) => <OfferItem item={item} />}
            keyExtractor={(item) => item.id.toString()}
            ListEmptyComponent={<Text style={styles.noOffersText}>Nenhuma oferta encontrada para este mercado.</Text>}
          />

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
    padding: 20,
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
  },
  closeButtonText: {
    fontSize: 24,
    color: '#888',
  },
  offerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f2f2f2',
  },
  offerProduct: {
    fontSize: 16,
  },
  offerPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  noOffersText: {
    textAlign: 'center',
    marginTop: 20,
    color: 'gray',
  },
  mapsButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 50,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  mapsButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default OffersModal;