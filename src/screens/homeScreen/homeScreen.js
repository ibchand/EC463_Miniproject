import React, { useState, useEffect } from 'react'
import { TextInput, StyleSheet, Button, TouchableOpacity, Text, View } from 'react-native'
import styles from './styles';

import { Auth, API, graphqlOperation } from "aws-amplify";

import { BarCodeScanner } from 'expo-barcode-scanner';

import * as backend_calls from '../../api/backend_calls';

import * as mutations from "../../graphql/mutations";

global.username = "Empty";
global.upc = "";
global.calories = "";
// global.daily;
// global.recipes;

export default function homeScreen({props, navigation}) {

    Auth.currentAuthenticatedUser({
        bypassCache: false
    }).then(user => global.username = user.username)
    .catch(err => console.log(err))

    const [hasPermission, setHasPermission] = useState(null);
    const [scanned, setScanned] = useState(false);
    const [servings, onChangeServings] = React.useState("Servings");
    const [totalCals, onChangeCals] = React.useState("Calories");
    // const [username, setUsername] = React.useState("Empty");

    useEffect(() => {
        (async () => {
          const { status } = await BarCodeScanner.requestPermissionsAsync();
          setHasPermission(status === 'granted');
        })();
    }, []);

    const handleBarCodeScanned = ({ type, data }) => {
        setScanned(true);
        // global.upc = data;
        alert(`Bar code with type ${type} and data ${data} has been scanned!`);
        global.upc = data;
        getFood(data);
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

    async function getFood(upc) {
        try {
            console.log(upc)
            url = "https://api.nal.usda.gov/fdc/v1/foods/search?api_key=" + "o6VxgV7qVhQ20G7XXTpYeCmfIm98tjJMwiF2qk9b" + "&query=" + upc;
            console.log(url)
            let response = await fetch(url);
            let responseJSON = await response.json();

            for (var i = 0; i < responseJSON["foods"].length; i++) {
                if (responseJSON["foods"][i]["gtinUpc"] == upc) {
                    console.log("UPC IN LOOP is: " + responseJSON["foods"][i]["gtinUpc"])
                    for (var j = 0; j < responseJSON["foods"][0]["foodNutrients"].length; j++) {
                        if (responseJSON["foods"][0]["foodNutrients"][j]["nutrientId"] == "1008") {
                            global.calories = responseJSON["foods"][0]["foodNutrients"][j]["value"];
                            console.log("CALORIES: " + global.calories);
                        }
                    }
                }
            }
        } catch (error) {
            console.log(error)
        }
    }

    const calcCals = (incals) => {
        onChangeServings(incals)
        // var cals = parseFloat(global.calories);
        // var servs = parseFloat(servings);

        var total = parseFloat(global.calories) * parseFloat(servings);
        onChangeCals(total);
    }

    async function createUserData() {
        try {
            daily_foods = [
                {
                    "UPC": global.upc,
                    "Calories": global.calories,
                    "Servings": servings,
                    "Total": totalCals
                }            
            ];
            recipes = [
                {
                    "UPC": global.upc,
                    "Calories": global.calories,
                    "Servings": servings,
                    "Total": totalCals
                }            
            ];
            const userData = await API.graphql(graphqlOperation(mutations.createFood_table, { input: {username: global.username, daily_foods: daily_foods, recipes: recipes}}));
            console.log("Created User data entry")
        } catch (error) {
            console.log(error);
        }
    }

    // const updateDaily() {
    //     global.daily = [
    //         {
    //             "UPC": global.upc,
    //             "Calories": global.calories,
    //             "Servings": servings,
    //             "Total": totalCals
    //         }            
    //     ];
    //     global.recipes = [
    //         {
    //             "UPC": global.upc,
    //             "Calories": global.calories,
    //             "Servings": servings,
    //             "Total": totalCals
    //         }            
    //     ];
    // }

    async function updateUserData() {
        try {
            const userData = await API.graphql(graphqlOperation(mutations.updateFood_table, { input: {username: global.username, daily_foods: global.daily_foods, recipes: global.recipes}}));
            console.log("Updated User data entry")
        } catch (error) {
            console.log(error);
        }
    }

    return (
        <View style={{ flex:1 }}>
            <View style={{ flex:2 }}>
                <BarCodeScanner
                    onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
                    style={{ flex: 1 }}
                />
            </View>
            <View style={{ flex:1 }}>
                {scanned && <Button title={'Tap to Scan Again'} onPress={() => setScanned(false)} />}
                {scanned && <TextInput style={styles.input} placeholder="Enter # of Servings" onChangeText={servings => calcCals(servings)} value={servings} />}
                {scanned && <Text>Total Calories: {totalCals}</Text>}
                {scanned && <Text>Total Servings: {servings}</Text>}
            </View>
            <View style={{ flex:1, background: "skyblue" }}>
                <TouchableOpacity
                    style={styles.button}
                    onPress={() => updateUserData()}>
                    <Text style={styles.buttonTitle}>Test Data Create</Text>
                </TouchableOpacity>
            </View>
            <View style={{ flex:1, background: "skyblue" }}>
                <TouchableOpacity
                    style={styles.button}
                    onPress={() => onSignOutPress()}>
                    <Text style={styles.buttonTitle}>Sign Out</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}

    // Auth.currentAuthenticatedUser({
    //     bypassCache: false
    // }).then(user => console.log(user))
    // .catch(err => console.log(err))

    // console.log(global.username)
