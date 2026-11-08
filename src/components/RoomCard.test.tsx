import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { RoomCard } from "@/components/RoomCard";
import { ROOMS } from "@/lib/fixtures";

const A101 = ROOMS.find((r) => r.id === "a101")!;
const D404 = ROOMS.find((r) => r.id === "d404")!;

describe("RoomCard", () => {
  it("renders the room name and capacity", () => {
    render(
      <RoomCard room={A101} isSelected={false} onSelect={() => {}} />,
    );
    expect(
      screen.getByRole("button", { name: /Study Room A101/i }),
    ).toBeInTheDocument();
    expect(screen.getByText("6")).toBeInTheDocument();
  });

  it("renders the 'Blocked' badge for a blocked room", () => {
    render(
      <RoomCard room={D404} isSelected={false} onSelect={() => {}} />,
    );
    expect(screen.getByText("Blocked")).toBeInTheDocument();
  });

  it("renders the 'Open' badge for a non-blocked room", () => {
    render(
      <RoomCard room={A101} isSelected={false} onSelect={() => {}} />,
    );
    expect(screen.getByText("Open")).toBeInTheDocument();
  });
});
