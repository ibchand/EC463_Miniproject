import 'react-native-gesture-handler';
import React, { FunctionComponent, useCallback, useEffect, useState } from 'react'
import { Button, SafeAreaView, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import { loginScreen, homeScreen } from './src/screens'
import {decode, encode} from 'base-64'

// import { withAuthenticator } from 'aws-amplify-react-native'

// import Amplify from "aws-amplify";
import config from "./src/aws-exports";
import { Auth } from "aws-amplify";

if (!global.btoa) {  global.btoa = encode }
if (!global.atob) { global.atob = decode }

Auth.configure(config);

const Stack = createStackNavigator();

function App() {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)

  return (
    <NavigationContainer>
      <Stack.Navigator>
        { user ? (
          <Stack.Screen name="Home" component={homeScreen}>
            {props => <loginScreen {...props} extraData={user} />}
          </Stack.Screen>
        ) : (
          <>
            <Stack.Screen name="Login" component={loginScreen} />
            <Stack.Screen name="Home" component={homeScreen} options={{ headerLeft: null, gestureEnabled: false }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App


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

// export default function App()
