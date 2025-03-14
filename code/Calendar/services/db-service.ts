import * as SQLite from "expo-sqlite";
import { Event, User, EventRelation, FriendRelation, defaultEvents, defaultFriendRelations, defaultUsers, PerformanceData } from "./models";
import { timelineEvents } from "../timelineEvents";
import { getCalendarDateString } from "react-native-calendars/src/services";
import { TimelineEventProps } from "react-native-calendars";
import { filter, reject } from "lodash";
import { useState } from "react";


export const getDBConnection = () => {
  return SQLite.openDatabase("calendar-db2.db");
};

/**
 * All helper functions for initializing app data:
 *
 * initDefaultData(db: SQLiteDatabase) --> void
 * clearDatabase(db: SQLiteDatabase) --> void
 *
 * */

export const initDefaultData = async (db: SQLite.SQLiteDatabase) => {
  try {

    createEventsTable(db);
    createUserTable(db);
    createFriendsWithTable(db);
    createParticipatesInTable(db);
    createPerformanceDataTable(db)
    createTemplatesStateTable(db)

    console.log("Database INIT Log:");


    //init tables with some content
    db.transaction((tx) => {
      tx.executeSql(`SELECT * FROM users`, undefined, (txObj, resultSet) => {
        if (resultSet.rows.length == 0) {
          console.log("No users initialized. Default userbase is added...");
          addUser(db, defaultUsers[0]);
          addUser(db, defaultUsers[1]);
          addUser(db, defaultUsers[2]);
          addUser(db, defaultUsers[3]);
        } else {
          console.log("Users table already initialized...");
        }
      }, (_, error) => {
        console.log(error);
        return true;
      });
    });

    //init event and participatesIn tables with some content
    db.transaction((tx) => {
      tx.executeSql(`SELECT * FROM events`, undefined, (txObj, resultSet) => {
        if (resultSet.rows.length == 0) {
          console.log("No events initialized. Default events are added...");
          /* addEvent(db, defaultEvents[0]);
          addEvent(db, defaultEvents[1]);
          addEvent(db, defaultEvents[2]); */
          initializeTimelineEvents(db);
          /* console.log("Database Events Date Update Log:");
          console.log("Database Event Dates Update started...");
          updateEventDates(db, 0);
          updateEventDates(db, 1)
          console.log("Database Event Dates Update finished..."); */
        } else {
          console.log("Events and participatesIn table already initialized...");
        }
      }, (_, error) => {
        console.log(error);
        return true;
      });
    });

    //init friendsWith table with some content
    db.transaction((tx) => {
      tx.executeSql(
        `SELECT * FROM friendsWith`,
        undefined,
        (txObj, resultSet) => {
          if (resultSet.rows.length == 0) {
            console.log("No friend relationships initialized. Default friends relationships are added...");
            defaultFriendRelations.forEach(friendRelation => {
              addFriend(db, friendRelation.user1Id, friendRelation.user2Id);
            });
          } else {
            console.log("friendsWith table already initialized...");
          }
        }, (_, error) => {
          console.log(error);
          return true;
        }
      );
    });
  } catch (error) {
    console.log(error)
  }

  //init tables with some content
  db.transaction((tx) => {
    tx.executeSql(`SELECT * FROM performanceData`, undefined, (txObj, resultSet) => {
      if (resultSet.rows.length == 0) {
        console.log("No performance data initialized. Default performance data is added...");
        addTester(db);
      } else {
        console.log("Performance data table already initialized...");
      }
    }, (_, error) => {
      console.log(error);
      return true;
    });
  });

  //init tables with some content
  db.transaction((tx) => {
    tx.executeSql(`SELECT * FROM templateState`, undefined, (txObj, resultSet) => {
      if (resultSet.rows.length == 0) {
        console.log("No template variant state initialized. Default template state is added...");
        db.transaction((tx) => {
          tx.executeSql(
            `INSERT INTO templateState(state) values (0);`,
            undefined,
            undefined,
            (_, error) => {
              console.log(error);
              return true;
            }
          );
        });
      } else {
        console.log("Template variant state data already initialized...");
      }
    }, (_, error) => {
      console.log(error);
      return true;
    });
  });



};

export const clearDatabase = async (db: SQLite.SQLiteDatabase) => {
  console.log("Database CLEAR Log:");

  try {

    db.transaction((tx) => {
      tx.executeSql(`DELETE FROM users`, undefined, (txObj, resultSet) => {
        if (resultSet.rows.length == 0) {
          console.log("Users table cleared...");
        }
      }, (_, error) => {
        console.log(error);
        return true;
      });
    });

    db.transaction((tx) => {
      tx.executeSql(`DELETE FROM events`, undefined, (txObj, resultSet) => {
        if (resultSet.rows.length == 0) {
          console.log("Events table cleared...");
        }
      }, (_, error) => {
        console.log(error);
        return true;
      });
    });

    db.transaction((tx) => {
      tx.executeSql(`DELETE FROM participatesIn`, undefined, (txObj, resultSet) => {
        if (resultSet.rows.length == 0) {
          console.log("participatesIn table cleared...");
        }
      }, (_, error) => {
        console.log(error);
        return true;
      });
    });

    db.transaction((tx) => {
      tx.executeSql(`DELETE FROM friendsWith`, undefined, (txObj, resultSet) => {
        if (resultSet.rows.length == 0) {
          console.log("friendsWith table cleared...");
        }
      }, (_, error) => {
        console.log(error);
        return true;
      });
    });

    db.transaction((tx) => {
      tx.executeSql(`DELETE FROM performanceData`, undefined, (txObj, resultSet) => {
        if (resultSet.rows.length == 0) {
          console.log("Performance data table cleared...");
        }
      }, (_, error) => {
        console.log(error);
        return true;
      });
    });


  } catch (error) {
    console.log(error)
  }


};


/**
 * All helper functions for creating tables:
 *
 * createUserTabe(db: SQLiteDatabase) --> void
 * createParticipatesInTable(db: SQLiteDatabase) --> void
 * createFriendsWithTable(db: SQLiteDatabase) --> void
 * createEventsTable(db: SQLiteDatabase) --> void
 * createPerformanceDataTable(db: SQLiteDatabase) --> void
 * */

export const createUserTable = async (db: SQLite.SQLiteDatabase) => {
  db.transaction((tx) => {
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT,
      profilePicPath TEXT 
    );`,
      undefined,
      undefined,
      (_, error) => {
        console.log(error);
        return true;
      }
    );
  });
};

export const createTemplatesStateTable = async (db: SQLite.SQLiteDatabase) => {
  db.transaction((tx) => {
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS templateState (
      state INTEGER
    );`,
      undefined,
      undefined,
      (_, error) => {
        console.log(error);
        return true;
      }
    );
  });
};

export const createParticipatesInTable = async (db: SQLite.SQLiteDatabase) => {
  db.transaction((tx) => {
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS participatesIn (
      userId TEXT,
      eventId TEXT,
      PRIMARY KEY (userID, eventID)
    );`,
      undefined,
      undefined,
      (_, error) => {
        console.log(error);
        return true;
      }
    );
  });
};

export const createFriendsWithTable = async (db: SQLite.SQLiteDatabase) => {
  db.transaction((tx) => {
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS friendsWith (
      user1Id TEXT,
      user2Id TEXT,
      PRIMARY KEY (user1ID, user2ID)
    );`,
      undefined,
      undefined,
      (_, error) => {
        console.log(error);
        return true;
      }
    );
  });
};

export const createEventsTable = async (db: SQLite.SQLiteDatabase) => {
  db.transaction((tx) => {
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS events (
      id TEXT PRIMARY KEY,
      creatorId TEXT,
      isTemplate INTEGER,
      title TEXT,
      date TEXT,
      time TEXT,
      location TEXT,
      participants TEXT,
      colorTag TEXT,
      note TEXT
    );`,
      undefined,
      undefined,
      (_, error) => {
        console.log(error);
        return true;
      }
    );
  });
};

export const createPerformanceDataTable = async (db: SQLite.SQLiteDatabase) => {
  db.transaction((tx) => {
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS performanceData (
      variant TEXT PRIMARY KEY,
      time INTEGER,
      scroll INTEGER 
    );`,
      undefined,
      undefined,
      (_, error) => {
        console.log(error);
        return true;
      }
    );
  });
};

/**
 * All helper functions for adding, changing and getting items in the users table:
 *
 * addUser(db: SQLiteDatabase, user: User) --> void
 * deleteUser(db: SQLiteDatabase, userId: string) --> void
 * getUsers(db: SQLiteDatabase) --> Promise<User[]>
 * getCurrentUser(db: SQLiteDatabase) --> Promise<User>
 *
 * */

export const addUser = async (db: SQLite.SQLiteDatabase, user: User) => {
  db.transaction((tx) => {
    tx.executeSql(
      `INSERT INTO users(id, name, profilePicPath) values ("${user.id}", "${user.name}", "${user.profilePicPath}");`,
      undefined,
      (txObj, error) => console.log(error)
    );
  });
};

export const deleteUser = async (db: SQLite.SQLiteDatabase, userId: string) => {
  db.transaction((tx) => {
    tx.executeSql(
      `DELETE FROM users WHERE id == "${userId}";`,
      undefined,
      undefined,
      (_, error) => {
        console.log(error);
        return true;
      }
    );
  });
};

export const getUsers = async (db: SQLite.SQLiteDatabase, userIds: string[]) => {
  return new Promise<User[]>((resolve, _reject) => {
    try {
      const users: User[] = [];
      let userIdConcat: string = "";
      userIds.forEach((id, index) => {
        index == 0
          ? (userIdConcat = userIdConcat + "'" + id + "'")
          : (userIdConcat = userIdConcat + ",'" + id + "'");
      });
      db.transaction((tx) => {
        tx.executeSql(
          `SELECT * FROM users WHERE id IN (` +
          userIdConcat +
          `);`,
          undefined,
          (txObj, resultSet) => {
            for (let index = 0; index < resultSet.rows.length; index++) {
              users.push(resultSet.rows.item(index));
            }
            resolve(users);
          },
          (_, error) => {
            console.log(error);
            return true;
          }
        );
      });
    } catch (error) {
      console.log(error)
      reject("getUser function promise in database rejected")
    }
  });
};


export const getCurrentUser = async (db: SQLite.SQLiteDatabase) => {
  return new Promise<User>((resolve, _reject) => {
    try {
      db.transaction((tx) => {
        tx.executeSql(
          `SELECT * FROM users WHERE id == "a34i1";`,
          undefined,
          (txObj, resultSet) => {
            const user: User = resultSet.rows.item(0)
            resolve(user);
          },
          (_, error) => {
            console.log(error);
            return true;
          }
        );
      });
    } catch (error) {
      console.log(error)
      reject("getCurrentUser promise in database rejected")
    }
  });
};

/**
 * All helper functions for changing and getting items in the events table:
 *
 * addEvent(db: SQLiteDatabase, userId: string, event: Event) --> void
 * editEvent(db: SQLiteDatabase, userId: string, oldEvent: Event,newEvent: Event) --> void
 * deleteEvent(db: SQLiteDatabase, eventId: string) --> void
 * getEvents(db: SQLiteDatabase, userId: string, isTemplate: number) --> Promise<Event[]>
 * updateEventDate(db: SQLiteDatabase, isTemplate: number) --> void
 * */
export const initializeTimelineEvents = (db: SQLite.SQLiteDatabase) => {
  const isTemplateList: number[] = [0,1,1,0,0,0,0,1,0,1,1,0,1,0,0,0,1,1,1,1,1,1,1,1]
  const openLocationList:number[] = [0,0,0,0,1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0]
  const locations:any = ["At home","ETH Foodlab", "Universitätsspital Zürich","Tannenbar ETH",undefined,"Fitnessparcour Obere Letten", "St.Gallen Stadtpark",undefined, "ETH HG", "Orthopädie Sihlcity", "Mensa Polyterrasse", undefined, undefined, undefined, undefined,"Kunsthaus Zürich", "Yoga Studio Irchel", "At home in my bed",undefined,"Summer house in Antibes", undefined,undefined, "Arena Cinemas", "Zoo Zürich"]
  const openParticipantsList: number[] = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0]
  const participantsList: any = [undefined,["a52d3","a24i6", "a32c9"],undefined,["a52d3", "a32c9"],undefined,undefined,undefined,["a52d3"], ["a24i6"],undefined,["a24i6","a52d3"],undefined,["a52d3","a24i6", "a32c9"],undefined,undefined, undefined,undefined, ["a52d3","a24i6", "a32c9"], ["a52d3"],undefined,undefined,undefined,["a52d3","a24i6", "a32c9"],["a52d3"]]
  const alldayList: number[] = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1]

 
  for (let i = 0; i < timelineEvents.length; i++) {
    const e = timelineEvents[i];
    const newEvent: Event = {
      id: "-1",
      creatorId: "a34i1",
      isTemplate: isTemplateList[i],
      title: e.title,
      date: {
        flag: 0,
        data: (e.start == "")? undefined:(new Date(getCalendarDateString(e.start)).getTime()) / 1000
      },
      time: {
        flag: 0,
        data: (e.start == "")? undefined: {
          allDay: alldayList[i],
          startTime: (new Date(e.start).getHours() * 3600) + (new Date(e.start).getMinutes() * 60) + (new Date(e.start).getSeconds()),
          endTime: (new Date(e.end).getHours() * 3600) + (new Date(e.end).getMinutes() * 60) + (new Date(e.end).getSeconds())
        }
      },
      location: {
        flag: openLocationList[i],
        data: locations[i]
      },
      participants: {
        flag: openParticipantsList[i],
        data: participantsList[i]
      },
      colorTag: e.color == undefined ? "#add8e6": e.color,
      note: {
        flag: 0,
        data: e.summary
      }
    }
    if(i == 10){
      newEvent.date.flag = 1
      newEvent.isTemplate = 1
      newEvent.date.data = undefined
      newEvent.note.data = undefined
    }
    if(i ==22){
      newEvent.date.data = undefined
      newEvent.date.flag = 0
      newEvent.note.data = undefined,
      newEvent.time.data = undefined
    }
    if(i ==23){
      newEvent.date.data = undefined
      newEvent.date.flag = 0
      newEvent.note.data = undefined
      newEvent.time.data = {
        allDay: 1,
        startTime: 0,
        endTime: 0
      }
    }
    addEvent(db, newEvent)
  }
}
export const eventsToAgendaItems = (db: SQLite.SQLiteDatabase, userId: string) => {
  return new Promise<{ title?: string, data: { start?: string, end?: string, title: string, color: string | undefined }[] }[]>(async (resolve, _reject) => {
    try {
      var filteredArray: Event[] = [];
      filteredArray = await getEvents(db, userId, 0)
      filteredArray = filteredArray.filter((element: Event) => (element.date.flag == 0 && element.time.flag == 0));
      var agendaItems: { title?: string, data: { start?: string, end?: string, title: string, color: string | undefined, id: string }[] }[] = [];
      for (var i in filteredArray) {
        var event = filteredArray[i];
        const start = new Date((event.date.data! + event.time.data!.startTime) * 1000);
        const temp = agendaItems.findIndex((value) => { return (start.toISOString().split('T')[0].substring(0, 8) + start.getDate() == value.title) });
        if (temp == -1) {
          agendaItems.push({ title: start.toISOString().split('T')[0].substring(0, 8) + start.getDate(), data: [{ start: event.time.data!.allDay == 1 ? 'All Day' : new Date((event.date.data! + event.time.data!.startTime) * 1000).toString().substring(16, 21), end: event.time.data!.allDay == 1 ? 'All Day' : new Date((event.date.data! + event.time.data!.endTime) * 1000).toString().substring(16, 21), title: event.title.length > 40 ? event.title.substring(0, 30) + '...' : event.title, color: event.colorTag == ""? "lightgrey" : event.colorTag, id: event.id }] })
        }
        else {
          agendaItems[temp].data.push({ start: event.time.data!.allDay == 1 ? 'All Day' : new Date((event.date.data! + event.time.data!.startTime) * 1000).toString().substring(16, 21), end: event.time.data!.allDay == 1 ? 'All Day' : new Date((event.date.data! + event.time.data!.endTime) * 1000).toString().substring(16, 21), title: event.title.length > 40 ? event.title.substring(0, 30) + '...' : event.title, color: event.colorTag == ""? "lightgrey" : event.colorTag, id: event.id })
        }
      }
      resolve(agendaItems)
    } catch (error) {
      console.log(error)
      reject("events to agenda items promise rejected")
    }
  })
}

export const eventsToTimeLineEvents = async (db: SQLite.SQLiteDatabase, userId: string) => {
  return new Promise<TimelineEventProps[]>(async (resolve, _reject) => {
   try {
     var filteredArray: Event[] = [];
     filteredArray = await getEvents(db, userId, 0);
     filteredArray = filteredArray.filter((element: Event) => element.date.flag == 0 && element.time.flag == 0);
     const timelineEvents: TimelineEventProps[] = [];
     for (var i in filteredArray) {
       if(filteredArray[i].time.data?.allDay == 1){
         timelineEvents.push({
           id: filteredArray[i].id,
           start: getCalendarDateString(new Date((filteredArray[i].date.data! + filteredArray[i].time.data!.startTime) * 1000)) + ' ' + '00:00:00',
           end: getCalendarDateString(new Date((filteredArray[i].date.data! + filteredArray[i].time.data!.endTime) * 1000)) + ' ' + '24:00:00',
           title: filteredArray[i].title,
           color: filteredArray[i].colorTag,
           summary: filteredArray[i].note.data,
         })
       }else{
         timelineEvents.push({
         id: filteredArray[i].id,
         start: getCalendarDateString(new Date((filteredArray[i].date.data! + filteredArray[i].time.data!.startTime) * 1000)) + ' ' + new Date((filteredArray[i].date.data! - 3600 + filteredArray[i].time.data!.startTime) * 1000).toString().substring(16, 24),
         end: getCalendarDateString(new Date((filteredArray[i].date.data! + filteredArray[i].time.data!.endTime) * 1000)) + ' ' + new Date((filteredArray[i].date.data! - 3600 + filteredArray[i].time.data!.endTime) * 1000).toString().substring(16, 24),
         title: filteredArray[i].title,
         color: filteredArray[i].colorTag,
         summary: filteredArray[i].note.data,
       })
       }
       
     }
     resolve(timelineEvents);
   } catch (error) {
    console.log(error)
    reject("events to timeline events promise rejected")
   }
  });
}

export const addEvent = async (db: SQLite.SQLiteDatabase, event: Event) => {

  //preprocess the event before adding it to the database
  let adaptedEvent: Event = event
  if (adaptedEvent.date.data !== undefined) {
    const newDate: number = event.date.data! - (event.date.data! % 86400)
    adaptedEvent.date.data = newDate;
  }

  if (adaptedEvent.time.data !== undefined) {
    let startTime: number = event.time.data!.startTime % 86400
    startTime = startTime - (startTime % 60)
    let endTime: number = event.time.data!.endTime % 86400
    endTime = endTime - (endTime % 60)
    adaptedEvent.time.data.startTime = startTime;
    adaptedEvent.time.data.endTime = endTime;
  }

  //assign the event a random string as id
  if (adaptedEvent.id == "-1") {
    adaptedEvent.id = generateString(5)
  }

  //replace ' character with two '' s
  adaptedEvent.title = adaptedEvent.title.replaceAll("'", "''");
  if (adaptedEvent.location.data !== undefined) {
    adaptedEvent.location.data = adaptedEvent.location.data.replaceAll("'", "''");
  }

  if (adaptedEvent.note.data !== undefined) {
    adaptedEvent.note.data = adaptedEvent.note.data.replaceAll("'", "''");
  }


  db.transaction((tx) => {
    //adding event relations of participants
    if (adaptedEvent.participants.data != undefined) {
      adaptedEvent.participants.data.forEach(async (userId) => {
        tx.executeSql(
          `INSERT INTO participatesIn(userId, eventId) values ("${userId}", "${adaptedEvent.id}");`,
          undefined,
          undefined,
          (_, error) => {
            console.log(error);
            return true;
          }
        );
      });
    }

    //adding event relations of creator
    tx.executeSql(
      `INSERT INTO participatesIn(userId, eventId) values ("${adaptedEvent.creatorId}", "${adaptedEvent.id}");`,
      undefined,
      undefined,
      (_, error) => {
        console.log(error);
        return true;
      }
    );

    //adding event
    tx.executeSql(
      `INSERT INTO events(id, creatorId, isTemplate, title, date, time, location, participants, colorTag, note) values ("${adaptedEvent.id
      }", "${adaptedEvent.creatorId
      }",${adaptedEvent.isTemplate},"${adaptedEvent.title}",'${JSON.stringify(
        adaptedEvent.date
      )}', '${JSON.stringify(adaptedEvent.time)}', '${JSON.stringify(
        adaptedEvent.location
      )}','${JSON.stringify(adaptedEvent.participants)}',"${adaptedEvent.colorTag
      }",'${JSON.stringify(adaptedEvent.note)}');`,
      undefined,
      undefined,
      (_, error) => {
        console.log(error);
        return true;
      }
    );
  });
};

export const editEvent = async (
  db: SQLite.SQLiteDatabase,
  oldEvent: Event,
  newEvent: Event
) => {
  db.transaction((tx) => {
    //removing old event relations
    if (oldEvent.participants.data != undefined) {
      oldEvent.participants.data.forEach(async (userId) => {
        tx.executeSql(
          `DELETE FROM participatesIn WHERE userId == "${userId}" AND eventId == "${oldEvent.id}";`,
          undefined,
          undefined,
          (_, error) => {
            console.log(error);
            return true;
          }
        );
      });
    }

    //adding new event relations
    if (newEvent.participants.data != undefined) {
      newEvent.participants.data.forEach(async (userId) => {
        tx.executeSql(
          `INSERT INTO participatesIn(userId, eventId) values ("${userId}", "${newEvent.id}");`,
          undefined,
          undefined,
          (_, error) => {
            console.log(error);
            return true;
          }
        );
      });
    }

    //preprocess and update event

    //replace ' character with two '' s
    let adaptedEvent = newEvent;
    adaptedEvent.title = adaptedEvent.title.replaceAll("'", "''");
    if (adaptedEvent.location.data !== undefined) {
      adaptedEvent.location.data = adaptedEvent.location.data.replaceAll("'", "''");
    }

    if (adaptedEvent.note.data !== undefined) {
      adaptedEvent.note.data = adaptedEvent.note.data.replaceAll("'", "''");
    }
    tx.executeSql(
      `REPLACE INTO events(id, creatorId, isTemplate, title, date, time, location, participants, colorTag, note) values ("${adaptedEvent.id
      }", "${adaptedEvent.creatorId
      }",${adaptedEvent.isTemplate},"${adaptedEvent.title}",'${JSON.stringify(
        adaptedEvent.date
      )}', '${JSON.stringify(adaptedEvent.time)}', '${JSON.stringify(
        adaptedEvent.location
      )}','${JSON.stringify(adaptedEvent.participants)}',"${adaptedEvent.colorTag
      }",'${JSON.stringify(adaptedEvent.note)}');`,
      undefined,
      undefined,
      (_, error) => {
        console.log(error);
        return true;
      }
    );
  });
};

export const deleteEvent = async (
  db: SQLite.SQLiteDatabase,
  eventId: string
) => {
  db.transaction((tx) => {
    tx.executeSql(
      `DELETE FROM participatesIn WHERE eventId == "${eventId}";`,
      undefined,
      undefined,
      (_, error) => {
        console.log(error);
        return true;
      }
    );
    tx.executeSql(
      `DELETE FROM events WHERE id == "${eventId}";`,
      undefined,
      undefined,
      (_, error) => {
        console.log(error);
        return true;
      }
    );
  });
};

export const getEvents = async (
  db: SQLite.SQLiteDatabase,
  userId: string,
  isTemplate: number
) => {
  return new Promise<Event[]>((resolve, _reject) => {
    try {
      const events: Event[] = [];
      db.transaction((tx) => {
        //get all eventIds that correspond to this user
        const eventIds: string[] = [];
        tx.executeSql(
          `SELECT eventId FROM participatesIn WHERE userId == "${userId}";`,
          undefined,
          (txObj, resultSet) => {
            for (let index = 0; index < resultSet.rows.length; index++) {
              eventIds.push(resultSet.rows.item(index).eventId);
            }
            let eventIdsConcat: string = "";
            eventIds.forEach((word, index) => {
              index == 0
                ? (eventIdsConcat = eventIdsConcat + "'" + word + "'")
                : (eventIdsConcat = eventIdsConcat + ",'" + word + "'");
            });
  
            //differentiate between templates and non-templates (normal events / open events)
            if (isTemplate == 1) {
              tx.executeSql(
                `SELECT * FROM events WHERE id IN (` +
                eventIdsConcat +
                `) AND isTemplate == 1;`,
                undefined,
                (txObj, resultSet) => {
                  for (let index = 0; index < resultSet.rows.length; index++) {
                    const dateObj:string = resultSet.rows.item(index)["date"]
                    const timeObj:string = resultSet.rows.item(index)["time"]
                    const locationObj:string = resultSet.rows.item(index)["location"]
                    const participantsObj:string = resultSet.rows.item(index)["participants"]
                    const noteObj:string = resultSet.rows.item(index)["note"]
                    const parsedEvent: Event = {
                      id: resultSet.rows.item(index)["id"],
                      creatorId: resultSet.rows.item(index)["creatorId"],
                      isTemplate: resultSet.rows.item(index)["isTemplate"],
                      date: JSON.parse(dateObj),
                      time: JSON.parse(timeObj),
                      location: JSON.parse(locationObj),
                      note: JSON.parse(noteObj),
                      participants: JSON.parse(participantsObj),
                      title: resultSet.rows.item(index)["title"],
                      colorTag: resultSet.rows.item(index)["colorTag"]
                    }
                    events.push(parsedEvent);
                  }
                  //reverse preprocessing of event that happened in the addEvent() function
                  events.forEach((event, index) => {
                    event.title = event.title.replaceAll("''", "'");
                    if (event.location.data !== undefined) {
                      event.location.data = event.location.data.replaceAll("''", "'");
                    }
  
                    if (event.note.data !== undefined) {
                      event.note.data = event.note.data.replaceAll("''", "'");
                    }
                  });
                  resolve(events);
                },
                (_, error) => {
                  console.log(error);
                  return true;
                }
              );
            } else if (isTemplate == 0) {
              tx.executeSql(
                `SELECT * FROM events WHERE id IN (` +
                eventIdsConcat +
                `) AND isTemplate == 0;`,
                undefined,
                (txObj, resultSet) => {
                  for (let index = 0; index < resultSet.rows.length; index++) {
                    const dateObj:string = resultSet.rows.item(index)["date"]
                    const timeObj:string = resultSet.rows.item(index)["time"]
                    const locationObj:string = resultSet.rows.item(index)["location"]
                    const participantsObj:string = resultSet.rows.item(index)["participants"]
                    const noteObj:string = resultSet.rows.item(index)["note"]
                    const parsedEvent: Event = {
                      id: resultSet.rows.item(index)["id"],
                      creatorId: resultSet.rows.item(index)["creatorId"],
                      isTemplate: resultSet.rows.item(index)["isTemplate"],
                      date: JSON.parse(dateObj),
                      time: JSON.parse(timeObj),
                      location: JSON.parse(locationObj),
                      note: JSON.parse(noteObj),
                      participants: JSON.parse(participantsObj),
                      title: resultSet.rows.item(index)["title"],
                      colorTag: resultSet.rows.item(index)["colorTag"]
                    }
                    events.push(parsedEvent);
  
                  }
                  //reverse preprocessing of event that happened in the addEvent() function
                  events.forEach((event, index) => {
                    event.title = event.title.replaceAll("''", "'");
                    if (event.location.data !== undefined) {
                      event.location.data = event.location.data.replaceAll("''", "'");
                    }
  
                    if (event.note.data !== undefined) {
                      event.note.data = event.note.data.replaceAll("''", "'");
                    }
                  });                
                  resolve(events);
                },
                (_, error) => {
                  console.log(error);
                  return true;
                }
              );
            }
          },
          (_, error) => {
            console.log(error);
            return true;
          }
        );
      });
    
    } catch (error) {
      console.log(error)
      reject("getting events from db rejected")
    }});
};


export const updateEventDates = async (
  db: SQLite.SQLiteDatabase,
  isTemplate: number
) => {
  const currentUser: User = await getCurrentUser(db)
  getEvents(db, currentUser.id, isTemplate).then((events: Event[]) => {
    events.forEach((event: Event) => {
      if (event.date.data != undefined) {
        db.transaction((tx) => {
          //replace ' character with two '' s
          let adaptedEvent = event;
          adaptedEvent.title = adaptedEvent.title.replaceAll("'", "''");
          if (adaptedEvent.location.data !== undefined) {
            adaptedEvent.location.data = adaptedEvent.location.data.replaceAll("'", "''");
          }

          if (adaptedEvent.note.data !== undefined) {
            adaptedEvent.note.data = adaptedEvent.note.data.replaceAll("'", "''");
          }

          //adjust the date of the event
          const unixSec = Math.floor(Date.now() / 1000);
          const dateTodayUnixSec = unixSec - (unixSec % 86400); //at 00:00
          const dayMultiplier = Math.floor(Math.random() * 4); //random multiplier between 0 and 4
          const newDate = dateTodayUnixSec + (dayMultiplier * 86400);
          adaptedEvent.date.data = newDate;

          tx.executeSql(
            `REPLACE INTO events(id, creatorId, isTemplate, title, date, time, location, participants, colorTag, note) values ("${adaptedEvent.id
            }", "${adaptedEvent.creatorId
            }",${adaptedEvent.isTemplate},"${adaptedEvent.title}",'${JSON.stringify(
              adaptedEvent.date
            )}', '${JSON.stringify(adaptedEvent.time)}', '${JSON.stringify(
              adaptedEvent.location
            )}','${JSON.stringify(adaptedEvent.participants)}',"${adaptedEvent.colorTag
            }",'${JSON.stringify(adaptedEvent.note)}');`,
            undefined,
            undefined,
            (_, error) => {
              console.log(error);
              return true;
            }
          );
        });
      }

    });
  })


};

/**
 * All helper functions for the participatesIn and friendsWith relation tables:
 *
 * getFriends(db: SQLiteDatabase, userId: string) --> Promise<User[]>
 * removeFriend(db: SQLiteDatabase,userId: string, friendId: string) --> void
 * addFriend(db: SQLiteDatabase, userId: string, friendId: string) --> void
 *
 * */

export const getFriends = async (db: SQLite.SQLiteDatabase, userId: string) => {
  return new Promise<string[]>((resolve, _reject) => {
    try {
      const users: string[] = [];
      db.transaction((tx) => {
        tx.executeSql(
          `SELECT * FROM friendsWith WHERE user1Id == "${userId}" OR user2Id == "${userId}";`,
          undefined,
          (txObj, resultSet) => {
            for (let index = 0; index < resultSet.rows.length; index++) {
              const user1: string = resultSet.rows.item(index).user1Id;
              const user2: string = resultSet.rows.item(index).user2Id;
              if (user1 === userId) {
                users.push(user2);
              } else {
                users.push(user1);
              }
            }
            resolve(users);
          },
          (_, error) => {
            console.log(error);
            return true;
          }
        );
      });
    } catch (error) {
      console.log(error)
      reject("getFriends function in database")
    }
  });
};

export const addFriend = async (
  db: SQLite.SQLiteDatabase,
  userId: string,
  friendId: string
) => {
  db.transaction((tx) => {
    tx.executeSql(
      `INSERT INTO friendsWith(user1Id, user2Id) values ("${userId}","${friendId}");`,
      undefined,
      undefined,
      (_, error) => {
        console.log(error);
        return true;
      }
    );
  });
};

export const removeFriend = async (
  db: SQLite.SQLiteDatabase,
  userId: string,
  friendId: string
) => {
  db.transaction((tx) => {
    tx.executeSql(
      `DELETE FROM friendsWith WHERE (user1Id == "${userId}" AND user2Id == "${friendId}") OR (user1Id == "${friendId}" AND user2Id == "${userId}");`,
      undefined,
      undefined,
      (_, error) => {
        console.log(error);
        return true;
      }
    );
  });
};

/**
 * All helper functions for the performanceData table:
 *
 * addNewTester(db: SQLiteDatabase) --> void
 * updatePerformanceDataScroll(db: SQLiteDatabase, newScroll: number) --> void
* updatePerformanceDataTime(db: SQLiteDatabase, newTime: number) --> void
 * getPerformanceData(db: SQLiteDatabase) -->PeformanceData[]
 * */
export const getPerformanceData = async (db: SQLite.SQLiteDatabase) => {
  return new Promise<PerformanceData[]>((resolve, _reject) => {
    try {
      const data: PerformanceData[] = [];
      db.transaction((tx) => {
        tx.executeSql(
          `SELECT * FROM performanceData ORDER BY variant ASC;`,
          undefined,
          (txObj, resultSet) => {
            for (let index = 0; index < resultSet.rows.length; index++) {
              data.push(resultSet.rows.item(index))
            }
            resolve(data);
          },
          (_, error) => {
            console.log(error);
            return true;
          }
        );
      });
    } catch (error) {
      console.log(error)
      reject("getPerformance function in database rejected")
    }
  });
};

export const addTester = async (
  db: SQLite.SQLiteDatabase,
) => {
  db.transaction((tx) => {
    tx.executeSql(
      `INSERT INTO performanceData(variant, time, scroll) values ("A",0,0);`,
      undefined,
      undefined,
      (_, error) => {
        console.log(error);
        return true;
      }
    );
    tx.executeSql(
      `INSERT INTO performanceData(variant, time, scroll) values ("B",0,0);`,
      undefined,
      undefined,
      (_, error) => {
        console.log(error);
        return true;
      }
    );
  });
};

export const updatePerformanceDataScroll = async (db: SQLite.SQLiteDatabase, variant: string, newScroll: number) => {
  //first get the old performance data
  db.transaction((tx) => {
    tx.executeSql(
      `UPDATE performanceData SET scroll == ${newScroll} WHERE variant == "${variant}";`,
      undefined,
      undefined,
      (_, error) => {
        console.log(error);
        return true;
      }
    );
  });

  /* getPerformanceData(db).then((oldData) => {
    const variantIndex = (variant == "A") ? 0 : 1;
    db.transaction((tx) => {
      tx.executeSql(
        `REPLACE INTO performanceData(variant, time, scroll) values ("${variant}", ${timeToAdd + oldData[variantIndex].time},${scrollToAdd + oldData[variantIndex].scroll});`,
        undefined,
        undefined,
        (_, error) => {
          console.log(error);
          return true;
        }
      );
    });
  }) */
};

export const updatePerformanceDataTime = async (db: SQLite.SQLiteDatabase, variant: string, newTime: number) => {
  //first get the old performance data
  db.transaction((tx) => {
    tx.executeSql(
      `UPDATE performanceData SET time == ${newTime} WHERE variant == "${variant}";`,
      undefined,
      undefined,
      (_, error) => {
        console.log(error);
        return true;
      }
    );
  });
};

export const setTemplateState = async (db: SQLite.SQLiteDatabase, newState: number) => {
  //first get the old performance data
  db.transaction((tx) => {
    tx.executeSql(
      `UPDATE templateState SET state == ${newState} WHERE state == "${Math.abs(newState-1)}";`,
      undefined,
      undefined,
      (_, error) => {
        console.log(error);
        return true;
      }
    );
  });
};

export const getTemplateState = async (db: SQLite.SQLiteDatabase) => {
  return new Promise<number>((resolve, _reject) => {
    try {
      db.transaction((tx) => {
        tx.executeSql(
          `SELECT * FROM templateState;`,
          undefined,
          (txObj, resultSet) => {
            resolve(resultSet.rows.item(0)["state"]);
          },
          (_, error) => {
            console.log(error);
            return true;
          }
        );
      });
    } catch (error) {
      console.log(error)
      reject("getTemplateState function in database rejected")
    }
  });
};



const replacer = (key: string, value?: string) =>
  typeof value === "undefined" ? "undefined" : value;

const reviver = (key: string, value: string) =>
  value === "undefined" ? undefined : value;



export function generateString(length: number) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
}