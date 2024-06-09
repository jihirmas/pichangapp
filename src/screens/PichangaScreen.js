import { StatusBar } from 'expo-status-bar';
import Background from '../components/Background'
import Logo from '../components/Logo'
import Header from '../components/Header'
import Button from '../components/Button'
import Paragraph from '../components/Paragraph'
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState,useEffect } from 'react'
import {Icon, List, Text, ActivityIndicator, MD2Colors} from 'react-native-paper';
import TextInput from '../components/TextInput'
import axios, {isCancel, AxiosError} from 'axios';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { ScrollView, StyleSheet, View, SafeAreaView, Modal, Image, TouchableOpacity, Platform, RefreshControl  } from 'react-native';
import { theme } from '../core/theme';
import { useRoute } from '@react-navigation/native';
import NetInfo from "@react-native-community/netinfo";
import MapView, {PROVIDER_GOOGLE, Marker} from 'react-native-maps';


export default function PichangasScreen({ navigation }) {
    const [pichanga,setPichanga] = useState([])
    const [homeTeam, setHomeTeam] = useState("")
    const [visitorTeam, setVisitorTeam] = useState("")
    const [location, setLocation] = useState("")
    const [gameDate, setGameDate] = useState("")
    const [results, setResults] = useState("")
    const [instrucciones, setInstrucciones] = useState("")
    const [loading, setLoading] = useState(true);
    const [loading2, setLoading2] = useState(false);
    const [isOnline, setIsOnline] = useState(false);
    const [error, setError] = useState(false);
    const [mostrarMapa, setMostrarMapa] = useState(false);
    const [longitud, setLongitud] = useState(0);
    const [latitud, setLatitud] = useState(0);
    const [mostrarImagen, setMostrarImagen] = useState(false);
    const [imageUbi, setImageUbi] = useState(null);
    const [locationId, setLocationId] = useState(null);
    const [baseUrl, setBaseUrl] = useState("https://pichang-app-e6269910e1a5.herokuapp.com");
    const [imagenCargada, setImagenCargada] = useState(false);
    

    


    useEffect( () => {
      const fetchData = async () => {
        const netInfoState = await NetInfo.fetch();
        setIsOnline(netInfoState.isConnected);
        if (!netInfoState.isConnected) {
          return;
        }
        let response = await fetchDataCall ();
        try{ setPichanga(response.data.pichanga)} catch (error) { setPichanga("N/A")}
        try{ setHomeTeam(response.data.pichanga.home_team.name)} catch (error) { setHomeTeam("N/A")}
        try{ setVisitorTeam(response.data.pichanga.visitor_team.name)} catch (error) { setVisitorTeam("N/A")}
        try{ setLocation(response.data.pichanga.location.place_name)} catch (error) { setLocation("N/A")}
        try{ setLongitud(response.data.pichanga.location.longitude)} catch (error) { setLongitud("N/A")}
        try{ setLatitud(response.data.pichanga.location.latitude)} catch (error) { setLatitud("N/A")}
        let locationsTodas = await fetchLocationCall(response.data.pichanga.location.id);
        try{ setImageUbi(locationsTodas.data.location.image_url)} catch (error) { setImageUbi("N/A")}
        try{ setGameDate(response.data.pichanga.game_date)} catch (error) { setGameDate("N/A")}
        try{ setResults(response.data.pichanga.results)} catch (error) { setResults("N/A")}
        try{ setInstrucciones(response.data.pichanga.instructions)} catch (error) { setInstrucciones("N/A")}
        try{ setPichanga(response.data.pichanga)} catch (error) { setPichanga("N/A")}

      };
      
        fetchData()
        
    }, []);
    const formattedDate = new Date(gameDate).toLocaleDateString();
    const formattedTime = new Date(gameDate).toLocaleTimeString();

    const route = useRoute();
    const fetchDataCall = async () =>{
      let token;
      try {
          token = await AsyncStorage.getItem('token');
      } catch (e) {
          console.log('Error al obtener el token');
      }
      console.log("AAAAA")
      console.log(token)
      console.log("AAAAA")
      let pichangaId = route.params.itemId;
      let apiReturn = await axios
      .get(`https://pichang-app-e6269910e1a5.herokuapp.com/api/v1/pichangas/${pichangaId}`,{headers: { Authorization: `Bearer ${token}` }})
      .then(async function (response){setLoading(false); return response;})
      .catch(async function (error) { setError(true); console.log(error); });
        
      return apiReturn; 
  };
  const fetchLocationCall = async (id) =>{
    let token;
    try {
        token = await AsyncStorage.getItem('token');
    } catch (e) {
        console.log('Error al obtener el token');
    }

    let apiReturn = await axios
    .get(`https://pichang-app-e6269910e1a5.herokuapp.com/api/v1/locations/${id}`,{headers: { Authorization: `Bearer ${token}` }})
    .then(async function (response){setLoading(false); return response;})
    .catch(function (error) {setError(true); console.log(error);});
    return apiReturn; 
  };

    const deleteDataCall = async () =>{
      let token;
      try {
          token = await AsyncStorage.getItem('token');
      } catch (e) {
          console.log('Error al obtener el token');
      }
      console.log("AAAAA")
      console.log(token)
      console.log("AAAAA")
      
      // console.log(route.params.i
      let pichangaId = route.params.itemId;
      let apiReturn = await axios
      .delete(`https://pichang-app-e6269910e1a5.herokuapp.com/api/v1/pichangas/${pichangaId}`,{headers: { Authorization: `Bearer ${token}` }})
      .then(async function (response) { setLoading2(false); return response;})
      .catch(function (error) {setError(true); console.log(error);});
      
      return apiReturn; 
    };

    const handleEdit = () => {
      navigation.navigate('PichangaCRUD', {itemId: route.params.itemId});
    };

    const imagenLista = () => {
      setImagenCargada(true);
    }


    const handleDelete = async () => {
      setLoading2(true);
      try {
        // Realizar la lógica de borrado aquí
        const netInfoState = await NetInfo.fetch();
        setIsOnline(netInfoState.isConnected);
        if (!netInfoState.isConnected) {
          return;
        }
        await deleteDataCall();
        // Después de borrar, puedes navegar a otra pantalla o realizar otras acciones
        // Por ejemplo, regresar a la pantalla anterior:
        navigation.reset({
          index: 0,
          routes: [{ name: 'Pichangas' }],
        });
        navigation.navigate('Pichangas')
        console.log("Borrado")
      } catch (error) {
        console.error('Error al eliminar la pichanga', error);
        // Manejar el error, mostrar un mensaje al usuario, etc.
      }
    };

    const handleMap = () => {
      setMostrarMapa(!mostrarMapa);
    };
  
    return(
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <Background>
          {loading ? (
            <View style={styles.loadingContainer}>
              {isOnline ? (
                <Text style={{ fontSize: 20, color: 'black' }}>
                   {error ? 'Error al cargar datos' : 'Cargando'}
                </Text>
              ) : (
                <Text style={{ fontSize: 20, color: 'black' }}>No hay conexión a internet</Text>
              )}
              <ActivityIndicator animating={true} color={theme.colors.primary} size={100} />
            </View>
          ) : (
            <>
        <Ionicons name="football" size={50} color="black" style={{ alignSelf: 'center' }} />
        <Header>Pichanga {pichanga.id}</Header>
        <Header>{`${homeTeam} VS ${visitorTeam}`}</Header>
        <List.Item
            title={`${homeTeam}`}
            description="Equipo Local"
            left={props => <List.Icon {...props} icon="account-group" />}
        />
        <List.Item
            title={`${visitorTeam}`}
            description="Equipo Visitante"
            left={props => <List.Icon {...props} icon="account-group-outline" />}
        />
        <List.Item
            title={`${location}`}
            description="Ubicacion"
            left={props => <List.Icon {...props} icon="map-marker" />}
        />
       <Button
          mode="contained"
          onPress={() => setMostrarMapa(true)}
        >
          Ver en mapa
        </Button>

        <Modal
          animationType="slide"
          transparent={true}
          visible={mostrarMapa}
          onRequestClose={() => {
            setMostrarMapa(!mostrarMapa);
          }}>
          
          <View style={styles.centeredView}>
          <View style={styles.modalView}>
          <Text style={{fontSize: 20, alignSelf: 'center', marginTop: -90, marginBottom:20}}>{`${location}`}</Text>
            <MapView
              style={{height: '70%', width: '100%'}} 
              initialRegion={{
                latitude: parseFloat(latitud),
                longitude: parseFloat(longitud),
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
              }}
              provider={PROVIDER_GOOGLE}
            >
              <Marker
                key={0}
                coordinate={{
                  latitude: parseFloat(latitud),
                  longitude: parseFloat(longitud),
                }}
                title={`${location}`}
              />
            </MapView>
              <Button
                mode="contained"
                onPress={() => setMostrarMapa(false)}
              >
                Cerrar
              </Button>
              <Text style={{fontSize: 20, alignSelf: 'center', marginBottom: -100}}></Text>
            </View>
        </View>
        </Modal>
        <Button
          mode="outlined"
          onPress={() => setMostrarImagen(true)}
        >
          Ver imagen ubicación
        </Button>

        <Modal
          animationType="slide"
          transparent={true}
          visible={mostrarImagen}
          onRequestClose={() => {
            setMostrarImagen(!mostrarImagen);
          }}>
          
          <View style={styles.centeredView}>
          <View style={styles.modalView}>
            {imageUbi==null? (
            <Image
                style={{ width: 300 , height: 300 }}
                source={{ uri: baseUrl+imageUbi }}
                onLoad={() => imagenLista()}
            />
            ) : (
              <Text></Text>
            )}
            {!imagenCargada ? (
                <View>
                <Text style={{ fontSize: 20, alignSelf: 'center' }}>Cargando imagen...</Text>
                <ActivityIndicator animating={true} color={theme.colors.primary} size={100} />
                </View>
            ) : (
                <Text></Text>
            )}
              <Button
                mode="contained"
                onPress={() => setMostrarImagen(false)}
              >
                Cerrar
              </Button>
            </View>
        </View>
        </Modal>

        <List.Item
            title={`${formattedDate}`}
            description="Fecha de juego"
            left={props => <List.Icon {...props} icon="calendar-month-outline" />}
        />
        <List.Item
            title={`${formattedTime}`}
            description="Hora de juego"
            left={props => <List.Icon {...props} icon="clock-check-outline" />}
        />
        <List.Item
            title="Instrucciones"
            left={props => <List.Icon {...props} icon="format-list-numbered-rtl" />}
        />
        <Text
          style= {{paddingLeft: 55, paddingRight: 20, fontSize: 16, color: 'black', textAlign: 'justify', alignSelf: 'stretch'}}
        >
            {`${instrucciones}`}
        </Text>
        <List.Item
            title={`${results}`}
            description="Resultado"
            left={props => <List.Icon {...props} icon="counter" />}
        />
        <Button
            mode="contained"
            onPress = {handleEdit}
        >
            Edit
        </Button>
        <Button
            mode="outlined"
            onPress = {handleDelete}
        >
            Delete
        </Button>
        {loading2 &&
          <View style={styles.loading}>
            {isOnline ? (
              <Text style={{ fontSize: 20, color: 'black' }}>
                {error ? 'Error al eliminar la pichanga' : 'Eliminando'}
              </Text>
            ) : (
              <Text style={{ fontSize: 20, color: 'black' }}>No hay conexión a internet</Text>
            )}
            <ActivityIndicator size='large' />
          </View>
        }
        <View style={{height: 50}} />
        
      </>
      )}
    </Background>
  </ScrollView>
);
};
const styles = {
    // ... (otros estilos)
  
    // Contenedor de botones
    buttonContainer: {
      flexDirection: 'row', // Alinea los botones horizontalmente
      justifyContent: 'space-around', // Distribuye el espacio entre los botones
      marginTop: 20, // Ajusta el margen superior según sea necesario
    },
    centeredView: {
      flex: 1,
      justifyContent: 'center',
      marginTop: 22,
    },
    modalView: {
      margin: 20,
      backgroundColor: 'white',
      borderRadius: 20,
      padding: 10,
      paddingLeft: 35,
      paddingRight: 35,
      shadowColor: '#000',
      justifyContent: 'center',
      alignItems: 'center',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 4,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loading: {
      position: 'absolute',
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
      alignItems: 'center',
      paddingTop: 'calc((100vh - 50%) / 2)',
      zIndex: 1,
      backgroundColor: 'rgba(200, 200, 200, 0.8)',
    },
    centeredView: {
      flex: 1,
      justifyContent: 'center',
      marginTop: 22,
    },
    modalView: {
      margin: 20,
      backgroundColor: 'white',
      borderRadius: 20,
      padding: 10,
      paddingLeft: 15,
      paddingRight: 15,
      shadowColor: '#000',
      justifyContent: 'center',
      alignItems: 'center',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 4,
    },
    camera: {
      flex: 1,
    },
    inlineButton: {
      // poner boton abajo
      flex: 1,
      flexDirection: 'row',
      margin: 20,
      justifyContent: 'space-between',
      alignItems: 'flex-end',
    },
    container: {
      width: '100%',
      marginVertical: 12,
    },
    input: {
      backgroundColor: theme.colors.surface,
    },
  };

