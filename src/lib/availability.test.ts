import { describe, expect, it } from "vitest";
import {
  type AvailabilityInput,
  type Booking,
  type Room,
  MAX_DURATION_MINUTES,
  MINUTES_PER_DAY,
  checkAvailability,
  isInteger,
  validateBookingRequest,
} from "@/lib/availability";
import { filterByCapacity, filterByEquipment } from "@/lib/filter";
import { CURRENT_TIME_MINUTES, INITIAL_BOOKINGS, ROOM, ROOMS } from "@/lib/fixtures";

const OPEN_ROOM: Room = {
  id: "a101",
  name: "Study Room A101",
  capacity: 6,
  equipment: ["Projector", "Whiteboard"],
  blocked: false,
  bookings: [],
};
const BLOCKED_ROOM: Room = {
  id: "d404",
  name: "Seminar Room D404",
  capacity: 40,
  equipment: ["Projector", "Microphone", "Whiteboard"],
  blocked: true,
  bookings: [],
};

const EXISTING_BOOKING: Booking = {
  id: "b1",
  start: 600, // 10:00
  end: 660, // 11:00
  label: "Group Study — CS210",
};

function makeInput(
  overrides: Partial<AvailabilityInput> = {},
): AvailabilityInput {
  return {
    start: 660, // 11:00 — after now (540) and touching end of existing booking
    end: 720, // 12:00
    now: CURRENT_TIME_MINUTES,
    room: OPEN_ROOM,
    bookings: [EXISTING_BOOKING],
    ...overrides,
  };
}

describe("AC1 — integer minute boundaries and range 0–1440", () => {
  it("rejects a non-integer start time", () => {
    const result = validateBookingRequest(makeInput({ start: 540.5 }));
    expect(result.valid).toBe(false);
  });

  it("rejects a non-integer end time", () => {
    const result = validateBookingRequest(makeInput({ end: 720.5 }));
    expect(result.valid).toBe(false);
  });

  it("rejects a start time below 0", () => {
    const result = validateBookingRequest(makeInput({ start: -1, end: 60 }));
    expect(result.valid).toBe(false);
  });

  it("rejects an end time above 1440", () => {
    const result = validateBookingRequest(
      makeInput({ start: 1420, end: MINUTES_PER_DAY + 1 }),
    );
    expect(result.valid).toBe(false);
  });

  it("accepts an end time of exactly 1440", () => {
    const result = validateBookingRequest(
      makeInput({ start: 1320, end: MINUTES_PER_DAY }),
    );
    expect(result.valid).toBe(true);
  });

  it("isInteger returns false for NaN and Infinity", () => {
    expect(isInteger(NaN)).toBe(false);
    expect(isInteger(Infinity)).toBe(false);
    expect(isInteger(5)).toBe(true);
  });
});

describe("AC1 — start must be strictly earlier than end", () => {
  it("rejects a reversed interval (start === end)", () => {
    const result = validateBookingRequest(makeInput({ start: 600, end: 600 }));
    expect(result.valid).toBe(false);
  });

  it("rejects a reversed interval (start > end)", () => {
    const result = validateBookingRequest(makeInput({ start: 700, end: 660 }));
    expect(result.valid).toBe(false);
  });
});

describe("AC1 — start must be after the current time", () => {
  it("rejects a booking starting exactly at now", () => {
    const result = validateBookingRequest(
      makeInput({ start: CURRENT_TIME_MINUTES, end: CURRENT_TIME_MINUTES + 60 }),
    );
    expect(result.valid).toBe(false);
  });

  it("rejects a booking starting before now", () => {
    const result = validateBookingRequest(
      makeInput({ start: CURRENT_TIME_MINUTES - 10, end: CURRENT_TIME_MINUTES + 50 }),
    );
    expect(result.valid).toBe(false);
  });

  it("accepts a booking starting one minute after now", () => {
    const result = validateBookingRequest(
      makeInput({
        start: CURRENT_TIME_MINUTES + 1,
        end: CURRENT_TIME_MINUTES + 61,
      }),
    );
    expect(result.valid).toBe(true);
  });
});

describe("AC2 — maximum 120-minute duration", () => {
  it("rejects a 121-minute booking", () => {
    const start = 660;
    const end = start + MAX_DURATION_MINUTES + 1;
    const result = validateBookingRequest(makeInput({ start, end }));
    expect(result.valid).toBe(false);
  });

  it("accepts an exactly 120-minute booking when otherwise valid", () => {
    const start = 660;
    const end = start + MAX_DURATION_MINUTES;
    const result = validateBookingRequest(makeInput({ start, end }));
    expect(result.valid).toBe(true);
  });

  it("checkAvailability returns available for a valid 120-minute booking", () => {
    const start = 660;
    const end = start + MAX_DURATION_MINUTES;
    const result = checkAvailability(makeInput({ start, end }));
    expect(result.kind).toBe("available");
  });
});

describe("AC3 — blocked room rejects all requests", () => {
  it("returns unavailable for a blocked room even with otherwise valid times", () => {
    const result = checkAvailability(makeInput({ room: BLOCKED_ROOM }));
    expect(result.kind).toBe("unavailable");
  });

  it("returns unavailable for a blocked room even when no bookings exist", () => {
    const result = checkAvailability(
      makeInput({ room: BLOCKED_ROOM, bookings: [] }),
    );
    expect(result.kind).toBe("unavailable");
  });

  it("does not report a conflict booking for a blocked room", () => {
    const result = checkAvailability(makeInput({ room: BLOCKED_ROOM }));
    expect(result.kind).toBe("unavailable");
    if (result.kind === "unavailable") {
      expect(result.conflictBooking).toBeUndefined();
    }
  });
});

describe("AC4 — overlap detection and endpoint touching", () => {
  it("rejects a booking fully inside an existing booking", () => {
    const result = checkAvailability(
      makeInput({ start: 610, end: 650 }), // inside 600–660
    );
    expect(result.kind).toBe("unavailable");
    if (result.kind === "unavailable") {
      expect(result.conflictBooking).toBeDefined();
    }
  });

  it("rejects a booking that partially overlaps an existing booking", () => {
    const result = checkAvailability(
      makeInput({ start: 630, end: 700 }), // overlaps 600–660
    );
    expect(result.kind).toBe("unavailable");
  });

  it("accepts a booking starting exactly when an existing booking ends (touching endpoints)", () => {
    const result = checkAvailability(
      makeInput({ start: 660, end: 720 }), // 11:00–12:00, touches 10:00–11:00
    );
    expect(result.kind).toBe("available");
  });

  it("accepts a booking ending exactly when an existing booking starts (touching endpoints)", () => {
    const result = checkAvailability(
      makeInput({ start: 540, end: 600, now: 530 }), // 09:00–10:00, touches 10:00–11:00
    );
    expect(result.kind).toBe("available");
  });
});

describe("AC5 — booking fixtures are not mutated", () => {
  it("checkAvailability does not mutate the bookings array or its entries", () => {
    const bookings: Booking[] = [
      { ...EXISTING_BOOKING },
    ];
    const snapshot = JSON.stringify(bookings);
    checkAvailability(makeInput({ bookings }));
    expect(JSON.stringify(bookings)).toBe(snapshot);
  });

  it("validateBookingRequest does not mutate the bookings array", () => {
    const bookings: Booking[] = [{ ...EXISTING_BOOKING }];
    const snapshot = JSON.stringify(bookings);
    validateBookingRequest(makeInput({ bookings }));
    expect(JSON.stringify(bookings)).toBe(snapshot);
  });

  it("imported INITIAL_BOOKINGS fixture is unchanged after operations", () => {
    const snapshot = JSON.stringify(INITIAL_BOOKINGS);
    checkAvailability({
      start: 660,
      end: 720,
      now: CURRENT_TIME_MINUTES,
      room: ROOM,
      bookings: INITIAL_BOOKINGS,
    });
    expect(JSON.stringify(INITIAL_BOOKINGS)).toBe(snapshot);
  });
});

describe("AC6 — availability outcome is deterministic and well-typed", () => {
  it("returns available for a clear slot with no conflicts", () => {
    const result = checkAvailability(
      makeInput({ start: 720, end: 780, bookings: [EXISTING_BOOKING] }),
    );
    expect(result.kind).toBe("available");
  });

  it("returns unavailable with a reason string for a rejected request", () => {
    const result = checkAvailability(
      makeInput({ start: 610, end: 650 }),
    );
    expect(result.kind).toBe("unavailable");
    if (result.kind === "unavailable") {
      expect(typeof result.reason).toBe("string");
      expect(result.reason.length).toBeGreaterThan(0);
    }
  });

  it("produces the same result on repeated calls (deterministic)", () => {
    const input = makeInput({ start: 720, end: 780 });
    const a = checkAvailability(input);
    const b = checkAvailability(input);
    expect(a).toEqual(b);
  });
});

// ---------------------------------------------------------------------------
// Assignment #04 — Room catalog, capacity & equipment filters (F1, F2, F3)
// ---------------------------------------------------------------------------

describe("Room catalog — four fictional rooms", () => {
  it("exports at least four rooms", () => {
    expect(ROOMS.length).toBeGreaterThanOrEqual(4);
  });

  it("every room has a unique id", () => {
    const ids = ROOMS.map((r) => r.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("every room has required fields with valid values", () => {
    for (const room of ROOMS) {
      expect(typeof room.id).toBe("string");
      expect(room.id.length).toBeGreaterThan(0);
      expect(typeof room.name).toBe("string");
      expect(room.name.length).toBeGreaterThan(0);
      expect(typeof room.capacity).toBe("number");
      expect(room.capacity).toBeGreaterThan(0);
      expect(Array.isArray(room.equipment)).toBe(true);
      expect(room.equipment.length).toBeGreaterThan(0);
      expect(typeof room.blocked).toBe("boolean");
      expect(Array.isArray(room.bookings)).toBe(true);
    }
  });

  it("A101 preserves the original booking data exactly", () => {
    const a101 = ROOMS.find((r) => r.id === "a101");
    expect(a101).toBeDefined();
    expect(a101!.bookings).toEqual([
      {
        id: "b1",
        start: 600,
        end: 660,
        label: "Group Study — CS210",
      },
    ]);
  });

  it("D404 is blocked", () => {
    const d404 = ROOMS.find((r) => r.id === "d404");
    expect(d404).toBeDefined();
    expect(d404!.blocked).toBe(true);
  });
});

describe("F1 — filterByCapacity", () => {
  it("returns all rooms when minCapacity is 0 or invalid", () => {
    expect(filterByCapacity(ROOMS, 0)).toHaveLength(ROOMS.length);
    expect(filterByCapacity(ROOMS, -5)).toHaveLength(ROOMS.length);
    expect(filterByCapacity(ROOMS, NaN)).toHaveLength(ROOMS.length);
    expect(filterByCapacity(ROOMS, 5.5)).toHaveLength(ROOMS.length);
  });

  it("returns only rooms with capacity >= the requested value", () => {
    const result = filterByCapacity(ROOMS, 15);
    expect(result.every((r) => r.capacity >= 15)).toBe(true);
    expect(result.length).toBeLessThan(ROOMS.length);
  });

  it("returns only D404 (capacity 40) when requesting 40", () => {
    const result = filterByCapacity(ROOMS, 40);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("d404");
  });

  it("returns no rooms when requesting more than the largest capacity", () => {
    const result = filterByCapacity(ROOMS, 100);
    expect(result).toHaveLength(0);
  });

  it("does not mutate the input array", () => {
    const snapshot = JSON.stringify(ROOMS);
    filterByCapacity(ROOMS, 20);
    expect(JSON.stringify(ROOMS)).toBe(snapshot);
  });
});

describe("F2 — filterByEquipment (ALL required items)", () => {
  it("returns all rooms when no equipment is required", () => {
    expect(filterByEquipment(ROOMS, [])).toHaveLength(ROOMS.length);
  });

  it("returns only rooms containing ALL selected items", () => {
    const result = filterByEquipment(ROOMS, ["Projector", "Whiteboard"]);
    expect(result.every(
      (r) => r.equipment.includes("Projector") && r.equipment.includes("Whiteboard"),
    )).toBe(true);
  });

  it("returns only B202 when Computers is required", () => {
    const result = filterByEquipment(ROOMS, ["Computers"]);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("b202");
  });

  it("returns no rooms when requiring non-existent equipment", () => {
    const result = filterByEquipment(ROOMS, ["Coffee Machine"]);
    expect(result).toHaveLength(0);
  });

  it("returns only C303 when Video Conferencing is required", () => {
    const result = filterByEquipment(ROOMS, ["Video Conferencing"]);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("c303");
  });

  it("does not mutate the input array", () => {
    const snapshot = JSON.stringify(ROOMS);
    filterByEquipment(ROOMS, ["Projector"]);
    expect(JSON.stringify(ROOMS)).toBe(snapshot);
  });
});

describe("F3 — blocked rooms never reported as available", () => {
  it("checkAvailability returns unavailable for blocked room D404", () => {
    const d404 = ROOMS.find((r) => r.id === "d404")!;
    const result = checkAvailability({
      start: 720,
      end: 780,
      now: CURRENT_TIME_MINUTES,
      room: d404,
      bookings: d404.bookings,
    });
    expect(result.kind).toBe("unavailable");
  });
});

describe("Combined filters — capacity and equipment together", () => {
  it("filters by both capacity and equipment (AND logic)", () => {
    const byCap = filterByCapacity(ROOMS, 15);
    const byEq = filterByEquipment(byCap, ["Projector", "Whiteboard"]);
    expect(byEq.every((r) => r.capacity >= 15)).toBe(true);
    expect(byEq.every(
      (r) => r.equipment.includes("Projector") && r.equipment.includes("Whiteboard"),
    )).toBe(true);
  });
});
