import type { Room } from "./types";
import { isInteger } from "./availability";

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
