import type { Booking, Room } from "./availability";

export const CURRENT_TIME_MINUTES = 540; // 09:00

export const ROOM: Room = {
  name: "Study Room A101",
  blocked: false,
};

export const INITIAL_BOOKINGS: Booking[] = [
  {
    id: "b1",
    start: 600, // 10:00
    end: 660, // 11:00
    label: "Group Study — CS210",
  },
];
