import { useEffect, useMemo, useState } from "react";
import {
  Building2,
  CalendarClock,
  CheckCircle2,
  Clock,
  DoorClosed,
  GraduationCap,
  Info,
  Lock,
  RefreshCw,
  SearchX,
  Users,
} from "lucide-react";
import {
  type AvailabilityInput,
  type AvailabilityOutcome,
  type Booking,
  type ValidationResult,
  checkAvailability,
  formatMinutes,
  parseTimeToMinutes,
  validateBookingRequest,
} from "@/lib/availability";
import { filterByCapacity, filterByEquipment } from "@/lib/filter";
import {
  ALL_EQUIPMENT,
  CURRENT_TIME_MINUTES,
  ROOMS,
} from "@/lib/fixtures";
import { AvailabilityCard } from "@/components/AvailabilityCard";
import { BookingRow } from "@/components/BookingRow";
import { TimeField } from "@/components/TimeField";
import { ValidationHint } from "@/components/ValidationHint";
import { RoomCard } from "@/components/RoomCard";

export default function App() {
  const [now] = useState(CURRENT_TIME_MINUTES);

  const [attendeesInput, setAttendeesInput] = useState("");
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);

  const minCapacity = useMemo(() => {
    const parsed = Number(attendeesInput);
    if (attendeesInput === "" || !Number.isFinite(parsed)) return 0;
    if (parsed < 0) return 0;
    return Math.floor(parsed);
  }, [attendeesInput]);

  const filteredRooms = useMemo(() => {
    const byCapacity = filterByCapacity(ROOMS, minCapacity);
    return filterByEquipment(byCapacity, selectedEquipment);
  }, [minCapacity, selectedEquipment]);

  const [selectedRoomId, setSelectedRoomId] = useState<string>(ROOMS[0].id);

  const selectedRoom = useMemo(
    () => filteredRooms.find((r) => r.id === selectedRoomId) ?? null,
    [filteredRooms, selectedRoomId],
  );

  const [startStr, setStartStr] = useState("09:30");
  const [endStr, setEndStr] = useState("10:30");
  const [result, setResult] = useState<AvailabilityOutcome | null>(null);
  const [requestedRange, setRequestedRange] = useState<{
    start: number;
    end: number;
  } | null>(null);

  useEffect(() => {
    setResult(null);
    setRequestedRange(null);
  }, [startStr, endStr, selectedRoomId]);

  const parsedTimes = useMemo(() => {
    const start = parseTimeToMinutes(startStr);
    const end = parseTimeToMinutes(endStr);
    if (start === null || end === null) return null;
    return { start, end };
  }, [startStr, endStr]);

  const requestedDuration =
    parsedTimes && parsedTimes.end > parsedTimes.start
      ? parsedTimes.end - parsedTimes.start
      : null;

  const liveValidation = useMemo<ValidationResult>(() => {
    if (!parsedTimes) {
      return {
        valid: false,
        message: "Enter start and end times in HH:MM format.",
      };
    }
    if (!selectedRoom) {
      return { valid: false, message: "Select a room to check availability." };
    }
    return validateBookingRequest({
      start: parsedTimes.start,
      end: parsedTimes.end,
      now,
      room: selectedRoom,
      bookings: selectedRoom.bookings,
    });
  }, [parsedTimes, now, selectedRoom]);

  const handleCheck = () => {
    if (!parsedTimes) {
      setResult({
        kind: "unavailable",
        reason: "Please enter valid start and end times.",
      });
      setRequestedRange(null);
      return;
    }
    if (!selectedRoom) {
      setResult({
        kind: "unavailable",
        reason: "Please select a room from the list.",
      });
      setRequestedRange(null);
      return;
    }
    const input: AvailabilityInput = {
      start: parsedTimes.start,
      end: parsedTimes.end,
      now,
      room: selectedRoom,
      bookings: selectedRoom.bookings,
    };
    setResult(checkAvailability(input));
    setRequestedRange({ start: parsedTimes.start, end: parsedTimes.end });
  };

  const handleReset = () => {
    setStartStr("09:30");
    setEndStr("10:30");
    setResult(null);
    setRequestedRange(null);
  };

  const toggleEquipment = (item: string) => {
    setSelectedEquipment((prev) =>
      prev.includes(item) ? prev.filter((e) => e !== item) : [...prev, item],
    );
  };

  const handleSelectRoom = (roomId: string) => {
    setSelectedRoomId(roomId);
    setResult(null);
    setRequestedRange(null);
  };

  const bookings: Booking[] = selectedRoom ? selectedRoom.bookings : [];

  return (
    <div className="relative min-h-screen overflow-hidden bg-campus-bg font-sans text-campus-ink">
      {/* Decorative gradient background */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute -top-32 -right-24 h-96 w-96 rounded-full bg-gradient-to-br from-campus-primary/30 to-campus-deep/20 blur-3xl animate-floatSlow" />
        <div className="absolute top-1/3 -left-32 h-[28rem] w-[28rem] rounded-full bg-gradient-to-br from-campus-lavender to-campus-primary/20 blur-3xl animate-floatSlow [animation-delay:-6s]" />
        <div className="absolute -bottom-40 right-1/4 h-80 w-80 rounded-full bg-gradient-to-br from-fuchsia-200/50 to-campus-primary/20 blur-3xl animate-floatSlow [animation-delay:-3s]" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-campus-lavender/60 bg-white/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-4 sm:px-6 sm:py-5">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-campus-primary to-campus-deep text-white shadow-soft">
              <GraduationCap className="h-6 w-6" />
            </span>
            <div className="min-w-0 leading-tight">
              <h1 className="truncate text-base font-bold tracking-tight text-campus-ink sm:text-lg">
                Smart Campus Room Availability Checker
              </h1>
              <p className="truncate text-sm text-slate-500">
                Check study room availability in real time
              </p>
            </div>
          </div>
          <div className="hidden shrink-0 items-center gap-2 rounded-full border border-campus-lavender bg-campus-lavender/50 px-3.5 py-2 text-sm font-semibold text-campus-deep sm:flex">
            <CalendarClock className="h-4 w-4" />
            Current time: {formatMinutes(now)}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
        {/* Filters */}
        <section className="mb-6 animate-fadeIn sm:mb-8">
          <div className="rounded-3xl border border-white/60 bg-white/80 p-5 shadow-card backdrop-blur-sm sm:p-7">
            <div className="mb-4 flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-campus-lavender text-campus-primary">
                <SearchX className="h-4.5 w-4.5" />
              </span>
              <h3 className="text-lg font-bold tracking-tight text-campus-ink">
                Filter rooms
              </h3>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              {/* Capacity filter */}
              <label className="flex flex-col gap-2">
                <span className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                  Minimum attendees
                </span>
                <input
                  type="number"
                  min={0}
                  value={attendeesInput}
                  onChange={(e) => setAttendeesInput(e.target.value)}
                  placeholder="Any capacity"
                  className="rounded-xl border border-campus-lavender bg-white px-4 py-3.5 text-base font-medium text-campus-ink shadow-sm transition focus:border-campus-primary focus:outline-none focus:ring-4 focus:ring-campus-primary/15"
                />
              </label>

              {/* Equipment filter */}
              <div className="flex flex-col gap-2">
                <span className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                  Required equipment
                </span>
                <div className="flex flex-wrap gap-2">
                  {ALL_EQUIPMENT.map((item) => {
                    const checked = selectedEquipment.includes(item);
                    return (
                      <label
                        key={item}
                        className={`inline-flex cursor-pointer items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-medium transition ${
                          checked
                            ? "border-campus-primary bg-campus-lavender text-campus-deep"
                            : "border-campus-lavender bg-white text-slate-600 hover:border-campus-primary/40"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleEquipment(item)}
                          className="h-4 w-4 accent-campus-primary"
                        />
                        {item}
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Room catalog */}
        <section className="mb-6 animate-fadeIn sm:mb-8">
          {filteredRooms.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-campus-lavender bg-white/60 px-4 py-12 text-center">
              <SearchX className="h-10 w-10 text-campus-primary/60" />
              <p className="text-base font-semibold text-campus-ink">
                No rooms match your requirements.
              </p>
              <p className="text-sm text-slate-500">
                Try adjusting the capacity or equipment filters.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {filteredRooms.map((room) => (
                <RoomCard
                  key={room.id}
                  room={room}
                  isSelected={selectedRoom?.id === room.id}
                  onSelect={() => handleSelectRoom(room.id)}
                />
              ))}
            </div>
          )}
        </section>

        {/* Selected room info + availability checker */}
        {selectedRoom && (
          <div className="grid gap-6 lg:grid-cols-5 lg:gap-7">
            {/* Availability checker + room info */}
            <section className="animate-riseIn lg:col-span-3 rounded-3xl border border-white/60 bg-white/85 p-5 shadow-card backdrop-blur-sm sm:p-7">
              {/* Room info */}
              <div className="mb-5 rounded-2xl bg-gradient-to-br from-campus-lavender to-campus-bg p-4 sm:p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-4">
                    <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-campus-primary to-campus-deep text-white shadow-soft">
                      <Building2 className="h-7 w-7" />
                    </span>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-campus-primary">
                        Selected room
                      </p>
                      <h2 className="mt-1 text-xl font-extrabold tracking-tight text-campus-ink sm:text-2xl">
                        {selectedRoom.name}
                      </h2>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1 text-sm font-semibold text-campus-deep">
                          <Users className="h-4 w-4" />
                          {selectedRoom.capacity} seats
                        </span>
                        {selectedRoom.blocked ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-100 px-3 py-1 text-sm font-semibold text-rose-700">
                            <Lock className="h-4 w-4" />
                            Blocked
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700">
                            <DoorClosed className="h-4 w-4" />
                            Open for requests
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1 text-sm font-semibold text-campus-deep sm:hidden">
                          <CalendarClock className="h-4 w-4" />
                          Now {formatMinutes(now)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 sm:flex-col sm:items-end sm:gap-1">
                    <div className="rounded-2xl bg-white/70 px-5 py-3 text-center sm:px-6 sm:py-3.5">
                      <p className="text-xs font-semibold uppercase tracking-widest text-campus-primary">
                        Current time
                      </p>
                      <p className="mt-0.5 text-2xl font-extrabold tabular-nums text-campus-ink sm:text-3xl">
                        {formatMinutes(now)}
                      </p>
                    </div>
                    <div className="hidden text-right sm:block">
                      <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                        Existing bookings
                      </p>
                      <p className="text-xl font-bold tabular-nums text-campus-ink">
                        {bookings.length}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Time inputs */}
              <div className="mb-5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-campus-lavender text-campus-primary">
                    <CheckCircle2 className="h-4.5 w-4.5" />
                  </span>
                  <h3 className="text-lg font-bold tracking-tight text-campus-ink">
                    Check availability
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-slate-500 transition hover:bg-campus-lavender/60 hover:text-campus-deep"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Reset
                </button>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <TimeField
                  label="Start time"
                  value={startStr}
                  onChange={setStartStr}
                />
                <TimeField
                  label="End time"
                  value={endStr}
                  onChange={setEndStr}
                />
              </div>

              <div className="mt-4 space-y-2.5">
                <p className="flex items-center gap-2 text-sm leading-relaxed text-slate-600">
                  <Clock className="h-4 w-4 shrink-0 text-campus-primary" />
                  Times must be in whole minutes. Maximum booking length is 120
                  minutes.
                </p>
                {requestedDuration !== null && (
                  <p className="pl-6 text-sm leading-relaxed text-slate-600">
                    Selected duration:{" "}
                    <span className="font-semibold text-campus-ink">
                      {requestedDuration} min
                    </span>
                    {requestedDuration > 120 && (
                      <span className="font-medium text-rose-600">
                        {" "}
                        (exceeds the 120-minute limit)
                      </span>
                    )}
                  </p>
                )}
              </div>

              <div className="mt-3">
                <ValidationHint validation={liveValidation} />
              </div>

              <button
                type="button"
                onClick={handleCheck}
                className="group mt-5 inline-flex w-full items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-campus-primary to-campus-deep px-5 py-3.5 text-base font-semibold text-white shadow-soft transition-all hover:shadow-glow hover:brightness-110 focus:outline-none focus:ring-4 focus:ring-campus-primary/30 active:scale-[0.98] sm:w-auto"
              >
                <CheckCircle2 className="h-5 w-5 transition-transform group-hover:scale-110" />
                Check Availability
              </button>

              <div className="mt-5">
                <AvailabilityCard result={result} requestedRange={requestedRange} />
              </div>
            </section>

            {/* Existing bookings */}
            <section className="animate-riseIn [animation-delay:80ms] lg:col-span-2 rounded-3xl border border-white/60 bg-white/85 p-5 shadow-card backdrop-blur-sm sm:p-7">
              <div className="mb-4 flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-campus-lavender text-campus-primary">
                  <Info className="h-4.5 w-4.5" />
                </span>
                <h3 className="text-lg font-bold tracking-tight text-campus-ink">
                  Existing bookings
                </h3>
              </div>

              {bookings.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-campus-lavender bg-campus-bg px-4 py-8 text-center text-sm font-medium text-slate-500">
                  No existing bookings for this room.
                </p>
              ) : (
                <ul className="space-y-3">
                  {bookings.map((b) => (
                    <BookingRow key={b.id} booking={b} />
                  ))}
                </ul>
              )}

              <div className="mt-4 flex items-start gap-2.5 rounded-2xl bg-campus-lavender/70 px-4 py-3 text-sm leading-relaxed text-campus-deep">
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-campus-primary" />
                <span className="font-medium">
                  Requests that only touch an existing booking at an endpoint
                  (e.g. 11:00–12:00 after a 10:00–11:00 booking) are allowed.
                </span>
              </div>
            </section>
          </div>
        )}

        <footer className="mt-8 text-center text-sm leading-relaxed text-slate-500 sm:mt-10">
          Fictional booking data for demonstration only. No booking is created.
        </footer>
      </main>
    </div>
  );
}
