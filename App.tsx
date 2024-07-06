import * as React from 'react';
import Navigation from './navigation/Navigation';
import { RootSiblingParent } from 'react-native-root-siblings';
import { useEffect, useState } from 'react';
import { AppState, Platform } from 'react-native';
import { checkAndClearMeals, clearMealsAtMidnight } from 'utils/MealUtils';

function App() {

  const [appState, setAppState] = useState(AppState.currentState);


  useEffect(() => {
    clearMealsAtMidnight();
    const subscription = AppState.addEventListener('change', handleAppStateChange);

    // Initial check when the app is launched
    checkAndClearMeals();

    return () => {
      subscription.remove();
    };
  }, []);

  const handleAppStateChange = async (nextAppState: any) => {
    if (appState.match(/inactive|background/) && nextAppState === 'active') {
      await checkAndClearMeals();
    }
    setAppState(nextAppState);
  };

  return (<RootSiblingParent>
    <Navigation />
  </RootSiblingParent>);
}

export default App;
