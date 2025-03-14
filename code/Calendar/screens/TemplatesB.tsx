import { Modal, StyleSheet, Text, View, Image, Dimensions,TouchableOpacity, FlatList, SafeAreaView, Alert, ScrollView, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import * as React from 'react';
import { Event, User, EventRelation, FriendRelation, defaultEvents, defaultFriendRelations, defaultUsers, TESTDATA, PerformanceData } from "../services/models";
import HalfLengthTile from '../components/HalfLengthTile';
import TopNavigation from '../components/TopNavigation';
import {TimelineEventProps, CalendarUtils} from 'react-native-calendars';
import { useCallback, useEffect, useState } from 'react';
import { deleteEvent, getDBConnection, getEvents, getPerformanceData, getUsers, updatePerformanceDataScroll, updatePerformanceDataTime } from '../services/db-service';
import { useFocusEffect } from '@react-navigation/native';
//import Modal from 'react-native-modal/dist/modal';
import { EmojiIconB2, TemplateRowB2, getTimeString } from './AllEvents';
import { X } from 'react-native-feather';


const windowWidth = Dimensions.get('window').width;
const marginwindowWidth = 0.0125*windowWidth;


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

let filteredArray = prepend({
  id: 'DUMMY',
  isTemplate: 3,
  title: '',
  date:{
    flag: 0,
    data: undefined
  },
  time: {
    flag: 1,
    data: undefined
  },
  location: {
    flag: 0,
    data: undefined
  },
  participants: {
    flag: 0,
    data: []
  },
  colorTag: "#000000",
  note: {
    flag: 0,
    data: undefined
  }
},TESTDATA.filter(element => element.isTemplate !== 0));


function convertSecondsToTime(seconds:number) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

function convertIsoToDate(isoString: number) {
  // Create a new Date object using the ISO string
  const date = new Date(isoString*1000);

  // Define an array of month names
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"];

  // Extract the day, month and year from the date object
  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();

  // Return the formatted date string
  return `${day}. ${month} ${year}`;
}

const EmojiIcon = ({emoji, color}: any) => {
  return(
    <View style={{backgroundColor:color, width:4.5 * marginwindowWidth, height:4.5 * marginwindowWidth, justifyContent:'center', alignItems:'center',borderRadius:8, marginRight:5}}>
      <Text style={{fontSize:2.5 * marginwindowWidth}}>{emoji}</Text> 
    </View>
  )
}

const TemplateRow = ({emoji, text}: any) => {
  return(
      <View style={{flexDirection:'row', alignItems:'center',marginTop:5, }}>
        <EmojiIcon emoji={emoji} color={'#34c11d'} />
        <Text style={{marginLeft:5, color:'#7c7c7c', fontSize: 3 * marginwindowWidth}} >{text}</Text>
      </View>)
   }


const Item = ({item, onPress, onLongPress}: any) => (
  <TouchableOpacity delayLongPress={700} onLongPress={onLongPress} onPress={onPress} style={{marginVertical:marginwindowWidth}}>
    <HalfLengthTile title={item.title} profiles={item.participants.data} >
    <View>
    { /* green big */ }
      { (item.time.flag == 0) && (item.time.data.startTime && item.time.data.endTime) && (<TemplateRow emoji={'🕗'} text={`${(item.time.data.allDay==1) ? ('All day') : (convertSecondsToTime(item.time.data.startTime) +" - "+ convertSecondsToTime(item.time.data.endTime))}`}/>)}
      { (item.date.flag == 0) && item.date.data && (<TemplateRow emoji={'📆'} text={convertIsoToDate(item.date.data)} />)}
      { (item.location.flag == 0) && item.location.data && (<TemplateRow emoji={'📍'} text={item.location.data} />)}
      <View style={{flexDirection:'row', alignItems:'center',marginTop:5}}>
        { /* green small */ }
        { (item.note.flag == 0) && item.note.data && (<EmojiIcon emoji={'📝'} color={'#34c11d'} />)}
        { /* black small */ }
        { (item.time.flag == 1) && (<EmojiIcon emoji={'🕗'} color={'#000000'} />)}
        { (item.date.flag == 1) && (<EmojiIcon emoji={'📆'} color={'#000000'} />)}
        { (item.location.flag == 1) && (<EmojiIcon emoji={'📍'} color={'#000000'} />)}
        { (item.participants.flag == 1) && (<EmojiIcon emoji={'👥'} color={'#000000'} />)}
        { (item.note.flag == 1) && (<EmojiIcon emoji={'📝'} color={'#000000'} />)}
        { /* grey small */ }
        { (item.time.flag == 0) && !(item.time.data.startTime && item.time.data.endTime) && (<EmojiIcon emoji={'🕗'} color={'#d9d9d9'} />)}
        { (item.date.flag == 0) && !item.date.data && (<EmojiIcon emoji={'📆'} color={'#d9d9d9'} />)}
        { (item.location.flag == 0) && !item.location.data && (<EmojiIcon emoji={'📍'} color={'#d9d9d9'} />)}
        { (item.participants.flag == 0) && !item.participants.data && (<EmojiIcon emoji={'👥'} color={'#d9d9d9'} />)}
        { (item.note.flag == 0) && !item.note.data && (<EmojiIcon emoji={'📝'} color={'#d9d9d9'} />)}
      </View>
      </View>
    </HalfLengthTile>
  </TouchableOpacity>
);

export default function Templates({navigation}: any) {
    const windowWidth = Dimensions.get('window').width;
    const windowWidth45 = windowWidth * 0.45
    const halfwindowWidth45 = windowWidth45 * 0.5
    const [myArray, setMyArray] = useState([...filteredArray]); // initialArray is your original array
    let [yPrev, setYPrev] = useState(0)


    useEffect(() => {
      setMyArray(shuffleExceptFirst([...filteredArray]));
    }, []);

    useFocusEffect(
      React.useCallback(() => {
        setMyArray(shuffleExceptFirst([...filteredArray]));
        //init performance tracking
        const startTime = Date.now()
        return async () => {
          const endTime = Date.now()
          const screenTime = Math.floor((endTime - startTime)/1000)
          const db = getDBConnection()
          const performanceData: PerformanceData[] = await getPerformanceData(db)
          updatePerformanceDataTime(db,"B", screenTime + performanceData[1].time)
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
      const currentEvent = item
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

  
      return (
        (item.id == "DUMMY" && item.isTemplate == 3) 
        ? (<TouchableOpacity delayLongPress={700} onLongPress={() => Alert.alert('You long pressed on the empty template!')} onPress={()=>navigation.navigate('NewEntry', {id: item.id, isTemplate: item.isTemplate})} style={{marginVertical:marginwindowWidth}}>
            <HalfLengthTile>
              <View style={{justifyContent:'center', alignContent:'center', display:'flex',flex: 1 }} >
                <Text style={{textAlign:'center', marginTop:-20, fontWeight:'400', fontSize:5 * marginwindowWidth, color:'#7c7c7c'}}>Empty Template</Text>
              </View>
            </HalfLengthTile>
          </TouchableOpacity> )
        : (<Item
          item={item}
          onPress={() => {
            itemPressed(item);
            {/*navigation.navigate('NewEntry', {id: item.id, isTemplate: item.isTemplate}), {
              event: item
            }*/}
          }}
          onLongPress={() => Alert.alert(item.title,`You long pressed on ${item.title}!`)}
        />)
      );
    };

    async function handleScroll(event: NativeSyntheticEvent<NativeScrollEvent>): Promise<void> {
      const currentScroll = Math.floor(Math.abs((yPrev-event.nativeEvent.contentOffset.y)));
      setYPrev(event.nativeEvent.contentOffset.y)
      const db = getDBConnection()
      const performanceData: PerformanceData[] = await getPerformanceData(db)
      updatePerformanceDataScroll(db,"B",currentScroll + performanceData[1].scroll)
    }
  

    return (
      <View style={{ flex: 1, backgroundColor:'#ffffff'}}>
          <TopNavigation navigation={navigation} title={'Templates B'} color={'#000000'} />
          <SafeAreaView style={{marginVertical:'5%', flex:1}}>
          <ScrollView onScrollEndDrag={handleScroll}>

            <FlatList
              data={myArray}
              renderItem={renderItem}
              keyExtractor={item => item.id}
              numColumns={2}
              style={{marginLeft:marginwindowWidth}}
            /></ScrollView>
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
              { currentEvent != undefined &&(currentEvent!.time.flag == 0) && (currentEvent!.time.data) && (<TemplateRowB2 emoji={'ios-time-sharp'} text={`${(currentEvent!.time.data.allDay==1) ? ('All day') : (convertSecondsToTime(currentEvent!.time.data.startTime) +" - "+ convertSecondsToTime(currentEvent!.time.data.endTime))}`}/>)}
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
            <TouchableOpacity onPress={() => navigation.navigate("NewNewEntry", {currentEvent: currentEvent!, isTemplate: 1, editing: false})} style={{backgroundColor: "black", borderRadius: 20, width: 200, alignSelf: 'center', marginBottom: 10}}><Text style={{color: 'white', textAlign: 'center', fontSize: 17, padding: 10}}>Use this template</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => {setModalVisible(false); navigation.navigate("NewNewEntry", {currentEvent: currentEvent, isTemplate: 1, editing: true, toptitle:'Edit Template'})}} style={{backgroundColor: "black", borderRadius: 20, width: 200, alignSelf: 'center', marginBottom: 10}}><Text style={{color: 'white', textAlign: 'center', fontSize: 17, padding: 10}}>Edit template</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => {setModalVisible2(true)}} style={{backgroundColor: "red", borderRadius: 20, width: 200, alignSelf: 'center', marginBottom: 30}}><Text style={{color: 'white', textAlign: 'center', fontSize: 17, padding: 10}}>Delete template</Text></TouchableOpacity>
          </View>
        </Modal>
        <Modal
          visible={modalVisible2}
          //onBackdropPress={() => setModalVisible2(false)}
          //backdropOpacity={0.7}
        >
          <View style={{backgroundColor: "white", borderRadius: 10, padding: 10}}>
            <Text>Do you really want to delete template "{currentEvent?.title}"?</Text>
            <View style={{flexDirection: "row", marginTop: 20}}>
              <TouchableOpacity style={{flex: 1, borderColor: "lightgrey", borderRightWidth: 1}} onPress={() => setModalVisible2(false)}><Text style={{textAlign:"center", fontSize: 20}}>Cancel</Text></TouchableOpacity>
              <TouchableOpacity style={{flex: 1, borderColor: "lightgrey", borderLeftWidth: 1}} onPress={() => {deleteEvent(db, currentEvent!.id); setModalVisible2(false); setModalVisible(false); setMyArray(myArray.filter((element: Event) => element.id != currentEvent!.id));}}><Text style={{textAlign:"center", fontSize: 20}}>Confirm</Text></TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    );
  }