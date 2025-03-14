import { CalendarUtils, TimelineEventProps } from 'react-native-calendars';

function getTimeFromDate(date: Date){
    const hour = date.getHours() > 9? date.getHours().toString() : '0' + date.getHours().toString();
    const min = date.getMinutes() > 9? date.getMinutes().toString() : '0' + date.getMinutes().toString();
    const sec = date.getSeconds() > 9? date.getSeconds().toString() : '0' + date.getSeconds().toString();
    return (hour + ':' + min + ':' + sec);
}

var i = 0;

export class CalendarEvent implements TimelineEventProps {
    id?: string | undefined;
    start!: string;
    end!: string;
    title!: string;
    summary?: string | undefined;
    color?: string | undefined;
    date?: string;
    duration?: string | undefined;
    location?: string | undefined;
    notes?: string | undefined;
    participants?: string[];
    isOpen!: boolean;

    constructor (start: Date | undefined, end: Date | undefined, title: string, summary?: string | undefined, color?: string | undefined, location?: string, notes?: string, participants?: string[], isOpen?: boolean) {
        this.id = i.toString();
        this.start = start == undefined? '' : CalendarUtils.getCalendarDateString(start) + ' ' + getTimeFromDate(start);
        this.end = end == undefined? '' : CalendarUtils.getCalendarDateString(end) + ' ' + getTimeFromDate(end);
        this.title = title;
        this.summary = summary;
        this.color = color;
        this.date = start == undefined? undefined : start.toISOString().split('T')[0].substring(0,8) + start.getDate();
        var difference = start == undefined || end == undefined? undefined : ((end.getTime() - start.getTime())/3600000);
        var hours = difference == undefined? undefined : Math.floor(difference);
        var minutes = hours == undefined || difference == undefined? undefined : ((difference - hours) * 60).toFixed(0);
        this.duration = (hours == undefined? '' : hours + 'h') + ' ' + (minutes == undefined? '' : minutes + 'min');
        this.location = location;
        this.notes = notes;
        this.participants = participants == undefined? [] : participants;
        this.isOpen = isOpen == undefined? false : isOpen;
        if (start == undefined || end == undefined){
            this.isOpen = true;
        }
        i++;
    }
}

export var CalendarEvents: CalendarEvent[] = [
    new CalendarEvent(undefined, undefined, 'OpenEvent', undefined, undefined, undefined, undefined, undefined, true)
];


i += CalendarEvents.length;