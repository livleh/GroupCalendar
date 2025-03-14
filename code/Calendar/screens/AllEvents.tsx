import { Modal, StyleSheet, Text, View, Image, Dimensions,TouchableOpacity, FlatList, SafeAreaView, Alert, ScrollView } from 'react-native';
import * as React from 'react';
import { Event, User} from "../services/models";
import HalfLengthTile from '../components/HalfLengthTile';
import TopNavigation from '../components/TopNavigation';
import {TimelineEventProps, CalendarUtils} from 'react-native-calendars';
import { useCallback, useEffect, useState } from 'react';
import { Ionicons as Icon } from '@expo/vector-icons';
import { deleteEvent, getCurrentUser, getDBConnection, getEvents, getUsers } from '../services/db-service';
import { useFocusEffect } from '@react-navigation/native';
import FullLengthTile from '../components/FullLengthTile';
import {X} from "react-native-feather";
//import Modal from 'react-native-modal/dist/modal';

export function getTimeString(currentEvent: any) {
  if(currentEvent == undefined){
    return " ";
  }
  if(currentEvent.time.data == undefined){
    return " ";
  }
  if(currentEvent.time.data.allDay == 1){
    return "All day"
  }
  if(currentEvent.time.data.startTime != undefined && currentEvent.time.data.endTime != undefined){
    return (new Date((currentEvent.date.data! + currentEvent.time.data!.startTime) * 1000)).toLocaleTimeString().substring(0, 5) +  " - " + (new Date((currentEvent.date.data! + currentEvent.time.data!.endTime) * 1000)).toLocaleTimeString().substring(0, 5);
  }
  return " ";
}

function shuffleExceptFirst(arr:any) {
  // Keep the first element intact
  let firstElement = arr[0];

  // Shuffle the rest of the array
  for (let i = arr.length - 1; i > 1; i--) {
      let j = Math.floor(Math.random() * (i - 1)) + 1; // Ensure j is never 0
      [arr[i], arr[j]] = [arr[j], arr[i]];
  }

  // Restore the first element
  arr[0] = firstElement;
  return arr;
}




function convertSecondsToTime(seconds:number) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

function convertIsoToDateA(isoString: number) {
  // Create a new Date object using the ISO string
  const date = new Date(isoString*1000);

  // Define an array of month names
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  // Extract the day, month and year from the date object
  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();

  // Return the formatted date string
  return `${day}. ${month} ${year}`;
}

function convertIsoToDateB(isoString: number) {
  // Create a new Date object using the ISO string
  const date = new Date(isoString*1000);

  // Define an array of month names
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  // Extract the day, month and year from the date object
  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();

  // Return the formatted date string
  return `${day}. ${month} ${year}`;
}


const EmojiIconB = ({emoji, color}: any) => {
  return(
    <View style={{backgroundColor:color,width:20,height:20, justifyContent:'center', alignItems:'center',borderRadius:8, marginRight:5}}>
      <Icon name={emoji} size={15}/>
    </View>
  )
}


const TemplateRowB = ({emoji, text}: any) => {
  return(
      <View style={{flexDirection:'row', alignItems: 'center', marginTop:5}}>
        <EmojiIconB emoji={emoji} color={'#34c11d'}/>
        <Text numberOfLines={1} ellipsizeMode="tail" style={{marginLeft:5, marginRight:15, color:'#7c7c7c', fontSize: 15}} >{text}</Text>
      </View>
    )
}

export const EmojiIconB2 = ({emoji, color}: any) => {
  return(
    <View style={{backgroundColor:color,width:25,height:25, justifyContent:'center', alignItems:'center',borderRadius:8, marginRight:5}}>
      <Icon name={emoji} size={20}/>
    </View>
  )
}


export const TemplateRowB2 = ({emoji, text}: any) => {
  return(
    <View style={{flexDirection:'row', marginTop:5}}>
      <EmojiIconB2 emoji={emoji} color={'#34c11d'}/>
      <Text numberOfLines={3} ellipsizeMode="tail" style={{marginLeft:5, marginRight:15, color:'#7c7c7c', fontSize: 20}} >{text}</Text>
    </View>
  )
}

  const windowWidth = Dimensions.get('window').width;
  const marginwindowWidth = 0.0125*windowWidth;


const ItemB = ({item, onPress}: any) => (
  <TouchableOpacity onPress={onPress} style={{marginVertical:10}}>
    <FullLengthTile title={item.title} profiles={item.participants.data} >
    { /* green big */ }
      { (item.date.flag == 0) && item.date.data && (<TemplateRowB emoji={'ios-calendar-sharp'} text={convertIsoToDateB(item.date.data)} />)}
      { (item.time.flag == 0) && (item.time.data) && !(item.time.data.startTime == 0 && item.time.data.endTime == 0 && item.time.data.allDay == 0) && (<TemplateRowB emoji={'ios-time-sharp'} text={`${(item.time.data.allDay==1) ? ('All day') : (convertSecondsToTime(item.time.data.startTime) +" - "+ convertSecondsToTime(item.time.data.endTime))}`}/>)}
      { (item.location.flag == 0) && item.location.data && (<TemplateRowB emoji={'ios-location-sharp'} text={item.location.data} />)}
      { (item.note.flag == 0) && item.note.data && (<TemplateRowB emoji={'ios-document-text-sharp'} text={item!.note.data}/>)}

      <View style={{flexDirection:'row', alignItems:'center',marginTop:5}}>
        { /* yellow small */ }
        { (item.time.flag == 1) && (<EmojiIconB emoji={'ios-time-sharp'} color={'#FF9933'} />)}
        { (item.date.flag == 1) && (<EmojiIconB emoji={'ios-calendar-sharp'} color={'#FF9933'} />)}
        { (item.location.flag == 1) && (<EmojiIconB emoji={'ios-location-sharp'} color={'#FF9933'} />)}
        { (item.participants.flag == 1) && (<EmojiIconB emoji={'ios-person-sharp'} color={'#FF9933'} />)}
        { (item.note.flag == 1) && (<EmojiIconB emoji={'ios-document-text-sharp'} color={'#FF9933'} />)}
      </View>
    </FullLengthTile>
  </TouchableOpacity>
);

export default function AllEvents({navigation}: any) {
    const windowWidth = Dimensions.get('window').width;
    const windowWidth45 = windowWidth * 0.45
    const halfwindowWidth45 = windowWidth45 * 0.5
    const [myArray, setMyArray] = useState<Event[]>([]);

    useFocusEffect(
      React.useCallback(() => {
        const db = getDBConnection()
        getCurrentUser(db).then((user: User)=>{
          getEvents(db,user.id,0).then((events: Event[]) => {
            setMyArray(events.sort((a, b) => {
              if (a.date.data == undefined) {
                if(b.date.data == undefined){
                  return 0
                }else{
                  return 1
                }
              }else if(b.date.data == undefined){
                if(a.date.data == undefined){
                  return 0
                }else{
                  return -1
                }
              }else{
                return a.date.data - b.date.data
              }
              
            })
           ) })
        })}, [])
    );

      
    interface TempEvent extends Event {
      participantNames: string,
    }
    const [modalVisible, setModalVisible] = useState(false);
    const [modalVisible2, setModalVisible2] = useState(false);
    const [currentEvent, setCurrentEvent] = useState<TempEvent>();
    const openModal = (e: TempEvent) => {
      setCurrentEvent(e);
      setModalVisible(true);
    }
    const db = getDBConnection();
    const itemPressed = useCallback(async (item: any) => {
      const currentEvent = item;
      const pps = currentEvent!.participants.data == undefined? [] : await getUsers(db, currentEvent!.participants.data);
      var ppsString = "";
      for(var i in pps) {
        ppsString += pps[i].name + ", "
      }
      ppsString = ppsString.substring(0, ppsString.length-3);
      openModal({...currentEvent!, participantNames: ppsString});
      //navigation.navigate("NewEntry", {id: item.id, isTemplate: 0});
    }, []);

    const renderItem = ({item}: {item: Event}) => {
      return (<ItemB
          item={item}
          onPress={() => {
            console.log(item)
            itemPressed(item);
            //navigation.navigate('NewEntry', {id: item.id, isTemplate: item.isTemplate}), 
            {/*{
              event: item
            }*/}
          }}
        />);
    };
    

    return (
      <View style={{ flex: 1, backgroundColor:'#ffffff'}}>
        <TopNavigation navigation={navigation} title={'All Events'} color={'#000000'} />
        <SafeAreaView style={{marginVertical:'5%', flex:1}}>
        {myArray.length !== 0 && <FlatList
            data={myArray}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            numColumns={1}
            style={{marginLeft:marginwindowWidth}}
          />}
        </SafeAreaView>
        <Modal 
          visible={modalVisible}
          //onBackdropPress={() => setModalVisible(false)}
          //backdropOpacity={0.5}
          transparent={true}
        >
          <View style={{padding: 20, flex: 1, backgroundColor: 'white'}}>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <X color={"black"} height={40} width={30} />
            </TouchableOpacity>
            <Text style={{textAlign: 'center', fontSize: 25, fontWeight: 'bold', marginTop:10}}>{currentEvent == undefined? " " : currentEvent.title}</Text>
            <ScrollView style={{flex: 1, backgroundColor: 'white', marginTop: 30}}>
              { /* green big */ }
              { currentEvent != undefined && (currentEvent!.date.flag == 0) && currentEvent!.date.data && (<TemplateRowB2 emoji={'ios-calendar-sharp'} text={convertIsoToDateB(currentEvent!.date.data)} />)}
              { currentEvent != undefined &&(currentEvent!.time.flag == 0) && (currentEvent!.time.data) && !(currentEvent!.time.data.startTime == 0 && currentEvent!.time.data.endTime == 0 && currentEvent!.time.data.allDay == 0) && (<TemplateRowB2 emoji={'ios-time-sharp'} text={`${(currentEvent!.time.data.allDay==1) ? ('All day') : (convertSecondsToTime(currentEvent!.time.data.startTime) +" - "+ convertSecondsToTime(currentEvent!.time.data.endTime))}`}/>)}
              { currentEvent != undefined &&(currentEvent!.location.flag == 0) && currentEvent!.location.data && (<TemplateRowB2 emoji={'ios-location-sharp'} text={currentEvent!.location.data} />)}
              { currentEvent != undefined && (currentEvent!.note.flag == 0) && currentEvent!.note.data && (<TemplateRowB2 emoji={'ios-document-text-sharp'} text={currentEvent!.note.data}/>)}
              { /* yellow small */ }
              <ScrollView horizontal={true} style={{flexDirection: 'row', marginTop: 5}}>
                { currentEvent != undefined &&(currentEvent!.time.flag == 1) && (<EmojiIconB2 emoji={'ios-time-sharp'} color={'#FF9933'} />)}
                { currentEvent != undefined &&(currentEvent!.date.flag == 1) && (<EmojiIconB2 emoji={'ios-calendar-sharp'} color={'#FF9933'} />)}
                { currentEvent != undefined &&(currentEvent!.location.flag == 1) && (<EmojiIconB2 emoji={'ios-location-sharp'} color={'#FF9933'} />)}
                { currentEvent != undefined &&(currentEvent!.participants.flag == 1) && (<EmojiIconB2 emoji={'ios-person-sharp'} color={'#FF9933'} />)}
                { currentEvent != undefined &&(currentEvent!.note.flag == 1) && (<EmojiIconB2 emoji={'ios-document-text-sharp'} color={'#FF9933'} />)}
              </ScrollView>
            </ScrollView>
            <TouchableOpacity onPress={() => {setModalVisible(false); navigation.navigate("NewNewEntry", {currentEvent: currentEvent, isTemplate: 0, editing: true, toptitle:'Edit Event'})}} style={{backgroundColor: "black", borderRadius: 20, width: 200, alignSelf: 'center', marginBottom: 10}}><Text style={{color: 'white', textAlign: 'center', fontSize: 17, padding: 10}}>Edit event</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => {setModalVisible2(true)}} style={{backgroundColor: "red", borderRadius: 20, width: 200, alignSelf: 'center', marginBottom: 30}}><Text style={{color: 'white', textAlign: 'center', fontSize: 17, padding: 10}}>Delete event</Text></TouchableOpacity>
          </View>
        </Modal>
        <Modal
          visible={modalVisible2}
          //onBackdropPress={() => setModalVisible2(false)}
          //backdropOpacity={0.7}
          transparent={true}
        >
          <View style ={{flex:1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center'}}>
            <View style={{backgroundColor: "white", borderRadius: 10, padding: 20, marginHorizontal: 50}}>
              <Text>Do you really want to delete event "{currentEvent?.title}"?</Text>
              <View style={{flexDirection: "row", marginTop: 20}}>
                <TouchableOpacity style={{flex: 1, borderColor: "lightgrey", borderRightWidth: 1}} onPress={() => setModalVisible2(false)}><Text style={{textAlign:"center", fontSize: 20}}>Cancel</Text></TouchableOpacity>
                <TouchableOpacity style={{flex: 1, borderColor: "lightgrey", borderLeftWidth: 1}} onPress={() => {deleteEvent(db, currentEvent!.id); setModalVisible2(false); setModalVisible(false); setMyArray(myArray.filter((element: Event) => element.id != currentEvent!.id))}}><Text style={{textAlign:"center", fontSize: 20}}>Confirm</Text></TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    );
  }
