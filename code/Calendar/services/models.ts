
export type User = { id: string; name: string; profilePicPath: string }; //profilePicPath is the relative path to the image file in the assets folder


/**
 * Short explanation of the Event type:
 * 
 * isTemplate --> 0 if normal or open event, 1 if template
 * flag --> 0 if closed (default state when new entry created), 1 if open event
 * data --> undefined if not yet set (default state), else holds the relevant data according to below
 * colorTag --> hex color code (need to decide on a default color)
 * 
 * 
 */
export type Event = {
  id: string;
  creatorId: string;
  isTemplate: number; 
  title: string;
  date: {
    flag: number; 
    data?: number; //Unix Time of specified date at 00:00
  };
  time: {
    flag: number;
    data?: {
      allDay: number; //0 if the event is not all day, 1 if all day
      startTime: number; //number of seconds from 00:00 until start time
      endTime: number; //number of seconds from 00:00 until end time
    };
  };
  location: {
    flag: number;
    data?: string;
  };
  participants: {
    flag: number;
    data?: string[]; //ids of participants
  };
  colorTag: string;
  note: {
    flag: number;
    data?: string;
  };
};

export type FriendRelation = { user1Id: string; user2Id: string };
export type EventRelation = { userId: string; eventId: string };


//default app data

export const defaultUsers: User[] = [
  {
    id: "a34i1",
    name: "Anita Spielberg",
    profilePicPath: "../assets/profile-picture1.png",
  },
  {
    id: "a52d3",
    name: "Manfred Müller",
    profilePicPath: "../assets/profile-picture2.png",
  },
  {
    id: "a24i6",
    name: "Hansueli Brecht",
    profilePicPath: "../assets/profile-picture3.png",
  },
  {
    id: "a32c9",
    name: "Hanspeter Furrer",
    profilePicPath: "../assets/profile-picture4.png",
  },
];

export const defaultEvents: Event[] = [
  {
    id: "e1",
    creatorId: "a32c9",
    isTemplate: 0,
    title: "Cinema Night",
    date: { flag: 0, data: undefined },
    time: {
      flag: 1,
      data: { allDay: 0, startTime: 64800, endTime: 72000 },
    },
    location: { flag: 1, data: "Badenerstrasse 25, Zürich" },
    colorTag: "#0000",
    note: { flag: 1, data: "Do not forget the popcorn" },
    participants: { flag: 1, data: ["a24i6"] },
  },
  {
    id: "e2",
    creatorId: "a24i6",
    isTemplate: 0,
    title: "Lasertech",
    date: { flag: 0, data: 1700175600 },
    time: {
      flag: 1,
      data: { allDay: 0, startTime: 64800, endTime: 72000 },
    },
    location: { flag: 1, data: "ETH Hauptgebäude, Zürich" },
    colorTag: "#0000",
    note: { flag: 1, data: "Do not forget your armoured vest" },
    participants: { flag: 0, data: undefined },
  },
  {
    id: "e3",
    creatorId: "a32c9",
    isTemplate: 1,
    title: "Study session",
    date: { flag: 0, data: undefined },
    time: { flag: 0, data: undefined },
    location: { flag: 1, data: "ETH Hauptgebäude Mathebibliothek" },
    colorTag: "#0000",
    note: { flag: 0, data: undefined },
    participants: { flag: 0, data: undefined },
  },
];


export const defaultFriendRelations: FriendRelation[] = [
  { user1Id: "a34i1", user2Id: "a52d3" },
  { user1Id: "a34i1", user2Id: "a24i6" },
  { user1Id: "a34i1", user2Id: "a32c9" },
  { user1Id: "a52d3", user2Id:  "a24i6" },
  { user1Id: "a52d3", user2Id:  "a32c9" },
  { user1Id: "a24i6", user2Id:  "a32c9" },

];

export type PerformanceData = {variant: string, time: number, scroll: number}
