import type { Booking, Room } from "./types";

export const CURRENT_TIME_MINUTES = 540; // 09:00

const A101_BOOKINGS: Booking[] = [
  {
    id: "b1",
    start: 600, // 10:00
    end: 660, // 11:00
    label: "Group Study — CS210",
  },
];

const B202_BOOKINGS: Booking[] = [
  {
    id: "b2",
    start: 720, // 12:00
    end: 780, // 13:00
    label: "Lab Session — IT205",
  },
];

const C303_BOOKINGS: Booking[] = [
  {
    id: "b3",
    start: 840, // 14:00
    end: 900, // 15:00
    label: "Department Meeting",
  },
];

const D404_BOOKINGS: Booking[] = [
  {
    id: "b4",
    start: 660, // 11:00
    end: 720, // 12:00
    label: "Guest Lecture — MG430",
  },
];

export const ROOMS: Room[] = [
  {
    id: "a101",
    name: "Study Room A101",
    capacity: 6,
    equipment: ["Projector", "Whiteboard"],
    blocked: false,
    bookings: A101_BOOKINGS,
  },
  {
    id: "b202",
    name: "Computer Lab B202",
    capacity: 25,
    equipment: ["Computers", "Projector", "Whiteboard"],
    blocked: false,
    bookings: B202_BOOKINGS,
  },
  {
    id: "c303",
    name: "Conference Room C303",
    capacity: 15,
    equipment: ["Projector", "Video Conferencing", "Whiteboard"],
    blocked: false,
    bookings: C303_BOOKINGS,
  },
  {
    id: "d404",
    name: "Seminar Room D404",
    capacity: 40,
    equipment: ["Projector", "Microphone", "Whiteboard"],
    blocked: true,
    bookings: D404_BOOKINGS,
  },
];

export const ALL_EQUIPMENT: string[] = [
  "Projector",
  "Whiteboard",
  "Computers",
  "Video Conferencing",
  "Microphone",
];

export const ROOM: Room = ROOMS[0];
export const INITIAL_BOOKINGS: Booking[] = ROOMS[0].bookings;
