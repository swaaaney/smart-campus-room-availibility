import { AlertCircle, CheckCircle2 } from "lucide-react";
import { type ValidationResult } from "@/lib/availability";

export function ValidationHint({ validation }: { validation: ValidationResult }) {
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
