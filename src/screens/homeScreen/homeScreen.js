import React, { useState, useEffect } from 'react'
import { TextInput, StyleSheet, Button, TouchableOpacity, Text, View } from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import styles from './styles';

import { Auth } from "aws-amplify";

import { BarCodeScanner } from 'expo-barcode-scanner';

import * as backend_calls from '../../api/backend_calls';


global.username = "";
global.foodname = "";
global.upc = "";
global.calories = "";
global.recipeBOOL = false;
global.recipetext = "Create Recipe"
global.servings = "";
global.totalCals = "";
global.currentFood;
global.userDailyFoods;
global.userRecipes = [];
global.localRecipe = [];
global.listFoodBOOL = false;
global.listRecipeBOOL = false;
global.recipeDisplay = "";
global.foodDisplay = "";

global.userData;


export default function homeScreen({props, navigation}) {
    const [hasPermission, setHasPermission] = useState(null);
    const [scanned, setScanned] = useState(false);
    const [displayFood, setDisplayFood] = useState(false);
    const [displayRecipe, setDisplayRecipe] = useState(false);
    const [servings, setServings] = React.useState("Servings");
    const [totalCals, setTotalCals] = React.useState("Calories");
    const [recipeText, onRecipe] = React.useState("Create Recipe");
    const [recipeName, onRecipeName] = React.useState("My Recipe");
    const [username, setUsername] = React.useState("");
    const [DailyFoodList, onDisplayFood] = React.useState("View Daily Foods");
    const [RecipeList, onDisplayRecipe] = React.useState("View Recipes");

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

    async function getUserData() {
        try {
            let isDailyFood = true;
            let isRecipes = true;
            global.userData = await backend_calls.getUserData(username);

            try {
                global.userDailyFoods = JSON.parse(userData["data"]["getFood_table"]["daily_foods"]);
            } catch (error) {
                console.log("User has no daily foods");
                isDailyFood = false;
                global.userDailyFoods = [];
            }

            try {
                global.userRecipes = JSON.parse(userData["data"]["getFood_table"]["recipes"]);
            } catch (error) {
                console.log("User has no recipes");
                isRecipes = false;
                global.userRecipes = [];
            }
            
            if (!isDailyFood && !isRecipes) {
                console.log("Failed to pull any user data");
                global.userDailyFoods = [];
                global.userRecipes = [];

                // Prep object to store
                let values = {
                    username: username,
                    daily_foods: JSON.stringify(global.userDailyFoods),
                    recipes: JSON.stringify(global.userRecipes)
                };

                // Create user data
                backend_calls.createUserData(values);
                console.log("DAILY: CREATED USER DATA");

                // Pull data
                await getUserData();
            } else {
                console.log("Got User Data");
            }
        }
        catch (error) {
            console.log(error);
        }
    }

    async function addDailyFood() {
        try {
            if (global.currentFood != null) {
                 // Retreive data from Dynamo Table
                await getUserData();

                // Append new daily foods
                global.userDailyFoods.push(global.currentFood)

                // Prep object to store
                let values = {
                    username: username,
                    daily_foods: JSON.stringify(global.userDailyFoods),
                    recipes: JSON.stringify(global.userRecipes)
                };

                // Update user data
                backend_calls.updateUserData(values);
                console.log("DAILY: UPDATED USER DATA");
            } else {
                console.log("No current food");
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

    async function createRecipe() {
        try {
            global.recipeBOOL = !global.recipeBOOL;
            global.recipeBOOL ? onRecipe("Finish Recipe") : onRecipe("Create Recipe");

            if (!global.recipeBOOL) {
                // Retreive data from Dynamo Table
                await getUserData();

                // Get Total Calories of current recipe
                let recipe_cals = await totalCalories(global.localRecipe);

                // Append new recipe
                global.localRecipe = { recipeName: recipeName, recipe: global.localRecipe, recipeCals: recipe_cals };
                global.userRecipes.push(global.localRecipe);

                // Prep object to store
                let values = {
                    username: username,
                    daily_foods: JSON.stringify(global.userDailyFoods),
                    recipes: JSON.stringify(global.userRecipes)
                };

                // Update user data
                backend_calls.updateUserData(values);
                console.log("DAILY: UPDATED USER DATA");

                // Reset Local Recipe
                global.localRecipe = [];
            }
        } catch (error) {
            console.log(error);
        }
    }

    async function listRecipes() {
        // Set flag to TRUE
        setDisplayRecipe(!displayRecipe);
        !displayRecipe ? onDisplayRecipe("Hide Recipes") : onDisplayRecipe("View Recipes");

        if (!displayRecipe) {
            // Retreive data from Dynamo Table
            await getUserData();

            let output = "";
            
            for (var i = 0; i < global.userRecipes.length; i++) {
                output += "\nRecipe #" + (i+1) + " Name: " + global.userRecipes[i]["recipeName"] + "\n";
                output += "Total Recipe Calories: " + global.userRecipes[i]["recipeCals"] + "\n"
                for (var j = 0; j < global.userRecipes[i]["recipe"].length; j++) {
                    output += "\n";
                    output += "Food #" + (j+1) + "\n";
                    output += "Name: " + global.userRecipes[i]["recipe"][j]["Name"] + "\n";
                    output += "Servings: " +global.userRecipes[i]["recipe"][j]["Servings"] + "\n";
                    output += "Calories: " + global.userRecipes[i]["recipe"][j]["Calories"] + "\n";
                    output += "Toital Calories: " + global.userRecipes[i]["recipe"][j]["TotalCals"] + "\n";
                }
            } 
            global.recipeDisplay = output;
        }     
    }

    async function listFoods() {
        // Set flag to TRUE
        setDisplayFood(!displayFood);
        !displayFood ? onDisplayFood("Hide Daily Foods") : onDisplayFood("View Daily Foods");

        if (displayFood) {
            // Retreive data from Dynamo Table
            await getUserData();

            let cal_count = await totalCalories(global.userDailyFoods);

            let output = "";
            output += "Total Calories: " + cal_count + "\n";
            for (var i = 0; i < global.userDailyFoods.length; i++) {
                output += "\n";
                output += "Food #" + (i+1) + "\n";
                output += "Name: " + global.userDailyFoods[i]["Name"] + "\n";
                output += "Servings: " + global.userDailyFoods[i]["Servings"] + "\n";
                output += "Calories: " + global.userDailyFoods[i]["Calories"] + "\n";
                output += "Toital Calories: " + global.userDailyFoods[i]["TotalCals"] + "\n";
            }
            global.foodDisplay = output;
        }
    }

    async function totalCalories(food_list) {
        // Retreive data from Dynamo Table
        let cal_count = 0;
        for (var i = 0; i < food_list.length; i++) {
            if (food_list[i]["TotalCals"] != null) {
                cal_count += food_list[i]["TotalCals"];
            }
        }
        return cal_count;
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
                        {scanned && <Text style={styles.text}>Servings: {servings}</Text>}
                        {scanned && <Text style={styles.text}>Calories: {totalCals}</Text>}
                    </View>
                    <View style={{ flex:2, background: "#000000" }}>
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
                            onPress={() => listRecipes()}>
                            <Text style={styles.buttonTitle}>{RecipeList}</Text>
                        </TouchableOpacity>
                        {displayRecipe && <Text style={styles.text}>{global.recipeDisplay}</Text>}
                    </View>
                    <View style={{ flex:1, background: "#000000" }}>
                        <TouchableOpacity
                            style={styles.button}
                            onPress={() => listFoods()}>
                            <Text style={styles.buttonTitle}>{DailyFoodList}</Text>
                        </TouchableOpacity>
                        {displayFood && <Text style={styles.text}>{global.foodDisplay}</Text>}
                    </View>
                    <View style={{ flex:1, background: "#000000" }}>
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
