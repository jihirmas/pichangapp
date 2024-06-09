import { StatusBar } from 'expo-status-bar';
import Background from '../components/Background'
import Logo from '../components/Logo'
import Header from '../components/Header'
import Paragraph from '../components/Paragraph'
import ButtonCrud from '../components/ButtonCrud'
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState,useEffect, useRef } from 'react'
import {Icon, List, Text, ActivityIndicator} from 'react-native-paper';
import TextInput from '../components/TextInput'
import axios, {isCancel, AxiosError} from 'axios';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { ScrollView, StyleSheet, View, SafeAreaView, Modal, Button, Image, TouchableOpacity, Platform, RefreshControl  } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { theme } from '../core/theme';
import { SelectList } from 'react-native-dropdown-select-list'
import DateTimePicker from '@react-native-community/datetimepicker';
import NetInfo from "@react-native-community/netinfo";
import { Camera, CameraType } from 'expo-camera';
import CameraButton from '../components/CameraButton';
import * as ImagePicker from 'expo-image-picker';


export default function PichangasScreen({ navigation }) {
    const [pichanga,setPichanga] = useState([])
    const [homeTeam, setHomeTeam] = useState("")
    const [visitorTeam, setVisitorTeam] = useState("")
    const [location, setLocation] = useState("")
    const [gameDate, setGameDate] = useState("")
    const [results, setResults] = useState("")
    const [instrucciones, setInstrucciones] = useState("")
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState([]);
    const [locations, setLocations] = useState([]);
    const [date, setDate] = useState(new Date());
    const [mode, setMode] = useState('date');
    const [showDate, setShowDate] = useState(false);
    const [showTime, setShowTime] = useState(false);
    const [showHomeTeamError, setShowHomeTeamError] = useState(false)
    const [showVisitorTeamError, setShowVisitorTeamError] = useState(false)
    const [showLocationError, setShowLocationError] = useState(false)
    const [showResultsError, setShowResultsError] = useState(false)
    const [showInstruccionesError, setShowInstruccionesError] = useState(false)
    const [loadingChanges, setLoadingChanges] = useState(false)
    const [isOnline, setIsOnline] = useState(false);
    const [error, setError] = useState(false);
    const [mostrarImagen, setMostrarImagen] = useState(false);
    const [subiendoImagen, setSubiendoImagen] = useState(false);
    const [errorImagen, setErrorImagen] = useState(false);
    const [imagenCargada, setImagenCargada] = useState(false);
    const [tipoCamara, setTipoCamara] = useState(CameraType.back);
    const [permission, requestPermission] = Camera.useCameraPermissions();
    const [flash, setFlash] = useState(Camera.Constants.FlashMode.off);
    const [imagenTomada, setImagenTomada] = useState(false);
    const cameraRef = useRef(null);
    const [origenCamara, setOrigenCamara] = useState(false);
    const [imagen, setImagen] = useState(null);
    const [tamanoCamara, setTamanoCamara] = useState('auto');
    const [refreshing, setRefreshing] = useState(false);
    const [errorCamara, setErrorCamara] = useState(false);
    const [idDeEdicion, setIdDeEdicion] = useState(null);
    const [baseUrl, setBaseUrl] = useState("https://pichang-app-e6269910e1a5.herokuapp.com");
    const [mostrarOpciones, setMostrarOpciones] = useState(false);
    const [imagenElegida, setImagenElegida] = useState(false);
    const [imagenSubida, setImagenSubida] = useState(false);
    const [imagenSubidaEnProceso, setImagenSubidaEnProceso] = useState(false);
    const [imagenArchivos, setImagenArchivos] = useState(false);
    const [origenGaleria, setOrigenGaleria] = useState(false);
    const [imagenCambiada, setImagenCambiada] = useState(false);
    const [nuevaImagen, setNuevaImagen] = useState(null);





    // const [pichangaId, setPichangaId] = useState("")
    const [creando, setCreando] = useState(true);
    const route = useRoute();

    const onChange = (event, selectedDate) => {
      const currentDate = selectedDate;
      setShowDate(false);
      setShowTime(false);
      setDate(currentDate);
    };
  
    const showDatePicker = () => {
        setShowDate(true);

    };
  
    const showTimePicker = () => {
        setShowTime(true);
    };

    const cerrarDatePicker = () => {
        setShowDate(false);
    }

    const cerrarTimePicker = () => {
        setShowTime(false);
    }

    
    
    
    
    useEffect( () => {
        const fetchData = async () => {
            const netInfoState = await NetInfo.fetch();
            setIsOnline(netInfoState.isConnected);
            if (!netInfoState.isConnected) {
            return;
            }
            let response = await fetchDataCall ();
            try{ setPichanga(response.data.pichanga)} catch (error) { setPichanga("N/A")}
            try{ setHomeTeam(response.data.pichanga.home_team.id)} catch (error) { console.log(error);setHomeTeam("")}
            try{ setVisitorTeam(response.data.pichanga.visitor_team.id)} catch (error) { setVisitorTeam("")}
            try{ setLocation(response.data.pichanga.location.id)} catch (error) { setLocation("")}
            try{ setDate(new Date(response.data.pichanga.game_date))} catch (error) { setDate(new Date())}
            try{ setResults(response.data.pichanga.results)} catch (error) { setResults("N/A")}
            try{ setInstrucciones(response.data.pichanga.instructions)} catch (error) { setInstrucciones("N/A")}
            try{ setPichanga(response.data.pichanga)} catch (error) { setPichanga("N/A")}
            setCreando(false);
        };

        

        const fetchUsers = async () => {
            const netInfoState = await NetInfo.fetch();
            setIsOnline(netInfoState.isConnected);
            if (!netInfoState.isConnected) {
            return;
            }
            let response = await fetchUsersCall();
            try{ setUsers(response.data.users)} catch (error) { setUsers([])}
        };
        

        const fetchLocation = async () => {
            const netInfoState = await NetInfo.fetch();
            setIsOnline(netInfoState.isConnected);
            if (!netInfoState.isConnected) {
            return;
            }
            let response = await fetchLocationCall();
            try{ setLocations(response.data.locations)} catch (error) { setLocations([])}
        };
        console.log("PARAMS", route.params?.itemId)
        if (route.params?.itemId) {
            fetchData()
        }
        fetchUsers()
        fetchLocation()
        
    }, []);


    
    const fetchDataCall = async () =>{
        let token;
        try {
            token = await AsyncStorage.getItem('token');
        } catch (e) {
            console.log('Error al obtener el token');
        }
        let pichangaId = route.params.itemId;

        let apiReturn = await axios
        .get(`https://pichang-app-e6269910e1a5.herokuapp.com/api/v1/pichangas/${pichangaId}`,{headers: { Authorization: `Bearer ${token}` }})
        .then(async function (response){console.log(response);return response;})
        .catch(function (error) {console.log(error);});
        return apiReturn; 
    };

    const fetchUsersCall = async () =>{
        let token;
        try {
            token = await AsyncStorage.getItem('token');
        } catch (e) {
            console.log('Error al obtener el token');
        }

        let apiReturn = await axios
        .get(`https://pichang-app-e6269910e1a5.herokuapp.com/api/v1/users`,{headers: { Authorization: `Bearer ${token}` }})
        .then(async function (response){return response;})
        .catch(function (error) {console.log(error);});
        return apiReturn; 
    };

    const data = users
        .filter(user => user.name !== null) // Filtra usuarios con "name" no nulo
        .map(user => ({ key: user.id.toString(), value: user.name }));

    const fetchLocationCall = async () =>{
        let token;
        try {
            token = await AsyncStorage.getItem('token');
        } catch (e) {
            console.log('Error al obtener el token');
        }

        let apiReturn = await axios
        .get(`https://pichang-app-e6269910e1a5.herokuapp.com/api/v1/locations`,{headers: { Authorization: `Bearer ${token}` }})
        .then(async function (response){setLoading(false); return response;})
        .catch(function (error) {setError(true); console.log(error);});
        return apiReturn; 
    };
    const locationsData = locations
        .filter(loc => loc.place_name !== null) // Filtra usuarios con "name" no nulo
        .map(loc => ({ key: loc.id.toString(), value: loc.place_name }));

    const postEditDataCall = async () =>{
        const netInfoState = await NetInfo.fetch();
        setIsOnline(netInfoState.isConnected);
        let token;
        try {
            token = await AsyncStorage.getItem('token');
        } catch (e) {
            console.log('Error al obtener el token');
        }
        let pichangaId = route.params.itemId;
        let apiReturn = await axios
        .put(`https://pichang-app-e6269910e1a5.herokuapp.com/api/v1/pichangas/${pichangaId}`,
            {
                home_team_id: homeTeam,
                visitor_team_id: visitorTeam,
                location_id: location,
                game_date: date,
                results: results,
                instructions: instrucciones
            },
            {headers: { Authorization: `Bearer ${token}` }})
        .then(async function (response){ setLoadingChanges(false); return response;})
        .catch(function (error) { setError(true); console.log(error);});
        
        const locId = parseInt(idDeEdicion)
        const fileUri =
          Platform.OS === 'ios' ? imagen.replace('file://', '/') : imagen;
        console.log(imagen);
        console.log(fileUri);
        let uriParts = fileUri.split('.');
        let fileType = uriParts.pop()
  
        const formData = new FormData();
        formData.append('image', {
          uri: fileUri,
          name: `photo.${fileType}`,
          type: `image/${fileType}`,
        });
        
        const uploadUrl = `https://pichang-app-e6269910e1a5.herokuapp.com/api/v1/locations/${locId}`;
        const config = {
          headers: {
            
            'Authorization': 'Bearer ' + token,
          },
        };
        await axios.put(uploadUrl, formData, config)
          .then(response => {
            console.log(response.data);
          })
          .catch(error => {
            console.error('Error al enviar la foto al backend:', error);
          });
        return apiReturn;
    };

    const postCreateDataCall = async () =>{
        setLoadingChanges(true);
        let token;
        try {
            token = await AsyncStorage.getItem('token');
        } catch (e) {
            console.log('Error al obtener el token');
        }
        let apiReturn = await axios
        .post(`https://pichang-app-e6269910e1a5.herokuapp.com/api/v1/pichangas`,
            {
                home_team_id: homeTeam,
                visitor_team_id: visitorTeam,
                location_id: location,
                game_date: date,
                results: results,
                instructions: instrucciones
            },
            {headers: { Authorization: `Bearer ${token}` }})
        .then(async function (response){ setLoadingChanges(false); return response;})
        .catch(function (error) {setError(true); console.log(error);});
        const locId = parseInt(idDeEdicion)
        const elemento = locations.find((item) => item.id === locId);
        console.log("ASDASD",locId,elemento);
        const fileUri =
          Platform.OS === 'ios' ? imagen.replace('file://', '/') : imagen;
        console.log(imagen);
        console.log(fileUri);
        let uriParts = fileUri.split('.');
        let fileType = uriParts.pop()
  
        const formData = new FormData();
        formData.append('image', {
          uri: fileUri,
          name: `photo.${fileType}`,
          type: `image/${fileType}`,
        });
        formData.append('place_name', elemento.place_name);
        formData.append('latitude', elemento.latitude);
        formData.append('longitude', elemento.longitude);
        
        const uploadUrl = `https://pichang-app-e6269910e1a5.herokuapp.com/api/v1/locations/${locId}`;
        const config = {
          headers: {
            
            'Authorization': 'Bearer ' + token,
          },
        };
        await axios.put(uploadUrl, formData, config)
          .then(response => {
            console.log(response.data);
          })
          .catch(error => {
            console.error('Error al enviar la foto al backend:', error);
          });
        return apiReturn;
    };


    console.log("______________")
    console.log('homeTeam', homeTeam);
    console.log('visitorTeam', visitorTeam);
    console.log('location', location);
    console.log('gameDate', date);
    console.log('results', results);
    console.log('instrucciones', instrucciones);
    // console.log("date",)
    // console.log("users",locationsData)

    const handleResultsChange = (text) => {
        setResults(text);
      }
    const handleInstruccionesChange = (text) => {
        setInstrucciones(text);
      }

    const handleEdit = async () => {
        if (homeTeam === "") {
            setShowHomeTeamError(true);
        }
        if (visitorTeam === "") {
            setShowVisitorTeamError(true)
        }
        if (location === "") {
            setShowLocationError(true)
        }
        if (results === "") {
            setShowResultsError(true)
        }
        if (instrucciones === "") {
            setShowInstruccionesError(true)
        }
        if (homeTeam === "" || visitorTeam === "" || location === "" || results === "" || instrucciones === "") {
            return
        }
        setLoadingChanges(true);
        const netInfoState = await NetInfo.fetch();
        setIsOnline(netInfoState.isConnected);
        if (!netInfoState.isConnected) {
          return;
        }

        postEditDataCall()
        console.log("Editado")
        navigation.navigate('Pichangas')
    }

    const handleCreate = async () => {
        if (homeTeam === "") {
            setShowHomeTeamError(true)
        }
        if (visitorTeam === "") {
            setShowVisitorTeamError(true)
        }
        if (location === "") {
            setShowLocationError(true)
        }
        if (results === "") {
            setShowResultsError(true)
        }
        if (instrucciones === "") {
            setShowInstruccionesError(true)
        }
        if (homeTeam === "" || visitorTeam === "" || location === "" || results === "" || instrucciones === "") {
            return
        }
        setLoadingChanges(true);
        const netInfoState = await NetInfo.fetch();
        setIsOnline(netInfoState.isConnected);
        if (!netInfoState.isConnected) {
          return;
        }
        postCreateDataCall()
        console.log("Creado")
        navigation.reset({
            index: 0,
            routes: [{ name: 'Pichangas' }],
          });
    }

    const enviarImagen = async (foto, locId) => {
        // setImagenSubidaEnProceso(true);
        setImagen(foto.uri)
        setNuevaImagen(foto)
        setImagenCambiada(true);
        setMostrarImagen(false);
        setImagenCargada(false);
        setErrorImagen(false);
        setSubiendoImagen(false);
        setImagenTomada(false);
        setOrigenCamara(false);
        setMostrarOpciones(false);
        setImagenElegida(false);
        setImagenSubida(false);
        setImagenSubidaEnProceso(false);
        setTamanoCamara('auto');
        setImagenArchivos(null);
        setErrorCamara(false);      }
      
      const origenImagen = async (opcion) => {
        if (opcion === "camara") {
          if (permission.granted) {
            console.log("permiso concedido");
            setTamanoCamara('88%');
            setOrigenCamara(true);
            setOrigenGaleria(false);
            setMostrarOpciones(false);
          } else {
            setErrorCamara(true);
            console.log("permiso denegado");
            setOrigenCamara(true);
            setOrigenGaleria(false);
            setMostrarOpciones(false);
          }
          
        } else {
          setOrigenCamara(false);
          
          pickImage();
          setMostrarOpciones(false);
        }
      }
  
      const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.All,
          allowsEditing: true,
          aspect: [4, 3],
          quality: 1,
        });
    
        
    
        if (!result.canceled) {
          setImagenTomada({"uri": result.assets[0].uri});
          console.log({"uri": result.assets[0].uri});
          setImagenElegida(true);
          setOrigenGaleria(true);
        }
        else {
          setOrigenGaleria(false);
          setMostrarOpciones(true);
        }
      };

      const handleVerLugar = async (idString) => {
        if (imagenCambiada == false){
            const id = parseInt(idString);
            setIdDeEdicion(id);
            const elemento = locations.find((item) => item.id === id);
            console.log(elemento)
            if (elemento.image_url == null) {
            setImagen(null);
            setErrorImagen("La ubicacion no tiene imagen asociada");
            }
            else if (elemento.image_url.startsWith("/rails/active_storage")) {
            setImagen(baseUrl + elemento.image_url);
            setErrorImagen(false);
            } 
            else {
            setImagen(null);
            setErrorImagen("Imagen con error, puede subir una nueva");
            }
            setMostrarImagen(true);
        }
        else{
            setMostrarImagen(true);
        }
      }
  
      const imagenLista = () => {
        setImagenCargada(true);
      }
  
      const cerrarImagen = () => {
        setMostrarImagen(false);
        setImagenCargada(false);
        setErrorImagen(false);
        setSubiendoImagen(false);
        setImagenTomada(false);
        setOrigenCamara(false);
        setMostrarOpciones(false);
        setImagenElegida(false);
        setImagenSubida(false);
        setImagenSubidaEnProceso(false);
        setTamanoCamara('auto');
        setImagenArchivos(null);
        setErrorCamara(false);
        if (imagenSubida) { handleRefresh(); }
      }
  
      const cambiarTipoCamara = () => {
        if (tipoCamara === CameraType.back) {
          setTipoCamara(CameraType.front);
        } else {
          setTipoCamara(CameraType.back);
        }
      };
  
      const tomarFoto = async () => {
        if (cameraRef.current) {
          try{
            let foto = await cameraRef.current.takePictureAsync();
            console.log(foto);
            setImagenTomada(foto);
            setImagenElegida(true);
          } catch (error) {
            console.log(error);
          }
        };
      }
  
      const reintentarFoto = () => {
        setImagenTomada(false);
        setImagenElegida(false);
      }
  
      const subirImagen = async () => {
        setSubiendoImagen(true);
        setMostrarOpciones(true);
      }

      const handleCancel = async () => {
        navigation.reset({
            index: 1,
            routes: [{ name: 'Pichangas' }],
          });
      }
    

   
    return(
        <ScrollView contentContainerStyle={{flexGrow: 1}}>
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
        <Ionicons name="create-outline" size={50} color="black" style={{ alignSelf: 'center' }} />
        <Header>{creando ? 'Creando Pichanga' : `Editando Pichanga ${pichanga.id}`}</Header>
        <View style={{width: '100%',marginVertical: 10}}>
            <Text
                style={{marginBottom: 5}}
            >
                Equipo Local 
            </Text>
            <SelectList 
                setSelected={(key) => setHomeTeam(key)} 
                data={data} 
                save="key"
                placeholder={
                    homeTeam
                      ? data.find(item => item.key === homeTeam.toString())?.value || "Seleccione un equipo local"
                      : "Seleccione un equipo local"
                  }
                boxStyles={{ borderRadius: 4, height: 50 }}
                inputStyles={{ marginTop: 3, backgroundColor: theme.colors.surface, marginLeft: -2, fontSize: 16, color: theme.colors.secondary }}
            /> 
            <Text
                style={{marginVertical: 5, color: theme.colors.error, display: showHomeTeamError ? 'flex' : 'none'}}
            >
                Equipo Local no puede ser vacío
            </Text>
        </View>
        <View style={{width: '100%',marginVertical: 10}}>
            <Text
                style={{marginBottom: 5}}
            >
                Equipo Visitante
            </Text>
            <SelectList 
                setSelected={(key) => setVisitorTeam(key)} 
                data={data} 
                save="key"
                placeholder={
                    visitorTeam
                      ? data.find(item => item.key === visitorTeam.toString())?.value || "Seleccione un equipo local"
                      : "Seleccione un equipo local"
                  }
                boxStyles={{ borderRadius: 4, height: 50 }}
                inputStyles={{ marginTop: 3, backgroundColor: theme.colors.surface, marginLeft: -2, fontSize: 16, color: theme.colors.secondary }}
            />
            <Text
                style={{marginVertical: 5, color: theme.colors.error, display: showVisitorTeamError ? 'flex' : 'none'}}
            >
                Equipo Visitante no puede ser vacío
            </Text>
        </View>
        <View style={{width: '100%',marginVertical: 10}}>
            <Text
                style={{marginBottom: 5}}
            >
                Ubicacion
            </Text>
            { !imagenCambiada ? (
            <SelectList 
                setSelected={(key) => setLocation(key)} 
                data={locationsData} 
                save="key"
                placeholder={
                    location
                      ? locationsData.find(item => item.key === location.toString())?.value || "Seleccione ubicacion"
                      : "Seleccione ubicacion"
                  }
                boxStyles={{ borderRadius: 4, height: 50 }}
                inputStyles={{ marginTop: 3, backgroundColor: theme.colors.surface, marginLeft: -2, fontSize: 16, color: theme.colors.secondary }}
            />
            ) : (
                <Text
                style={{marginTop: 5}}
            >
             {locationsData.find(item => item.key === location.toString())?.value}   
            </Text>
            )}
            <Text
                style={{marginVertical: 5, color: theme.colors.error, display: showLocationError ? 'flex' : 'none'}}
            >
                Ubicacion no puede ser vacío
            </Text>


            {location ? (
               <Button
               title = {`Ver imagen lugar`}
               onPress={() => {
                 handleVerLugar(location);
               }}
             >
             </Button>
            ):(
                <Text
                    style={{marginBottom: 5, marginTop: 15}}
                >
                    Seleccione ubicación para ver imagen lugar
                </Text>
            )}
            </View>

            <Modal
                animationType="slide"
                transparent={true}
                visible={mostrarImagen}
                onRequestClose={() => {
                    setMostrarImagen(!mostrarImagen);
                    setImagenCargada(false);
                }}> 
                    
                    <View style={styles.centeredView}>
                    <View style={styles.modalView}> 
                    {!subiendoImagen ? (
                        <View style={{ width: '100%' }}>
                        {!errorImagen ? (
                            <View style={{ width: '100%', alignItems: 'center'}}>
                            <Image
                                style={{ width: 300 , height: 300 }}
                                source={{ uri: imagen }}
                                onLoad={() => imagenLista()}
                            />
                            {!imagenCargada ? (
                                <View>
                                <Text style={{ fontSize: 20, alignSelf: 'center', marginTop: -300, marginBottom: 50 }}>Cargando imagen...</Text>
                                <ActivityIndicator animating={true} color={theme.colors.primary} size={100} />
                                </View>
                            ) : (
                                <Text></Text>
                            )}
                            </View>
                            ) : (
                            <View>
                                <Text style={{ fontSize: 20, alignSelf: 'center', padding: 50 }}>{errorImagen}</Text>
                            </View>
                            )}
                            <ButtonCrud
                            mode="contained"
                            onPress={() => subirImagen()}
                            >
                            {errorImagen ? "Subir Imagen" : "Cambiar Imagen"}
                            </ButtonCrud>
                            <ButtonCrud
                            mode="outlined"
                            onPress={() => 
                                cerrarImagen()
                            }
                            >
                            Cerrar
                            </ButtonCrud>
                        </View>
                    ) : (
                        <View style={{ width: '100%' , justifyContent: 'flex-end'}}>
                        { imagenTomada === false ? (
                            <View style={{ width: '100%', justifyContent: 'center'}}>
                            { origenCamara ? ( 
                                <View style={{ width: '100%', justifyContent: 'center', height: tamanoCamara}}>
                                {errorCamara===false ? (
                                    <Camera style={styles.camera} 
                                    type={tipoCamara}
                                    flashMode={flash}
                                    ref={cameraRef}
                                    >
                                    <View style={styles.inlineButton}>
                                        <CameraButton
                                        icon={'retweet'}
                                        onPress={() => cambiarTipoCamara()}
                                        size={20}
                                        paddingSize={5}
                                        />
                                        <CameraButton
                                        icon={'camera'}
                                        onPress={() => tomarFoto()}
                                        paddingSize={20}
                                        size={28}
                                        />
                                        <CameraButton
                                        icon={'flash'}
                                        onPress={() => {
                                            setFlash(flash === Camera.Constants.FlashMode.off ? Camera.Constants.FlashMode.on : Camera.Constants.FlashMode.off);
                                        }}
                                        color={flash === Camera.Constants.FlashMode.off ? 'black' : 'red'}
                                        size={20}
                                        paddingSize={5}
                                        />
                                    </View>
                                    </Camera>
                                ) : (
                                    <Text style={{ fontSize: 20, alignSelf: 'center' }}>Error al acceder a la camara</Text>
                                )}
                                </View>
                            ) : (
                                <View style={{ width: '100%' }}>
                                <CameraButton
                                    title="Tomar Foto"
                                    onPress={() => origenImagen("camara")}
                                    icon="camera"
                                    color="black"
                                    size={30}
                                    paddingSize={10}
                                />
                                <CameraButton
                                    title="Elegir de la Galería"
                                    onPress={() => origenImagen("galeria")}
                                    icon="folder"
                                    color="black"
                                    size={30}
                                    paddingSize={10}
                                />
                            </View>
                            )}
                            </View>
                            ) : ( 
                            <View style={{ width: '100%', height: 'auto', justifyContent: 'center', alignContent: 'center', alignItems: 'center' }}>
                                {!imagenSubidaEnProceso ? (
                                    <View style={{ width: '100%', height: 'auto', justifyContent: 'center', alignContent: 'center', alignItems: 'center' }}>
                                    <Image
                                    style={{ width: 300 , height: 300 }}
                                    source={{ uri: imagenTomada.uri }}
                                    />
                                    <View style={{ width: '100%' }}>
                                        <CameraButton
                                        title="Reintentar"
                                        onPress={() => reintentarFoto()}
                                        icon="back"
                                        color="black"
                                        size={30}
                                        paddingSize={10}
                                        />
                                        <CameraButton
                                        title="Aceptar"
                                        onPress={() => enviarImagen(imagenTomada, idDeEdicion)}
                                        icon="upload-to-cloud"
                                        color="black"
                                        size={30}
                                        paddingSize={10}
                                        />
                                    </View>
                                    </View>
                                ) : (
                                    <View style={{ width: '100%', height: 'auto', justifyContent: 'center', alignContent: 'center', alignItems: 'center' }}>
                                    {imagenSubida === true ? (
                                        <View style={{ width: '100%', height: 'auto', justifyContent: 'center', alignContent: 'center', alignItems: 'center' }}>
                                        <Text style={{ fontSize: 20, alignSelf: 'center', marginBottom: 50, marginTop: 50 }}>Imagen subida correctamente</Text>
                                        <ButtonCrud
                                            mode="contained"
                                            onPress={() => 
                                            cerrarImagen()
                                            }
                                        >
                                            {imagenSubida? "Cerrar" : "Cancelar"}
                                        </ButtonCrud>
                                        </View>
                                    ) : (
                                        <View>
                                        <Text style={{ fontSize: 20, alignSelf: 'center' }}>Subiendo imagen...</Text>
                                        <ActivityIndicator animating={true} color={theme.colors.primary} size={100} />
                                    </View>
                                    )}
                                    </View>
                                )}
                            </View>

                            )}


                            {imagenSubidaEnProceso != true ? (
                            <ButtonCrud
                                mode="contained"
                                onPress={() => 
                                cerrarImagen()
                                }
                            >
                                Cancelar
                            </ButtonCrud>
                            ) : (
                            <Text></Text>
                            )}
                        </View>
                    )}
                    
                    </View>
                    </View>
                </Modal>
        <View style={{width: '100%',marginVertical: 10}}>
        <TextInput
            label="Instrucciones"
            value={instrucciones}
            onChangeText={handleInstruccionesChange}
            style={{marginTop: 12}}
        />
        <Text
                style={{marginTop: -10, marginBottom: 5, color: theme.colors.error, display: showInstruccionesError ? 'flex' : 'none'}}
            >
                Instrucciones no puede ser vacío
            </Text>
        <TextInput
            label="Resultados"
            value={results}
            onChangeText={handleResultsChange}
            
        />
        <Text
                style={{marginTop: -10, color: theme.colors.error, display: showResultsError ? 'flex' : 'none'}}
            >
                Resultados no puede ser vacío
            </Text>
        </View>
       <View style={{ width: '100%', marginVertical: 10 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ marginRight: 10, fontSize: 16 }}>Fecha Pichanga</Text>
                {!showDate && (
                <Button onPress={showDatePicker} title="Elegir Fecha" />
                )}
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'flex-start' }}>
                {showDate && (
                <DateTimePicker
                    testID="dateTimePicker"
                    value={date}
                    mode='date'
                    is24Hour={true}
                    onChange={onChange}
                />
                )}
                {showDate && (
                    <Button onPress={cerrarDatePicker} title="cancelar" />
                )}
            </View>
            {!showDate && (
            <Text style={{ fontSize: 16 }}>{date.getDate().toString().padStart(2, '0')}-{(date.getMonth() + 1).toString().padStart(2, '0')}-{date.getFullYear()}</Text>
            )}
        </View>
        <View style={{ width: '100%', marginVertical: 10 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ marginRight: 10, fontSize: 16 }}>Hora Pichanga</Text>
                {!showTime && (
                    <Button onPress={showTimePicker} title="Elegir Hora" />
                )}
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'flex-start' }}>
                {showTime && (
                <DateTimePicker
                    testID="dateTimePicker"
                    value={date}
                    mode='time'
                    is24Hour={true}
                    onChange={onChange}
                />
                )}
                {showTime && (
                    <Button onPress={cerrarTimePicker} title="cancelar" />
                )}
                
            </View>
            {!showTime && (
                <Text style={{ fontSize: 16 }}>{date.getHours().toString().padStart(2, '0')}:{date.getMinutes().toString().padStart(2, '0')}</Text>
            )}
        </View>
        <ButtonCrud
                mode="contained"
                onPress={creando ? handleCreate : handleEdit}
                style={{ marginTop: 24 }}
            >
                {creando ? 'Crear Pichanga' : `Confirmar Edición`}
            </ButtonCrud>
        <ButtonCrud
            mode="outlined"
            onPress={handleCancel}
            style={{ marginBottom: 45 }}
        >
            Cancel
        </ButtonCrud>
        {loadingChanges &&
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
        </>
      )}
        </Background>
        </ScrollView>
)
}

const styles = StyleSheet.create({
    container: {
      width: '100%',
      marginVertical: 12,
    },
    input: {
      backgroundColor: theme.colors.surface,
    },
    buttonContainer: {
        flexDirection: 'row', // Alinea los botones horizontalmente
        justifyContent: 'space-around', // Distribuye el espacio entre los botones
        marginTop: 20, // Ajusta el margen superior según sea necesario
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
  })

  
  