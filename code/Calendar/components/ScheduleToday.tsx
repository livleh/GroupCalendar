/*  
TODO
Rename 'ScheduleToday' to 'DailyOverview' in 'ScheduleToday.tsx', 'Index.tsx', 'App.tsx'
Pass argument 'day' to 'ScheduleToday' in 'App.tsx' and remove '?' from 'day?: number;'
*/
import { StyleSheet, Text, View, Image } from 'react-native';

type MyEvent = {
  id: string
  title: string;
  description: string;
  time: number;
}

// hard coded variables
let DailyEventList: MyEvent[];
let MonthlyEventList: MyEvent[][];
let YearlyEventList: MyEvent[][][];
let CompleteEventList: MyEvent[][][][] = [];

// Initalise hard coded event array
for (let i=0; i<3000; i++)  {
  CompleteEventList[i] = [];
  for (let j=0; j<12; j++)  {
    CompleteEventList[i][j] = [];
    for (let k=0; k<30; k++)  {
      CompleteEventList[i][j][k] = [];
    }
  }
}

for (let i=0; i<5; i++) {
  CompleteEventList[2000][7][1].push(
    {
      id: "dummyEvent" + i,
      title: "Dummy Event " + i,
      description: "This is a dummy Event",
      time: 830
    }
  )
}

/*
Arguments for the DailyOverview function
day: the day for which the schedule must be displayed
*/
type DailyOverviewProps = {
  year?: number;
  month?: number;
  day?: number;
};

// The DailyOverview functional component displays the user's schedule of the selected day
const ScheduleToday = (props: DailyOverviewProps) => {
  // Selected date
  const {year = 2000, month = 7, day = 1} = props;
  // Initialise variables
  let eventList = [];
  DailyEventList = CompleteEventList[year][month][day];
  for (let i=0; i<DailyEventList.length; i++) {
    const event = DailyEventList[i];
    eventList.push(
      <View key={event.id}>
        <Text>{event.title}</Text>
        <Text>{event.description}</Text>
      </View>
    )
  }
  

  return(
    <View style={styles.container}>
      <Text>{"Today is day " + day}</Text>
      {eventList}
    </View>
  )

}

const styles = StyleSheet.create({
    container: {
        flex: 8,
      },
});

export default ScheduleToday;