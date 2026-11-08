import { CheckCircle2, Sparkles, XCircle } from "lucide-react";
import {
  type AvailabilityOutcome,
  formatMinutes,
} from "@/lib/availability";

export function AvailabilityCard({
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
