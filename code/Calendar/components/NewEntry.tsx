import React, { Component, Fragment, ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View, Image, Switch, Button, TouchableOpacity, ScrollView } from 'react-native';
import { Calendar, CalendarUtils, DateData } from 'react-native-calendars';
import { TextInput } from 'react-native-gesture-handler';
import { MenuProvider, MenuOptions, MenuOption, Menu, MenuTrigger } from 'react-native-popup-menu';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Event, Event as MyEvent, TESTDATA, User } from '../services/models'
import { getDBConnection, addEvent, getFriends, getUsers, eventsToAgendaItems, getCurrentUser, getEvents, editEvent } from '../services/db-service';
import TopNavigation from './TopNavigation';
import { Ionicons as Icon } from '@expo/vector-icons';
import { getCalendarDateString } from 'react-native-calendars/src/services';
import TopNavigationNoBurger from './TopNavigationNoBurger';

// hardcoded CreatorId
//const thisUser = globalThis.currentUser;
const thisUser = "a34i1";

const addAnEvent = (
  title: string, 
  date: Date,
  dateFlag: boolean,
  allDay: boolean,
  timeFlag: boolean,
  startTime: Date, 
  endTime: Date, 
  location: string,
  locationFlag: boolean,
  participants: User[],
  participantsFlag: boolean,
  color: string,
  note: string,
  noteFlag: boolean,
  editing: boolean,
  e?: Event
  ) => {
  const db = getDBConnection();

  const eventId = "-1";
  const eventCreatorId = thisUser;
  const eventIsTemplate = 0;
  const eventTitle = title;

  console.log(date)
  const eventDateData = Math.floor(date.getTime() / 1000);
  console.log(eventDateData)
  const eventDateFlag = dateFlag ? 1 : 0;
  const eventDate = {flag: eventDateFlag, data: eventDateData};
  const eventTimeFlag = timeFlag ? 1 : 0;
  const eventTimeData = {allDay: (allDay ? 1 : 0), startTime: Math.floor(startTime.getTime()/1000), endTime: Math.floor(endTime.getTime()/1000)};
  const eventTime = {flag: eventTimeFlag, data: eventTimeData};
  const eventLocationFlag = locationFlag ? 1 : 0;
  const eventLocationData = location;
  const eventLocation = {flag: eventLocationFlag, data: eventLocationData};
  const eventParticipantsFlag = participantsFlag ? 1 : 0;
  const eventParticipantsData = participants.map((participant) => participant.id);
  const eventParticipants = {flag: eventParticipantsFlag, data: eventParticipantsData}
  const eventColorTag = color;
  const eventNoteFlag = noteFlag ? 1 : 0;
  const eventNoteData = note;
  const eventNote = {flag: eventNoteFlag, data: eventNoteData}

  const newEvent: MyEvent = {
    id: eventId,
    creatorId: eventCreatorId,
    isTemplate: eventIsTemplate,
    title: eventTitle,
    date: eventDate,
    time: eventTime,
    location: eventLocation,
    participants: eventParticipants,
    colorTag: eventColorTag,
    note: eventNote
  }

  // only for debugging (can take out later)
  /*
  alert(`
    ID: ${eventId}\n
    Creator ID: ${eventCreatorId}\n
    Is it a Template?: ${eventIsTemplate}\n
    Title: ${eventTitle}\n
    Date: 
      Open?: ${eventDate.flag}
      Data: ${eventDate.data}\n
    Time: 
      Open?: ${eventTime.flag}
      All Day: ${eventTime.data.allDay} 
      Start Time: ${eventTime.data.startTime}
      End Time: ${eventTime.data.endTime}\n
    Location:
      Open?: ${eventLocation.flag}
      Data: ${eventLocation.data}\n
    Participants: 
      Open?: ${eventParticipants.flag}
      Data: ${eventParticipants.data}\n
    Color: ${eventColorTag}\n
    Notes: ${eventNote.data}
  `)
  */
  if(editing != undefined && editing == true && e != undefined) {
    newEvent.id = e.id;
    editEvent(db, e, newEvent);
  }
  else{
    addEvent(db, newEvent);
  } // adds the event to the db
  
}

function ToggleIcon ({ selected, onSelect, iconName}: { selected: boolean; onSelect: () => void; iconName: string }) {
  return  (
    <TouchableOpacity onPress={onSelect}>
      <Icon name={iconName} size={35} color={selected ? '#FFD699' : 'gray'} />
    </TouchableOpacity>
  );
}

const EmojiIcon = ({emoji, color}: any) => {
  return (
    <View style={{backgroundColor:color,width:40,height:40, justifyContent:'center', alignItems:'center',borderRadius:8, marginRight:5}}>
      <Icon name={emoji} size={20}/>
    </View>
  )
}

export default function NewEntry({ route, navigation }: any){
  console.log(route.params)
    //depending on who calls, either currentEvent and editing are undefined or id is undefined
    const { currentEvent, id, isTemplate, editing, toptitle } = route.params;
    console.log(`current Event: ${currentEvent}`)
    var eventId: string;
    var eventCreatorId: string;
    var eventIsTemplate: number;
    var eventTitle: string;
    var eventDate: {
      flag: number; 
      data?: number; //Unix Time of specified date at 00:00
    };
    var eventTime: {
      flag: number;
      data?: {
        allDay: number; //0 if the event is not all day, 1 if all day
        startTime: number; //number of seconds from 00:00 until start time
        endTime: number; //number of seconds from 00:00 until end time
      };
    };
    var eventLocation: {
      flag: number;
      data?: string;
    };
    var eventParticipants: {
      flag: number;
      data?: string[]; //ids of participants
    };
    var eventColorTag: string;
    var eventNote: {
      flag: number;
      data?: string;
    };

    const[ce, setCurrentEvent] = useState<Event>();

    // START  flag variables
    const openEventIcon = 'ios-people-sharp';
    const [dateFlag, setDateFlag] = useState(false);
    const [timeFlag, setTimeFlag] = useState(false);
    const [locationFlag, setLocationFlag] = useState(false);
    const [participantsFlag, setParticipantsFlag] = useState(false);
    const [noteFlag, setNoteFlag] = useState(false);
    // END    flag variables

    const [title, onChangeTitle] = React.useState('');
    const [date, onChangeDate] = React.useState<Date>(new Date());
    console.log(date)
    const [locationString, onChangeLocationString] = React.useState('');
    const [notesString, onChangeNotesString] = React.useState('');
    const [allDay, onChangeAllDay] = React.useState(false);
    const toggleSwitch = () => onChangeAllDay(!allDay);

    // START  time picker logic
    const [time, setTime] = useState<Date>(new Date(0));
    const [timeString, setTimeString] = useState<String>('No Time');
    const [show, setShow] = useState(false);

    const onChangeTime = (event: any, selectedTime: any) => {
      setShow(false);
      setTime(selectedTime);
      if (selectedTime != new Date(0))  {
        setTimeString((Number(selectedTime.getHours())<10? '0' : '') + selectedTime.getHours() + ':' + (Number(selectedTime.getMinutes())<10? '0' : '') + selectedTime.getMinutes());
      }
    };
    const showTimepicker = () => {
      setShow(true);
      onChangeFirstStartTime(true);
    };
    // END    time picker logic

    // START  endTime picker logic
    const [endTime, setEndTime] = useState<Date>(new Date(0));
    const [endTimeString, setEndTimeString] = useState<String>('No Time');
    const [showEndTime, setShowEndTime] = useState(false);

    const onChangeEndTime = (event: any, selectedTime: any) => {
      setShowEndTime(false);
      setEndTime(selectedTime);
      if (selectedTime != new Date(0))  {
        setEndTimeString((Number(selectedTime.getHours())<10? '0' : '') + selectedTime.getHours() + ':' + (Number(selectedTime.getMinutes())<10? '0' : '') + selectedTime.getMinutes());
      }
    };
    const showEndTimepicker = () => {
      setShowEndTime(true);
      onChangeFirstEndTime(true);
    };
    // END    endTime picker logic

    // START  add participants logic
    const [participants, onChangeParticipants] = useState<User[]>([]);
    const [items, setItems] = useState<User[]>([]);

    

    useEffect(() => {
      const fetchData = async () => {
      try {
        const db = getDBConnection();
        const friendIDs = await getFriends(db, thisUser);
        console.log(`Ids are: ${friendIDs}`)
        const friends = await getUsers(db, friendIDs);
        setItems(friends);
        console.log(`The user's friends are loaded in: ${friends}`)
        //alert(`The user's friends are loaded in: ${friends}`)
      } catch (error) {
        console.error('Error fetching friends:', error);
      }
    }; fetchData();}, [])

    console.log(participants.map((p) => p.name))
    const loadDefaultDataCallback = async () => {
      setColor('#d3d3d3');
      setDateFlag(false);
      setTimeFlag(false);
      setNoteFlag(false);
      setLocationFlag(false);
      setParticipantsFlag(false);
      onChangeTime(undefined, (new Date(0)));
      onChangeFirstStartTime(false);
      onChangeEndTime(undefined, (new Date(0)));
      onChangeFirstEndTime(false);
      onChangeAllDay(false);
      setSelected(getCalendarDateString(new Date()));
      onChangeDate(new Date());
      onChangeLocationString('');
      onChangeNotesString('');
      onChangeParticipants([])
      onChangeTitle('')
      setCurrentEvent(undefined);

    }
    const loadDataCallback = async () => {
      console.log(currentEvent + ' this event 1')
      if(currentEvent == undefined) {
        console.log("Event does not exist!");
      }
      else{
        if (currentEvent.id == "DUMMY")  {
          console.log(`${currentEvent.colorTag} ${currentEvent.date.flag} ${currentEvent.time.flag} ${currentEvent.note.flag} ${currentEvent.participants.flag} ${currentEvent.time.data} ${currentEvent.time.data}`)
        }
        console.log(currentEvent + ' this event')
        setColor(currentEvent.colorTag == undefined? '#d3d3d3' : currentEvent.colorTag);
        setDateFlag(currentEvent.date.flag == 0? false : true);
        setTimeFlag(currentEvent.time.flag == 0? false : true);
        setNoteFlag(currentEvent.note.flag == 0? false : true);
        setLocationFlag(currentEvent.location.flag == 0? false : true);
        setParticipantsFlag(currentEvent.participants.flag == 0? false : true);
        onChangeTime(undefined, (currentEvent.time.data) ? (new Date(currentEvent.time.data.startTime * 1000)) : (new Date(0)));
        onChangeFirstStartTime((currentEvent.time.data) ? (true) : (false));
        onChangeEndTime(undefined, (currentEvent.time.data) ? (new Date(currentEvent.time.data.endTime * 1000)) : (new Date(0)));
        onChangeFirstEndTime((currentEvent.time.data) ? (true) : (false));
        onChangeAllDay((currentEvent.time.data && currentEvent.time.data.allDay != 0) ? (true) : (false));
        setSelected((currentEvent.date.data) ? (new Date(currentEvent.date.data * 1000)) : (getCalendarDateString(new Date())));
        if (currentEvent.date.data)  {
          const date = new Date (currentEvent.date.data * 1000);
          onChangeDate(date);
        }
        onChangeLocationString((currentEvent.location.data) ? (currentEvent.location.data) : (''));
        onChangeNotesString((currentEvent.note.data) ? (currentEvent.note.data) : (''));
        const db = getDBConnection();
        onChangeParticipants((currentEvent.participants.data) ? (await getUsers(db,currentEvent.participants.data)) : ([]))
        onChangeTitle(currentEvent.title)
        setCurrentEvent(currentEvent);
      }
      
    };
    useEffect(() => {
      console.log('loading values')
      if(((currentEvent == undefined && id === "DUMMY") || (currentEvent.id === "DUMMY")) && isTemplate === 3){
        console.log('loading default values')
        loadDefaultDataCallback();
      }
      else  {
        console.log('loading event values')
        loadDataCallback();
      }
      console.log('done loading values')
    }, [route.params]);

    const friendList = items.map((item) => (
      <MenuOption 
        key={item.id} 
        onSelect={() => {
          //alert(`Current Participants: ${participants.map((participant) => '\n' + participant.name)} \n${item.name}`);
          if (participants.some((participant) => participant.id === item.id)) {
            onChangeParticipants(participants.filter((participant) => participant.id !== item.id))
          }
          else  {
            onChangeParticipants([...participants, item]);
          }
        }} 
        //disabled={participants.some((participant) => participant.id === item.id)}
        >
          <Text key={item.id+1} style={[styles.friendListEntryStyle, {color: (participants.some((participant) => participant.id === item.id)) ? '#d9d9d9' : '#000000'}]}>{item.name}</Text>
        </MenuOption>
    ));
    const [startTimePicked, onChangeFirstStartTime] = useState(false);
    const [endTimePicked, onChangeFirstEndTime] = useState(false);
    const textList: ReactNode[] = []
    function displayParts() {
      for (let i=0; i<participants.length; i++) {
        textList.push(
          <Text key={i} style={[styles.fieldText, {color: '#000000'}]}>{participants[i].name}</Text>
        )
      }
      if (participants.length === 0)  {
        textList.push(<Text key={-1} style={[styles.fieldText, {color: '#d9d9d9'}]}>Pick participants</Text>)
      }
    }
    displayParts();
    useEffect(() => {
    displayParts();
  }, [participants]);

  const optionStyles =   {
    optionsContainer: {
      borderRadius: 15,
      borderWidth: 5,
      height: /*500*/ 170,
      width: 300,
      marginTop: /*200*/ -100,
      padding: 5,
      backgroundColor: 'grey',
    },
    optionWrapper: {
      borderRadius: 15,
      backgroundColor: 'white',
      margin: 5,
    },
  }

    const YourComponent = () => (
      <View>
        <Menu>
          <MenuTrigger>
            <View>
              {textList}
            </View>
          </MenuTrigger>
          <MenuOptions customStyles={optionStyles}>
              {friendList}
          </MenuOptions>
        </Menu>
      </View>
    );
    // END    add participants logic

    // START  color picker logic
    const [eventColor, setColor] = React.useState();
    const colorOptions = ['#d3d3d3', '#ffb6c1', '#add8e6', '#98fb98', /*'#dda0dd',*/ '#e6add8'];
    
    const [borderColor, setBorderColor] = useState(colorOptions.map((color) => (color === eventColor ? '#000000' : '#ffffff')));
    const handleColorPress = (color: String) => {
      setColor(color);
    };
    useEffect(() => {
      // Check if the eventColor changes and update the borderColor accordingly
      setBorderColor(colorOptions.map((color) => color === eventColor ? '#000000' : '#ffffff'))
    }, [eventColor]);
    /*
      Pastel Pink: #ffb6c1
      Pastel Blue: #add8e6
      Pastel Green: #98fb98
      Pastel Purple: #dda0dd
      Pastel Grey: #d3d3d3
    */
    // END    color picker logic

    const theme = {

      selectedDayBackgroundColor: 'black',
      arrowColor: 'black',
      dotColor: 'darkgrey',
      'stylesheet.day.basic': {
        todayText: {
          color: 'black',
          fontWeight: '900'
        }
      }
    };

    const [selected, setSelected] = useState(getCalendarDateString(new Date()));
    const marked = useMemo(() => {
      return {
        [selected]: {
          selected: true,
          disableTouchEvent: true,
          selectedColor: 'black',
          selectedTextColor: 'white'
        }
      };
    }, [selected]);

    console.log(date); 

    return(
      <MenuProvider style={styles.container}>
        <TopNavigationNoBurger onClick={() => {addAnEvent(title, date, dateFlag, allDay, timeFlag, time, endTime, locationString, locationFlag, participants, participantsFlag, eventColor, notesString, noteFlag, editing, ce); navigation.goBack()}} navigation={navigation} title={toptitle} color={'#000000'} />
        <ScrollView automaticallyAdjustKeyboardInsets={true} style={{ marginVertical: "5%", flex: 1 }}>
          <View style={styles.container}>
            <TextInput 
              multiline= {true}
              maxLength={40}
              value= {title} 
              onChangeText={onChangeTitle} 
              selectTextOnFocus={true} 
              style={styles.title} 
              placeholder="Title"
              placeholderTextColor="#d9d9d9" >
            </TextInput>
            <View style={styles.field}>
                <EmojiIcon emoji={'ios-calendar-sharp'} color={'#d9d9d9'}/>
                <Text style={styles.fieldText}>{date.toDateString().substring(4)}</Text>
                <View style={styles.openEventToggle}>
                  <ToggleIcon selected={dateFlag} onSelect={() => setDateFlag(!dateFlag)} iconName={openEventIcon} />
                </View>
            </View>
            <Fragment>
                <Calendar
                  enableSwipeMonths
                  current={CalendarUtils.getCalendarDateString(new Date())}
                  onDayPress={(date: DateData) => {setSelected(date.dateString); onChangeDate(new Date(date.timestamp))}}
                  theme={theme}
                  markedDates={marked}
                />
            </Fragment>
            <View style={styles.field}>
                <EmojiIcon emoji={'ios-time-sharp'} color={'#d9d9d9'}/>
                <Text style={styles.fieldText}>All Day</Text>
                <Switch value={allDay} onValueChange={toggleSwitch}/>
                <View style={styles.openEventToggle}>
                  <ToggleIcon selected={timeFlag} onSelect={() => setTimeFlag(!timeFlag)} iconName={openEventIcon} />
                </View>
            </View>
            <View style={styles.field}>
              <View style={styles.timePickers}>
                <TouchableOpacity onPress={allDay? ()=>{return} : showTimepicker} style={{backgroundColor: "darkgrey", paddingVertical: 10, borderTopStartRadius: 10, borderBottomStartRadius: 10, borderRightColor: 'lightgrey', borderRightWidth: 1}}>
                  <Text style={{color:'black', textAlign: 'center', fontWeight: 'bold'}}>{allDay? 'All day' : (startTimePicked? 'selected:' + timeString : 'Pick a start time')}</Text>
                </TouchableOpacity>
                {show && (
                  <DateTimePicker
                    testID="dateTimePicker"
                    value={time}
                    mode='time'
                    is24Hour={true}
                    onChange={onChangeTime}
                  />
                )}
              </View>
              <View style={styles.timePickers}>
                <TouchableOpacity onPress={allDay? ()=>{return} : showEndTimepicker} style={{backgroundColor: "darkgrey", paddingVertical: 10, borderTopEndRadius: 10, borderBottomEndRadius: 10, borderLeftColor: 'lightgrey', borderLeftWidth: 1}}>
                  <Text style={{color:'black', textAlign: 'center', fontWeight: 'bold'}}>{allDay? 'All day' : (endTimePicked? 'selected:' + endTimeString : 'Pick an end time')}</Text>
                </TouchableOpacity>
                {showEndTime && (
                  <DateTimePicker
                    testID="dateTimePicker"
                    value={endTime}
                    mode='time'
                    is24Hour={true}
                    onChange={onChangeEndTime}
                  />
                )}
              </View>
            </View>
            <View style={styles.field}>
                <EmojiIcon emoji={'ios-location-sharp'} color={'#d9d9d9'}/>
                <TextInput
                  multiline= {true}
                  maxLength={100}
                  value= {locationString} 
                  onChangeText={onChangeLocationString} 
                  placeholder="Enter a location."
                  placeholderTextColor="#d9d9d9" 
                  style={styles.fieldText}>
                </TextInput>
                <View style={styles.openEventToggle}>
                  <ToggleIcon selected={locationFlag} onSelect={() => setLocationFlag(!locationFlag)} iconName={openEventIcon} />
                </View>
            </View>
            <View style={styles.field}>
                <EmojiIcon emoji={'ios-person-add-sharp'} color={'#d9d9d9'}/>
                <YourComponent/>
                <View style={styles.openEventToggle}>
                  <ToggleIcon selected={participantsFlag} onSelect={() => setParticipantsFlag(!participantsFlag)} iconName={openEventIcon}/>
                </View>
            </View>
            <View style={styles.field}>
              <EmojiIcon emoji={'ios-color-palette-sharp'} color={'#d9d9d9'}/>
              <View style={styles.colorContainer}>
                {colorOptions.map((color, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[styles.colorCircle, { backgroundColor: color, borderColor: borderColor[index]}]}
                    onPress={() => handleColorPress(color)}
                  />
                ))}
              </View>
            </View>
            <View style={styles.field}>
                <EmojiIcon emoji={'ios-document-text-sharp'} color={'#d9d9d9'}/>
                <TextInput
                  multiline= {true}
                  maxLength={500}
                  value= {notesString} 
                  onChangeText={onChangeNotesString}
                  placeholder="Additional Notes."
                  placeholderTextColor="#d9d9d9"
                  style={styles.fieldText}>
                </TextInput>
                <View style={styles.openEventToggle}>
                  <ToggleIcon selected={noteFlag} onSelect={() => setNoteFlag(!noteFlag)} iconName={openEventIcon} />
                </View>
            </View>
          </View>
        </ScrollView>
      </MenuProvider>
    )
  }
  
  const styles = StyleSheet.create({
      container: {
            alignItems: 'stretch',
            flex: 1, // flex: 1 should fill up whole screen. This means that the current width is 100% of the parent container
            justifyContent: 'center',
            padding: 3,
            backgroundColor: 'white',
        },
        field: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: 5,
            paddingTop: 30,
        },
        fieldText: {
          paddingLeft: 30,
          flex: 1,
          fontSize: 25,
        },
        title: {
         textAlign: 'center',
         marginBottom: 16,
         fontSize: 40,
         marginHorizontal: 40,
         paddingTop: 30,
        },
        colorContainer: {
          flexDirection: 'row',
          justifyContent: 'space-around',
          paddingHorizontal: 10,
        },
        colorCircle: {
          width: 50,
          height: 50,
          borderRadius: 25,
          borderWidth: 2,
          marginHorizontal: 5,
        },
        timePickers:  {
          flex: 1,
        },
        openEventToggle:  {
          marginLeft: 'auto',
        },
        friendListEntryStyle: {
          fontSize: 20,
          marginHorizontal: 10,
        }
  });