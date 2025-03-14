import React, { Fragment, useMemo, useState } from "react";
import {
  StyleSheet,
  Text,
  ScrollView,
  ActivityIndicator,
  View,
  TextInput,
  TouchableOpacity,
  Switch,
  Modal,
  FlatList,
  Button,
} from "react-native";
import { Event, User } from "../services/models";
import {
  addEvent,
  editEvent,
  getCurrentUser,
  getDBConnection,
  getFriends,
  getUsers,
} from "../services/db-service";
import TopNavigationNoBurger from "../components/TopNavigationNoBurger";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons as Icon } from "@expo/vector-icons";
import { Calendar, CalendarUtils, DateData } from "react-native-calendars";
import { getCalendarDateString } from "react-native-calendars/src/services";
import DateTimePicker from "@react-native-community/datetimepicker";
import {
  MenuProvider,
  MenuOptions,
  MenuOption,
  Menu,
  MenuTrigger,
} from "react-native-popup-menu";
import { set } from "lodash";
import ProfilePicture from "../components/ProfilePicture";
import { setStatusBarNetworkActivityIndicatorVisible } from "expo-status-bar";

export default function NewNewEntry({ route, navigation }: any) {
  let [loading, setLoading] = useState<boolean>(true);

  //event state
  let [thisId, setThisId] = useState<string>("");
  let [thisCreatorID, setThisCreatorId] = useState<string>("");
  let [isTemplate, setIsTemplate] = useState<number>(0);
  let [thisTitle, setThisTitle] = useState<string>("");
  let [thisDateData, setThisDateData] = useState<number | undefined>(undefined);
  let [thisDateFlag, setThisDateFlag] = useState<number>(0);
  let [thisTimeFlag, setThisTimeFlag] = useState<number>(0);
  let [thisTimeData, setThisTimeData] = useState<object | undefined>(undefined);
  let [thisTimeAllDay, setThisTimeAllDay] = useState<number>(0);
  let [thisStartTime, setThisStartTime] = useState<number>(0);
  let [thisEndTime, setThisEndTime] = useState<number>(0);
  let [thisLocationData, setThisLocationData] = useState<string | undefined>(
    undefined
  );
  let [thisLocationFlag, setThisLocationFlag] = useState<number>(0);
  let [thisParticipantsFlag, setThisParticipantsFlag] = useState<number>(0);
  let [thisParticipantsData, setThisParticipantsData] = useState<
    User[] | undefined
  >(undefined);
  let [thisColorTagData, setThisColorTagData] = useState<string>("");
  let [thisNoteData, setThisNoteData] = useState<string | undefined>(undefined);
  let [thisNoteFlag, setThisNoteFlag] = useState<number>(0);

  //for participantsModal
  let [modalVisible, setModalVisible] = useState<boolean>(false);
  let [friendsObjects, setFriendsObjects] = useState<User[]>([]);

  //warning modal
  let [timeDateWarningModalVisible, setTimeDateWarningModalVisible] = useState<boolean>(false);
  let [titleWarningModalVisible, setTitleWarningModalVisible] = useState<boolean>(false);

  //state for time picker
  const [show, setShow] = useState(false);
  const [startTimePicked, setStartTimePicked] = useState(false);
  const [startTimeString, setStartTimeString] = useState<String>("No Time");
  const [endTimeString, setEndTimeString] = useState<String>("No Time");
  const [showEndTime, setShowEndTime] = useState(false);
  const [endTimePicked, setEndTimePicked] = useState(false);
  let [startTime, setStartTime] = useState<Date>(new Date(0));
  let [endTime, setEndTime] = useState<Date>(new Date(0));

  //calendar picker
  const [selected, setSelected] = useState("");

  async function initState(initEvent: Event, initIsTemplate: number) {
    setLoading(true);
    const db = getDBConnection();
    if (initEvent.id.includes("DUMMY")) {
      //user tries to use empty template and create an event
      setThisId("-1");
      setIsTemplate(initIsTemplate)
      const currentUser: User = await getCurrentUser(db);
      setThisCreatorId(currentUser.id);

      //fetch friends of user
      const friendsIds: string[] = await getFriends(db, currentUser.id);
      const friendsObjects: User[] = await getUsers(db, friendsIds);
      setFriendsObjects(friendsObjects);
      setThisColorTagData(initEvent.colorTag);

    } else {
      //user either edits or uses existing template/ event / open event
      setThisId(initEvent.id);

      if(initIsTemplate == 1){
        if(!route.params.editing){
          //we are using a template
          setIsTemplate(0); 
          setThisId("-1")
        }else{
          setIsTemplate(1); //we are editing a template
        }
      }else{
        //we are editing an event or open event
        setIsTemplate(0)
      }

      setThisCreatorId(initEvent.creatorId);
      setThisTitle(initEvent.title);
      setThisDateData(initEvent.date.data);
      setThisDateFlag(initEvent.date.flag);
      setThisTimeData(initEvent.time.data);
      if (initEvent.date.data != undefined) {
        setSelected(
          getCalendarDateString(new Date(initEvent.date.data! * 1000))
        );
      }else{
        setSelected(
         ""
        );
      }
      if (initEvent.time.data != undefined) {
        setThisTimeAllDay(initEvent.time.data.allDay);
        setThisStartTime(initEvent.time.data.startTime);
        setThisEndTime(initEvent.time.data.endTime);
        
        //init time for picker
        const date = new Date(initEvent.time.data.startTime * 1000);
        onChangeStartTime(
          undefined,
          new Date(initEvent.time.data.startTime * 1000)
        );
        onChangeEndTime(
          undefined,
          new Date(initEvent.time.data.endTime * 1000)
        );
      }
      setThisLocationFlag(initEvent.location.flag);
      if (initEvent.location.data != undefined) {
        setThisLocationData(initEvent.location.data);
      }
      //fetch participants if any

      if (initEvent.participants.data != undefined) {
        const fetchedParticipants: User[] = await getUsers(
          db,
          initEvent.participants.data
        );
        console.log("participants fetched")
        setThisParticipantsData(fetchedParticipants);
      }

      //fetch friends of creator
      const friendsIds: string[] = await getFriends(db, initEvent.creatorId);
      const friendsObjects: User[] = await getUsers(db, friendsIds);
      console.log("friends fetched")

      setFriendsObjects(friendsObjects);

      setThisParticipantsFlag(initEvent.participants.flag);
      setThisColorTagData(initEvent.colorTag);
      setThisNoteFlag(initEvent.note.flag);
      if (initEvent.note.data != undefined) {
        setThisNoteData(initEvent.note.data);
      }
    }
    setLoading(false);
  }

  function resetState() {
    setThisId("");
    setIsTemplate(0);
    setThisCreatorId("");
    setThisTitle("");
    setThisDateData(undefined);
    setThisDateFlag(0);
    setThisTimeData(undefined);
    setThisTimeAllDay(0);
    setThisStartTime(0);
    setThisEndTime(0);
    setThisLocationFlag(0);
    setThisLocationData(undefined);
    setThisParticipantsData(undefined);
    setThisParticipantsFlag(0);
    setThisColorTagData("");
    setThisNoteFlag(0);
    setThisNoteData(undefined);
    setShow(false);
    setStartTimePicked(false);
    setStartTimeString("No Time");
    setEndTimeString("No Time");
    setShowEndTime(false);
    setEndTimePicked(false);
    setStartTime(new Date(0));
    setEndTime(new Date(0));
    setSelected("")
  }

  useFocusEffect(
    React.useCallback(() => {
      //init state first
      const paramEvent: Event = route.params.currentEvent;
      const paramIsTemplate: number = route.params.isTemplate;
      console.log(paramEvent.title)
      initState(paramEvent, paramIsTemplate);
      console.log("Mount procedure");
      return async () => {
        //reset state after screen is closed
        resetState();
        console.log("Dismount procedure");
      };
    }, [route.params.currentEvent,route.params.isTemplate])
  );

  const EmojiIcon = ({ emoji, color }: any) => {
    return (
      <View
        style={{
          backgroundColor: color,
          width: 40,
          height: 40,
          justifyContent: "center",
          alignItems: "center",
          borderRadius: 8,
          marginRight: 5,
        }}
      >
        <Icon name={emoji} size={20} />
      </View>
    );
  };

  function ToggleIcon({
    selected,
    onSelect,
    iconName,
  }: {
    selected: boolean;
    onSelect: () => void;
    iconName: string;
  }) {
    return (
      <TouchableOpacity onPress={onSelect}>
        <Icon name={iconName} size={35} color={selected ? "#FFD699" : "gray"} />
      </TouchableOpacity>
    );
  }

  const calendarTheme = {
    selectedDayBackgroundColor: "black",
    arrowColor: "black",
    dotColor: "darkgrey",
    "stylesheet.day.basic": {
      todayText: {
        color: "black",
        fontWeight: "900",
      },
    },
  };

  const marked = useMemo(() => {
    return {
      [selected]: {
        selected: true,
        disableTouchEvent: true,
        selectedColor: "black",
        selectedTextColor: "white",
      },
    };
  }, [selected]);

  const showStartTimepicker = () => {
    setShow(true);
    setStartTimePicked(true);
  };

  
function convertSecondsToTime(seconds:number) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

  const onChangeStartTime = (event: any, selectedTime: any) => {
    setShow(false);
    setStartTime(selectedTime);
    setThisStartTime(new Date(selectedTime).getTime() / 1000);
    if (selectedTime != new Date(0)) {
      setStartTimeString(
        (new Date(selectedTime).getUTCHours() < 10 ? "0" : "") +
        new Date(selectedTime).getUTCHours() +
          ":" +
          (Number(selectedTime.getMinutes()) < 10 ? "0" : "") +
          selectedTime.getMinutes()
      );
    }
    setStartTimePicked(true);
  };

  const onChangeEndTime = (event: any, selectedTime: any) => {
    setShowEndTime(false);
    setEndTime(selectedTime);
    setThisEndTime(new Date(selectedTime).getTime() / 1000);
    if (selectedTime != new Date(0)) {
      setEndTimeString(
        (new Date(selectedTime).getUTCHours() < 10 ? "0" : "") +
        new Date(selectedTime).getUTCHours() +
          ":" +
          (Number(selectedTime.getMinutes()) < 10 ? "0" : "") +
          selectedTime.getMinutes()
      );
    }
    setEndTimePicked(true);
  };

  const showEndTimepicker = () => {
    setShowEndTime(true);
    setEndTimePicked(true);
  };

  function handleCheckMarkClick() {
    const eventScaffold: Event = {
      id: thisId,
      creatorId: thisCreatorID,
      isTemplate: isTemplate,
      title: thisTitle,
      date: {
        flag: thisDateFlag,
        data: thisDateData,
      },
      time: {
        flag: thisTimeFlag,
        data: (thisTimeData == undefined && thisTimeAllDay == 0 && thisStartTime == 0 && thisEndTime == 0)? undefined :{
          allDay: thisTimeAllDay,
          startTime: thisStartTime,
          endTime: thisEndTime,
        },
      },
      location: {
        flag: thisLocationFlag,
        data: thisLocationData,
      },
      participants: {
        flag: thisParticipantsFlag,
        data: thisParticipantsData?.map((user) => user.id),
      },
      colorTag: thisColorTagData,
      note: {
        flag: thisNoteFlag,
        data: thisNoteData,
      },
    };
    console.log(eventScaffold);


    const db = getDBConnection()
    if(thisTitle.length == 0){
      setTitleWarningModalVisible(true)
    }else{
      //title check passed
      if (route.params.editing == true) {
        //user is here for editing event or template
        if(eventScaffold.isTemplate == 0){
          
          if((eventScaffold.date.data == undefined && eventScaffold.date.flag == 0) || (eventScaffold.time.data == undefined && eventScaffold.time.flag == 0) || (eventScaffold.time.data != undefined && eventScaffold.time.data?.allDay == 0 && (eventScaffold.time.data.startTime == 0 || eventScaffold.time.data.endTime == 0) && eventScaffold.time.flag == 0)){
            setTimeDateWarningModalVisible(true)
            console.log("warning when editing")
          }else{
            //event or open event is valid and changes can be updated
            editEvent(db,route.params.currentEvent, eventScaffold)
            navigation.goBack()
            console.log("no warning when editing")
  
          }
        }else if(eventScaffold.isTemplate == 1){
          editEvent(db,route.params.currentEvent, eventScaffold)
          navigation.goBack()
        }
        
      } else if (route.params.editing == false) {
        //user wants to add new event or template --> add event
        if(eventScaffold.isTemplate == 0){
          //error checking
          if((eventScaffold.date.data == undefined && eventScaffold.date.flag == 0) || (eventScaffold.time.data == undefined && eventScaffold.time.flag == 0) || (eventScaffold.time.data != undefined && eventScaffold.time.data?.allDay == 0 && (eventScaffold.time.data.startTime == 0 || eventScaffold.time.data.endTime == 0) && eventScaffold.time.flag == 0)){
            setTimeDateWarningModalVisible(true)
            console.log("warning when adding event/open event")
  
          }else{
            //event or open event is valid and changes can be updated
            addEvent(db, eventScaffold)
            navigation.goBack()
            console.log("no warning when adding event")
  
          }
        }else if(eventScaffold.isTemplate == 1){
          addEvent(db, eventScaffold)
          navigation.goBack()
        }
        
      }
    }
  }

  return (
    <MenuProvider style={styles.container}>
      <TopNavigationNoBurger
        onClick={() => handleCheckMarkClick()}
        navigation={navigation}
        title={route.params.toptitle}
        color={"#000000"}
      />
      <ScrollView
        automaticallyAdjustKeyboardInsets={true}
        style={{ marginVertical: "5%", flex: 1 }}
      >
        {loading ? (
          <View style={{ marginTop: 300 }}>
            <ActivityIndicator size="large" color={'black'} />
          </View>
        ) : (
          <View style={styles.container}>
            <TextInput
              multiline={true}
              maxLength={40}
              value={thisTitle}
              onChangeText={setThisTitle}
              selectTextOnFocus={true}
              style={styles.title}
              placeholder="Title"
              placeholderTextColor="#d9d9d9"
            ></TextInput>
            <View style={styles.field}>
              <EmojiIcon emoji={"ios-calendar-sharp"} color={"#d9d9d9"} />

              <Text style={styles.fieldText}>
                {thisDateData != undefined
                  ? new Date(thisDateData * 1000).toDateString()
                  : ""}
              </Text>

              <View style={styles.openEventToggle}>
                <ToggleIcon
                  selected={thisDateFlag == 1}
                  onSelect={() => setThisDateFlag(Math.abs(thisDateFlag - 1))}
                  iconName={"ios-people-sharp"}
                />
              </View>
            </View>
            <Fragment>
              <Calendar
                enableSwipeMonths
                current={CalendarUtils.getCalendarDateString(new Date())}
                onDayPress={(date: DateData) => {
                  setSelected(date.dateString);
                  setThisDateData(date.timestamp / 1000);
                }}
                theme={calendarTheme}
                markedDates={marked}
              />
            </Fragment>
            <View style={styles.field}>
              <EmojiIcon emoji={"ios-time-sharp"} color={"#d9d9d9"} />
              <Text style={{marginLeft: 20}}>All day:</Text>
              <Switch
                value={thisTimeAllDay == 1}
                onValueChange={() =>
                  setThisTimeAllDay(Math.abs(thisTimeAllDay - 1))
                }
              />
              <View style={styles.openEventToggle}>
                <ToggleIcon
                  selected={thisTimeFlag == 1}
                  onSelect={() => setThisTimeFlag(Math.abs(thisTimeFlag - 1))}
                  iconName={"ios-people-sharp"}
                />
              </View>
            </View>
            <View style={styles.field}>
              <View style={styles.timePickers}>
                <TouchableOpacity
                  onPress={
                    thisTimeAllDay == 1
                      ? () => {
                          return;
                        }
                      : showStartTimepicker
                  }
                  style={{
                    backgroundColor: "darkgrey",
                    paddingVertical: 10,
                    borderTopStartRadius: 10,
                    borderBottomStartRadius: 10,
                    borderRightColor: "lightgrey",
                    borderRightWidth: 1,
                  }}
                >
                  <Text
                    style={{
                      color: "black",
                      textAlign: "center",
                      fontWeight: "bold",
                    }}
                  >
                    {thisTimeAllDay == 1
                      ? "All day"
                      : startTimePicked
                      ? startTimeString
                      : "Pick a start time"}
                  </Text>
                </TouchableOpacity>
                {show && (
                  <DateTimePicker
                    testID="dateTimePicker"
                    value={startTime}
                    mode="time"
                    is24Hour={true}
                    onChange={onChangeStartTime}
                    timeZoneOffsetInMinutes={0}
                  />
                )}
              </View>
              <View style={styles.timePickers}>
                <TouchableOpacity
                  onPress={
                    thisTimeAllDay == 1
                      ? () => {
                          return;
                        }
                      : showEndTimepicker
                  }
                  style={{
                    backgroundColor: "darkgrey",
                    paddingVertical: 10,
                    borderTopEndRadius: 10,
                    borderBottomEndRadius: 10,
                    borderLeftColor: "lightgrey",
                    borderLeftWidth: 1,
                  }}
                >
                  <Text
                    style={{
                      color: "black",
                      textAlign: "center",
                      fontWeight: "bold",
                    }}
                  >
                    {thisTimeAllDay == 1
                      ? "All day"
                      : endTimePicked
                      ? endTimeString
                      : "Pick an end time"}
                  </Text>
                </TouchableOpacity>
                {showEndTime && (
                  <DateTimePicker
                    testID="dateTimePicker"
                    value={endTime}
                    mode="time"
                    is24Hour={true}
                    onChange={onChangeEndTime}
                    timeZoneOffsetInMinutes={0}

                  />
                )}
              </View>
            </View>
            <View style={styles.field}>
              <EmojiIcon emoji={"ios-location-sharp"} color={"#d9d9d9"} />
              <TextInput
                multiline={true}
                maxLength={100}
                value={thisLocationData != undefined ? thisLocationData : ""}
                onChangeText={setThisLocationData}
                placeholder="Enter a location."
                placeholderTextColor="#d9d9d9"
                style={styles.fieldText}
              ></TextInput>
              <View style={styles.openEventToggle}>
                <ToggleIcon
                  selected={thisLocationFlag == 1}
                  onSelect={() =>
                    setThisLocationFlag(Math.abs(thisLocationFlag - 1))
                  }
                  iconName={"ios-people-sharp"}
                />
              </View>
            </View>
            <View style={styles.field}>
              <EmojiIcon emoji={"ios-person-add-sharp"} color={"#d9d9d9"} />
              <View
                style={{
                  display: "flex",
                  flexDirection: "row",
                  marginLeft: 30,
                }}
              >
                {thisParticipantsData != undefined &&
                thisParticipantsData.length > 0 ? (
                  thisParticipantsData.map((user, index) => (
                    <ProfilePicture
                      userId={user.id}
                      key={index}
                      style={{
                        height: 40,
                        width: 40,
                        borderRadius: 50,
                        borderWidth: 1,
                        borderColor: "#000000",
                        marginRight: 10,
                      }}
                    />
                  ))
                ) : (
                  <></>
                )}
                <TouchableOpacity
                  style={{
                    borderWidth: 1,
                    borderColor: "grey",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 40,
                    height: 40,
                    backgroundColor: "grey",
                    borderRadius: 60,
                  }}
                  onPress={() => setModalVisible(true)}
                >
                  <View style={{ flex: 1, justifyContent: "center" }}>
                  {(thisParticipantsData == undefined)?<Icon name="add" color={"white"} size={20} />: <Icon name="pencil" color={"white"} size={20} />}
                  </View>
                </TouchableOpacity>
                <Modal
                    visible={timeDateWarningModalVisible}
                    transparent={true}
                  >
                    <View style ={{flex:1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center'}}>
                      <View style={{backgroundColor: "white", borderRadius: 10, padding: 20, marginHorizontal: 50}}>
                        <Text style={{fontSize: 15}}>Please make sure to fill in both the date and the time field. Alternatively, you can set them to "open"!</Text>
                        <View style={{flexDirection: "row", marginTop: 20}}>
                          <TouchableOpacity style={{flex: 1}} onPress={() => setTimeDateWarningModalVisible(false)}><Text style={{textAlign:"center", fontSize: 20}}>Ok, I will</Text></TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  </Modal>
                  <Modal
                    visible={titleWarningModalVisible}
                    transparent={true}
                  >
                    <View style ={{flex:1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center'}}>
                      <View style={{backgroundColor: "white", borderRadius: 10, padding: 20, marginHorizontal: 50}}>
                        <Text style={{fontSize: 15}}>Please make sure to fill in the title and not leave it empty.</Text>
                        <View style={{flexDirection: "row", marginTop: 20}}>
                          <TouchableOpacity style={{flex: 1}} onPress={() => setTitleWarningModalVisible(false)}><Text style={{textAlign:"center", fontSize: 20}}>Ok, I will</Text></TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  </Modal>
                <Modal visible={modalVisible} transparent={true}>
                  <View
                    style={{ padding: 20, flex: 1, backgroundColor: "white" }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                      }}
                    >
                      <TouchableOpacity onPress={() => setModalVisible(false)}>
                        <Icon name="close" color={"black"} size={30} />
                      </TouchableOpacity>
                    </View>
                    <View>
                      <Text
                        style={{
                          textAlign: "center",
                          fontSize: 25,
                          fontWeight: "bold",
                          marginTop: 10,
                          marginBottom: 50,
                        }}
                      >
                        Edit participants
                      </Text>
                      <View style={{ marginHorizontal: 30 }}>
                        {friendsObjects.map((user, index) => {
                          return (
                            <View
                              key={index}
                              style={{
                                flexDirection: "row",
                                justifyContent: "space-between",
                                alignItems: "center",
                                marginBottom: 10,
                              }}
                            >
                              <ProfilePicture
                                userId={user.id}
                                key={index}
                                style={{
                                  height: 40,
                                  width: 40,
                                  borderRadius: 50,
                                  borderWidth: 1,
                                  borderColor: "#000000",
                                  marginRight: 10,
                                }}
                              />
                              <Text>{user.name}</Text>
                              {thisParticipantsData == undefined ||
                              thisParticipantsData.filter(
                                (participant) => participant.id == user.id
                              ).length == 0 ? (
                                <Button
                                  onPress={() => {
                                    if (thisParticipantsData == undefined) {
                                      const emptyParticipantsList: User[] = [];
                                      emptyParticipantsList.push(user);
                                      setThisParticipantsData(
                                        emptyParticipantsList
                                      );
                                    } else {
                                      const newParticipantsList: User[] =
                                        thisParticipantsData;
                                      if((newParticipantsList.filter((participant) =>
                                      participant.id == user.id
                                       )).length == 0){
                                        newParticipantsList.push(user)
                                       }
                                       setThisParticipantsData(
                                        JSON.parse(JSON.stringify(newParticipantsList))
                                      )
                                    }
                                  }}
                                  title="Add"
                                  color="green"
                                />
                              ) : (
                                <Button
                                  onPress={() => {
                                    const participantsList: User[] =
                                      thisParticipantsData!;
                                    const newParticipantsList =
                                      participantsList.filter(
                                        (participant) =>
                                          participant.id != user.id
                                      );
                                    newParticipantsList.length == 0
                                      ? setThisParticipantsData(undefined)
                                      : setThisParticipantsData(
                                          newParticipantsList
                                        );
                                  }}
                                  title="Remove"
                                  color="red"
                                />
                              )}
                            </View>
                          );
                        })}
                      </View>
                    </View>
                  </View>
                </Modal>
              </View>
              <View style={styles.openEventToggle}>
                <ToggleIcon
                  selected={thisParticipantsFlag == 1}
                  onSelect={() =>
                    setThisParticipantsFlag(Math.abs(thisParticipantsFlag - 1))
                  }
                  iconName={"ios-people-sharp"}
                />
              </View>
            </View>
            <View style={styles.field}>
              <EmojiIcon emoji={"ios-color-palette-sharp"} color={"#d9d9d9"} />
              <View style={styles.colorContainer}>
                {["#d3d3d3", "#ffb6c1", "#add8e6", "#98fb98", "#e6add8"].map(
                  (color, index) => (
                    <TouchableOpacity
                      key={index}
                      id="color"
                      style={[
                        styles.colorCircle,
                        {
                          backgroundColor: color,
                          borderColor: [
                            "#d3d3d3",
                            "#ffb6c1",
                            "#add8e6",
                            "#98fb98",
                            "#e6add8",
                          ].map((color) =>
                            color === thisColorTagData ? "#000000" : "#ffffff"
                          )[index],
                        },
                      ]}
                      onPress={() => setThisColorTagData(color)}
                    />
                  )
                )}
              </View>
            </View>
            <View style={styles.field}>
              <EmojiIcon emoji={"ios-document-text-sharp"} color={"#d9d9d9"} />
              <TextInput
                multiline={true}
                maxLength={500}
                value={thisNoteData != undefined ? thisNoteData : ""}
                onChangeText={setThisNoteData}
                placeholder="Additional Notes."
                placeholderTextColor="#d9d9d9"
                style={styles.fieldText}
              ></TextInput>
              <View style={styles.openEventToggle}>
                <ToggleIcon
                  selected={thisNoteFlag == 1}
                  onSelect={() => setThisNoteFlag(Math.abs(thisNoteFlag - 1))}
                  iconName={"ios-people-sharp"}
                />
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </MenuProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "stretch",
    flex: 1, // flex: 1 should fill up whole screen. This means that the current width is 100% of the parent container
    justifyContent: "center",
    padding: 3,
    backgroundColor: "white",
  },
  field: {
    flexDirection: "row",
    alignItems: "center",
    padding: 5,
    paddingTop: 30,
  },
  fieldText: {
    paddingLeft: 30,
    flex: 1,
    fontSize: 25,
  },
  title: {
    textAlign: "center",
    marginBottom: 16,
    fontSize: 40,
    marginHorizontal: 40,
    paddingTop: 30,
  },
  colorContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 10,
  },
  colorCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    marginHorizontal: 5,
  },
  timePickers: {
    flex: 1,
  },
  openEventToggle: {
    marginLeft: "auto",
  },
  friendListEntryStyle: {
    fontSize: 20,
    marginHorizontal: 10,
  },
});
