import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { AvailabilityCard } from "@/components/AvailabilityCard";

describe("AvailabilityCard", () => {
  it("renders the idle prompt when no result is provided", () => {
    render(
      <AvailabilityCard result={null} requestedRange={null} />,
    );
    expect(
      screen.getByText("Enter a start and end time, then check availability."),
    ).toBeInTheDocument();
  });

  it("renders 'Available' for an available outcome", () => {
    render(
      <AvailabilityCard
        result={{ kind: "available" }}
        requestedRange={{ start: 660, end: 720 }}
      />,
    );
    expect(screen.getByText("Available")).toBeInTheDocument();
  });

  it("renders 'Unavailable' with the reason for an unavailable outcome", () => {
    render(
      <AvailabilityCard
        result={{ kind: "unavailable", reason: "Room is blocked." }}
        requestedRange={null}
      />,
    );
    expect(screen.getByText("Unavailable")).toBeInTheDocument();
    expect(screen.getByText("Room is blocked.")).toBeInTheDocument();
  });
});
