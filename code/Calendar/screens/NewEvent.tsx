import { StyleSheet, Text, View, Image, SafeAreaView } from 'react-native';
import { NewEntry } from '../components/Index';
import TopNavigation from '../components/TopNavigation';
import React = require('react');

export default function AllEvents({navigation}: any) {
  
    return (
      <View style={styles.container}>
        <TopNavigation navigation={navigation} title={'Agenda'} color={'#000000'}/>
        <SafeAreaView style={{marginVertical:'5%', flex:1}}>
          <NewEntry/>
        </SafeAreaView>
      </View>
    );
  }

const styles = StyleSheet.create({
  container: {
    flex: 1,
    color: '#ffffff'
  },
});