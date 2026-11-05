import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  BookOpen,
  Building2,
  CalendarClock,
  CheckCircle2,
  Clock,
  DoorClosed,
  GraduationCap,
  Info,
  Lock,
  RefreshCw,
  Sparkles,
  XCircle,
} from "lucide-react";
import {
  type AvailabilityInput,
  type AvailabilityOutcome,
  type Booking,
  type Room,
  type ValidationResult,
  checkAvailability,
  formatMinutes,
  parseTimeToMinutes,
  validateBookingRequest,
} from "@/lib/availability";
import {
  CURRENT_TIME_MINUTES,
  INITIAL_BOOKINGS,
  ROOM,
} from "@/lib/fixtures";

function durationLabel(start: number, end: number): string {
  return `${end - start} min`;
}

function AvailabilityCard({
  result,
  requestedRange,
}: {
  result: AvailabilityOutcome | null;
  requestedRange: { start: number; end: number } | null;
}) {
  if (!result) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-campus-lavender/70 bg-campus-lavender/40 px-5 py-4 text-campus-ink/70 animate-fadeIn">
        <Sparkles className="h-5 w-5 shrink-0 text-campus-primary" />
        <span className="text-sm font-medium">
          Enter a start and end time, then check availability.
        </span>
      </div>
    );
  }

  if (result.kind === "available") {
    return (
      <div className="animate-riseIn rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 px-5 py-4 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-sm">
            <CheckCircle2 className="h-6 w-6" />
          </span>
          <div>
            <p className="text-base font-bold text-emerald-800">Available</p>
            <p className="text-sm font-medium text-emerald-700">
              {requestedRange
                ? `${formatMinutes(requestedRange.start)}–${formatMinutes(
                    requestedRange.end,
                  )} is free for booking.`
                : "This time slot is free for booking."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-riseIn rounded-2xl border border-rose-200 bg-gradient-to-br from-rose-50 to-red-50 px-5 py-4 shadow-sm">
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-rose-500 text-white shadow-sm">
          <XCircle className="h-6 w-6" />
        </span>
        <div>
          <p className="text-base font-bold text-rose-800">Unavailable</p>
          <p className="text-sm font-medium text-rose-700">{result.reason}</p>
        </div>
      </div>
    </div>
  );
}

function BookingRow({ booking }: { booking: Booking }) {
  return (
    <li className="group flex flex-col gap-2 rounded-2xl border border-campus-lavender/70 bg-white px-4 py-3.5 transition-all hover:border-campus-primary/40 hover:shadow-soft sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-campus-lavender to-campus-bg text-campus-primary transition group-hover:from-campus-primary group-hover:to-campus-deep group-hover:text-white">
          <BookOpen className="h-4 w-4" />
        </span>
        <div>
          <p className="text-sm font-semibold text-campus-ink">
            {booking.label}
          </p>
          <p className="text-sm leading-relaxed text-slate-500">
            {formatMinutes(booking.start)} – {formatMinutes(booking.end)}
          </p>
        </div>
      </div>
      <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-campus-lavender/60 px-3 py-1 text-xs font-semibold text-campus-deep">
        <Clock className="h-3.5 w-3.5" />
        {durationLabel(booking.start, booking.end)}
      </span>
    </li>
  );
}

function TimeField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (next: string) => void;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-sm font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </span>
      <input
        type="time"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-xl border border-campus-lavender bg-white px-4 py-3.5 text-base font-medium text-campus-ink shadow-sm transition focus:border-campus-primary focus:outline-none focus:ring-4 focus:ring-campus-primary/15"
      />
    </label>
  );
}

function ValidationHint({ validation }: { validation: ValidationResult }) {
  if (validation.valid) {
    return (
      <div className="flex items-start gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50/80 px-3.5 py-3 text-sm leading-relaxed text-emerald-800 animate-fadeIn">
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
        <span className="font-medium">
          Times look valid. Tap Check Availability to confirm the room.
        </span>
      </div>
    );
  }
  return (
    <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50/90 px-3.5 py-3 text-sm leading-relaxed text-amber-800 animate-fadeIn">
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
      <span className="font-medium">{validation.message}</span>
    </div>
  );
}

export default function App() {
  const [now] = useState(CURRENT_TIME_MINUTES);
  const [room] = useState<Room>(ROOM);
  const [bookings] = useState<Booking[]>(INITIAL_BOOKINGS);

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
  }, [startStr, endStr]);

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
    return validateBookingRequest({
      start: parsedTimes.start,
      end: parsedTimes.end,
      now,
      room,
      bookings,
    });
  }, [parsedTimes, now, room, bookings]);

  const handleCheck = () => {
    if (!parsedTimes) {
      setResult({
        kind: "unavailable",
        reason: "Please enter valid start and end times.",
      });
      setRequestedRange(null);
      return;
    }
    const input: AvailabilityInput = {
      start: parsedTimes.start,
      end: parsedTimes.end,
      now,
      room,
      bookings,
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
        {/* Room information card */}
        <section className="mb-6 animate-fadeIn sm:mb-8">
          <div className="overflow-hidden rounded-3xl border border-white/60 bg-white/80 p-5 shadow-card backdrop-blur-sm sm:p-7">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-4">
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-campus-primary to-campus-deep text-white shadow-soft">
                  <Building2 className="h-7 w-7" />
                </span>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-campus-primary">
                    Room
                  </p>
                  <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-campus-ink sm:text-3xl">
                    {room.name}
                  </h2>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {room.blocked ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-100 px-3.5 py-1.5 text-sm font-semibold text-rose-700">
                        <Lock className="h-4 w-4" />
                        Blocked
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3.5 py-1.5 text-sm font-semibold text-emerald-700">
                        <DoorClosed className="h-4 w-4" />
                        Open for requests
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-campus-lavender px-3.5 py-1.5 text-sm font-semibold text-campus-deep sm:hidden">
                      <CalendarClock className="h-4 w-4" />
                      Now {formatMinutes(now)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 sm:flex-col sm:items-end sm:gap-1">
                <div className="rounded-2xl bg-gradient-to-br from-campus-lavender to-campus-bg px-5 py-3 text-center sm:px-7 sm:py-4">
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
        </section>

        <div className="grid gap-6 lg:grid-cols-5 lg:gap-7">
          {/* Availability checker */}
          <section className="animate-riseIn lg:col-span-3 rounded-3xl border border-white/60 bg-white/85 p-5 shadow-card backdrop-blur-sm sm:p-7">
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
                <BookOpen className="h-4.5 w-4.5" />
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

        <footer className="mt-8 text-center text-sm leading-relaxed text-slate-500 sm:mt-10">
          Fictional booking data for demonstration only. No booking is created.
        </footer>
      </main>
    </div>
  );
}


