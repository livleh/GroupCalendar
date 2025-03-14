import {
  StyleSheet,
  Text,
  View,
  Image,
  Button,
  SafeAreaView,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Modal,
} from "react-native";
import {
  TitleBar,
  MonthlyOverview,
  ScheduleToday,
  Menu,
} from "../components/Index";
import TopNavigation from "../components/TopNavigation";
import * as Icon from "react-native-feather";
import React = require("react");
import { getDBConnection, getCurrentUser, getTemplateState, deleteEvent } from "../services/db-service";
import { Event, User } from "../services/models";
import { useCallback, useState } from "react";
import { concat } from "lodash";
import { getCalendarDateString } from "react-native-calendars/src/services";
//import Modal from "react-native-modal/dist/modal";
import { TOUCHABLE_STATE } from "react-native-gesture-handler/lib/typescript/components/touchables/GenericTouchable";
import { ScrollView } from "react-native-gesture-handler";
import { EmojiIconB2, TemplateRowB2, getTimeString } from "./AllEvents";
import { Ionicons } from '@expo/vector-icons';


// @ts-ignore
export default function LandingPage({ navigation }) {
  let [currentUser, setCurrentUser] = useState<User>({
    id: "",
    name: "",
    profilePicPath: "",
  });

  const loadDataCallback = useCallback(async () => {
    const db = getDBConnection();
    const user = await getCurrentUser(db);
    setCurrentUser(user);
  }, []);

  React.useEffect(() => {
    loadDataCallback();
  }, [loadDataCallback]);
  interface TempEvent extends Event {
    participantNames: string,
  }

  const TemplateRowB = ({emoji, text}: any) => {
    return(
        <View style={{flexDirection:'row', alignItems:'center',marginTop:5}}>
          <EmojiIconB emoji={emoji} color={'#34c11d'}/>
          <Text numberOfLines={1} ellipsizeMode="tail" style={{marginLeft:5, marginRight: 15, color:'#7c7c7c'}} >{text}</Text>
        </View>)
     }

     const EmojiIconB = ({emoji, color}: any) => {
      return(
        <View style={{backgroundColor:color,width:20,height:20, justifyContent:'center', alignItems:'center',borderRadius:8, marginRight:5}}>
          <Ionicons name={emoji} size={15}/>
        </View>
      )
    }

    function convertSecondsToTime(seconds:number) {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
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

  const [modalVisible, setModalVisible] = useState(false);
  const [modalVisible2, setModalVisible2] = useState(false);
  const [currentEvent, setCurrentEvent] = useState<TempEvent>();
  const openModal = (e: TempEvent) => {
    setCurrentEvent(e);
    setModalVisible(true);
  }
  const db = getDBConnection();
  return (
    <View style={styles.container}>
      <TopNavigation navigation={navigation} title="Calendar Overview" color="#000" />
      {/*< TitleBar />*/}
      <SafeAreaView style={{ marginVertical: "5%", flex: 1 }}>
        <MonthlyOverview navigation={navigation} openModal={openModal} />
      </SafeAreaView>
      <View style={{ position: "absolute", right: 50, bottom: 50 }}>
        <TouchableOpacity
          style={{
            borderWidth: 1,
            borderColor: "black",
            alignItems: "center",
            justifyContent: "center",
            width: 60,
            height: 60,
            backgroundColor: "black",
            borderRadius: 60,
          }}
          onPress={async () =>{
            navigation.navigate("Template Selection")
          }}
        >
          <View style={{ flex: 1, justifyContent: "center" }}>
            <Text style={{ fontWeight: "bold", color: "white", fontSize: 30 }}>
              +
            </Text>
          </View>
        </TouchableOpacity>
        <Modal 
          visible={modalVisible}
          //onBackdropPress={() => setModalVisible(false)}
          //backdropOpacity={0.5}
          transparent={true}
        >
          <View style={{padding: 20, flex: 1, backgroundColor: 'white'}}>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Icon.X color={"black"} height={40} width={30} />
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
                <TouchableOpacity style={{flex: 1, borderColor: "lightgrey", borderLeftWidth: 1}} onPress={() => {deleteEvent(db, currentEvent!.id); setModalVisible2(false); setModalVisible(false)}}><Text style={{textAlign:"center", fontSize: 20}}>Confirm</Text></TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
      {/*< ScheduleToday />*/}
      {/*< Menu />*/}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "flex-start",
    justifyContent: "flex-start",
  },
});
