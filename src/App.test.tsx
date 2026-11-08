import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "@/App";
import { ROOMS } from "@/lib/fixtures";

const ROOM_NAMES = ROOMS.map((r) => r.name);
const B202 = ROOMS.find((r) => r.id === "b202")!;
const D404 = ROOMS.find((r) => r.id === "d404")!;

function renderApp() {
  return render(<App />);
}

async function clickRoomByName(name: string) {
  const card = screen.getByRole("button", { name: new RegExp(name, "i") });
  await userEvent.click(card);
}

describe("App — room catalog rendering", () => {
  it("renders all four room cards by name", () => {
    renderApp();
    for (const name of ROOM_NAMES) {
      expect(
        screen.getByRole("button", { name: new RegExp(name, "i") }),
      ).toBeInTheDocument();
    }
  });

  it("renders the header title", () => {
    renderApp();
    expect(
      screen.getByText("Smart Campus Room Availability Checker"),
    ).toBeInTheDocument();
  });
});

describe("F1 — capacity filtering via UI", () => {
  it("filters out rooms below the entered capacity", async () => {
    renderApp();
    const input = screen.getByLabelText("Minimum attendees");
    await userEvent.clear(input);
    await userEvent.type(input, "15");

    expect(screen.queryByRole("button", { name: /Study Room A101/i })).toBeNull();
    expect(
      screen.getByRole("button", { name: /Computer Lab B202/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Conference Room C303/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Seminar Room D404/i }),
    ).toBeInTheDocument();
  });
});

describe("F2 — equipment filtering via UI", () => {
  it("filters rooms to only those with the selected equipment", async () => {
    renderApp();
    const checkbox = screen.getByRole("checkbox", { name: "Computers" });
    await userEvent.click(checkbox);

    expect(
      screen.getByRole("button", { name: /Computer Lab B202/i }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Study Room A101/i })).toBeNull();
    expect(screen.queryByRole("button", { name: /Conference Room C303/i })).toBeNull();
    expect(screen.queryByRole("button", { name: /Seminar Room D404/i })).toBeNull();
  });
});

describe("F4 — empty state", () => {
  it("displays an empty-state message when no rooms match", async () => {
    renderApp();
    const input = screen.getByLabelText("Minimum attendees");
    await userEvent.clear(input);
    await userEvent.type(input, "100");

    expect(
      screen.getByText("No rooms match your requirements."),
    ).toBeInTheDocument();
  });
});

describe("F5 — room switching", () => {
  it("updates the selected room details when a different room is clicked", async () => {
    renderApp();
    await clickRoomByName(B202.name);

    expect(
      screen.getByRole("heading", { name: B202.name }),
    ).toBeInTheDocument();
  });

  it("updates the bookings list to show the selected room's bookings", async () => {
    renderApp();
    await clickRoomByName(B202.name);

    expect(
      screen.getByText("Lab Session — IT205"),
    ).toBeInTheDocument();
  });

  it("clears a previous availability result when switching rooms", async () => {
    renderApp();

    // Set times that are available for A101 (11:00–12:00 touches the 10:00–11:00 booking endpoint)
    const startInput = screen.getByLabelText("Start time");
    const endInput = screen.getByLabelText("End time");
    await userEvent.clear(startInput);
    await userEvent.type(startInput, "11:00");
    await userEvent.clear(endInput);
    await userEvent.type(endInput, "12:00");

    const checkBtn = screen.getByRole("button", { name: /Check Availability/i });
    await userEvent.click(checkBtn);
    expect(screen.getByText("Available")).toBeInTheDocument();

    // Switch to B202
    await clickRoomByName(B202.name);
    expect(screen.queryByText("Available")).toBeNull();
  });

  it("uses only the selected room's bookings for availability checks", async () => {
    renderApp();
    await clickRoomByName(B202.name);

    // B202 has a booking at 12:00–13:00 (720–780)
    // Default times are 09:30–10:30 which is before the booking, so available
    const checkBtn = screen.getByRole("button", { name: /Check Availability/i });
    await userEvent.click(checkBtn);
    expect(screen.getByText("Available")).toBeInTheDocument();
  });
});

describe("F3 — blocked room UI feedback", () => {
  it("shows unavailable feedback when checking a blocked room", async () => {
    renderApp();
    await clickRoomByName(D404.name);

    const checkBtn = screen.getByRole("button", { name: /Check Availability/i });
    await userEvent.click(checkBtn);

    expect(screen.getByText("Unavailable")).toBeInTheDocument();
    expect(
      screen.getByText(/is currently blocked and cannot be booked/i),
    ).toBeInTheDocument();
  });
});

describe("Validation feedback for invalid time intervals", () => {
  it("shows a validation hint for a reversed time interval", async () => {
    renderApp();
    const startInput = screen.getByLabelText("Start time");
    const endInput = screen.getByLabelText("End time");

    await userEvent.clear(startInput);
    await userEvent.type(startInput, "11:00");
    await userEvent.clear(endInput);
    await userEvent.type(endInput, "10:00");

    expect(
      screen.getByText(/Start time must be strictly earlier than end time/i),
    ).toBeInTheDocument();
  });

  it("shows a validation hint when start is not after the current time", async () => {
    renderApp();
    const startInput = screen.getByLabelText("Start time");
    const endInput = screen.getByLabelText("End time");

    // Current time is 09:00; enter 09:05 which is after now but let's enter 08:30
    await userEvent.clear(startInput);
    await userEvent.type(startInput, "08:30");
    await userEvent.clear(endInput);
    await userEvent.type(endInput, "09:15");

    expect(
      screen.getByText(/Start time must be after the current time/i),
    ).toBeInTheDocument();
  });

  it("shows valid feedback for a proper time interval", async () => {
    renderApp();
    const startInput = screen.getByLabelText("Start time");
    const endInput = screen.getByLabelText("End time");

    await userEvent.clear(startInput);
    await userEvent.type(startInput, "10:00");
    await userEvent.clear(endInput);
    await userEvent.type(endInput, "11:00");

    expect(
      screen.getByText(/Times look valid/i),
    ).toBeInTheDocument();
  });
});
