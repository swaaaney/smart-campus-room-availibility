export interface Booking {
  id: string;
  start: number; // minutes after midnight, integer
  end: number; // minutes after midnight, integer
  label: string;
}

export interface Room {
  id: string;
  name: string;
  capacity: number;
  equipment: string[];
  blocked: boolean;
  bookings: Booking[];
}

export interface AvailabilityInput {
  start: number;
  end: number;
  now: number; // minutes after midnight, integer
  room: Room;
  bookings: Booking[];
}

export type AvailabilityOutcome =
  | { kind: "available" }
  | {
      kind: "unavailable";
      reason: string;
      conflictBooking?: Booking;
    };

export type ValidationResult =
  | { valid: true }
  | { valid: false; message: string };
