import React, { useState, useEffect } from 'react'
import { TextInput, StyleSheet, Button, TouchableOpacity, Text, View } from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
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
global.listFoodBOOL = false;
global.listRecipeBOOL = false;


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
                try {
                global.userRecipes = JSON.parse(userData["data"]["getFood_table"]["recipes"]);
                } catch (error) {
                    console.log("No Recipes")
                    global.userRecipes = null;
                }

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
                global.userRecipes = null;

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
                    try {
                        global.userDailyFoods = JSON.parse(userData["data"]["getFood_table"]["daily_foods"]);
                    } catch (error) {
                        console.log("No Daily Foods")
                        global.userDailyFoods = null;
                    }
                    global.userRecipes = [JSON.parse(userData["data"]["getFood_table"]["recipes"])];
                    // console.log("USERRECIPES");
                    // console.log(global.userRecipes);

                    // Append new recipe
                    global.localRecipe = { recipeName: recipeName, recipe: global.localRecipe };
                    // console.log("GLOBAL LOCAL RECIPE");
                    // console.log(global.localRecipe);
                    global.userRecipes.push(global.localRecipe);
                    // console.log("Appended localRecipe -");
                    // console.log(global.localRecipe);

                    // Publish Recipes
                    var values = {
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
                    // console.log('No entry exisits')
                    // console.log(error)
                    global.userDailyFoods = null;
                    global.userRecipes = [{ recipeName: recipeName, recipe: [global.localRecipe] }];

                    // Publish Recipes
                    var values = {
                        username: username,
                        daily_foods: JSON.stringify(global.userDailyFoods),
                        recipes: JSON.stringify(global.userRecipes)
                    };
                    // console.log(values);
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
        const userData = await backend_calls.getUserData(username);
        try {
            global.userDailyFoods = JSON.parse(userData["data"]["getFood_table"]["daily_foods"]);
        } catch (error) {
            console.log("No Daily Foods")
            global.userDailyFoods = null;
        }
    }

    async function listRecipes() {
        const userData = await backend_calls.getUserData(username);
        try {
            global.userRecipes = [JSON.parse(userData["data"]["getFood_table"]["recipes"])];
        } catch (error) {
            console.log("No Recipes")
            global.userRecipes = null;
        }

        for (var i = 0; i < global.userRecipes[0][0].length; i++) {
            if (global.userRecipes[0][0][i] != null) {
                console.log(global.userRecipes[0][0][i]);
            }
        }        
    }

    async function listFoods() {
    }


    return (

        <View style = {styles.container}>
            <View style={styles.container2}>
                <BarCodeScanner
                    onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
                    style={StyleSheet.absoluteFillObject}
                />
            </View>
            {scanned && <Button title={'Tap to Scan Again'} onPress={() => setScanned(false)} />}
            <KeyboardAwareScrollView
                    style={{ flex: 1, width: '100%' }}
                    keyboardShouldPersistTaps="always">
                <View style={{ flex:1 }}>
                    <View style={{ flex:1 }}>
                        
                        {scanned && <TextInput style={styles.input} placeholder="Enter # of Servings" onChangeText={(input)=>calcCals(input)} />}
                        {scanned && <Text>Total Calories: {totalCals}</Text>}
                        {scanned && <Text>Total Servings: {servings}</Text>}
                    </View>
                    <View style={{ flex:2, background: "skyblue" }}>
                        {recipeBOOL && <TextInput style={styles.input} placeholder="Enter Recipe Name" onChangeText={(input)=>onRecipeName(input)} />}
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
                    <View style={{ flex:1, background: "skyblue" }}>
                        <TouchableOpacity
                            style={styles.button}
                            onPress={() => addDailyFood()}>
                            <Text style={styles.buttonTitle}>Add to Daily Foods</Text>
                        </TouchableOpacity>
                    </View>
                     <View style={{ flex:1, background: "skyblue" }}>
                        <TouchableOpacity
                            style={styles.button}
                            onPress={() => listRecipes()}>
                            <Text style={styles.buttonTitle}>View Recipes</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={{ flex:1, background: "skyblue" }}>
                        <TouchableOpacity
                            style={styles.button}
                            onPress={() => listFoods()}>
                            <Text style={styles.buttonTitle}>View Daily Foods</Text>
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
            </KeyboardAwareScrollView>
        </View>
    )
}
