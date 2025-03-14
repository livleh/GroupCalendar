import {TimelineEventProps, CalendarUtils} from 'react-native-calendars';

const EVENT_COLOR = '#e6add8';
const today = new Date();
export const getDate = (offset = 0) => CalendarUtils.getCalendarDateString(new Date().setDate(today.getDate() + offset));

export const timelineEvents: TimelineEventProps[] = [
  { 
    id: '1',
    start: `${getDate(-1)} 09:20:00`,
    end: `${getDate(-1)} 12:00:00`,
    title: 'Merge Request to React Native Calendars',
    summary: 'Merge Timeline Calendar to React Native Calendars',
    color: '#add8e6'
  },
  {
    id: '2',
    start: `${getDate()} 12:15:00`,
    end: `${getDate()} 14:30:00`,
    title: 'Meeting with HCI Group',
    summary: 'Please finish your tasks until then!',
    color: '#add8e6'
  },
  {
    id: '3',
    start: `${getDate()} 17:30:00`,
    end: `${getDate()} 18:30:00`,
    title: 'Meeting with doctor',
    summary: 'Yearly health checkup',
    color: '#add8e6'
  },
  {
    id: '4',
    start: `${getDate()} 07:45:00`,
    end: `${getDate()} 09:45:00`,
    title: 'Meeting Bachelor Thesis',
    summary: 'Make sure to finish report by then.',
    color: '#add8e6'
  },
  {
    id: '5',
    start: `${getDate()} 20:40:00`,
    end: `${getDate()} 22:10:00`,
    title: 'Football training',
    summary: 'Never forget to bring a second pair of boots!',
    color: '#add8e6'
  },
  {
    id: '6',
    start: `${getDate()} 04:30:00`,
    end: `${getDate()} 05:30:00`,
    title: 'Early morning workout',
    summary: 'Bring swimming shorts and goggles',
    color: '#add8e6'
  },
  {
    id: '7',
    start: `${getDate(1)} 12:30:00`,
    end: `${getDate(1)} 13:30:00`,
    title: 'Visit Grand Mother',
    summary: 'Visit Grand Mother and bring some fruits.',
    color: '#add8e6'

  },
  {
    id: '8',
    start: `${getDate(1)} 07:30:00`,
    end: `${getDate(1)} 08:20:00`,
    title: 'Meeting with Prof. Behjet Zuhaira',
    summary: 'Meeting with Prof. Behjet at 130 in her office.',
    color: '#add8e6'
  },
  {
    id: '9',
    start: `${getDate(1)} 10:10:00`,
    end: `${getDate(1)} 10:40:00`,
    title: 'Tea Time with Dr. Hasan',
    summary: 'Tea Time with Dr. Hasan, Talk about Project',
    color: '#add8e6'

  },
  {
    id: '10',
    start: `${getDate(1)} 14:05:00`,
    end: `${getDate(1)} 15:35:00`,
    title: 'Dr. Mariana Joseph',
    summary: 'Remember to bring my medical report along',
    color: '#add8e6'

  },
  {
    id: '11',
    start: `${getDate(1)} 12:00:00`,
    end: `${getDate(1)} 13:00:00`,
    title: 'Lunch with Friends',
    summary: 'Wear cosy clothes!',
    color: '#add8e6'
  },
  {
    id: '12',
    start: `${getDate(2)} 10:40:00`,
    end: `${getDate(2)} 12:25:00`,
    title: 'Meet Sir Khurram Iqbal',
    summary: 'Computer Science Dept. Comsats Islamabad',
    color: '#add8e6'
  },
  {
    id: '13',
    start: `${getDate(2)} 15:10:00`,
    end: `${getDate(2)} 16:40:00`,
    title: 'Tea Time with Colleagues',
    summary: 'WeRplay',
    color: '#add8e6'

  },
  {
    id: '14',
    start: `${getDate(2)} 20:45:00`,
    end: `${getDate(2)} 22:45:00`,
    title: 'Lets Play Apex Legends',
    summary: 'with Boys at Work',
    color: '#add8e6'

  },
  {
    id: '15',
    start: `${getDate(3)} 12:10:00`,
    end: `${getDate(3)} 13:45:00`,
    title: 'Merge Request to WebEng Project',
    summary: 'Merge branches that have been worked on',
    color: '#add8e6'

  },
  {
    id: '16',
    start: `${getDate(2)} 12:10:00`,
    end: `${getDate(2)} 13:45:00`,
    title: '22nd Birthday of Anna',
    summary: 'Bring a cake to university',
    color: '#add8e6'

  },
  {
    id: '17',
    start: ``,
    end: ``,
    title: 'Meditation Session',
    summary: 'Bring yoga mat to class',
    color: '#add8e6'

  },
  {
    id: '18',
    start: ``,
    end: ``,
    title: 'Zoom with high school friends',
    summary: 'Use same link as always!',
    color: '#add8e6'

  },
  {
    id: '19',
    start: ``,
    end: ``,
    title: 'Weekend Trip',
    summary: 'Pack lightly and have fun!',
    color: '#add8e6'

  },
  {
    id: '20',
    start: ``,
    end: ``,
    title: 'Family reunion',
    summary: 'Meet at our summer house at the beach',
    color: '#add8e6'
  },
  {
    id: '21',
    start: ``,
    end: ``,
    title: 'Violin Concert',
    summary: 'Make sure my violin is tuned correctly',
    color: '#add8e6'
  },
  {
    id: '22',
    start: ``,
    end: ``,
    title: 'Exam',
    summary: 'Do not miss the date!',
    color: '#add8e6'
  },
  {
    id: '23',
    start: ``,
    end: ``,
    title: 'Cinema Night',
    summary: '',
    color: "#ffb6c1"
  },
  {
    id: '24',
    start: ``,
    end: ``,
    title: 'Zoo',
    summary: '',
    color: '#ffb6c1'
  }
];