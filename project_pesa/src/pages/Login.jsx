import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleAuthProvider, signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth, configureInMemoryAuthPersistence } from '../firebase';

const getAuthErrorMessage = (err) => {
  switch (err.code) {
    case 'auth/invalid-credential':
    case 'auth/user-not-found':
    case 'auth/wrong-password':
      return 'Invalid email or password.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Try again later.';
    case 'auth/operation-not-allowed':
      return 'This sign-in method is not enabled in Firebase Authentication.';
    case 'auth/popup-blocked':
      return 'The Google sign-in popup was blocked by your browser.';
    case 'auth/popup-closed-by-user':
      return 'Google sign-in was closed before it finished.';
    case 'auth/unauthorized-domain':
      return 'This website domain is not authorized in Firebase.';
    default:
      return `Firebase error: ${err.code || err.message}`;
  }
};

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await configureInMemoryAuthPersistence();
      await signInWithEmailAndPassword(auth, email.trim(), password);
      navigate('/');
    } catch (err) {
      setError(getAuthErrorMessage(err));
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const googleLogin = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    setError('');
    setIsGoogleSubmitting(true);

    try {
      await configureInMemoryAuthPersistence();
      await signInWithPopup(auth, provider);
      navigate('/');
    } catch (err) {
      setError(getAuthErrorMessage(err));
      console.error(err);
    } finally {
      setIsGoogleSubmitting(false);
    }
  };

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: '450px', margin: '2rem auto' }}>
        <h2 style={{ fontSize: '28px', marginBottom: '20px' }}>Login to PesaPal</h2>
        
        {error && <div className="alert alert-error" style={{ marginBottom: '15px' }}>{error}</div>}
        
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={isSubmitting}>
            {isSubmitting ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div style={{ textAlign: 'center', margin: '15px 0', color: 'var(--gray)' }}>or</div>

        <button
          onClick={googleLogin}
          className="btn btn-secondary"
          style={{ width: '100%' }}
          disabled={isGoogleSubmitting}
        >
          {isGoogleSubmitting ? 'Opening Google...' : 'Sign in with Google'}
        </button>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--gray)' }}>
          Don't have an account? <Link to="/signup" style={{ color: 'var(--main-blue)', fontWeight: '600' }}>Sign up</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
