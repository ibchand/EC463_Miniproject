import React, { FunctionComponent, useCallback, useState } from 'react';
import { Button, SafeAreaView, Text } from 'react-native';

// import Amplify from "aws-amplify";
import config from "./src/aws-exports";
import { Auth } from "aws-amplify";

Auth.configure(config);



// const App: FunctionComponent = () => {
  
//   const [user, setUser] = useState()

//   const signin = useCallback(() => {
//     Auth.federatedSignIn({provider: "google"});
//   }, []);

//   return <SafeAreaView>
//     <>
//       <Text>Hello, {user?.name ?? "please login."}</Text>
//       {user === null && <Button title="Login with Google" onPress={signin} />}
//     </>
//   </SafeAreaView>
// }

export default function App()

// import { StatusBar } from 'expo-status-bar';
// import React from 'react';
// import { StyleSheet, Text, View } from 'react-native';

// export default function App() {
//   return (
//     <View style={styles.container}>
//       <Text>Open up App.js to start working on your app!</Text>
//       <StatusBar style="auto" />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fff',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
// });



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
            Auth.currentAuthenticatedUser({
                bypassCache: false
            }).then(user => global.username = user.username)
            .catch(err => console.log(err))

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
            const userData = await API.graphql(graphqlOperation(mutations.updateFood_table, { input: {username: global.username, daily_foods: global.daily_foods, recipes: global.recipes}}));
            console.log("Updated User data entry")
        } catch (error) {
            console.log(error);
        }
    }

        // Auth.currentAuthenticatedUser({
    //     bypassCache: false
    // }).then(user => console.log(user))
    // .catch(err => console.log(err))

    // console.log(global.username)


    
    async function createUserData() {
        try {
            // Auth.currentAuthenticatedUser({
            //     bypassCache: false
            // }).then(user => global.username = user.username)
            // .catch(err => console.log(err))

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
                },
                {
                    "UPC": global.upc,
                    "Calories": global.calories,
                    "Servings": servings,
                    "Total": totalCals
                }         
            ]
            // console.log(global.username);
            // console.log(daily_foods);
            // console.log(recipes);
            const userData = await API.graphql(graphqlOperation(mutations.createFood_table, { input: {username: username, daily_foods: daily_foods, recipes: recipes}}));
            // console.log("Created User data entry")
        } catch (error) {
            console.log(error);
        }
    }

                // if (global.recipeBOOL) {
            //     food_arr = [
            //         {
            //             "UPC": "1test",
            //             "Calories": "1test",
            //             "Servings": "1test",
            //             "Total": "1test"
            //         } 
            //     ]

            //     // console.log(food_arr);

            //     food_arr.push({"UPC": "2test", "Calories": "2test", "Servings": "2test", "Total": "2test"}); 
            //     // console.log("");
            //     // console.log(food_arr);
            // }

            // food = {
            //     "Name": global.foodname,
            //     "UPC": global.upc,
            //     "Calories": global.calories,
            //     "Servings": servings,
            //     "TotalCals": totalCals
            // }


    // async function getFood(upc) {
    //     try {
    //         url = "https://api.nal.usda.gov/fdc/v1/foods/search?api_key=" + "o6VxgV7qVhQ20G7XXTpYeCmfIm98tjJMwiF2qk9b" + "&query=" + upc;
    //         let response = await fetch(url);
    //         let responseJSON = await response.json();

    //         for (var i = 0; i < responseJSON["foods"].length; i++) {
    //             if (responseJSON["foods"][i]["gtinUpc"] == upc) {
    //                 for (var j = 0; j < responseJSON["foods"][0]["foodNutrients"].length; j++) {
    //                     if (responseJSON["foods"][0]["foodNutrients"][j]["nutrientId"] == "1008") {
    //                         global.foodname = responseJSON["foods"][0]["description"];
    //                         global.calories = responseJSON["foods"][0]["foodNutrients"][j]["value"];
    //                         // console.log("CALORIES: " + global.calories);
    //                     }
    //                 }
    //             }
    //         }

    //         setFood({
    //             "Name": global.foodname,
    //             "UPC": global.upc,
    //             "Calories": global.calories,
    //             "Servings": servings,
    //             "TotalCals": totalCals
    //         });
    //         console.log("GETFOOD: Set currentFood -");
    //         console.log(currentFood);

    //         if (global.recipeBOOL) {
    //             localRecipe.push(currentFood);
    //             console.log("GETFOOD: Added currentFood to localRecipe -");
    //             console.log(localRecipe);
    //         }
    //     } catch (error) {
    //         console.log(error);
    //     }
    // }


        // this.onChangeServings(input_servings, () => { console.warn(this.onChangeServings.value) });
        // this.onChangeCals(total, () => { console.warn(this.onChangeCals.value) });
        // this.setFood({"Name": global.foodname, "UPC": global.upc, "Calories": global.calories, "Servings": input_servings, "TotalCals": total}, () => { console.warn(this.setFood) });
        // onChangeCals(total);
        // setFood({
        //   "Name": global.foodname,
        //   "UPC": global.upc,
        //   "Calories": global.calories,
        //   "Servings": input_servings,
        //   "TotalCals": total
        // });


        // values = '{ "username": ' + JSON.stringify(username) + ', "daily_foods": ' + JSON.stringify(global.userDailyFoods) + ', "recipes": ' + JSON.stringify(global.userRecipes) + '}'
                // values = {
                //     username: username,
                //     daily_foods: global.userDailyFoods,
                //     recipes: global.userRecipes
                // };


                // values = '{ "username": ' + JSON.stringify(username) + ', "daily_foods": ' + JSON.stringify(global.userDailyFoods) + ', "recipes": ' + JSON.stringify(global.userRecipes) + '}'
            // values = {
            //     username: username,
            //     daily_foods: userDailyFoods,
            //     recipes: global.userRecipes
            // };

            console.log("Failed, instead of appending just pushing new one");
            // userDailyFoods = [];
            // userDailyFoods.push(global.currentFood);
            // var values = {
            //     username: username,
            //     daily_foods: userDailyFoods,
            //     recipes: global.userRecipes
            // };

            // console.log(values);

            // backend_calls.updateUserData(values);



            async function testAPI() {

                // df = [{
                //     "Name": "1foodname",
                //     "UPC": "1foodupc",
                //     "Calories": "1cals",
                //     "Servings": "1servings",
                //     "TotalCals": "1totalcals"
                // }]
        
                // rep = [
                //     [
                //         {
                //             "Name": "1foo dname",
                //             "UPC": "1foodupc",
                //             "Calories": "1cals",
                //             "Servings": "1servings",
                //             "TotalCals": "1totalcals"
                //         },
                //         {
                //             "Name": "2fo odname",
                //             "UPC": "2foodupc",
                //             "Calories": "2cals",
                //             "Servings": "2servings",
                //             "TotalCals": "2totalcals"
                //         }
                //     ],
                //     [
                //         {
                //             "Name": "3foodname",
                //             "UPC": "3foodupc",
                //             "Calories": "3cals",
                //             "Servings": "3servings",
                //             "TotalCals": "3totalcals"
                //         },
                //         {
                //             "Name": "4foodname",
                //             "UPC": "4foodupc",
                //             "Calories": "4cals",
                //             "Servings": "4servings",
                //             "TotalCals": "4totalcals"
                //         }
                //     ]
                // ]
                // console.log("HERE")
                // // console.log(df);
                // // console.log(JSON.stringify(df))
        
                // // values = '{ "username": ' + JSON.stringify(username) + ', "daily_foods": ' + JSON.stringify(df) + ', "recipes": ' + JSON.stringify(rep) + '}'
        
                // values = {
                //     username: username,
                //     daily_foods: JSON.stringify(df),
                //     recipes: JSON.stringify(rep)
                // };
        
                // console.log(values.username)
                // console.log(values.daily_foods)
                // console.log(values.recipes)
        
                // backend_calls.updateUserData(values);
        
                const userData = await backend_calls.getUserData(username);
                global.userRecipes = JSON.parse(userData["data"]["getFood_table"]["recipes"]);
                global.userDailyFoods = JSON.parse(userData["data"]["getFood_table"]["daily_foods"]);
        
                console.log(global.userRecipes)
                console.log(global.userDailyFoods)
        
            }