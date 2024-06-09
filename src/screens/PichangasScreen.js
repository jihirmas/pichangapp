import { StatusBar } from 'expo-status-bar';
import Background from '../components/Background';
import Logo from '../components/Logo';
import Header from '../components/Header';
import Button from '../components/Button';
import Paragraph from '../components/Paragraph';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Animated, FlatList, RefreshControl, ScrollView } from 'react-native';
import { ActivityIndicator, MD2Colors} from 'react-native-paper';
import axios from 'axios';
import { theme } from '../core/theme';
import { useFocusEffect } from '@react-navigation/native';
import NetInfo from "@react-native-community/netinfo";

const fetchDataCall = async () => {
  let token;
  try {
    token = await AsyncStorage.getItem('token');
  } catch (e) {
    console.log('Error al obtener el token');
  }

  try {
    const response = await axios.get("https://pichang-app-e6269910e1a5.herokuapp.com/api/v1/pichangas", {
      headers: { Authorization: `Bearer ${token}` }
    });

    return response.data.pichangas;
  } catch (error) {
    console.log(error);
    return [];
  }
};


export default function PichangasScreen({ navigation }) {
  const [pichanga, setPichanga] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
  useEffect(() => {
    const fetchData = async () => {

      const netInfoState = await NetInfo.fetch();
      setIsOnline(netInfoState.isConnected);
      if (!netInfoState.isConnected) { setLoading(false); return; };


      const pichangaData = await fetchDataCall();
      pichangaData.sort((a, b) => {return new Date(a.game_date) - new Date(b.game_date);});
      setPichanga(pichangaData);
      setLoading(false);
    };

    fetchData();
  }, []);

  const handleRefresh = async () => {

    const netInfoState = await NetInfo.fetch();
    setIsOnline(netInfoState.isConnected);
    if (!netInfoState.isConnected) { setLoading(false); return; };

    setRefreshing(true);
    const pichangaData = await fetchDataCall();
    pichangaData.sort((a, b) => {return new Date(a.game_date) - new Date(b.game_date);});
    setPichanga(pichangaData);
    setRefreshing(false);
  };

  const renderItem = ({ item }) => {
    const gameDate = new Date(item.game_date);

    const formatDate = (date) => {
      const day = date.getDate();
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    };

    const formatTime = (date) => {
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes}`;
    };

    const goPichanga = (itemId) => {
      navigation.navigate('Pichanga', { itemId });
    };

    

    return (
      <View style={styles.listItem}>
        <View style={styles.idContainer}>
          <Text style={styles.itemId}>Pichanga Numero: {item.id}</Text>
        </View>
        {gameDate && !isNaN(gameDate) ? (
          <Text style={styles.itemDate}>
            Fecha: {formatDate(gameDate)} - Hora: {formatTime(gameDate)}
          </Text>
        ) : (
          <Text style={styles.itemName}>Fecha inválida</Text>
        )}

        {item.location.place_name !== null ? (
          <Text style={styles.itemLocation}>Lugar: {item.location.place_name}</Text>
        ) : (
          <Text style={styles.itemLocation}>Lugar no definido</Text>
        )}

        {item.instructions ? (
          <Text style={styles.instructions}>Instrucciones: {item.instructions}</Text>
        ) : (
          <Text style={styles.instructions}>Instrucciones no disponibles</Text>
        )}
        <Button
          mode="outlined"
          onPress={() => goPichanga(item.id)}
        >
          Ver Pichanga
        </Button>
      </View>
    );
  };



  useFocusEffect(
    React.useCallback(() => {
      const fetchData = async () => {
        const netInfoState = await NetInfo.fetch();
        setIsOnline(netInfoState.isConnected);
        if (!netInfoState.isConnected) { setLoading(false); return; };

        const pichangaData = await fetchDataCall();
        pichangaData.sort((a, b) => {return new Date(a.game_date) - new Date(b.game_date);});
        setPichanga(pichangaData);
        setLoading(false);
      };
      
      fetchData();
    }, [])
  );
  return (
    
      <View>
        {!isOnline && (
          <View style={styles.noInternetContainer}>
            <Text style={styles.noInternetText}>
              Problemas de conexion, recargue la pagina
            </Text>
            <ActivityIndicator size="large" />
          </View>
        )}
        {loading ? (
          <View>
            {!isOnline && (
              <View>
                <Text style={styles.noInternetText}>
                  Verifique su conexión a Internet
                </Text>
              </View>
            )}
            <ActivityIndicator size="large" />
          </View>
        ) : (
          <FlatList
            data={pichanga}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
            onEndReached={handleRefresh}
            onEndReachedThreshold={0.1}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
              />
            }
          />
        )}
      </View>
    
  );

}
const styles = StyleSheet.create({
  listItem: {
    backgroundColor: 'white',
    margin: 10,
    padding: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 8,
  },
  idContainer: {
    backgroundColor: '#560CCE',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  itemId: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemDate: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20, // Aumenta el margen inferior
    color: '#333',
    textAlign: 'center',
  },
  itemLocation: {
    fontSize: 16,
    color: '#333',
    marginBottom: 20, // Aumenta el margen inferior
  },
  instructions: {
    fontSize: 16,
    color: '#333',
    marginBottom: 20, // Aumenta el margen inferior
  },
  noInternetContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: '10px',
    marginBottom: '10px',
    padding: '10px'
  },
  noInternetText: {
    fontSize: 18,
    color: '#333',
    textAlign: 'center', // Esta propiedad centra el texto
    marginTop: '10px',
  },
});