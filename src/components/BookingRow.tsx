import { BookOpen, Clock } from "lucide-react";
import { type Booking, formatMinutes } from "@/lib/availability";

function durationLabel(start: number, end: number): string {
  return `${end - start} min`;
}

export function BookingRow({ booking }: { booking: Booking }) {
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
