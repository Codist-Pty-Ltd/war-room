import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach } from "vitest";
import AppAuthGate from "./AppAuthGate";
import {
  fetchAuthStatus,
  loginWarRoom,
  logoutWarRoom,
  setUnauthorizedHandler,
} from "../services/api";

vi.mock("../services/api", () => ({
  fetchAuthStatus: vi.fn(),
  loginWarRoom: vi.fn(),
  logoutWarRoom: vi.fn(),
  setUnauthorizedHandler: vi.fn(),
}));

const mockFetchAuthStatus = vi.mocked(fetchAuthStatus);
const mockLoginWarRoom = vi.mocked(loginWarRoom);

function getPasswordInput(): HTMLInputElement {
  const el = document.querySelector('input[name="password"]');
  if (!el) throw new Error("password input not found");
  return el as HTMLInputElement;
}

describe("Login (AppAuthGate)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(setUnauthorizedHandler).mockImplementation(() => undefined);
    vi.mocked(logoutWarRoom).mockResolvedValue(undefined);
  });

  it("renders username and password fields", async () => {
    mockFetchAuthStatus.mockResolvedValue({
      authRequired: true,
      authenticated: false,
    });

    render(
      <AppAuthGate>
        <div>War Room App</div>
      </AppAuthGate>,
    );

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /sign in/i })).toBeInTheDocument();
    });

    expect(screen.getByRole("textbox")).toBeInTheDocument();
    expect(getPasswordInput()).toBeInTheDocument();
  });

  it("shows error message on failed login", async () => {
    mockFetchAuthStatus.mockResolvedValue({
      authRequired: true,
      authenticated: false,
    });
    mockLoginWarRoom.mockRejectedValue(new Error("Invalid credentials"));

    const user = userEvent.setup();
    render(
      <AppAuthGate>
        <div>War Room App</div>
      </AppAuthGate>,
    );

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
    });

    await user.type(screen.getByRole("textbox"), "wrong");
    await user.type(getPasswordInput(), "bad");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    });
  });

  it("calls login API with entered credentials on submit", async () => {
    mockFetchAuthStatus.mockResolvedValue({
      authRequired: true,
      authenticated: false,
    });
    mockLoginWarRoom.mockResolvedValue({ role: "guest" });

    const user = userEvent.setup();
    render(
      <AppAuthGate>
        <div>War Room App</div>
      </AppAuthGate>,
    );

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
    });

    await user.type(screen.getByRole("textbox"), "guest1");
    await user.type(getPasswordInput(), "secret");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(mockLoginWarRoom).toHaveBeenCalledWith("guest1", "secret");
    });
  });

  it("redirects to dashboard on successful login", async () => {
    mockFetchAuthStatus.mockResolvedValue({
      authRequired: true,
      authenticated: false,
    });
    mockLoginWarRoom.mockResolvedValue({ role: "super" });

    const user = userEvent.setup();
    render(
      <AppAuthGate>
        <div>War Room App</div>
      </AppAuthGate>,
    );

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
    });

    await user.type(screen.getByRole("textbox"), "admin");
    await user.type(getPasswordInput(), "pass");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText("War Room App")).toBeInTheDocument();
    });

    expect(screen.queryByRole("heading", { name: /sign in/i })).not.toBeInTheDocument();
  });

  it("disables submit button while login is in progress", async () => {
    mockFetchAuthStatus.mockResolvedValue({
      authRequired: true,
      authenticated: false,
    });

    let resolveLogin: (value: { role: "guest" }) => void = () => undefined;
    mockLoginWarRoom.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveLogin = resolve;
        }),
    );

    const user = userEvent.setup();
    render(
      <AppAuthGate>
        <div>War Room App</div>
      </AppAuthGate>,
    );

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
    });

    await user.type(screen.getByRole("textbox"), "guest1");
    await user.type(getPasswordInput(), "secret");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /signing in/i })).toBeDisabled();
    });

    resolveLogin({ role: "guest" });

    await waitFor(() => {
      expect(screen.getByText("War Room App")).toBeInTheDocument();
    });
  });
});
