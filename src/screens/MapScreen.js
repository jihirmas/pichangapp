import Background from '../components/Background'
import Header from '../components/Header'
import React, { useState,useEffect, useRef } from 'react'
import {Icon, List, Text, ActivityIndicator} from 'react-native-paper';
import axios, {isCancel, AxiosError} from 'axios';
import Ionicons from 'react-native-vector-icons/Ionicons';
import ButtonCrud from '../components/ButtonCrud'
import { ScrollView, StyleSheet, View, SafeAreaView, Modal, Button, Image, TouchableOpacity, Platform, RefreshControl  } from 'react-native';
import { theme } from '../core/theme';
import NetInfo from "@react-native-community/netinfo";
import MapView, {PROVIDER_GOOGLE, Marker} from 'react-native-maps';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Camera, CameraType } from 'expo-camera';
import CameraButton from '../components/CameraButton';
import * as ImagePicker from 'expo-image-picker';


export default function MapScreen() {

    const [loading, setLoading] = useState(true);
    const [isOnline, setIsOnline] = useState(false);
    const [error, setError] = useState(false);
    const [location, setLocation] = useState(null);
    const [errorMsg, setErrorMsg] = useState(null);
    const [ubicacionOk, setUbicacionOk] = useState(false);
    const [pichangaData, setPichangaData] = useState([]);
    const [locations, setLocations] = useState([]);
    const [resultado, setResultado] = useState([]);
    const [mostrarMapa, setMostrarMapa] = useState(false);
    const [mostrarImagen, setMostrarImagen] = useState(false);
    const [imagen, setImagen] = useState(null);
    const [baseUrl, setBaseUrl] = useState("https://pichang-app-e6269910e1a5.herokuapp.com");
    const [errorImagen, setErrorImagen] = useState(false);
    const [imagenCargada, setImagenCargada] = useState(false);
    const [tipoCamara, setTipoCamara] = useState(CameraType.back);
    const [permission, requestPermission] = Camera.useCameraPermissions();
    const [subiendoImagen, setSubiendoImagen] = useState(false);
    const [flash, setFlash] = useState(Camera.Constants.FlashMode.off);
    const [imagenTomada, setImagenTomada] = useState(false);
    const cameraRef = useRef(null);
    const [origenCamara, setOrigenCamara] = useState(false);
    const [origenGaleria, setOrigenGaleria] = useState(false);
    const [mostrarOpciones, setMostrarOpciones] = useState(false);
    const [imagenElegida, setImagenElegida] = useState(false);
    const [idDeEdicion, setIdDeEdicion] = useState(null);
    const [imagenSubida, setImagenSubida] = useState(false);
    const [imagenSubidaEnProceso, setImagenSubidaEnProceso] = useState(false);
    const [imagenArchivos, setImagenArchivos] = useState(false);
    const [tamanoCamara, setTamanoCamara] = useState('auto');
    const [refreshing, setRefreshing] = useState(false);
    const [errorCamara, setErrorCamara] = useState(false);
    

    useEffect(() => {
      const getLoctation = async () => {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            setErrorMsg('Permission to access location was denied');
            return;
        }

        let location = await Location.getCurrentPositionAsync({});
        try{ setLocation(location)} catch (error) { setLocation("N/A")}
        setUbicacionOk(true);
      };

      const fetchData = async () => {
        const netInfoState = await NetInfo.fetch();
        setIsOnline(netInfoState.isConnected);
        if (!netInfoState.isConnected) { setLoading(false); return; };
        const responsePichanga = await fetchDataCall();
        try{ setPichangaData(responsePichanga.data.pichangas) } catch (error) { setPichangaData([])}
      };

      const fetchLocation = async () => {
        const netInfoState = await NetInfo.fetch();
        setIsOnline(netInfoState.isConnected);
        if (!netInfoState.isConnected) { setLoading(false); return; };
        const responseLocation = await fetchLocationCall();
        try{ setLocations(responseLocation.data.locations)} catch (error) { setLocations([])}
      };

        fetchData();
        fetchLocation();
        getLoctation();

    }, []);

        

    const fetchDataCall = async () => {
      let token;
      try {
        token = await AsyncStorage.getItem('token');
      } catch (e) {
        console.log('Error al obtener el token');
      }
      
      let apiReturn = await axios
      .get(`https://pichang-app-e6269910e1a5.herokuapp.com/api/v1/pichangas`,{headers: { Authorization: `Bearer ${token}` }})
      .then(async function (response){return response;})
      .catch(function (error) {console.log(error);});
      return apiReturn; 
    };

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

    const mergeData = () => {
      const resultado = pichangaData.map(partido => {
        const locationId = partido.location.id;
        const ubicacion = locations.find(loc => loc.id === locationId);
        const dataPartido = partido;
    
        if (ubicacion) {
          return {
            latitud: ubicacion.latitude,
            longitud: ubicacion.longitude,
            nombre: ubicacion.place_name,
            pichanga: dataPartido.id,
            versus: dataPartido.home_team.name + " vs " + dataPartido.visitor_team.name,
          };
        }
    
        return null; // Otra opción es devolver null para los partidos sin ubicación
      }).filter(Boolean); // Filtra los elementos null si los hay
      setResultado(resultado);
      setMostrarMapa(true);
    }

    const handleRefresh = async () => {
      const netInfoState = await NetInfo.fetch();
      setIsOnline(netInfoState.isConnected);
      if (!netInfoState.isConnected) { setLoading(false); return; };

      setRefreshing(true);
      setLoading(true);
      const responsePichanga = await fetchDataCall();
      setPichangaData(responsePichanga.data.pichangas)
      const responseLocation = await fetchLocationCall();
      setLocations(responseLocation.data.locations)
      setRefreshing(false);
    };


    const handleVerLugar = async (id) => {
      setIdDeEdicion(id);
      const elemento = locations.find((item) => item.id === id);
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

    const imagenLista = () => {
      setImagenCargada(true);
    }

    const cerrarImagen = () => {
      setMostrarImagen(false);
      setImagenCargada(false);
      setImagen(null);
      setErrorImagen(false);
      setSubiendoImagen(false);
      setImagenTomada(false);
      setOrigenCamara(false);
      setMostrarOpciones(false);
      setImagenElegida(false);
      setIdDeEdicion(null);
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

    // const actualizarPichangas = async (locId, nuevoId) => {
    //   console.log("nuevo ID", nuevoId)
    //   let token;
    //   try {
    //       token = await AsyncStorage.getItem('token');
    //   } catch (e) {
    //       console.log('Error al obtener el token');
    //   }
    //   const config = {
    //     headers: {
          
    //       'Authorization': 'Bearer ' + token,
    //     },
    //   };
    //   for (const partido of pichangaData) {
    //     if (partido.location.id === locId) {
    //       console.log("partido", partido.id);
    //       const formData = new FormData();
    //       formData.append('location_id', nuevoId);
    //       try {
    //         const response = await axios.put("https://pichang-app-e6269910e1a5.herokuapp.com/api/v1/pichangas/" + partido.id, formData, config);
    //         console.log(response.data);
    //       } catch (error) {
    //         console.error('Error al actualizar el partido:', error);
    //         return;
    //       }
    //     }
    //   }
    // };

    const enviarImagen = async (foto, locId) => {
      setImagenSubidaEnProceso(true);
      const elemento = locations.find((item) => item.id === locId);
      console.log("imagen",foto);
      console.log("id",locId);
      let token;
      try {
          token = await AsyncStorage.getItem('token');
      } catch (e) {
          console.log('Error al obtener el token');
      }
      const fileUri =
        Platform.OS === 'ios' ? foto.uri.replace('file://', '/') : foto.uri;
      console.log(foto);
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
      setImagenSubida(true);
    }
    
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

    




    return (
        <ScrollView 
        contentContainerStyle={{flexGrow: 1}}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }>
        <Background>
        {loading ? (
            <View style={styles.loadingContainer}>
              {isOnline ? (
                <Text style={{ fontSize: 20, color: 'black' }}>
                   {error ? 'Error al cargar datos' : 'Cargando...'}
                </Text>
              ) : (
                <Text style={{ fontSize: 20, color: 'black' }}>No hay conexión a internet</Text>
              )}
              <ActivityIndicator animating={true} color={theme.colors.primary} size={100} />
            </View>
          ) : (
            <>
        <Ionicons name="map-outline" size={50} color="black" style={{ alignSelf: 'center' }} />
        <Header>Mapa de Pichangas</Header>
        <ButtonCrud
          mode="contained"
          onPress={() => mergeData()}
        >
        Mostrar Ubicaciones en Mapa
        </ButtonCrud>

        <Modal
          animationType="slide"
          transparent={true}
          visible={mostrarMapa}
          onRequestClose={() => {
            setMostrarMapa(!mostrarMapa);
          }}> 
            {ubicacionOk ? (
              <View style={styles.centeredView}>
                <View style={styles.modalView}> 
                  <Text style={{fontSize: 20, alignSelf: 'center', marginTop: -90, marginBottom:20}}>Mostrando {resultado.length} ubicaciones</Text>
                  <MapView
                    style={{height: '70%', width: '100%'}} 
                    initialRegion={{
                      latitude: location.coords.latitude,
                      longitude: location.coords.longitude,
                      latitudeDelta: 0.0922,
                      longitudeDelta: 0.0421,
                      }}
                    provider={PROVIDER_GOOGLE}
                    showsUserLocation={true}
                  >
                  {resultado.map((data, index) => (
                    <Marker
                      key={index}
                      coordinate={{
                          latitude: parseFloat(data.latitud),
                          longitude: parseFloat(data.longitud),
                      }}
                      title={`${data.nombre}`}
                      description={`Partido ${data.pichanga}: ${data.versus}`}
                      />
                  ))} 
                </MapView>
                  <ButtonCrud
                    mode="contained"
                    onPress={() => setMostrarMapa(false)}
                  >
                    Cerrar
                  </ButtonCrud>
                <Text style={{fontSize: 20, alignSelf: 'center', marginBottom: -100}}></Text>
              </View>
            </View>
            ) : (
              <View style={styles.centeredView}>
                <View style={styles.modalView}> 
                  <Text style={{fontSize: 20, alignSelf: 'center', marginTop: 10, marginBottom:20}}>Obteniendo Ubicacion</Text>
                  <ActivityIndicator animating={true} color={theme.colors.primary} size={100} />
              </View>
            </View>
            )}
        </Modal>
        {locations.map((data, index) => (
          <List.Item
          title={data.place_name}
          description={pichangaData.filter(partido => partido.location.id === data.id).length + " partidos en este lugar"}
          left={props => <List.Icon {...props} icon="map-marker" />}
          key={index}
          right={() => (
            <Button
              title = {`Ver\nlugar`}
              onPress={() => {
                handleVerLugar(data.id);
              }}
            >
            </Button>
          )}
        />
        ))}
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
                                  title="Aceptar y Subir Foto"
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
        </>
      )}
        </Background>
        </ScrollView>
    );
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
