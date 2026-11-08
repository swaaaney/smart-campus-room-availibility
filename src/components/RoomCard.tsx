import { Building2, DoorClosed, Lock, Monitor, Users } from "lucide-react";
import { type Room } from "@/lib/availability";

export function RoomCard({
  room,
  isSelected,
  onSelect,
}: {
  room: Room;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`group flex flex-col gap-3 rounded-2xl border p-4 text-left transition-all sm:p-5 ${
        isSelected
          ? "border-campus-primary bg-campus-lavender/60 shadow-soft"
          : "border-campus-lavender/70 bg-white hover:border-campus-primary/40 hover:shadow-soft"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <span
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition ${
              isSelected
                ? "bg-gradient-to-br from-campus-primary to-campus-deep text-white"
                : "bg-campus-lavender text-campus-primary group-hover:from-campus-primary group-hover:to-campus-deep group-hover:text-white"
            }`}
          >
            <Building2 className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm font-bold text-campus-ink">{room.name}</p>
            <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1">
                <Users className="h-3.5 w-3.5" />
                {room.capacity}
              </span>
            </div>
          </div>
        </div>
        {room.blocked ? (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-rose-100 px-2.5 py-1 text-xs font-semibold text-rose-700">
            <Lock className="h-3 w-3" />
            Blocked
          </span>
        ) : (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
            <DoorClosed className="h-3 w-3" />
            Open
          </span>
        )}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {room.equipment.map((item) => (
          <span
            key={item}
            className="inline-flex items-center gap-1 rounded-full bg-campus-lavender/60 px-2.5 py-0.5 text-xs font-medium text-campus-deep"
          >
            <Monitor className="h-3 w-3" />
            {item}
          </span>
        ))}
      </div>
    </button>
  );
}
