import * as React from 'react';
import Navigation from './navigation/Navigation';
import { RootSiblingParent } from 'react-native-root-siblings';
import { useEffect, useState } from 'react';
import { AppState, Platform } from 'react-native';
import { checkAndClearMeals, clearMeals, clearMealsAtMidnight } from 'utils/MealUtils';
import schedule from 'node-schedule';

function App() {

  const [appState, setAppState] = useState(AppState.currentState);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', handleAppStateChange);

    // Initial check when the app is launched
    checkAndClearMeals();

    // Set up periodic check every minute
    const id = setInterval(checkAndClearMeals, 60000);
    setIntervalId(id);

    // Schedule the job to clear meals at midnight if the app is active
    const rule = new schedule.RecurrenceRule();
    rule.hour = 0;
    rule.minute = 0;
    const job = schedule.scheduleJob(rule, clearMeals);

    return () => {
      subscription.remove();
      if (intervalId) {
        clearInterval(intervalId);
      }
      if (job) {
        job.cancel();
      }
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
