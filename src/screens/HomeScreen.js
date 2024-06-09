import { StatusBar } from 'expo-status-bar';
import Background from '../components/Background'
import Logo from '../components/Logo'
import Header from '../components/Header'
import Button from '../components/Button'
import Paragraph from '../components/Paragraph'
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState } from 'react'
import { ScrollView, Text, View } from 'react-native'
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import FontAwesome from '@expo/vector-icons/FontAwesome';

WebBrowser.maybeCompleteAuthSession();

export default function StartScreen({ navigation }) {
    const [name, setName] = useState("")
    const [category, setCategory] = useState("")
    const [userId, setUserId] = useState("")
    const [token, setToken] = useState("")
    const [email, setEmail] = useState("")
    const [request,response,promptAsync] = Google.useIdTokenAuthRequest({
      iosClientId: 
      "835860208828-p79u5sfbu23cu42t0qto0kb6et1vbl27.apps.googleusercontent.com",
      androidClientId:
      "835860208828-tn6mkjij322t0unorc5r56no3lf1gcf7.apps.googleusercontent.com",
  
    })



    const getData = async () => {
        try {
            const name = await AsyncStorage.getItem('name')
            const category = await AsyncStorage.getItem('category')
            const userId = await  AsyncStorage.getItem('userId')
            const token = await  AsyncStorage.getItem('token')
            const email = await  AsyncStorage.getItem('email')
            if(name !== null) {
              setName(name)
            }
            if(category !== null) {
              setCategory(category)
            }
            if(userId !== null) {
              setUserId(userId)
            }
            if(token !== null) {
              setToken(token)
            }
            if(email !== null) {
              setEmail(email)
            }

        } catch(e) {
          console.log(e)
        }
        if (name != "") {
          
          navigation.navigate('Dashboard')
          
    }
      }
    getData()
    

  
    // if (token != null) {
    //   navigation.navigate('Pichangas')
    // }
    const getStorage = async () => {
      try {
          const name = await AsyncStorage.getItem('name')
          const category = await AsyncStorage.getItem('category')
          const userId = await  AsyncStorage.getItem('userId')
          const token = await  AsyncStorage.getItem('token')
          const email = await  AsyncStorage.getItem('email')
          console.log(name)
          console.log(category)
          console.log(userId)
          console.log(token)
          console.log(email)

      } catch(e) {
        console.log(e)
      }
    }
  
  return (
    <ScrollView contentContainerStyle={{flexGrow: 1}}>
    <Background>
      <Logo />
      <Header>Bienvenido a PichangaApp</Header>
      <Paragraph>
        La mejor forma de crear tus pichangas
      </Paragraph>
      <Button
        mode="contained"
        onPress={() => navigation.navigate('Login')}
      >
        Login
      </Button>
      <Button
        mode="outlined"
        onPress={() => navigation.navigate('Register')}
      >
        Sign Up
      </Button>
      <Button
        mode="contained"
        onPress={() => promptAsync()}
      >
      <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
        <FontAwesome 
          name="google" 
          size={28} 
          color="white"
          />          
          <Text style={{color: 'white', fontSize: 15, lineHeight: 26, fontWeight: 'bold', marginTop: 5}}>  Log in with Google</Text>
        </View>
      </Button>

    </Background>
    </ScrollView>
  )
}