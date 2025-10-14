import React, {useState,useEffect } from 'react';
import {View, Text, StyleSheet,ActivityIndicator} from 'react-native';
import MapView, {Marker, Region} from 'react-native-maps';
import * as Location from 'expo-location';
import OffersModal from '../src/components/OffersModal';
import { MarketType } from '../src/types/entities';


const MapScreen = () => {

  const [markets, setMarkets] = useState<MarketType[]>([]);
  const [mapRegion, setMapRegion] = useState<Region | undefined>(undefined);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [selectedMarket, setSelectedMarket] = useState<MarketType | null>(null);

useEffect(() => {
  const setupMap = async () => {
    try {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setErrorMsg('Permissão de localização negada');
      return;
    }
      let currentLocation = await Location.getCurrentPositionAsync({});
        setMapRegion({
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });
      
      const apiUrl = 'https://riders-managing-ski-zoloft.trycloudflare.com/markets/';


       const response = await fetch(apiUrl);

      if (!response.ok) {
          throw new Error(`Erro ao buscar mercados: ${response.status}`);
        }

       const data: MarketType[] = await response.json();
        setMarkets(data);


    } catch (error) {
      console.error("!!! ERRO NO BLOCO TRY:", error); 
      setErrorMsg('Não foi possivel obter a localização');
    } finally {
    }
  };

  setupMap();
}, []);

if (!mapRegion) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 10 }}>A obter localização...</Text>
      </View>
    );
  }

if (errorMsg) {
    return (
        <View style={styles.loader}>
            <Text>{errorMsg}</Text>
        </View>
    );
}

    return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={mapRegion}
        showsUserLocation={true}
      >
        {markets.map((market) => (
          <Marker
            key={market.id}
            coordinate={{
              latitude: market.latitude,
              longitude: market.longitude,
            }}
            title={market.name}
            // NOVO: Ao pressionar, definimos o mercado selecionado
            onPress={() => setSelectedMarket(market)}
          />
        ))}
      </MapView>
      
      {/* NOVO: Renderizamos o nosso modal aqui */}
      <OffersModal 
        market={selectedMarket} 
        onClose={() => setSelectedMarket(null)} 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
});

export default MapScreen;
