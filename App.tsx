import * as React from 'react';
import Navigation from './navigation/Navigation';
import { RootSiblingParent } from 'react-native-root-siblings';


function App() {
  return (<RootSiblingParent>
    <Navigation />
  </RootSiblingParent>);
}

export default App;
