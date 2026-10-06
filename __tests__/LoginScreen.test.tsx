import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import React from 'react';

import { ApiError } from '@/api/client';

const mockSignIn = jest.fn();
jest.mock('@/store/AuthProvider', () => ({
  useAuth: () => ({ signIn: mockSignIn, expiredNotice: false, dismissExpiredNotice: jest.fn() }),
}));
jest.mock('expo-router', () => ({
  Link: ({ children }: { children: unknown }) => children,
}));
jest.mock('expo-web-browser', () => ({ openBrowserAsync: jest.fn() }));

// eslint-disable-next-line import/first
import LoginScreen from '@/app/login';

describe('LoginScreen', () => {
  beforeEach(() => mockSignIn.mockReset());

  it('validates empty fields without calling the API', async () => {
    await render(<LoginScreen />);
    await fireEvent.press(screen.getByTestId('sign-in'));
    expect(await screen.findByText('Please enter your email.')).toBeTruthy();
    expect(screen.getByText('Please enter your password.')).toBeTruthy();
    expect(mockSignIn).not.toHaveBeenCalled();
  });

  it('rejects an invalid email', async () => {
    await render(<LoginScreen />);
    await fireEvent.changeText(screen.getByTestId('email'), 'notanemail');
    await fireEvent.changeText(screen.getByTestId('password'), 'secret');
    await fireEvent.press(screen.getByTestId('sign-in'));
    expect(await screen.findByText('Please enter a valid email address.')).toBeTruthy();
    expect(mockSignIn).not.toHaveBeenCalled();
  });

  it('shows the website error copy on bad credentials and clears the password', async () => {
    mockSignIn.mockRejectedValue(new ApiError(401, 'Invalid email or password'));
    await render(<LoginScreen />);
    await fireEvent.changeText(screen.getByTestId('email'), 'user@example.com');
    await fireEvent.changeText(screen.getByTestId('password'), 'wrong');
    await fireEvent.press(screen.getByTestId('sign-in'));
    expect(await screen.findByText('Invalid email and/or password. Please try again.')).toBeTruthy();
    expect(screen.getByTestId('password').props.value).toBe('');
  });

  it('shows a connectivity error', async () => {
    mockSignIn.mockRejectedValue(new ApiError(0, 'No connection. Check your internet and try again.'));
    await render(<LoginScreen />);
    await fireEvent.changeText(screen.getByTestId('email'), 'user@example.com');
    await fireEvent.changeText(screen.getByTestId('password'), 'pw');
    await fireEvent.press(screen.getByTestId('sign-in'));
    expect(await screen.findByText(/No connection/)).toBeTruthy();
  });

  it('signs in with trimmed input', async () => {
    mockSignIn.mockResolvedValue(undefined);
    await render(<LoginScreen />);
    await fireEvent.changeText(screen.getByTestId('email'), 'user@example.com');
    await fireEvent.changeText(screen.getByTestId('password'), 'pw');
    await fireEvent.press(screen.getByTestId('sign-in'));
    await waitFor(() => expect(mockSignIn).toHaveBeenCalledWith('user@example.com', 'pw'));
  });
});
