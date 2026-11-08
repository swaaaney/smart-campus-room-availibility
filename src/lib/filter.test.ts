import { describe, expect, it } from "vitest";
import { filterByCapacity, filterByEquipment } from "@/lib/filter";
import { ROOMS } from "@/lib/fixtures";

const ROOM_BY_ID = (id: string) => ROOMS.find((r) => r.id === id)!;

describe("F1 — filterByCapacity boundary regression", () => {
  it("includes a room whose capacity exactly equals the requested minimum", () => {
    const a101 = ROOM_BY_ID("a101");
    const result = filterByCapacity(ROOMS, a101.capacity);
    expect(result.some((r) => r.id === "a101")).toBe(true);
  });

  it("excludes rooms whose capacity is below the requested minimum", () => {
    const result = filterByCapacity(ROOMS, 7);
    expect(result.some((r) => r.id === "a101")).toBe(false);
    expect(result.every((r) => r.capacity >= 7)).toBe(true);
  });

  it("includes all rooms at capacity 1 (smallest valid filter)", () => {
    const result = filterByCapacity(ROOMS, 1);
    expect(result).toHaveLength(ROOMS.length);
  });
});

describe("F2 — filterByEquipment regression", () => {
  it("excludes a room missing one required item out of several", () => {
    const result = filterByEquipment(ROOMS, ["Projector", "Microphone"]);
    expect(result.some((r) => r.id === "a101")).toBe(false);
    expect(result.every((r) => r.equipment.includes("Microphone"))).toBe(true);
  });

  it("empty equipment selection does not restrict results", () => {
    const result = filterByEquipment(ROOMS, []);
    expect(result).toHaveLength(ROOMS.length);
  });

  it("a room with all required items is included", () => {
    const result = filterByEquipment(ROOMS, ["Projector", "Whiteboard"]);
    const a101 = result.find((r) => r.id === "a101");
    expect(a101).toBeDefined();
  });
});
