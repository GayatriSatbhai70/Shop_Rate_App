import { Link } from 'react-router-dom';
import { Store, Mail, MapPin, Phone, Heart } from 'lucide-react';

const Footer = () => {
  const handleScrollToSection = (elementId) => {
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer style={{
      background: 'rgba(10, 14, 26, 0.9)',
      backdropFilter: 'var(--glass-blur)',
      webkitBackdropFilter: 'var(--glass-blur)',
      borderTop: '1px solid rgba(255, 255, 255, 0.05)',
      padding: '4rem 2rem 2rem',
      marginTop: 'auto',
      color: 'var(--text-secondary)'
    }}>
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '3rem',
        marginBottom: '3rem'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Store size={24} style={{ color: 'var(--color-indigo)' }} />
            <span style={{
              fontSize: '1.35rem',
              fontWeight: 700,
              background: 'linear-gradient(135deg, var(--color-indigo) 0%, var(--color-violet) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              ShopRate
            </span>
          </div>
          <p style={{ fontSize: '0.9rem', lineHeight: '1.6', color: 'var(--text-muted)' }}>
            Empowering consumers to rate and support local businesses, while providing shop owners with real-time feedback logging and analytics.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.25rem' }}>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="btn btn-secondary" style={{ padding: '0.5rem', borderRadius: '50%', display: 'inline-flex' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                <path d="M9 18c-4.51 2-5-2-7-2" />
              </svg>
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="btn btn-secondary" style={{ padding: '0.5rem', borderRadius: '50%', display: 'inline-flex' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
              </svg>
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="btn btn-secondary" style={{ padding: '0.5rem', borderRadius: '50%', display: 'inline-flex' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                <rect width="4" height="12" x="2" y="9" />
                <circle cx="4" cy="4" r="2" />
              </svg>
            </a>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h4 style={{ color: 'var(--text-primary)', fontSize: '1rem', fontWeight: 600 }}>Quick Navigation</h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem', padding: 0, margin: 0 }}>
            <li>
              <Link to="/" style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                Home Page
              </Link>
            </li>
            <li>
              <Link to="/" style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }} onClick={() => handleScrollToSection('explore-section')}>
                Explore Directory
              </Link>
            </li>
            <li>
              <Link to="/" style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }} onClick={() => handleScrollToSection('about-section')}>
                About Platform
              </Link>
            </li>
            <li>
              <Link to="/" style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }} onClick={() => handleScrollToSection('contact-section')}>
                Contact Support
              </Link>
            </li>
          </ul>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h4 style={{ color: 'var(--text-primary)', fontSize: '1rem', fontWeight: 600 }}>Contact Us</h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: 0, margin: 0, fontSize: '0.9rem' }}>
            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
              <MapPin size={16} style={{ color: 'var(--color-indigo)', minWidth: '16px', marginTop: '0.15rem' }} />
              <span>101 Silicon Valley Blvd, San Jose, CA 95112</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Mail size={16} style={{ color: 'var(--color-indigo)' }} />
              <a href="mailto:support@shoprate.com" style={{ color: 'var(--text-secondary)' }}>support@shoprate.com</a>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Phone size={16} style={{ color: 'var(--color-indigo)' }} />
              <span>+1 (800) 555-RATE</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Copyright Bar */}
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        paddingTop: '1.5rem',
        borderTop: '1px solid rgba(255, 255, 255, 0.05)',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '1rem',
        fontSize: '0.85rem',
        color: 'var(--text-muted)'
      }}>
        <span>&copy; {new Date().getFullYear()} ShopRate Platform. All rights reserved.</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
          Made with <Heart size={12} fill="var(--color-pink)" style={{ color: 'var(--color-pink)' }} /> for business transparency.
        </span>
      </div>
    </footer>
  );
};

export default Footer;
