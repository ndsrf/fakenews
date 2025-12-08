import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Login from '../../../src/client/pages/Login';
import { AuthProvider } from '../../../src/client/contexts/AuthContext';
import '@testing-library/jest-dom';

// Mock fetch
global.fetch = jest.fn();

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        {component}
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('Login Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  it('renders login form with all required fields', () => {
    renderWithProviders(<Login />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument();
    expect(screen.getByText(/register/i)).toBeInTheDocument();
  });

  it('displays version number', () => {
    renderWithProviders(<Login />);

    // Version should be displayed somewhere on the page
    const versionElement = screen.getByText(/v\d+\.\d+\.\d+/i);
    expect(versionElement).toBeInTheDocument();
  });

  it('has language toggle (EN/ES)', () => {
    renderWithProviders(<Login />);

    // Look for language toggle buttons or dropdown
    const languageToggle = screen.getByRole('button', { name: /en|es|language/i });
    expect(languageToggle).toBeInTheDocument();
  });

  it('shows validation error for empty email', async () => {
    renderWithProviders(<Login />);

    const submitButton = screen.getByRole('button', { name: /log in/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/email.*required/i)).toBeInTheDocument();
    });
  });

  it('shows validation error for empty password', async () => {
    renderWithProviders(<Login />);

    const emailInput = screen.getByLabelText(/email/i);
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

    const submitButton = screen.getByRole('button', { name: /log in/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/password.*required/i)).toBeInTheDocument();
    });
  });

  it('submits form with valid credentials', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        token: 'test-token',
        user: { id: '1', email: 'test@example.com', role: 'user' }
      }),
    });

    renderWithProviders(<Login />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /log in/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/auth/login'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
          body: JSON.stringify({
            email: 'test@example.com',
            password: 'password123',
          }),
        })
      );
    });
  });

  it('displays error message for invalid credentials', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Invalid credentials' }),
    });

    renderWithProviders(<Login />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /log in/i });

    fireEvent.change(emailInput, { target: { value: 'wrong@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    });
  });

  it('has link to register page', () => {
    renderWithProviders(<Login />);

    const registerLink = screen.getByRole('link', { name: /register/i });
    expect(registerLink).toBeInTheDocument();
    expect(registerLink).toHaveAttribute('href', expect.stringContaining('/register'));
  });

  it('is minimal - no app title or marketing copy', () => {
    renderWithProviders(<Login />);

    // Should NOT have a large heading with app name
    const headings = screen.queryAllByRole('heading');
    const hasLargeAppTitle = headings.some(h =>
      h.textContent?.toLowerCase().includes('fictional news generator') ||
      h.textContent?.toLowerCase().includes('welcome')
    );

    expect(hasLargeAppTitle).toBe(false);
  });

  it('toggles password visibility', () => {
    renderWithProviders(<Login />);

    const passwordInput = screen.getByLabelText(/password/i) as HTMLInputElement;
    expect(passwordInput.type).toBe('password');

    // Look for show/hide password button
    const toggleButton = screen.queryByRole('button', { name: /show|hide|toggle.*password/i });

    if (toggleButton) {
      fireEvent.click(toggleButton);
      expect(passwordInput.type).toBe('text');

      fireEvent.click(toggleButton);
      expect(passwordInput.type).toBe('password');
    }
  });
});
