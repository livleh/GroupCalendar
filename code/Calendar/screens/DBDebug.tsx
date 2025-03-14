import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  Button,
  GestureResponderEvent,
} from "react-native";
import React, { Component, useCallback, useEffect, useState } from "react";
import {
  getDBConnection,
  createEventsTable,
  addEvent,
  addUser,
  createFriendsWithTable,
  createParticipatesInTable,
  createUserTable,
  deleteEvent,
  deleteUser,
  editEvent,
  getEvents,
  getFriends,
  getUsers,
  removeFriend,
  addFriend,
  initDefaultData,
  eventsToTimeLineEvents,
  eventsToAgendaItems,
  getTemplateState,
} from "../services/db-service";

import { Event, User } from "../services/models";
import TopNavigation from "../components/TopNavigation";

const DBDebug = ({navigation}: any) => {
  const [usersLogData, setUsersLogData] = useState("No log");
  const [eventsLogData, setEventsLogData] = useState("No log");
  const [friendsWithLogData, setFriendsWithLogData] = useState("No log");
  const [participatesInLogData, setParticipatesInLogData] = useState("No log");
  const [performanceDataLogData, setPerformanceDataLogData] = useState("No log");
  const [templateStateLog, setTemplateStateLog] = useState("No log");


  /* const loadDataCallback = useCallback(async () => {
    const db = getDBConnection();
    initDefaultData(db);
  }, []);
  useEffect(() => {
    loadDataCallback();
  }, [loadDataCallback]); */

  function addUserButton(event: GestureResponderEvent): void {
    const db = getDBConnection();
    const addedUser: User = {
      id: "a3523s",
      name: "Hermann Rösti",
      profilePicPath: "../assets/image.jpg",
    };

    addUser(db, addedUser);
  }

  function deleteUserButton(event: GestureResponderEvent): void {
    const db = getDBConnection();

    deleteUser(db, "a3523s");
  }

  function addEventButton(event: GestureResponderEvent): void {
    const db = getDBConnection();
    const newEvent: Event = {
      id: "e4",
      creatorId: "a32c9",
      isTemplate: 0,
      title: "Geburifest",
      date: { flag: 0, data: 1700175600 },
      time: {
        flag: 1,
        data: { allDay: 1, startTime: 0, endTime: 0 },
      },
      location: { flag: 1, data: "Zuhause" },
      colorTag: "#0000",
      note: { flag: 1, data: "Bitte gute Laune mitbringen" },
      participants: { flag: 1, data: ["a24i6"] },
    };
    addEvent(db, newEvent);
  }
  function editEventButton(event: GestureResponderEvent): void {
    const db = getDBConnection();
    const oldEvent: Event = {
      id: "e4",
      isTemplate: 0,
      creatorId: "a32c9",
      title: "Geburifest",
      date: { flag: 0, data: 1700175600 },
      time: {
        flag: 1,
        data: { allDay: 1, startTime: 0, endTime: 0 },
      },
      location: { flag: 1, data: "Zuhause" },
      colorTag: "#0000",
      note: { flag: 1, data: "Bitte gute Laune mitbringen" },
      participants: { flag: 1, data: ["a24i6"] },
    };

    const newEvent: Event = {
      id: "e4",
      creatorId: "a32c9",
      isTemplate: 0,
      title: "Geburifest Adam",
      date: { flag: 0, data: 1700175600 },
      time: {
        flag: 1,
        data: { allDay: 1, startTime: 0, endTime: 0 },
      },
      location: { flag: 1, data: "Zuhause bei Adam" },
      colorTag: "#0000",
      note: { flag: 1, data: "Bitte gute Laune mitbringen" },
      participants: { flag: 1, data: ["a24i6"] },
    };

    editEvent(db, oldEvent, newEvent);
  }
  function deleteEventButton(event: GestureResponderEvent): void {
    const db = getDBConnection();
    deleteEvent(db, "e4");
  }

  function getUsersButton(event: GestureResponderEvent): void {
    const db = getDBConnection();
    getUsers(db,["a32c9", "a24i6"]).then((results) => console.log(results));
  }

  function getEventsButton(event: GestureResponderEvent): void {
    const db = getDBConnection();
    //getEvents(db, "a24i6", 0).then((results) => console.log(results));
    eventsToTimeLineEvents(db, "a34i1").then((results) => console.log(results));
    eventsToAgendaItems(db,"a34i1").then((results) => console.log(results[0].data));
  }

  function getTemplatesButton(event: GestureResponderEvent): void {
    const db = getDBConnection();
    getEvents(db, "a24i6", 1).then((results) => console.log(results));
  }

  function getFriendsButton(event: GestureResponderEvent): void {
    const db = getDBConnection();
    getFriends(db, "a24i6").then((results) => console.log(results));
  }

  async function logCurrentState(event: GestureResponderEvent): Promise<void> {
    let db = getDBConnection();

    //initialize users table with some objects if empty
    db.transaction((tx) => {
      tx.executeSql(`SELECT * FROM users`, undefined, (txObj, resultSet) => {
        const array = [];
        for (let index = 0; index < resultSet.rows.length; index++) {
          array.push(JSON.stringify(resultSet.rows.item(index)));
        }
        setUsersLogData(array.join("\n\n"));
      });
    });

    //initialize events table with some objects if empty
    db.transaction((tx) => {
      tx.executeSql(`SELECT * FROM events`, undefined, (txObj, resultSet) => {
        const array = [];
        for (let index = 0; index < resultSet.rows.length; index++) {
          array.push(JSON.stringify(resultSet.rows.item(index)));
        }
        setEventsLogData(array.join("\n\n"));
      });
    });

    //initialize friendsWith table with some objects if empty
    db.transaction((tx) => {
      tx.executeSql(
        `SELECT * FROM friendsWith`,
        undefined,
        (txObj, resultSet) => {
          const array = [];
          for (let index = 0; index < resultSet.rows.length; index++) {
            array.push(JSON.stringify(resultSet.rows.item(index)));
          }
          setFriendsWithLogData(array.join("\n\n"));
        }
      );
    });

    //initialize participatesIn table with some objects if empty
    db.transaction((tx) => {
      tx.executeSql(
        `SELECT * FROM participatesIn`,
        undefined,
        (txObj, resultSet) => {
          const array = [];
          for (let index = 0; index < resultSet.rows.length; index++) {
            array.push(JSON.stringify(resultSet.rows.item(index)));
          }
          setParticipatesInLogData(array.join("\n\n"));
        }
      );
    });

    db.transaction((tx) => {
      tx.executeSql(
        `SELECT * FROM performanceData`,
        undefined,
        (txObj, resultSet) => {
          const array = [];
          for (let index = 0; index < resultSet.rows.length; index++) {
            array.push(JSON.stringify(resultSet.rows.item(index)));
          }
          setPerformanceDataLogData(array.join("\n\n"));
        }
      );
    });

    setTemplateStateLog((await getTemplateState(db)).toString())
  }

  return (
    <ScrollView style={styles.container}>
      <TopNavigation navigation={navigation} title={'Database Debug'} color={'#000000'} />
      <View style={{marginHorizontal:20}}>
      <Text>{"\n"}</Text>

      <Text style={styles.subtitle}>DB Log</Text>

      <Text style={styles.logTitle}>{"users Table\n"}</Text>
      <Text>{usersLogData + "\n"}</Text>

      <Text style={styles.logTitle}>{"events Table\n"}</Text>
      <Text>{eventsLogData + "\n"}</Text>

      <Text style={styles.logTitle}>{"participatesIn Table\n"}</Text>
      <Text>{participatesInLogData + "\n"}</Text>

      <Text style={styles.logTitle}>{"friendsWith Table\n"}</Text>
      <Text>{friendsWithLogData + "\n"}</Text>

      <Text style={styles.logTitle}>{"performanceData Table\n"}</Text>
      <Text>{performanceDataLogData + "\n"}</Text>
      <Text style={styles.logTitle}>{"templateState Table\n"}</Text>
      <Text>{templateStateLog + "\n"}</Text>

      <Text style={styles.subtitle}>Actions</Text>

      <Button
        onPress={logCurrentState}
        title="Log current state"
        color="#841584"
      />
      <Text>{"\n"}</Text>

      <Button onPress={getEventsButton} title="Get events" color="#841584" />
      <Text>{"\n"}</Text>
      <Button
        onPress={getTemplatesButton}
        title="Get templates"
        color="#841584"
      />
      <Text>{"\n"}</Text>
      <Button onPress={getUsersButton} title="Get users" color="#841584" />
      <Text>{"\n"}</Text>
      <Button onPress={getFriendsButton} title="Get friends" color="#841584" />
      <Text>{"\n"}</Text>
      <Button onPress={addUserButton} title="Add new user" color="#841584" disabled />
      <Text>{"\n"}</Text>

      <Button onPress={deleteUserButton} title="Delete user" color="#841584" disabled/>
      <Text>{"\n"}</Text>

      <Button onPress={addEventButton} title="Add event" color="#841584" disabled/>
      <Text>{"\n"}</Text>

      <Button onPress={editEventButton} title="Edit event" color="#841584" disabled/>
      <Text>{"\n"}</Text>

      <Button
        onPress={deleteEventButton}
        title="Delete event"
        color="#841584"
        disabled
      />
      <Text>{"\n"}</Text>
      </View>
    </ScrollView>
  );
};
export default DBDebug;

const styles = StyleSheet.create({
  headStyle: {
    height: 30,
    width: 500,
    backgroundColor: "#ffe3f0",
  },
  logTitle: {
    fontWeight: "500",
  },
  container: {
    flex: 1
  },
  title: {
    fontSize: 25,
    fontWeight: "500",
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: "500",
    marginBottom: 20,
  },
});
