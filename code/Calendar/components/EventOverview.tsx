import React, {useCallback, useEffect, useRef, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {AgendaList, CalendarProvider, TimelineEventProps} from 'react-native-calendars';
import {CalendarEvents} from '../AgendaItems';
import AgendaItem from '../AgendaItem';
import { getCalendarDateString } from 'react-native-calendars/src/services';
import { TESTDATA } from '../services/models';
import { filter } from 'lodash';
import { eventsToAgendaItems, eventsToTimeLineEvents, getCurrentUser, getDBConnection } from '../services/db-service';
import { FlatList, ScrollView } from 'react-native-gesture-handler';
import { useFocusEffect } from '@react-navigation/native';

{/*
let filteredArray = TESTDATA.filter(element => element.isTemplate == 0 && element.date.flag == 0 && element.time.flag == 0);

var ITEMS: { title?: string, data: { start?: string, end?: string, title: string, color: string | undefined}[] }[] = [];
for(var i in CalendarEvents) {
  var e = CalendarEvents[i];
  if(!e.isOpen) {
    const temp = ITEMS.findIndex((value) => {return (value.title == e.date)});
    if (temp == -1){
        ITEMS.push({title: e.date, data: [{start: e.start.substring(11,16), end: e.end.substring(11,16), title: e.title.length > 40? e.title.substring(0,30) + '...': e.title, color: e.color}]})
    }
    else {
        ITEMS[temp].data.push({start: e.start.substring(11,16), end: e.end.substring(11,16), title: e.title.length > 40? e.title.substring(0,30) + '...': e.title, color: e.color})
    }
  }
}
for(var i in filteredArray) {
  var event = filteredArray[i];
  const start = new Date((event.date.data! + event.time.data!.startTime) * 1000);
  const temp = ITEMS.findIndex((value) => {return (start.toISOString().split('T')[0].substring(0,8) + start.getDate() == value.title)});
  if (temp == -1){
    ITEMS.push({title: start.toISOString().split('T')[0].substring(0,8) + start.getDate(), data: [{start: event.time.data!.allDay == 1? 'All Day' : new Date((event.date.data! + event.time.data!.startTime) * 1000).toString().substring(16,21), end: event.time.data!.allDay == 1? 'All Day' : new Date((event.date.data! + event.time.data!.endTime) * 1000).toString().substring(16,21), title: event.title.length > 40? event.title.substring(0,30) + '...': event.title, color: event.colorTag}]})
  }
  else {
      ITEMS[temp].data.push({start: event.time.data!.allDay == 1? 'All Day' : new Date((event.date.data! + event.time.data!.startTime) * 1000).toString().substring(16,21), end: event.time.data!.allDay == 1? 'All Day' : new Date((event.date.data! + event.time.data!.endTime) * 1000).toString().substring(16,21), title: event.title.length > 40? event.title.substring(0,30) + '...': event.title, color: event.colorTag})
  }
}
*/}

export default function EventOverview({navigation, openModal}: any) {
  // const onDateChanged = useCallback((date, updateSource) => {
  //   console.log('ExpandableCalendarScreen onDateChanged: ', date, updateSource);
  // }, []);

  // const onMonthChange = useCallback(({dateString}) => {
  //   console.log('ExpandableCalendarScreen onMonthChange: ', dateString);
  // }, []);
  let [events, setEvents] =  useState<{ title?: string, data: { start?: string, end?: string, title: string, color: string | undefined }[] }[]>([]);

  const loadDataCallback = useCallback(async () => {
    const db = getDBConnection();
    const user = await getCurrentUser(db);
    const agendaItems = await eventsToAgendaItems(db, user.id)
    setEvents(agendaItems)
  }, []);
  useEffect(() => {
    loadDataCallback();
  }, [loadDataCallback]);

  const renderItem = useCallback(({item}: any) => {
    return <AgendaItem item={item} navigation={navigation} openModal={openModal}/>;
  }, []);

  const scrollRef = useRef<ScrollView>(null);

  useFocusEffect(
    React.useCallback(() => {
      scrollRef.current?.scrollTo({ x:0, y:0 })
    }, [])
  );

  return (
    <CalendarProvider
      date={Date()}
      // onDateChanged={onDateChanged}
      // onMonthChange={onMonthChange}
      showTodayButton
      // disabledOpacity={0.6}
      // todayBottomMargin={16}
    >
      <ScrollView ref={scrollRef}>
      <AgendaList 
        sections={events}
        renderItem={renderItem}
        // scrollToNextEvent
        sectionStyle={styles.section}
        // dayFormat={'yyyy-MM-d'}
      />
      </ScrollView>
    </CalendarProvider>
    
  );
};

const styles = StyleSheet.create({
  calendar: {
    paddingLeft: 20,
    paddingRight: 20
  },
  header: {
    backgroundColor: 'lightgrey'
  },
  section: {
    backgroundColor: 'white',
    color: 'grey',
    textTransform: 'capitalize'
  }
});