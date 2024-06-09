import React, { useState } from 'react'
import { TouchableOpacity, StyleSheet, View, ScrollView,Animated } from 'react-native'
import {ActivityIndicator, Text } from 'react-native-paper'
import Background from '../components/Background'
import Logo from '../components/Logo'
import Header from '../components/Header'
import Button from '../components/Button'
import TextInput from '../components/TextInput'
import BackButton from '../components/BackButton'
import { theme } from '../core/theme'
import { emailValidator } from '../helpers/emailValidator'
import { passwordValidator } from '../helpers/passwordValidator'
import axios, {isCancel, AxiosError} from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from "@react-native-community/netinfo";


export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState({ value: '', error: '' })
  const [password, setPassword] = useState({ value: '', error: '' })
  const [loading, setLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const [error, setError] = useState(false);
  



  const handleLogIn = () => {
    
    axios.post('https://pichang-app-e6269910e1a5.herokuapp.com/api/v1/login',
        {
            email: email.value,
            password: password.value,
        }
    )
    .then(async function (response) {
        console.log(response.data)
        await AsyncStorage.clear()
        await AsyncStorage.setItem('token', response.data.token)
        await AsyncStorage.setItem('userId', response.data.user_id.toString())
        await AsyncStorage.setItem('name', response.data.name)
        await AsyncStorage.setItem('category', response.data.category)
        await AsyncStorage.setItem('email', email.value)
        navigation.replace('Dashboard')
        navigation.navigate('Dashboard')
        setLoading(false);
    })
    .catch(async function (error) {
      if (error.response.status === 503) {
        alert("No se puede conectar con el servidor")
      } else {
        alert("Error al iniciar sesión, revise sus credenciales")
      }
      setLoading(false);
      console.log(error)
    });

}

  const onLoginPressed = async () => {
    const emailError = emailValidator(email.value)
    const passwordError = passwordValidator(password.value)
    if (emailError || passwordError) {
      setEmail({ ...email, error: emailError })
      setPassword({ ...password, error: passwordError })
      return
    }
    setLoading(true);
    const netInfoState = await NetInfo.fetch();
    setIsOnline(netInfoState.isConnected);
    if (!netInfoState.isConnected) {
      return;
    }
    handleLogIn()
  }

  return (
    <ScrollView contentContainerStyle={{flexGrow: 1}}>
    <Background>
      <Logo />
      <Header>Que bueno volver a verte</Header>
      <TextInput
        label="Email"
        returnKeyType="next"
        value={email.value}
        onChangeText={(text) => setEmail({ value: text, error: '' })}
        error={!!email.error}
        errorText={email.error}
        autoCapitalize="none"
        autoCompleteType="email"
        textContentType="emailAddress"
        keyboardType="email-address"
      />
      <TextInput
        label="Password"
        returnKeyType="done"
        value={password.value}
        onChangeText={(text) => setPassword({ value: text, error: '' })}
        error={!!password.error}
        errorText={password.error}
        secureTextEntry
      />
      
      <Button mode="contained" onPress={onLoginPressed}>
        Login
      </Button>
      <View style={styles.row}>
        <Text>Don’t have an account? </Text>
        <TouchableOpacity onPress={() => navigation.replace('Register')}>
          <Text style={styles.link}>Sign up</Text>
        </TouchableOpacity>
      </View>
      {loading &&
        <View style={styles.loading}>
            {isOnline ? (
            <Text style={{ fontSize: 20, color: 'black' }}>
                {error ? 'Error al iniciar sesion' : 'Iniciando Sesión'}
            </Text>
            ) : (
            <Text style={{ fontSize: 20, color: 'black' }}>No hay conexión a internet</Text>
            )}
            <ActivityIndicator size='large' />
        </View>
        }

    </Background>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  forgotPassword: {
    width: '100%',
    alignItems: 'flex-end',
    marginBottom: 24,
  },
  row: {
    flexDirection: 'row',
    marginTop: 4,
  },
  forgot: {
    fontSize: 13,
    color: theme.colors.secondary,
  },
  link: {
    fontWeight: 'bold',
    color: theme.colors.primary,
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
  }
})