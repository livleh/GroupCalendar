import groupBy from 'lodash/groupBy';
import filter from 'lodash/filter';
import find from 'lodash/find';

import React, { useCallback, useEffect, useState } from 'react';
import {Alert, StyleSheet, View, Text, ScrollView, TouchableOpacity} from 'react-native';
import {
  ExpandableCalendar,
  TimelineEventProps,
  TimelineList,
  CalendarProvider,
  TimelineProps,
  CalendarUtils
} from 'react-native-calendars';
import {CalendarEvents, CalendarEvent} from '../AgendaItems';
import {timelineEvents, getDate} from '../timelineEvents';
import { User, Event } from '../services/models';
import { getCalendarDateString } from 'react-native-calendars/src/services';
import { eventsToTimeLineEvents, getCurrentUser, getDBConnection, getEvents, getUsers } from '../services/db-service';
import { FlatList } from 'react-native-gesture-handler';

const INITIAL_TIME = {hour: 9, minutes: 0};
{/*for(var i in timelineEvents) {
  CalendarEvents.push(new CalendarEvent(new Date(timelineEvents[i].start), new Date(timelineEvents[i].end), timelineEvents[i].title, timelineEvents[i].summary, timelineEvents[i].color))
}
let filteredArray = TESTDATA.filter(element => element.isTemplate == 0 && element.date.flag == 0 && element.time.flag == 0);
const EVENTS: TimelineEventProps[] = CalendarEvents;
for(var i in filteredArray) {
  EVENTS.push({
    id: filteredArray[i].id,
    start: getCalendarDateString(new Date((filteredArray[i].date.data! + filteredArray[i].time.data!.startTime) * 1000)) + ' ' + new Date((filteredArray[i].date.data! + filteredArray[i].time.data!.startTime) * 1000).toString().substring(16,24),
    end: getCalendarDateString(new Date((filteredArray[i].date.data! + filteredArray[i].time.data!.endTime) * 1000)) + ' ' + new Date((filteredArray[i].date.data! + filteredArray[i].time.data!.endTime) * 1000).toString().substring(16,24),
    title: filteredArray[i].title
  });
  //Sun Jan 01 2023 08:00:00 GMT+0100
  //console.log(getCalendarDateString(new Date((filteredArray[i].date.data! + filteredArray[i].time.data!.startTime) * 1000)) + ' ' + new Date((filteredArray[i].date.data! + filteredArray[i].time.data!.startTime) * 1000).toString().substring(16,24))
}
*/}
// hardcoded CreatorId
const userId = "a34i1";
var originalEvents: Event[];

export default function MonthlyOverview({ navigation, openModal } : any) {
  let [events, setEvents] =  useState<{[keys: string]: TimelineEventProps[]}>({});
  let [currentDate, setCurrentDate] = useState(getDate());
  let [marked, setMarked] =  useState<{[key: string]: {marked: boolean}}>({});
  const db = getDBConnection();

  const loadDataCallback = useCallback(async () => {
    const timelineEvents = await eventsToTimeLineEvents(db, userId);
    originalEvents = await getEvents(db, userId, 0);
    var grouped: {[keys: string]: TimelineEventProps[]} = {}
    var m: {[key: string]: {marked: boolean}} = {};
    for(var i in timelineEvents) {
      const name = CalendarUtils.getCalendarDateString(timelineEvents[i].start);
      if (grouped[name] == undefined) {
        grouped[name] = [timelineEvents[i]];
        m[name] = {marked: true};
      }
      else {
        grouped[name].push(timelineEvents[i]);
      }
    }
    setEvents(JSON.parse(JSON.stringify(grouped)));
    setMarked(JSON.parse(JSON.stringify(m)));
  }, []);
  useEffect(() => {
    loadDataCallback();
  }, [events]);

  const onEventPress = async (event: Event) => {
    console.log(events)
    console.log(event)
    console.log(originalEvents)
    const currentEvent = originalEvents.find((value, index, obj) => {return (value.id == event.id)});
    const pps = currentEvent!.participants.data == undefined? [] : await getUsers(db, currentEvent!.participants.data);
    openModal({...currentEvent!, participantNames: pps});
    //navigation.navigate("NewEntry", {id: event.id, isTemplate: 0});
  }

  const onDateChanged = (date: string, source: string) => {
    console.log('TimelineCalendarScreen onDateChanged: ', date, source);
    setCurrentDate(date);
  };

  const onMonthChange = (month: any, updateSource: any) => {
    console.log('TimelineCalendarScreen onMonthChange: ', month, updateSource);
  };

  const timelineProps: any = {
    format24h: true,
    onEventPress: onEventPress,
    // scrollToFirst: true,
    // start: 0,
    // end: 24,
    unavailableHours: [{start: 0, end: 6}, {start: 22, end: 24}],
    overlapEventsSpacing: 8,
    rightEdgeSpacing: 24,
    renderEvent: (e: TimelineEventProps) => {
      if(e.start.substring(11,16) == "00:00" && e.end.substring(11,16) == "24:00"){
        return(
          <View style={{flex:1}}>
            <Text style={{fontSize: 15, fontWeight: "bold", marginRight: 2}}>{e.title}</Text>
            <Text style={{flex:1,fontSize: 10, marginTop: 5}}>All day</Text>
          </View>
        )
      }else{
        return(
          <View style={{flex:1}}>
            <Text style={{fontSize: 15, fontWeight: "bold", marginRight: 2}}>{e.title}</Text>
            <Text style={{flex:1,fontSize: 10, marginTop: 5}}>{e.start.substring(11,16)} - {e.end.substring(11,16)}</Text>
          </View>
        )
      }
    },
  };

  const renderTimeslot = (item: number) => {
    if(item % 2 == 0){
      const time = (item)/2;
      const TimeString = time < 10? "0" + time + ":00  " : time + ":00  ";
      return(
        <View style={{height: 40, flexDirection: "row"}}>
          <Text style={{marginLeft:10, fontSize: 10}}>{TimeString}</Text>
          <View style={{marginTop: 5, flexDirection: "row"}}><View style={{borderTopWidth: 2, borderColor: "grey", width: 20}}/><View style={{borderTopWidth: 2, borderColor: "grey"}}/></View>
        </View>
      )
    }
    else{
      return(
        <View style={{height: 40, flexDirection: "row"}}/>
      )
    }
  }

  const times = Array.from(Array(47).keys());

  return (
    <View>
      <CalendarProvider
        date={currentDate}
        onDateChanged={onDateChanged}
        onMonthChange={onMonthChange}
        showTodayButton
        disabledOpacity={0.6}
        // numberOfDays={3}
      >
        <ExpandableCalendar
          firstDay={1}
          markedDates={marked}
          theme={theme}
        />
        {/*<ScrollView>
          <FlatList style={{ height: 47 * 40, marginTop: 10}} data={times} renderItem={({item}) => (renderTimeslot(item))} />
  </ScrollView>*/}
        <TimelineList
          events={events}
          timelineProps={timelineProps}
          showNowIndicator
          scrollToNow
          //scrollToFirst
          initialTime={INITIAL_TIME}
        />
      </CalendarProvider>
    </View>
  );
}

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

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    calendar: {

    }
});
