import 'react-native-gesture-handler';
import * as Icon from "react-native-feather";
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, useFocusEffect } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';

import LandingPage from './screens/LandingPage'
import AllEvents from './screens/AllEvents';
import Templates from './screens/Templates';
import TemplatesB from './screens/TemplatesB';
import OpenEvents from './screens/OpenEvents';
import Settings from './screens/Settings';
import Profile from './screens/Profile';
import CustomDrawer from './components/CustomDrawer';
import NewEntry from './components/NewEntry'; //maybe move it to screens
import DBDebug from './screens/DBDebug';
import { useCallback, useEffect, useState } from 'react';
import {getDBConnection, initDefaultData } from './services/db-service';
import React from 'react';
import TemplateChooser from './screens/TemplateChooser';
import TemplateOverview from './screens/TemplateOverview';
import TemplateSelection from './screens/TemplateSelection';
import NewNewEntry from './screens/NewNewEntry';

declare global {
  var currentUser: string;
}

const Drawer = createDrawerNavigator();
//const Stack = createNativeStackNavigator();

const App = () => {
  
  globalThis.currentUser = "a34i1";
  
  useEffect(() => {
    const db = getDBConnection();
    initDefaultData(db);
  }, []);


  return (
    <NavigationContainer>
      <Drawer.Navigator backBehavior="history" drawerContent={props => <CustomDrawer {...props} />} initialRouteName='Calendar' screenOptions={{drawerStyle:{borderRadius:20}, headerShown: false, drawerType:'front', drawerActiveBackgroundColor:'#ffffff', drawerActiveTintColor:'#000000',drawerInactiveTintColor:'#ffffff', drawerItemStyle:{borderRadius:23, paddingLeft:6, marginBottom:15} ,drawerLabelStyle: {fontSize:18, fontWeight:'600'}}}>
        <Drawer.Screen name="Profile" options={{drawerItemStyle: {display:'none'}}} component={Profile} />
        <Drawer.Screen name="NewNewEntry" options={{drawerItemStyle: {display:'none'}}} component={NewNewEntry} />
        <Drawer.Screen name="Template Selection" options={{drawerItemStyle: {display:'none'}}} component={TemplateSelection} />
        <Drawer.Screen name="Calendar" component={LandingPage} options={{drawerIcon: ({color}) => (<Icon.Calendar stroke={color}/>)}}/>
        <Drawer.Screen name="All Events" component={AllEvents} options={{drawerIcon: ({color}) => (<Icon.Menu stroke={color}/>)}}/>
        <Drawer.Screen name="Open Events" component={OpenEvents} options={{drawerIcon: ({color}) => (<Icon.Users stroke={color}/>)}}/>
        <Drawer.Screen name="Templates" options={{drawerIcon: ({color}) => (<Icon.PlusSquare stroke={color}/>)}} component={TemplateOverview} />
        {/* <Drawer.Screen name="Templates" component={TemplateChooser} options={{drawerIcon: ({color}) => (<Icon.PlusSquare stroke={color}/>)}}/> */}
        <Drawer.Screen name="Settings"  component={Settings} options={{drawerIcon: ({color}) => (<Icon.Settings stroke={color}/>)}}/>
        <Drawer.Screen name="DB Debug" component={DBDebug} options={{drawerIcon: ({color}) => (<Icon.Database stroke={color}/>)}}/>
      </Drawer.Navigator>
    </NavigationContainer>
  );
}

export default App;



