import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import * as Location from 'expo-location';

import OffersModal from '../src/components/OffersModal';
import { MarketType, OfferType } from '../src/types/entities';

type OsmMarketType = {
  id: number;
  tags: { name: string };
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

  useEffect(() => {
    const setupMapAndFetchPlaces = async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          throw new Error('Permissão de acesso à localização foi negada');
        }
        let currentLocation = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = currentLocation.coords;

        setMapRegion({
          latitude,
          longitude,
          latitudeDelta: 0.04,
          longitudeDelta: 0.02,
        });

        const radius = 5000; 
        const overpassQuery = `
          [out:json][timeout:25];
          (
            node["shop"="supermarket"](around:${radius},${latitude},${longitude});
            way["shop"="supermarket"](around:${radius},${latitude},${longitude});
          );
          out center;
        `;
        const overpassUrl = "https://overpass-api.de/api/interpreter";
        
        const response = await fetch(overpassUrl, { method: 'POST', body: overpassQuery });
        if (!response.ok) {
          throw new Error(`Erro ao buscar locais do OSM: ${response.status}`);
        }
        
        const data = await response.json();
        
        const formattedMarkers: MarketType[] = data.elements
          .filter((element: OsmMarketType) => element.tags?.name)
          .map((element: OsmMarketType) => {
            const lat = element.type === 'node' ? element.lat : element.center!.lat;
            const lon = element.type === 'node' ? element.lon : element.center!.lon;
            return {
              id: element.id,
              name: element.tags.name,
              latitude: lat,
              longitude: lon,
              offers: [], 
            };
          });

        setMarkers(formattedMarkers);

      } catch (error: any) {
        console.error("ERRO DETALHADO NO SETUP:", error);
        setErrorMsg(error.message || 'Não foi possível carregar os dados do mapa');
      }
    };

    setupMapAndFetchPlaces();
  }, []);

  async function handleMarkerPress(market: MarketType) {
    setSelectedMarket({ ...market, offers: [] }); 
    try {
      const apiUrl = `https://behavioral-imaging-excellence-startup.trycloudflare.com/offers/${market.id}`;
      
      const response = await fetch(apiUrl);
      if (response.status === 404) {
        console.log(`Nenhuma oferta encontrada na nossa base de dados para: ${market.name}`);
        return; 
      }
      if (!response.ok) {
        throw new Error(`Erro ao buscar ofertas da nossa API: ${response.status}`);
      }
      
      const offersData: OfferType[] = await response.json();
      
      setSelectedMarket({ ...market, offers: offersData });

    } catch (error) {
      console.error("Erro ao buscar ofertas da nossa API:", error);
    }
  }

  if (!mapRegion) {
    return (<View style={styles.loader}><ActivityIndicator size="large" /><Text style={{ marginTop: 10 }}>A obter localização...</Text></View>);
  }

  if (errorMsg) {
    return (<View style={styles.loader}><Text>{errorMsg}</Text></View>);
  }

  return (
    <View style={styles.container}>
      <MapView style={styles.map} initialRegion={mapRegion} showsUserLocation={true}>
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

