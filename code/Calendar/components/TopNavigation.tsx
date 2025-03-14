import * as React from 'react';
import {Text, View, TouchableOpacity } from 'react-native';
import * as Icon from "react-native-feather";
import { useEffect, useState } from 'react'


const TopNavigation = ({navigation, title, color}: any) => {
  const [canGoBack, setCanGoBack] = useState(navigation.canGoBack());

    useEffect(() => {
      const unsubscribe = navigation.addListener('state', () => {
        setCanGoBack(navigation.canGoBack());
      });
  
      return unsubscribe;
    }, [navigation]);

    return(
      <View style={{flexDirection:'row', width:'90%',paddingTop:50,justifyContent:'space-between',marginHorizontal:'5%'}}>
        <View>
          {navigation.canGoBack() && (
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon.ArrowLeft color={color} height={40} width={30} />
          </TouchableOpacity>)
          }
          {!navigation.canGoBack() &&
            <Icon.ArrowLeft color={'rgba(0,0,0,0)'} height={40} width={30} />
          }
        </View>
        <Text style={{color:color,fontSize:24, fontWeight:'500'}}>{title}</Text>
        <TouchableOpacity onPress={() => navigation.openDrawer()}>
          <Icon.Menu color={color} height={40} width={30} />
        </TouchableOpacity>
      </View>
    )
  }

export default TopNavigation