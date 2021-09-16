import React, { useState, useEffect } from 'react'
import { TextInput, StyleSheet, Button, TouchableOpacity, Text, View } from 'react-native'
import styles from './styles';

import { Auth, API, graphqlOperation } from "aws-amplify";

import { BarCodeScanner } from 'expo-barcode-scanner';

import * as backend_calls from '../../api/backend_calls';

import * as mutations from "../../graphql/mutations";
import { getFood_table, listFood_tables } from "../../graphql/queries";

global.username = "";
global.foodname = "";
global.upc = "";
global.calories = "";
global.recipeBOOL = false;
global.recipetext = "Create Recipe"
global.servings = "";
global.totalCals = "";
global.currentFood = {};
global.userDailyFoods = [];
global.userRecipes = [];
global.localRecipe = [];


export default function homeScreen({props, navigation}) {
    const [hasPermission, setHasPermission] = useState(null);
    const [scanned, setScanned] = useState(false);
    const [servings, setServings] = React.useState("Servings");
    const [totalCals, setTotalCals] = React.useState("Calories");
    const [recipeText, onRecipe] = React.useState("Create Recipe");
    const [recipeName, onRecipeName] = React.useState("My Recipe");
    const [username, setUsername] = React.useState("");

    Auth.currentAuthenticatedUser({
        bypassCache: false
    }).then(user => setUsername(user.username))
    .catch(err => console.log(err))

    useEffect(() => {
        (async () => {
          const { status } = await BarCodeScanner.requestPermissionsAsync();
          setHasPermission(status === 'granted');
        })();
    }, []);

    async function handleBarCodeScanned({ type, data }) {
        try {
            setScanned(true);
            // alert(`Bar code with type ${type} and data ${data} has been scanned!`);
            global.upc = data;

            url = "https://api.nal.usda.gov/fdc/v1/foods/search?api_key=" + "o6VxgV7qVhQ20G7XXTpYeCmfIm98tjJMwiF2qk9b" + "&query=" + data;
            let response = await fetch(url);
            let responseJSON = await response.json();

            for (var i = 0; i < responseJSON["foods"].length; i++) {
                if (responseJSON["foods"][i]["gtinUpc"] == data) {
                    for (var j = 0; j < responseJSON["foods"][0]["foodNutrients"].length; j++) {
                        if (responseJSON["foods"][0]["foodNutrients"][j]["nutrientId"] == "1008") {
                            global.foodname = responseJSON["foods"][0]["description"];
                            global.calories = responseJSON["foods"][0]["foodNutrients"][j]["value"];
                        }
                    }
                }
            }

            // calcCals(global.servings);
        } catch (error) {
            console.log(error);
        }
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

    function calcCals(input_servings) {
        var total = parseFloat(global.calories) * parseFloat(input_servings);

        console.log("INPUT SERVINGS: " + input_servings);

        global.servings = input_servings;
        setServings(input_servings);

        global.totalCals = total;
        setTotalCals(total);

        global.currentFood = {
            "Name": global.foodname,
            "UPC": global.upc,
            "Calories": global.calories,
            "Servings": global.servings,
            "TotalCals": global.totalCals
        };
        console.log("CALCCALS CURRENT FOOD")
        console.log(global.currentFood)
    }

    async function addDailyFood() {
        try {
            // Pull Existing Daily Foods
            try {
                // Pull Existing Daily Foods
                const userData = await backend_calls.getUserData(username);
                global.userDailyFoods = JSON.parse(userData["data"]["getFood_table"]["daily_foods"]);
                global.userRecipes = JSON.parse(userData["data"]["getFood_table"]["recipes"]);

                // Append new daily foods
                global.userDailyFoods.push(global.currentFood)

                // Push new daily foods
                values = {
                    username: username,
                    daily_foods: JSON.stringify(global.userDailyFoods),
                    recipes: JSON.stringify(global.userRecipes)
                };
                // console.log(values);
                backend_calls.updateUserData(values);
                console.log("DAILY: UPDATED USER DATA");
            } catch (error) {                
                // // If none exist, initialize
                global.userDailyFoods = [global.currentFood];
                global.userRecipes = [];

                // // Push new daily foods
                values = {
                    username: username,
                    daily_foods: JSON.stringify(global.userDailyFoods),
                    recipes: JSON.stringify(global.userRecipes)
                };
                backend_calls.createUserData(values);
                console.log("DAILY: CREATED USER DATA");
            }
        } catch (error) {
            console.log(error);
        }
    }

    async function createRecipe() {
        try {
            global.recipeBOOL = !global.recipeBOOL;
            global.recipeBOOL ? onRecipe("Finish Recipe") : onRecipe("Create Recipe");

            if (!global.recipeBOOL) {
                try {
                     // Pull Existing Recipes
                    const userData = await backend_calls.getUserData(username);
                    global.userRecipes = JSON.parse(userData["data"]["getFood_table"]["recipes"]);
                    global.userDailyFoods = JSON.parse(userData["data"]["getFood_table"]["daily_foods"]);

                    // Append new recipe
                    global.userRecipes.push(global.localRecipe);
                    console.log("Appended localRecipe -");
                    console.log(global.localRecipe);

                    // Publish Recipes
                    values = {
                        username: username,
                        daily_foods: JSON.stringify(global.userDailyFoods),
                        recipes: JSON.stringify(global.userRecipes)
                    };
                    backend_calls.updateUserData(values);
                    console.log("RECIPE: UPDATED USER DATA");

                    // Reset Local Recipe
                    global.localRecipe = [];
                } catch (error) {
                    // // If none exist, initialize
                    global.userDailyFoods = [];
                    global.userRecipes = [global.localRecipe];

                    // Publish Recipes
                    values = {
                        username: username,
                        daily_foods: JSON.stringify(global.userDailyFoods),
                        recipes: JSON.stringify(global.userRecipes)
                    };
                    console.log(values);
                    backend_calls.createUserData(values);
                    console.log("RECIPE: CREATED USER DATA");

                    // Reset Local Recipe
                    global.localRecipe = [];
                    console.log("Reset local recipe");
                }
            }
        } catch (error) {
            console.log(error);
        }
    }

    async function addFood2Recipe() {
        try {
            if (global.recipeBOOL) {
                console.log(global.currentFood)
                global.localRecipe.push(global.currentFood);
                console.log("calCals: Added currentFood to localRecipe");
                console.log(global.localRecipe);
            }
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
                {scanned && <TextInput style={styles.input} placeholder="Enter # of Servings" onChangeText={(input)=>calcCals(input)} />}
                {scanned && <Text>Total Calories: {totalCals}</Text>}
                {scanned && <Text>Total Servings: {servings}</Text>}
            </View>
            <View style={{ flex:2, background: "#000000" }}>
                {recipeBOOL && <TextInput style={styles.input} placeholder="Enter Recipe Name" onChangeText={(input)=>onRecipeName(input)} value="My Recipe" />}
                {recipeBOOL && <TouchableOpacity
                    style={styles.button}
                    onPress={() => addFood2Recipe()}>
                    <Text style={styles.buttonTitle}>Add to Recipe</Text>
                </TouchableOpacity>}
                <TouchableOpacity
                    style={styles.button}
                    onPress={() => createRecipe()}>
                    <Text style={styles.buttonTitle}>{recipeText}</Text>
                </TouchableOpacity>
            </View>
            <View style={{ flex:1, background: "#000000" }}>
                <TouchableOpacity
                    style={styles.button}
                    onPress={() => addDailyFood()}>
                    <Text style={styles.buttonTitle}>Add to Daily Foods</Text>
                </TouchableOpacity>
            </View>
            <View style={{ flex:1, background: "#000000" }}>
                <TouchableOpacity
                    style={styles.button}
                    onPress={() => onSignOutPress()}>
                    <Text style={styles.buttonTitle}>Sign Out</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}
