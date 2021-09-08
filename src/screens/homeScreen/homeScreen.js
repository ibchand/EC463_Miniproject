import React, { useState, useEffect } from 'react'
import { StyleSheet, Button, TouchableOpacity, Text, View } from 'react-native'
// import styles from './styles';

import { Auth } from "aws-amplify";

import { BarCodeScanner } from 'expo-barcode-scanner';

global.username = "Error"

export default function homeScreen({props, navigation}) {

    const [hasPermission, setHasPermission] = useState(null);
    const [scanned, setScanned] = useState(false);

    useEffect(() => {
        (async () => {
          const { status } = await BarCodeScanner.requestPermissionsAsync();
          setHasPermission(status === 'granted');
        })();
    }, []);

    const handleBarCodeScanned = ({ type, data }) => {
        setScanned(true);
        alert(`Bar code with type ${type} and data ${data} has been scanned!`);
    };
    
    if (hasPermission === null) {
        return <Text>Requesting for camera permission</Text>;
    }
    if (hasPermission === false) {
        return <Text>No access to camera</Text>;
    }

    const onSignOutPress = () => {
        Auth.signOut({global: true })
        navigation.navigate('Login')
    }

    // const printUser = () => {
    //     Auth.currentAuthenticatedUser({
    //         bypassCache: false
    //     }).then(user => console.log(user))
    //     .catch(err => console.log(err))

    //     console.log(global.username)
    // }

    Auth.currentAuthenticatedUser({
        bypassCache: false
    }).then(user => global.username = user.username)
    .catch(err => console.log(err))

    console.log(global.username)

    return (
        <View>
            <Text>Home Screen</Text>
            <Text>Home Screen</Text>
            <Text>Home Screen</Text>
            <Text>Home Screen</Text>
            <Text>Home Screen</Text>
            <Text>Home Screen</Text>
            <Text>Home Screen</Text>
            <Text>Home Screen</Text>
            <Text>Home Screen</Text>
            <Text>Home Screen</Text>
            <Text>Home Screen</Text>
            <Text>Home Screen</Text>
            <Text>Home Screen</Text>
            <Text>Home Screen</Text>
            <Text>Home Screen</Text>
            <Text>Home Screen</Text>
            <Text>Home Screen</Text>
            <Text>Home Screen</Text>
            <Text>Home Screen</Text>
            <Text>Home Screen</Text>
            <Text>Home Screen</Text>
            <Text>Home Screen</Text>
            <Text>Home Screen</Text>
            <Text>Home Screen</Text>
            <BarCodeScanner
                onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
                 style={StyleSheet.absoluteFillObject}
            />
            {scanned && <Button title={'Tap to Scan Again'} onPress={() => setScanned(false)} />}
        </View>
    )
}

const styles = StyleSheet.create({}); 

{/* <Text>Home Screen</Text>
            <TouchableOpacity
                    style={styles.button}
                    onPress={() => onSignOutPress()}>
                    <Text style={styles.buttonTitle}>Sign Out</Text>
            </TouchableOpacity> */}

{/* <TouchableOpacity
style={styles.button}
onPress={() => printUser()}>
<Text style={styles.buttonTitle}>Print User Info</Text>
</TouchableOpacity> */}
