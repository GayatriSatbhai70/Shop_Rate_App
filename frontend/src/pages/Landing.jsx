import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Search, Star, MapPin, Sparkles, Users, Store, Heart, Mail, Phone, MessageSquare, Info } from 'lucide-react';
import StoreDetailsModal from '../components/StoreDetailsModal';

const Landing = () => {
  const [stats, setStats] = useState({ totalUsers: 0, totalStores: 0, totalRatings: 0 });
  const [loadingStats, setLoadingStats] = useState(true);

  const [stores, setStores] = useState([]);
  const [loadingStores, setLoadingStores] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('rating');
  const [sortOrder, setSortOrder] = useState('DESC');

  const { API_BASE_URL, user } = useAuth();
  const navigate = useNavigate();

  const [selectedStoreId, setSelectedStoreId] = useState(null);
  const [isStoreModalOpen, setIsStoreModalOpen] = useState(false);
  
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMsg, setContactMsg] = useState('');
  const [contactSubmitted, setContactSubmitted] = useState(false);

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/public/stats`);
      const data = await response.json();
      if (response.ok) {
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to load public stats:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchStores = async () => {
    setLoadingStores(true);
    try {
      const params = new URLSearchParams({
        search: searchQuery,
        sortBy,
        sortOrder,
      });

      const response = await fetch(`${API_BASE_URL}/public/stores?${params.toString()}`);
      const data = await response.json();
      if (response.ok) {
        setStores(data);
      }
    } catch (error) {
      console.error('Failed to load public stores:', error);
    } finally {
      setLoadingStores(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchStores();
  }, [searchQuery, sortBy, sortOrder]);


  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(prev => (prev === 'ASC' ? 'DESC' : 'ASC'));
    } else {
      setSortBy(field);
      setSortOrder(field === 'rating' ? 'DESC' : 'ASC');
    }
  };

  const handleRateClick = () => {
    if (user) {
      navigate('/user');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="landing-wrapper" style={{ paddingBottom: '4rem' }}>
      {/* Hero Header Section */}
      <section className="landing-hero" style={{
        textAlign: 'center',
        padding: '5rem 1rem 3.5rem',
        background: 'radial-gradient(circle at center, rgba(99, 102, 241, 0.08) 0%, transparent 65%)',
        position: 'relative'
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.4rem',
          padding: '0.5rem 1rem',
          borderRadius: '50px',
          background: 'rgba(99, 102, 241, 0.1)',
          border: '1px solid rgba(99, 102, 241, 0.15)',
          color: 'var(--color-indigo)',
          fontSize: '0.875rem',
          fontWeight: 600,
          marginBottom: '1.5rem',
          animation: 'fadeInDown 0.5s ease'
        }}>
          <Sparkles size={14} />
          <span>Real-time Store Rating Platform</span>
        </div>
        
        <h1 style={{
          fontSize: 'clamp(2rem, 5vw, 3.75rem)',
          fontWeight: 800,
          lineHeight: '1.15',
          letterSpacing: '-0.02em',
          maxWidth: '800px',
          margin: '0 auto 1.5rem',
          background: 'linear-gradient(135deg, var(--text-primary) 30%, rgba(255, 255, 255, 0.7) 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          animation: 'fadeInUp 0.5s ease 0.1s'
        }}>
          Discover, Rate, and Support Local Stores
        </h1>
        
        <p style={{
          fontSize: 'clamp(1rem, 2vw, 1.15rem)',
          color: 'var(--text-secondary)',
          maxWidth: '600px',
          margin: '0 auto 2.5rem',
          lineHeight: '1.6',
          animation: 'fadeInUp 0.5s ease 0.2s'
        }}>
          Search registered shops, view their overall performance scores, and sign in to submit your verified customer reviews.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', animation: 'fadeInUp 0.5s ease 0.3s' }}>
          <button className="btn btn-primary" onClick={handleRateClick} style={{ padding: '0.75rem 2rem' }}>
            {user ? 'Go to Dashboard' : 'Get Started'}
          </button>
          <a href="#explore-section" className="btn btn-secondary" style={{ padding: '0.75rem 2rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>
            Explore Stores
          </a>
        </div>
      </section>

      {/* Metrics Row */}
      <section className="landing-metrics-container" style={{ maxWidth: '1200px', margin: '0 auto 4rem', padding: '0 1rem' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.5rem'
        }}>
          <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ padding: '0.75rem', borderRadius: '12px', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--color-indigo)' }}>
              <Users size={24} />
            </div>
            <div>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block' }}>Verified Users</span>
              <span style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {loadingStats ? '...' : stats.totalUsers}
              </span>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ padding: '0.75rem', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--color-success)' }}>
              <Store size={24} />
            </div>
            <div>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block' }}>Active Stores</span>
              <span style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {loadingStats ? '...' : stats.totalStores}
              </span>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ padding: '0.75rem', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.1)', color: 'var(--color-warning)' }}>
              <Star size={24} />
            </div>
            <div>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block' }}>Ratings Logged</span>
              <span style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {loadingStats ? '...' : stats.totalRatings}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Explorer Section */}
      <section id="explore-section" className="landing-explorer" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>Store Directory</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Search and view shop information and user rating averages</p>
        </div>

        {/* Filter Toolbar */}
        <div className="search-filter-bar" style={{ gap: '1.5rem', marginBottom: '2rem' }}>
          <div className="search-input-wrapper" style={{ flex: 1 }}>
            <Search size={18} className="search-icon-inside" />
            <input
              type="text"
              className="form-input"
              placeholder="Search shops by store name or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Sort By:</span>
            <button
              className={`btn btn-secondary ${sortBy === 'rating' ? 'active' : ''}`}
              onClick={() => toggleSort('rating')}
              style={{ padding: '0.45rem 0.9rem', fontSize: '0.85rem', borderColor: sortBy === 'rating' ? 'var(--color-indigo)' : '' }}
            >
              Rating {sortBy === 'rating' && (sortOrder === 'ASC' ? '▲' : '▼')}
            </button>
            <button
              className={`btn btn-secondary ${sortBy === 'name' ? 'active' : ''}`}
              onClick={() => toggleSort('name')}
              style={{ padding: '0.45rem 0.9rem', fontSize: '0.85rem', borderColor: sortBy === 'name' ? 'var(--color-indigo)' : '' }}
            >
              Name {sortBy === 'name' && (sortOrder === 'ASC' ? '▲' : '▼')}
            </button>
          </div>
        </div>

        {/* Store Grid */}
        {loadingStores ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '6rem' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              border: '3px solid rgba(255, 255, 255, 0.05)',
              borderTopColor: 'var(--color-indigo)',
              animation: 'spin 1s linear infinite'
            }} />
          </div>
        ) : stores.length === 0 ? (
          <div className="glass-panel" style={{ textAlign: 'center', padding: '5rem 1rem' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>No matching stores found.</p>
          </div>
        ) : (
          <div className="stores-cards-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '1.5rem'
          }}>
            {stores.map((store) => (
              <div key={store.id} className="glass-panel store-card" style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                height: '100%',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease'
              }}>
                <div>
                  <div style={{ width: '100%', height: '140px', borderRadius: '8px', overflow: 'hidden', marginBottom: '1rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <img 
                      src={store.imageUrl ? (store.imageUrl.startsWith('/') ? `${API_BASE_URL.replace('/api', '')}${store.imageUrl}` : store.imageUrl) : `https://images.unsplash.com/photo-1534723452862-4c874018d66d?w=300&h=140&fit=crop&q=80&sig=${store.id}`} 
                      alt={store.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      loading="lazy"
                    />
                  </div>
                  <div className="store-card-header" style={{ marginBottom: '1.25rem' }}>
                    <h3 className="store-card-name" style={{ fontSize: '1.15rem', fontWeight: 600 }}>{store.name}</h3>
                    <div className="store-card-address" style={{ display: 'flex', alignItems: 'flex-start', gap: '0.35rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                      <MapPin size={16} style={{ minWidth: '16px', color: 'var(--text-muted)' }} />
                      <span style={{ fontSize: '0.875rem' }}>{store.address}</span>
                    </div>
                  </div>

                  <div className="store-ratings-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: 'none' }}>
                    <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Average Score</span>
                    <span className="rating-badge overall" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Star size={14} fill="currentColor" />
                      {store.rating > 0 ? store.rating.toFixed(2) : '0.00'}
                    </span>
                  </div>
                </div>

                <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.5rem' }}>
                  <button
                    className="btn btn-secondary"
                    onClick={() => { setSelectedStoreId(store.id); setIsStoreModalOpen(true); }}
                    style={{
                      flex: 1,
                      padding: '0.6rem',
                      fontSize: '0.85rem'
                    }}
                  >
                    Reviews
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={handleRateClick}
                    style={{
                      flex: 1,
                      padding: '0.6rem',
                      fontSize: '0.85rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.25rem'
                    }}
                  >
                    <Heart size={12} fill="currentColor" style={{ color: 'white' }} />
                    <span>{user ? 'Rate' : 'Sign In'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* About Us Section */}
      <section id="about-section" style={{ maxWidth: '1200px', margin: '6rem auto 4rem', padding: '0 1rem' }}>
        <div className="glass-panel" style={{ padding: '3rem 2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <Info size={24} style={{ color: 'var(--color-indigo)' }} />
            <h2 style={{ fontSize: '1.75rem', fontWeight: 700 }}>About ShopRate Platform</h2>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: '1.7', marginBottom: '2rem', maxWidth: '900px' }}>
            ShopRate was established as a premium, transparent platform to build trust and connection between customers and their local store managers. Customers can share rating reviews based on real interactions, and owners can monitor store performance using our feedback logs and dials.
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '2rem'
          }}>
            <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.04)' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-indigo)', marginBottom: '0.75rem' }}>1. True Transparency</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.5' }}>All reviews are linked to verified customer log profiles to eliminate dummy reviews and ensure reliable local directory scores.</p>
            </div>
            <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.04)' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-violet)', marginBottom: '0.75rem' }}>2. Business Insights</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.5' }}>Store owners get premium dashboards illustrating review histories, average scores, and direct customer details to build feedback loops.</p>
            </div>
            <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.04)' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-pink)', marginBottom: '0.75rem' }}>3. Simple Adjustments</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.5' }}>Customers can modify their star ratings at any time if their impressions change, keeping scores current and responsive.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact-section" style={{ maxWidth: '1200px', margin: '4rem auto', padding: '0 1rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2.5rem' }}>
          {/* Contact Details */}
          <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                <Mail size={24} style={{ color: 'var(--color-indigo)' }} />
                <h2 style={{ fontSize: '1.75rem', fontWeight: 700 }}>Get In Touch</h2>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '2rem' }}>
                Have questions about registering your business, updating account profiles, or integrating custom rating feedback? Write us a message.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.9rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <MapPin size={18} style={{ color: 'var(--color-indigo)' }} />
                  <span>101 Silicon Valley Blvd, San Jose, CA</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Mail size={18} style={{ color: 'var(--color-indigo)' }} />
                  <span>support@shoprate.com</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Phone size={18} style={{ color: 'var(--color-indigo)' }} />
                  <span>+1 (800) 555-RATE</span>
                </div>
              </div>
            </div>
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.5rem', marginTop: '2rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Our support representatives typically reply within 24 business hours.
            </div>
          </div>

          {/* Contact Form Mock */}
          <div className="glass-panel">
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MessageSquare size={18} style={{ color: 'var(--color-indigo)' }} />
              <span>Send Us a Message</span>
            </h3>

            {contactSubmitted ? (
              <div style={{
                textAlign: 'center',
                padding: '3rem 1rem',
                background: 'rgba(16, 185, 129, 0.05)',
                border: '1px solid rgba(16, 185, 129, 0.2)',
                borderRadius: '12px',
                color: 'var(--color-success)'
              }}>
                <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '1rem' }}>✓</span>
                <h4 style={{ fontWeight: 600, fontSize: '1.1rem', marginBottom: '0.5rem' }}>Message Submitted!</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Thank you for reaching out. We will contact you shortly.</p>
                <button
                  className="btn btn-secondary"
                  onClick={() => setContactSubmitted(false)}
                  style={{ marginTop: '1.5rem', padding: '0.45rem 1rem', fontSize: '0.85rem' }}
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); setContactSubmitted(true); setContactName(''); setContactEmail(''); setContactMsg(''); }}>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Enter your name"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="you@example.com"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Your Message</label>
                  <textarea
                    className="form-input"
                    rows="3.5"
                    placeholder="Tell us what you need help with..."
                    value={contactMsg}
                    onChange={(e) => setContactMsg(e.target.value)}
                    style={{ resize: 'none' }}
                    required
                  />
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>
                  Send Message
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Store Details Modal Popup */}
      <StoreDetailsModal
        isOpen={isStoreModalOpen}
        storeId={selectedStoreId}
        onClose={() => { setIsStoreModalOpen(false); setSelectedStoreId(null); }}
      />
    </div>
  );
};

export default Landing;
