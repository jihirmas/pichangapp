import { List } from 'react-native-paper';
import Background from '../components/Background'
import Logo from '../components/Logo'
import Header from '../components/Header'
import Button from '../components/Button'
import Paragraph from '../components/Paragraph'
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState } from 'react'
import { Email, Scale } from '@mui/icons-material';
import { StyleSheet, ScrollView } from 'react-native'

export default function ProfileScreen({ navigation }) {
    const [name, setName] = useState("")
    const [category, setCategory] = useState("")
    const [email, setEmail] = useState("")

    const getData = async () => {
        try {
            const name = await AsyncStorage.getItem('name')
            const category = await AsyncStorage.getItem('category')
            const email = await AsyncStorage.getItem('email')
            if(name !== null) {
              setName(name)
            }
            else {
                setName("Unable to get name")
                }
            if(category !== null) {
              setCategory(category)
            }
            else {
                setCategory("Unable to get category")
                }
            if(email !== null) {
              setEmail(email)
            }
            else {
                setEmail("Unable to get email")
                }

        } catch(e) {
          console.log(e)
        }
      }
    getData()

    return (
        <ScrollView contentContainerStyle={{flexGrow: 1}}>
        <Background>
            <Header>Perfil de Usuario</Header>
            <List.Item
                title={name}
                description="Nombre"
                left={props => <List.Icon {...props} icon="account" />}
                titleStyle={styles.title}
            />
            <List.Item
                title={email}
                description="email"
                left={props => <List.Icon {...props} icon="email" />}
                titleStyle={styles.title}
            />
            <List.Item
                title={category}
                description="category"
                left={props => <List.Icon {...props} icon="shape" />}
                titleStyle={styles.title}
            />
            
            </Background>
        </ScrollView>
)
}

const styles = StyleSheet.create({
    title: {
        fontSize: 24,
    },
    icon: {
        fontSize: 50,
        fontWeight: 'bold',
    }
});
