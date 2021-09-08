import React, { useState } from 'react'
import { Image, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import styles from './styles';

import { Auth } from "aws-amplify";

export default function loginScreen({navigation}) {
    // const [email, setEmail] = useState('')
    // const [password, setPassword] = useState('')

    const onSignInPress = () => {
        Auth.federatedSignIn({provider: 'Google'})
        navigation.navigate('Home')
    }

    return (
        <View style={styles.container}>
            <KeyboardAwareScrollView
                style={{ flex: 1, width: '100%' }}
                keyboardShouldPersistTaps="always">
                <TouchableOpacity
                    style={styles.button}
                    onPress={() => onSignInPress()}>
                    <Text style={styles.buttonTitle}>Log in with Google</Text>
                </TouchableOpacity>
            </KeyboardAwareScrollView>
        </View>
    )
}
