import { Modal, StyleSheet, Text, View, Image, Dimensions,TouchableOpacity, FlatList, SafeAreaView, Alert, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import * as React from 'react';
import { Event, User, EventRelation, FriendRelation, defaultEvents, defaultFriendRelations, defaultUsers, PerformanceData } from "../services/models";
import FullLengthTile from '../components/FullLengthTile';
import TopNavigation from '../components/TopNavigation';
import {TimelineEventProps, CalendarUtils} from 'react-native-calendars';
import { useCallback, useEffect, useState } from 'react';
import { Ionicons as Icon } from '@expo/vector-icons';
import { getDBConnection, getEvents, getPerformanceData, updatePerformanceDataTime, updatePerformanceDataScroll, getTemplateState, getCurrentUser, deleteEvent, getUsers} from '../services/db-service';
import { useFocusEffect } from '@react-navigation/native';
import { ScrollView } from 'react-native-virtualized-view';
import { scrollTo } from 'react-native-reanimated';
import HalfLengthTile from '../components/HalfLengthTile';
import {useRef} from "react";
//import Modal from 'react-native-modal/dist/modal';
import { EmojiIconB2, TemplateRowB2, getTimeString } from './AllEvents';
import { X } from 'react-native-feather';


function prepend(value:any, array:any) {
  var newArray = array.slice();
  newArray.unshift(value);
  return newArray;
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
const EmojiIconA = ({emoji, color}: any) => {
  return(
    <View style={{backgroundColor:color, width:4.5 * marginwindowWidth, height:4.5 * marginwindowWidth, justifyContent:'center', alignItems:'center',borderRadius:8, marginRight:5}}>
      <Icon name={emoji} style={{fontSize:2.5 * marginwindowWidth}}/>
    </View>
  )
}

const EmojiIconB = ({emoji, color}: any) => {
  return(
    <View style={{backgroundColor:color,width:20,height:20, justifyContent:'center', alignItems:'center',borderRadius:8, marginRight:5}}>
      <Icon name={emoji} size={15}/>
    </View>
  )
}

const TemplateRowA = ({emoji, text}: any) => {
  return(
      <View style={{flexDirection:'row', alignItems:'center',marginTop:5, }}>
        <EmojiIconA emoji={emoji} color={'#34c11d'} />
        <Text numberOfLines={1} ellipsizeMode="tail" style={{marginLeft:5, marginRight:15, color:'#7c7c7c', fontSize: 3 * marginwindowWidth}} >{text}</Text>
      </View>)
   }

const TemplateRowB = ({emoji, text}: any) => {
  return(
      <View style={{flexDirection:'row', alignItems:'center',marginTop:5}}>
        <EmojiIconB emoji={emoji} color={'#34c11d'}/>
        <Text numberOfLines={1} ellipsizeMode="tail" style={{marginLeft:5, marginRight:15, color:'#7c7c7c'}} >{text}</Text>
      </View>)
   }

   const windowWidth = Dimensions.get('window').width;
   const marginwindowWidth = 0.0115*windowWidth;


   const ItemA = ({item, onPress}: any) => (
    <TouchableOpacity onPress={onPress} style={{marginVertical:marginwindowWidth}}>
      <HalfLengthTile title={item.title} profiles={item.participants.data} >
      <View>
      { /* green big */ }
        { (item.date.flag == 0) && item.date.data && (<TemplateRowA emoji={'ios-calendar-sharp'} text={convertIsoToDateA(item.date.data)} />)}
        { (item.time.flag == 0) && (item.time.data) && !(item.time.data.startTime == 0 && item.time.data.endTime == 0 && item.time.data.allDay == 0) && (<TemplateRowA emoji={'ios-time-sharp'} text={`${(item.time.data.allDay==1) ? ('All day') : (convertSecondsToTime(item.time.data.startTime) +" - "+ convertSecondsToTime(item.time.data.endTime))}`}/>)}
        { (item.location.flag == 0) && item.location.data && (<TemplateRowA emoji={'ios-location-sharp'} text={item.location.data} />)}
        { (item.note.flag == 0) && item.note.data && (<TemplateRowA emoji={'ios-document-text-sharp'} text={item.note.data}/>)}
        <View style={{flexDirection:'row', alignItems:'center',marginTop:5}}>
          { /* yellow small */ }
          { (item.time.flag == 1) && (<EmojiIconA emoji={'ios-time-sharp'} color={'#FF9933'} />)}
          { (item.date.flag == 1) && (<EmojiIconA emoji={'ios-calendar-sharp'} color={'#FF9933'} />)}
          { (item.location.flag == 1) && (<EmojiIconA emoji={'ios-location-sharp'} color={'#FF9933'} />)}
          { (item.participants.flag == 1) && (<EmojiIconA emoji={'ios-person-sharp'} color={'#FF9933'} />)}
          { (item.note.flag == 1) && (<EmojiIconA emoji={'ios-document-text-sharp'} color={'#FF9933'} />)}
        </View>
        </View>
      </HalfLengthTile>
    </TouchableOpacity>
  );

const ItemB = ({item, onPress}: any) => (
  <TouchableOpacity onPress={onPress} style={{marginVertical:10}}>
    <FullLengthTile title={item.title} profiles={item.participants.data} >
    { /* green big */ }
      { (item.date.flag == 0) && item.date.data && (<TemplateRowB emoji={'ios-calendar-sharp'} text={convertIsoToDateB(item.date.data)} />)}
      { (item.time.flag == 0) && (item.time.data) && !(item.time.data.startTime == 0 && item.time.data.endTime == 0 && item.time.data.allDay == 0) && (<TemplateRowB emoji={'ios-time-sharp'} text={`${(item.time.data.allDay==1) ? ('All day') : (convertSecondsToTime(item.time.data.startTime) +" - "+ convertSecondsToTime(item.time.data.endTime))}`}/>)}
      { (item.location.flag == 0) && item.location.data && (<TemplateRowB emoji={'ios-location-sharp'} text={item.location.data} />)}
      { (item.note.flag == 0) && item.note.data && (<TemplateRowB emoji={'ios-document-text-sharp'} text={item.note.data}/>)}

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

export default function TemplateSelection({route, navigation}: any) {
    const windowWidth45 = windowWidth * 0.45
    const halfwindowWidth45 = windowWidth45 * 0.5
    const [templateVariant, setTemplateVariant] = useState<number|undefined>(undefined)
    const [myArray, setMyArray] = useState([]); 
    let yPrev = 0
    

    useFocusEffect(
      React.useCallback(() => {
        const db = getDBConnection()
        getCurrentUser(db).then((user: User)=>{
          getEvents(db,user.id,1).then((templates: Event[]) => {
            const prependedTemplates = prepend({
              id: 'DUMMYEvent',
              isTemplate: 0,
              creatorId: "",
              title: '',
              date:{
                flag: 0,
                data: undefined
              },
              time: {
                flag: 0,
                data: undefined
              },
              location: {
                flag: 0,
                data: undefined
              },
              participants: {
                flag: 0,
                data: undefined
              },
              colorTag: "#d3d3d3",
              note: {
                flag: 0,
                data: undefined
              }
            },templates);
            setMyArray(shuffleExceptFirst(prependedTemplates));
            setModalVisible(false)
          })
        })
        const state = getTemplateState(db).then((result: number) => {
          console.log("template state:" + result)
          if(result == 0){
            setTemplateVariant(0)
          }else{
            setTemplateVariant(1)
          }
        })
        //init performance tracking
        const startTime = Date.now()
        return async () => {
          const endTime = Date.now()
          const screenTime = (endTime - startTime)/1000
          const db = await getDBConnection()
          const performanceData: PerformanceData[] = await getPerformanceData(db)
          const stateNr = await getTemplateState(db)
          if(stateNr == 0){
            updatePerformanceDataTime(db,"A", screenTime + performanceData[0].time)
          }else{
            updatePerformanceDataTime(db,"B", screenTime + performanceData[1].time)          
          }
          scrollRef.current?.scrollTo({ x:0, y:0 })
        }
      }, [])
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

    const renderItemA = ({item}: {item: Event}) => {

  
      return (
        (item.id == "DUMMYEvent" && item.isTemplate == 0) 
        ? (<TouchableOpacity onPress={()=>navigation.navigate('NewNewEntry', {id: item.id, currentEvent: item, isTemplate: item.isTemplate, toptitle:'Create New Event', editing: false})} style={{marginVertical:marginwindowWidth}}>
            <HalfLengthTile>
              <View style={{justifyContent:'center', alignContent:'center', display:'flex',flex: 1 }} >
                <Text style={{textAlign:'center', marginTop:-20, fontWeight:'400', fontSize:5 * marginwindowWidth, color:'#7c7c7c'}}>Empty Template</Text>
              </View>
            </HalfLengthTile>
          </TouchableOpacity> )
        : (<ItemA
          item={item}
          onPress={() => {
            console.log(item)
            itemPressed(item);
            //navigation.navigate('NewEntry', {id: item.id, isTemplate: item.isTemplate}), 
            {/*{
              event: item
            }*/}
          }}
        />)
      );
    };


    const renderItemB = ({item}: {item: Event}) => {

      return (
        (item.id == "DUMMYEvent" && item.isTemplate == 0) 
        ? (<TouchableOpacity onPress={()=>navigation.navigate('NewNewEntry', {id: item.id, currentEvent: item, isTemplate: item.isTemplate, toptitle:'Create New Event',  editing: false})} style={{marginVertical:10}}>
            <FullLengthTile>
              <View style={{justifyContent:'center', alignContent:'center', display:'flex',flex: 1 }} >
                <Text style={{textAlign:'center', marginTop:-20, fontWeight:'400', fontSize:20, color:'#7c7c7c'}}>Empty template</Text>
              </View>
            </FullLengthTile>
          </TouchableOpacity> )
        : (<ItemB
          item={item}
          onPress={() => {
            itemPressed(item);
            {/*navigation.navigate('NewEntry', {id: item.id, isTemplate: item.isTemplate}), {
              event: item
            }*/}
          }}
        />)
      );
    };



  async function handleScroll(event: NativeSyntheticEvent<NativeScrollEvent>): Promise<void> {
    const currentScroll = Math.floor(Math.abs((yPrev-event.nativeEvent.contentOffset.y)));
    yPrev = event.nativeEvent.contentOffset.y
    const db = getDBConnection()
    const performanceData: PerformanceData[] = await getPerformanceData(db)
    if(templateVariant == 0){
      updatePerformanceDataScroll(db,"A",currentScroll + performanceData[0].scroll)
    }else{
      updatePerformanceDataScroll(db,"B",currentScroll + performanceData[1].scroll)
    }
    console.log(currentScroll)
  }

  const scrollRef = useRef<ScrollView>(null);


    return (
      <View style={{ flex: 1, backgroundColor:'#ffffff'}}>
          <TopNavigation navigation={navigation} title={'Templates'} color={'#000000'} />
          <SafeAreaView style={{marginVertical:'5%', flex:1}}>
            <ScrollView innerRef={scrollRef} onScrollEndDrag={handleScroll} >  
            {myArray.length != 0 && templateVariant != undefined && <FlatList
              key={(templateVariant == 0)?"A":"B"}
              data={myArray}
              renderItem={(templateVariant == 0)?renderItemA:renderItemB}
              numColumns={(templateVariant == 0)?2:undefined}
              style={(templateVariant == 0)?{marginLeft:marginwindowWidth}:{}}
              keyExtractor={(templateVariant == 0)?(item => item.id.toString() + "A"):(item => item.id.toString() + "B")}
              scrollEnabled={false}
             />}
            </ScrollView>
          </SafeAreaView>
        <Modal 
          visible={modalVisible}
          //onBackdropPress={() => setModalVisible(false)}
          //backdropOpacity={0.5}
          transparent={true}
        >
          <SafeAreaView style={{flex: 1, backgroundColor: 'white'}}>
            <View style={{padding:20, flex:1}}>            
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
            <TouchableOpacity onPress={() => {setModalVisible(false); navigation.navigate("NewNewEntry", {currentEvent: currentEvent!,toptitle:'Create New Event', isTemplate: 1,  editing: false})}} style={{backgroundColor: "black", borderRadius: 20, width: 200, alignSelf: 'center', marginBottom: 10}}><Text style={{color: 'white', textAlign: 'center', fontSize: 17, padding: 10}}>Use this template</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => {setModalVisible(false); navigation.navigate("NewNewEntry", {currentEvent: currentEvent, isTemplate: 1, editing: true, toptitle:'Edit Template'})}} style={{backgroundColor: "black", borderRadius: 20, width: 200, alignSelf: 'center', marginBottom: 10}}><Text style={{color: 'white', textAlign: 'center', fontSize: 17, padding: 10}}>Edit template</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => {setModalVisible2(true)}} style={{backgroundColor: "red", borderRadius: 20, width: 200, alignSelf: 'center', marginBottom: 30}}><Text style={{color: 'white', textAlign: 'center', fontSize: 17, padding: 10}}>Delete template</Text></TouchableOpacity>
          </View>
          </SafeAreaView>
        </Modal>
        <Modal
          visible={modalVisible2}
          //onBackdropPress={() => setModalVisible2(false)}
          //backdropOpacity={0.7}
          transparent={true}
        >
          <View style ={{flex:1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center'}}>
            <View style={{backgroundColor: "white", borderRadius: 10, padding: 20, marginHorizontal: 50}}>
              <Text>Do you really want to delete template "{currentEvent?.title}"?</Text>
              <View style={{flexDirection: "row", marginTop: 20}}>
                <TouchableOpacity style={{flex: 1, borderColor: "lightgrey", borderRightWidth: 1}} onPress={() => setModalVisible2(false)}><Text style={{textAlign:"center", fontSize: 20}}>Cancel</Text></TouchableOpacity>
                <TouchableOpacity style={{flex: 1, borderColor: "lightgrey", borderLeftWidth: 1}} onPress={() => {deleteEvent(db, currentEvent!.id); setModalVisible2(false); setModalVisible(false); setMyArray(myArray.filter((element: Event) => element.id != currentEvent!.id));}}><Text style={{textAlign:"center", fontSize: 20}}>Confirm</Text></TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    );
  }