import React, { useState } from 'react'
import { View, StyleSheet, TouchableOpacity, ScrollView,Animated } from 'react-native'
import Background from '../components/Background'
import Logo from '../components/Logo'
import Header from '../components/Header'
import Button from '../components/Button'
import TextInput from '../components/TextInput'
import BackButton from '../components/BackButton'
import { theme } from '../core/theme'
import { emailValidator } from '../helpers/emailValidator'
import { passwordValidator } from '../helpers/passwordValidator'
import { categoriaValidator } from '../helpers/categoriaValidator'
import { nameValidator } from '../helpers/nameValidator'
import { SelectList } from 'react-native-dropdown-select-list'
import axios, {isCancel, AxiosError} from 'axios';
import {Text, ActivityIndicator, MD2Colors} from 'react-native-paper';
import NetInfo from "@react-native-community/netinfo";


export default function RegisterScreen({ navigation }) {
    const [name, setName] = useState({ value: '', error: '' })
    const [email, setEmail] = useState({ value: '', error: '' })
    const [password, setPassword] = useState({ value: '', error: '' })
    const [categoria, setCategoria] = useState("")
    const [categoriaError, setCategoriaError] = useState('')
    const [loading, setLoading] = useState(false);
    const [isOnline, setIsOnline] = useState(false);
    const [error, setError] = useState(false);

    const data = [
            {key:'1', value:'Masculino'},
            {key:'2', value:'Femenino'},
        ]
    const handleSignUp = () => {
        axios.post('https://pichang-app-e6269910e1a5.herokuapp.com/api/v1/signup',
            {
                name: name.value,
                email: email.value,
                password: password.value,
                category: categoria
            }
        )
        .then(function (response) {
            setLoading(false);
            alert("Usuario creado con éxito")
            navigation.navigate('Login')
        })
        .catch(function (error) {
            alert("Email ya en uso")
            setLoading(false);
            return
        });
        
    }

    const onSignUpPressed = async () => {
        
        // console.log(name, email, password, categoria)
        const nameError = nameValidator(name.value)
        const emailError = emailValidator(email.value)
        const passwordError = passwordValidator(password.value)
        const aux = categoriaValidator(categoria)
        if (aux != '') {
            setCategoriaError('Debes seleccionar un género')
        }
        else {
            setCategoriaError('')
        }
        
        if (emailError || passwordError || nameError || aux) {
            setName({ ...name, error: nameError })
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
        // console.log(categoria)
        // alert("Usuario creado con éxito")
        handleSignUp()
    }

    return (
        <ScrollView contentContainerStyle={{flexGrow: 1}}>
            <Background>
            
            <Logo />
            <Header>Crear una cuenta</Header>
            <TextInput
                label="Name"
                returnKeyType="next"
                value={name.value}
                onChangeText={(text) => setName({ value: text, error: '' })}
                error={!!name.error}
                errorText={name.error}
            />
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
            <View style={{width: '100%',marginVertical: 20}}>
                <SelectList 
                    setSelected={(val) => setCategoria(val)} 
                    data={data} 
                    search={false}
                    save="value"
                    placeholder='Seleccione su género'
                    boxStyles={{borderRadius: 4, height: 50}}
                    inputStyles={{marginTop: 3, backgroundColor: theme.colors.surface, marginLeft: -2, fontSize: 16, color: theme.colors.secondary}}
                />
                {categoriaError ? <Text style={{fontSize: 13,color: theme.colors.error,paddingTop: 8}}>{categoriaError}</Text> : null}
                
            </View>
            
            <Button
                mode="contained"
                onPress={onSignUpPressed}
                style={{ marginTop: 24 }}
            >
                Sign Up
            </Button>
            <View style={styles.row}>
                <Text>Already have an account? </Text>
                <TouchableOpacity onPress={() => navigation.replace('Login')}>
                <Text style={styles.link}>Login</Text>
                </TouchableOpacity>
            </View>
            {loading &&
                <View style={styles.loading}>
                    {isOnline ? (
                    <Text style={{ fontSize: 20, color: 'black' }}>
                        {error ? 'Error al registrarse' : 'Creando usuario'}
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
    row: {
        flexDirection: 'row',
        marginTop: 4,
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