import isEmpty from 'lodash/isEmpty';
import React, {useCallback} from 'react';
import {StyleSheet, Alert, View, Text, TouchableOpacity, Button} from 'react-native';
import { getDBConnection, getEvents, getUsers } from './services/db-service';


interface ItemProps {
  item: any;
  navigation: any;
}

const AgendaItem = (props: any) => {
  const {item, navigation, openModal} = props;

  const buttonPressed = useCallback(() => {
    Alert.alert('Show me more');
  }, []);

  const itemPressed = useCallback(async () => {
    const db = getDBConnection();
    const events = await getEvents(db, globalThis.currentUser, 0);
    const currentEvent = events.find((value, index, obj) => {return (value.id == item.id)});
    const pps = currentEvent!.participants.data == undefined? [] : await getUsers(db, currentEvent!.participants.data);
    var ppsString = "";
    for(var i in pps) {
      ppsString += pps[i].name + ", "
    }
    ppsString = ppsString.substring(0, ppsString.length-3);
    openModal({...currentEvent!, participantNames: ppsString});
    //navigation.navigate("NewEntry", {id: item.id, isTemplate: 0});
  }, []);

  if (isEmpty(item)) {
    return (
      <View style={styles.emptyItem}>
        <Text style={styles.emptyItemText}>No Events Planned Today</Text>
      </View>
    );
  }

  function Location() {
    if(item.location != undefined){
      return(<Text>{item.location}</Text>)
    }
    return;
  }

  return (
    <TouchableOpacity onPress={itemPressed} style={{...styles.item, marginBottom: 5, marginLeft: 20, marginRight: 20, backgroundColor: item.color == undefined? 'lightgrey' : item.color, borderRadius: 10}}>
      <View>
        <Text style={styles.itemTitleText}>{item.title}</Text>
        <Text style={styles.itemHourText}>{item.start == item.end? 'All day' : item.start + ' - ' + item.end}</Text>
        <Location/>
      </View>
    </TouchableOpacity>
  );
};

export default React.memo(AgendaItem);


const styles = StyleSheet.create({
  item: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'lightgrey',
    flexDirection: 'row'
  },
  itemHourText: {
    color: 'black',
    marginLeft: 4
  },
  itemDurationText: {
    color: 'black',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4
  },
  itemTitleText: {
    color: 'black',
    marginLeft: 4,
    fontWeight: 'bold',
    fontSize: 16
  },
  itemButtonContainer: {
    flex: 1,
    alignItems: 'flex-end'
  },
  emptyItem: {
    paddingLeft: 20,
    height: 52,
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'lightgrey'
  },
  emptyItemText: {
    color: 'lightgrey',
    fontSize: 14
  }
});