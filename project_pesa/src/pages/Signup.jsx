import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth, configureInMemoryAuthPersistence } from '../firebase';

const getAuthErrorMessage = (err) => {
  switch (err.code) {
    case 'auth/email-already-in-use':
      return 'An account already exists for this email.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters.';
    case 'auth/operation-not-allowed':
      return 'This sign-up method is not enabled in Firebase Authentication.';
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

function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    
    if (password !== confirmPassword) {
      setError('Passwords do not match!');
      return;
    }

    setIsSubmitting(true);

    try {
      await configureInMemoryAuthPersistence();
      await createUserWithEmailAndPassword(auth, email.trim(), password);
      navigate('/');
    } catch (err) {
      setError(getAuthErrorMessage(err));
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const googleSignup = async () => {
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
        <h2 style={{ fontSize: '28px', marginBottom: '20px' }}>Sign Up for PesaPal</h2>
        
        {error && <div className="alert alert-error" style={{ marginBottom: '15px' }}>{error}</div>}
        
        <form onSubmit={handleSignup}>
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
              placeholder="Create a password"
            />
          </div>
          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="Confirm your password"
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={isSubmitting}>
            {isSubmitting ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <div style={{ textAlign: 'center', margin: '15px 0', color: 'var(--gray)' }}>or</div>

        <button
          onClick={googleSignup}
          className="btn btn-secondary"
          style={{ width: '100%' }}
          disabled={isGoogleSubmitting}
        >
          {isGoogleSubmitting ? 'Opening Google...' : 'Sign up with Google'}
        </button>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--gray)' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--main-blue)', fontWeight: '600' }}>Login</Link>
        </p>
      </div>
    </div>
  );
}

export default Signup;
