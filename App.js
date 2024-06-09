import { Button } from 'react-native';
import HomeScreen from './src/screens/HomeScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import PichangasScreen from './src/screens/PichangasScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import PichangaScreen from './src/screens/PichangaScreen';
import PichangaCreateEditScreen from './src/screens/PichangaCreateEditScreen';
import { NavigationContainer, useNavigation} from "@react-navigation/native";
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState } from 'react'
import Ionicons from 'react-native-vector-icons/Ionicons';
import { LogBox } from 'react-native';
import MapScreen from './src/screens/MapScreen';
LogBox.ignoreAllLogs();//Ignore all log notifications


const Stack = createStackNavigator();
const Tab = createBottomTabNavigator()

function MasterStack () {
  return (
    <Stack.Navigator>
        <Stack.Screen name="Auth" component={AuthStack} options={{ headerShown: false}}/>
        <Stack.Screen name="Dashboard" component={DashboardTab} options={{ headerShown: false}}/>
        <Stack.Screen name="Pichanga" component={PichangaScreen} />
        <Stack.Screen name="PichangaCRUD" component={PichangaCreateEditScreen} />
    </Stack.Navigator>
  )
}

function AuthStack () {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Welcome" component={HomeScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  )
}

function DashboardTab() {
  const navigation = useNavigation()
  const ereaseStorage = async () => {
    try {
      await AsyncStorage.clear()
      console.log("Storage cleared")
    } catch(e) {
      console.log(e)
    }
  }
  const handlePress = () => {
    ereaseStorage()
    navigation.reset({
      index: 0,
      routes: [{ name: 'Auth' }],
    });
    console.log("Logout")
  }
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Pichangas') {
            iconName = focused ? 'football' : 'football-outline';
          } else if (route.name === 'CrearPichangas') {
            iconName = focused ? 'create' : 'create-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }
          else if (route.name === 'Map') {
            iconName = focused ? 'map' : 'map-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#560CCE',
        tabBarInactiveTintColor: 'gray',
      })}
    >
    <Tab.Screen name="Pichangas" component={PichangasScreen} />
    
    
    <Tab.Screen name="Map" component={MapScreen} />
    <Tab.Screen name="CrearPichangas" component={PichangaCreateEditScreen} />
    <Tab.Screen
      name="Profile"
      component={ProfileScreen}
      options={{
        headerRight: () => (
          <Button
            onPress={() => handlePress()}
            title="Log Out"
            color="#111"
          />
        ),
      }}
    />
  </Tab.Navigator>
  )
}


export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const getData = async () => {
    try {
        const token = await  AsyncStorage.getItem('token')
        if(token !== null) {
          setIsLoggedIn(true)
        }
    } catch(e) {
      console.log(e)
    }
  }
  getData()
  return (
      <NavigationContainer>
        <MasterStack 
          isLoggedIn={isLoggedIn}
        />
       </NavigationContainer>
    );
  }












