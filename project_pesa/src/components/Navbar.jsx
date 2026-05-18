import { Link, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../firebase';
import logo from '../assets/logo.png';

function Navbar() {
  const location = useLocation();
  const [user, setUser] = useState(null);

  useEffect(() => {
    onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
  }, []);

  const logout = async () => {
    await signOut(auth);
    window.location.href = '/login';
  };

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <div className="logo">
            <img src={logo} alt="PesaPal Logo" />
            <div className="logo-text">
              <h1>PesaPal</h1>
              <p>Student expense tracker</p>
            </div>
          </div>
          <nav className="nav">
            {user ? (
              <>
                <Link to="/" className={location.pathname === '/' || location.pathname === '/tracker' ? 'active' : ''}>
                  Tracker
                </Link>
                <Link to="/summary" className={location.pathname === '/summary' ? 'active' : ''}>
                  Summary
                </Link>
                <button onClick={logout} className="btn btn-secondary" style={{ padding: '10px 20px', fontSize: '15px' }}>
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className={location.pathname === '/login' ? 'active' : ''}>
                  Login
                </Link>
                <Link to="/signup" className={location.pathname === '/signup' ? 'active' : ''}>
                  Sign Up
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}

export default Navbar;