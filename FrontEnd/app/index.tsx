import React from 'react';
import {View,Text, StyleSheet, Pressable} from 'react-native';
import { Link } from 'expo-router';


const onboardingScreen = () => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Bem vindo ao app</Text>
            <Link href={{ pathname: '/map' }} asChild>
            <Pressable style={styles.button}>
                <Text style={styles.buttonText}>Verificar Ofertas</Text>
            </Pressable>
      </Link>
    </View>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 40,
  },
  button: {
    backgroundColor: '#4CAF50', // Um verde bonito
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 50,
    elevation: 2,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default onboardingScreen;
