import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Store, User as UserIcon, ShieldAlert, LogIn, LayoutDashboard } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleScroll = (id) => {
    if (window.location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 200);
    } else {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const getRoleIcon = () => {
    if (!user) return null;
    if (user.role === 'admin') return <ShieldAlert size={14} />;
    if (user.role === 'owner') return <Store size={14} />;
    return <UserIcon size={14} />;
  };

  const getDashboardPath = () => {
    if (!user) return '/';
    if (user.role === 'admin') return '/admin';
    if (user.role === 'owner') return '/owner';
    return '/user';
  };

  return (
    <header className="navbar-header">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <Store size={26} className="logo-svg" style={{ stroke: 'url(#indigo-violet-grad)' }} />
          <span>ShopRate</span>
          
          {/* SVG gradient definition for the Lucide stroke */}
          <svg width="0" height="0">
            <defs>
              <linearGradient id="indigo-violet-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="var(--color-indigo)" />
                <stop offset="100%" stopColor="var(--color-violet)" />
              </linearGradient>
            </defs>
          </svg>
        </Link>

        <ul className="navbar-nav-links" style={{
          display: 'flex',
          listStyle: 'none',
          gap: '2rem',
          margin: 0,
          padding: 0,
          alignItems: 'center'
        }}>
          <li>
            <Link to="/" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 600 }} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Home</Link>
          </li>
          <li>
            <a href="#explore-section" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 600 }} onClick={(e) => { e.preventDefault(); handleScroll('explore-section'); }}>Explore</a>
          </li>
          <li>
            <a href="#about-section" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 600 }} onClick={(e) => { e.preventDefault(); handleScroll('about-section'); }}>About</a>
          </li>
          <li>
            <a href="#contact-section" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 600 }} onClick={(e) => { e.preventDefault(); handleScroll('contact-section'); }}>Contact</a>
          </li>
        </ul>

        <nav className="navbar-menu">
          {user ? (
            <>
              <Link 
                to={getDashboardPath()} 
                className="btn btn-secondary" 
                style={{ 
                  padding: '0.45rem 0.9rem', 
                  fontSize: '0.85rem', 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: '0.35rem',
                  textDecoration: 'none' 
                }}
              >
                <LayoutDashboard size={14} />
                <span>Dashboard</span>
              </Link>

              <div className="user-info-badge">
                <span className={`role-tag ${user.role}`} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  {getRoleIcon()}
                  {user.role}
                </span>
                <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                  {user.name.length > 20 ? `${user.name.substring(0, 18)}...` : user.name}
                </span>
              </div>

              <button className="btn btn-secondary" onClick={handleLogout} style={{ padding: '0.45rem 0.9rem', fontSize: '0.85rem' }}>
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <>
              <Link 
                to="/login" 
                className="btn btn-primary" 
                style={{ 
                  padding: '0.5rem 1.1rem', 
                  fontSize: '0.85rem', 
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem'
                }}
              >
                <LogIn size={15} />
                <span>Sign In</span>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
