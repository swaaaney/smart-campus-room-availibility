/** @format */ /** @format */

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

export const MINUTES_PER_DAY = 1440;
export const MAX_DURATION_MINUTES = 120;

export function isInteger(value: number): boolean {
  return Number.isFinite(value) && Math.floor(value) === value;
}

export function validateBookingRequest(input: AvailabilityInput): ValidationResult {
  const { start, end, now } = input;

  if (!isInteger(start)) {
    return { valid: false, message: "Start time must be in whole minutes." };
  }
  if (!isInteger(end)) {
    return { valid: false, message: "End time must be in whole minutes." };
  }

  if (start < 0) {
    return { valid: false, message: "Start time cannot be before 00:00." };
  }
  if (end > MINUTES_PER_DAY) {
    return {
      valid: false,
      message: "End time cannot be after 24:00 (1440 minutes).",
    };
  }
  if (start >= end) {
    return {
      valid: false,
      message: "Start time must be strictly earlier than end time.",
    };
  }

  if (start <= now) {
    return {
      valid: false,
      message: `Start time must be after the current time (${formatMinutes(now)}).`,
    };
  }

  const duration = end - start;
  if (duration > MAX_DURATION_MINUTES) {
    return {
      valid: false,
      message: `Booking duration is ${duration} minutes. Maximum allowed is ${MAX_DURATION_MINUTES} minutes.`,
    };
  }

  return { valid: true };
}

export function checkAvailability(input: AvailabilityInput): AvailabilityOutcome {
  const validation = validateBookingRequest(input);
  if (!validation.valid) {
    return {
      kind: "unavailable",
      reason: validation.message,
    };
  }

  if (input.room.blocked) {
    return {
      kind: "unavailable",
      reason: `${input.room.name} is currently blocked and cannot be booked.`,
    };
  }

  const conflict = input.bookings.find((b) => overlaps(input.start, input.end, b));

  if (conflict) {
    return {
      kind: "unavailable",
      reason: `Requested time overlaps with an existing booking (${formatMinutes(
        conflict.start,
      )}–${formatMinutes(conflict.end)}).`,
      conflictBooking: conflict,
    };
  }

  return { kind: "available" };
}

/**
 * Two intervals [aStart, aEnd) and [bStart, bEnd) overlap if they share
 * any minute. Touching only at an endpoint (aEnd === bStart or bEnd === aStart)
 * is allowed and is NOT an overlap.
 */
function overlaps(aStart: number, aEnd: number, b: Booking): boolean {
  return aStart < b.end && b.start < aEnd;
}

export function formatMinutes(minutes: number): string {
  const m = clampInt(minutes);
  const h = Math.floor(m / 60);
  const rem = m % 60;
  const padded = rem.toString().padStart(2, "0");
  return `${h.toString().padStart(2, "0")}:${padded}`;
}

function clampInt(minutes: number): number {
  if (!Number.isFinite(minutes)) return 0;
  const m = Math.round(minutes);
  if (m < 0) return 0;
  if (m > MINUTES_PER_DAY) return MINUTES_PER_DAY;
  return m;
}

export function parseTimeToMinutes(time: string): number | null {
  const match = /^(\d{2}):(\d{2})$/.exec(time);
  if (!match) return null;
  const h = Number(match[1]);
  const m = Number(match[2]);
  if (h < 0 || h > 23 || m < 0 || m > 59) return null;
  return h * 60 + m;
}

export function filterByCapacity(rooms: Room[], minCapacity: number): Room[] {
  if (!isInteger(minCapacity) || minCapacity <= 0) return rooms;
  return rooms.filter((r) => r.capacity >= minCapacity);
}

export function filterByEquipment(rooms: Room[], requiredItems: string[]): Room[] {
  if (requiredItems.length === 0) return rooms;
  return rooms.filter((r) =>
    requiredItems.every((item) => r.equipment.includes(item)),
  );
}
