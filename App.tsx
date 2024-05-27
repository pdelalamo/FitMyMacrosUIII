import * as React from 'react';
import Navigation from './navigation/Navigation';
import { RootSiblingParent } from 'react-native-root-siblings';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { clearMealsAtMidnight } from 'utils/MealUtils';
// import {
//   initConnection,
//   endConnection,
//   flushFailedPurchasesCachedAsPendingAndroid,
// } from 'react-native-iap';

function App() {
  useEffect(() => {
    // Schedule the meals of the day cleaning batch job when the app starts up
    clearMealsAtMidnight();
  }, []);
  // if (Platform.OS === 'android' || Platform.OS === 'ios') {
  //   useEffect(() => {
  //     const init = async () => {
  //       try {
  //         await initConnection();
  //         if (Platform.OS === 'android') {
  //           flushFailedPurchasesCachedAsPendingAndroid();
  //         }
  //       }
  //       catch (error) {
  //         console.error('Error occurred during initilization', error);
  //       }
  //     }
  //     init();
  //     return () => {
  //       endConnection();
  //     }
  //   }, [])
  // }
  return (<RootSiblingParent>
    <Navigation />
  </RootSiblingParent>);
}

export default App;
