import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import * as Location from 'expo-location';

import OffersModal from '../src/components/OffersModal';
import { MarketType } from '../src/types/entities';

const API_BASE_URL = 'URL CloudFlared para eu fazer o tunelamento ate eu dokerizar';

type OsmMarketType = {
  id: number;
  tags: { name: string; 'addr:suburb'?: string; 'addr:city'?: string };
  lat: number;
  lon: number;
  center?: { lat: number; lon: number };
  type: 'node' | 'way';
};

const MapScreen = () => {
  const [markers, setMarkers] = useState<MarketType[]>([]);
  const [mapRegion, setMapRegion] = useState<Region | undefined>(undefined);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [selectedMarket, setSelectedMarket] = useState<MarketType | null>(null);
  const [isFetchingOffers, setIsFetchingOffers] = useState(false);

  useEffect(() => {
    const setupMapAndFetchPlaces = async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          throw new Error('Permissão de acesso à localização foi negada');
        }
        let currentLocation = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = currentLocation.coords;

        setMapRegion({ latitude, longitude, latitudeDelta: 0.04, longitudeDelta: 0.02 });

        const radius = 3000; // 3km
        const overpassQuery = `[out:json];(node["shop"="supermarket"](around:${radius},${latitude},${longitude});way["shop"="supermarket"](around:${radius},${latitude},${longitude}););out center;`;
        const overpassUrl = "https://overpass-api.de/api/interpreter";
        
        const response = await fetch(overpassUrl, { method: 'POST', body: overpassQuery });
        if (!response.ok) {
          throw new Error(`Erro ao buscar locais do OSM: ${response.status}`);
        }
        
        const data = await response.json();
        
        const formattedMarkers: MarketType[] = data.elements
          .filter((element: OsmMarketType) => element.tags?.name)
          .map((element: OsmMarketType) => ({
              id: element.id,
              name: element.tags.name,
              bairro: element.tags['addr:suburb'] || '',
              cidade: element.tags['addr:city'] || 'Sua Cidade Padrão', // Ex: Sumaré
              latitude: element.type === 'node' ? element.lat : element.center!.lat,
              longitude: element.type === 'node' ? element.lon : element.center!.lon,
          }));
        setMarkers(formattedMarkers);
      } catch (error: any) {
        setErrorMsg(error.message || 'Não foi possível carregar os dados do mapa');
      }
    };
    setupMapAndFetchPlaces();
  }, []);

  async function handleMarkerPress(market: MarketType) {
    setIsFetchingOffers(true);
    setSelectedMarket({ ...market, offersText: "A buscar ofertas com a IA..." }); 

    try {
      const query = {
        market_name: market.name,
        bairro: market.bairro || "",
        cidade: market.cidade || "Sumaré",
      };

      const response = await fetch(`${API_BASE_URL}/ai/fetch-offers-text`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(query),
      });

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status} ${await response.text()}`);
      }
      
      const offersText: string = await response.text();
      
      setSelectedMarket({ ...market, offersText: offersText });

    } catch (error) {
      const errorMessage = (error as Error).message || "Falha ao buscar ofertas.";
      console.error("Erro ao buscar ofertas com a IA:", error);
      setSelectedMarket({ ...market, offersText: `Erro: ${errorMessage}` });
    } finally {
      setIsFetchingOffers(false);
    }
  }

  if (!mapRegion && !errorMsg) {
    return (<View style={styles.loader}><ActivityIndicator size="large" /><Text style={{ marginTop: 10 }}>A obter localização...</Text></View>);
  }

  if (errorMsg) {
    return (<View style={styles.loader}><Text style={{ color: 'red' }}>{errorMsg}</Text></View>);
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={mapRegion}
        showsUserLocation={true}
      >
        {markers.map((market) => (
          <Marker
            key={market.id}
            coordinate={{ latitude: market.latitude, longitude: market.longitude }}
            title={market.name}
            onPress={() => handleMarkerPress(market)}
          />
        ))}
      </MapView>
      
      <OffersModal 
        market={selectedMarket} 
        onClose={() => setSelectedMarket(null)} 
        isLoading={isFetchingOffers}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { width: '100%', height: '100%' },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
});

export default MapScreen;

