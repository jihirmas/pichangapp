import { Text, TouchableOpacity, StyleSheet, View  } from 'react-native';
import * as React from 'react'
import {Entypo} from '@expo/vector-icons'


export default function CameraButton({title, onPress, icon, color, size, paddingSize}) {
  return (
    <TouchableOpacity 
        onPress={onPress} 
        style={styles.button}
    >
      <View style={styles.iconContainer}>
        <Entypo 
          name={icon} 
          size={size} 
          color={color} 
          style={{padding: paddingSize}}
        />
        </View>
        <Text style={styles.buttonText}>{title}</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
    button: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonText: {
        fontWeight: 'bold',
        fontSize: 16,
        color: 'black',
    },
    iconContainer: {
        backgroundColor: 'white',
        borderRadius: 50,  // Hace que el contenedor del icono sea un círculo
        padding: 0,
    },
})  


