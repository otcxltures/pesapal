import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Tracker from './pages/Tracker';
import Summary from './pages/Summary';

const mockUser = { uid: 'user-1', email: 'student@example.com' };

const firebaseAuthMocks = vi.hoisted(() => ({
  createUserWithEmailAndPassword: vi.fn(),
  onAuthStateChanged: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  signInWithPopup: vi.fn(),
  signOut: vi.fn(),
  setPersistence: vi.fn()
}));

const firestoreMocks = vi.hoisted(() => ({
  addDoc: vi.fn(),
  collection: vi.fn((db, name) => ({ db, name })),
  deleteDoc: vi.fn(),
  doc: vi.fn((db, collectionName, id) => ({ db, collectionName, id })),
  getDoc: vi.fn(),
  getDocs: vi.fn(),
  query: vi.fn((...args) => args),
  setDoc: vi.fn(),
  where: vi.fn((...args) => args)
}));

vi.mock('firebase/auth', () => ({
  GoogleAuthProvider: class GoogleAuthProvider {
    setCustomParameters = vi.fn();
  },
  inMemoryPersistence: 'memory',
  ...firebaseAuthMocks
}));

vi.mock('firebase/firestore', () => firestoreMocks);

vi.mock('./firebase', () => ({
  auth: {},
  db: {},
  configureInMemoryAuthPersistence: firebaseAuthMocks.setPersistence
}));

const renderWithRouter = (ui) => render(<MemoryRouter>{ui}</MemoryRouter>);

beforeEach(() => {
  vi.clearAllMocks();
  firebaseAuthMocks.createUserWithEmailAndPassword.mockResolvedValue({ user: mockUser });
  firebaseAuthMocks.signInWithEmailAndPassword.mockResolvedValue({ user: mockUser });
  firebaseAuthMocks.signInWithPopup.mockResolvedValue({ user: mockUser });
  firebaseAuthMocks.signOut.mockResolvedValue();
  firebaseAuthMocks.setPersistence.mockResolvedValue();
  firebaseAuthMocks.onAuthStateChanged.mockImplementation((auth, callback) => {
    callback(mockUser);
    return vi.fn();
  });
  firestoreMocks.getDoc.mockResolvedValue({
    exists: () => true,
    data: () => ({ amount: 5000 })
  });
  firestoreMocks.getDocs.mockResolvedValue({
    docs: [
      {
        id: 'expense-1',
        data: () => ({
          amount: 200,
          category: 'Food',
          date: '2026-05-18T08:00:00.000Z',
          description: 'Lunch',
          userId: mockUser.uid
        })
      }
    ]
  });
  globalThis.fetch = vi.fn().mockResolvedValue({
    json: () => Promise.resolve({ rates: { USD: 0.0078 } })
  });
});

describe('authentication flow', () => {
  it('logs in with email/password and keeps Google social auth available', async () => {
    renderWithRouter(<Login />);

    fireEvent.change(screen.getByPlaceholderText('Enter your email'), {
      target: { value: 'student@example.com' }
    });
    fireEvent.change(screen.getByPlaceholderText('Enter your password'), {
      target: { value: 'secret123' }
    });
    fireEvent.click(screen.getByRole('button', { name: 'Login' }));

    await waitFor(() => {
      expect(firebaseAuthMocks.setPersistence).toHaveBeenCalled();
      expect(firebaseAuthMocks.signInWithEmailAndPassword).toHaveBeenCalledWith(
        expect.anything(),
        'student@example.com',
        'secret123'
      );
    });

    expect(screen.getByRole('button', { name: 'Sign in with Google' })).toBeInTheDocument();
  });

  it('signs up with email/password and can start Google signup', async () => {
    renderWithRouter(<Signup />);

    fireEvent.change(screen.getByPlaceholderText('Enter your email'), {
      target: { value: 'new@example.com' }
    });
    fireEvent.change(screen.getByPlaceholderText('Create a password'), {
      target: { value: 'secret123' }
    });
    fireEvent.change(screen.getByPlaceholderText('Confirm your password'), {
      target: { value: 'secret123' }
    });
    fireEvent.click(screen.getByRole('button', { name: 'Sign Up' }));

    await waitFor(() => {
      expect(firebaseAuthMocks.createUserWithEmailAndPassword).toHaveBeenCalledWith(
        expect.anything(),
        'new@example.com',
        'secret123'
      );
    });

    fireEvent.click(screen.getByRole('button', { name: 'Sign up with Google' }));
    await waitFor(() => expect(firebaseAuthMocks.signInWithPopup).toHaveBeenCalled());
  });
});

describe('expense tracking flow', () => {
  it('loads persisted budget and expenses from Firestore', async () => {
    renderWithRouter(<Tracker />);

    expect(await screen.findByText('KSH 5,000')).toBeInTheDocument();
    expect(screen.getByText('Lunch')).toBeInTheDocument();
    expect(screen.getByText('$39.00')).toBeInTheDocument();
  });

  it('persists budget changes in Firestore', async () => {
    renderWithRouter(<Tracker />);

    const budgetInput = await screen.findByPlaceholderText('e.g. 5000');
    fireEvent.change(budgetInput, { target: { value: '7500' } });
    fireEvent.click(screen.getByRole('button', { name: 'Set Budget' }));

    await waitFor(() => {
      expect(firestoreMocks.setDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ amount: 7500, userId: mockUser.uid })
      );
    });
  });

  it('shows the persisted budget on the summary page', async () => {
    renderWithRouter(<Summary />);

    expect(await screen.findByText('KSH 5,000')).toBeInTheDocument();
    expect(screen.getByText('Spending by Category')).toBeInTheDocument();
    expect(screen.getAllByText('Lunch')).toHaveLength(2);
  });
});
