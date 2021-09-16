import React, { useState, useEffect } from 'react'
import { TextInput, StyleSheet, Button, TouchableOpacity, Text, View } from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import styles from './styles';

import { Auth, API, graphqlOperation } from "aws-amplify";

// import { BarCodeScanner } from 'expo-barcode-scanner';

// import { Food } from '../../components/food.js'

// import * as backend_calls from '../../api/backend_calls';

// import * as mutations from "../../graphql/mutations";
// import * as queries from "../../graphql/queries";



export default function recipeScreen({props, navigation}) {
    const [servings, setServings] = React.useState("Servings");


    Auth.currentAuthenticatedUser({
        bypassCache: false
    }).then(user => setUsername(user.username))
    .catch(err => console.log(err))

    data = queries.listUserData
    console.log(data);

    return (

        <View style = {styles.container}>
            <KeyboardAwareScrollView
                    style={{ flex: 1, width: '100%' }}
                    keyboardShouldPersistTaps="always">
                <View style={{ flex:1 }}>
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

