import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Search, Star, MapPin, Key, Settings, SlidersHorizontal } from 'lucide-react';
import StoreDetailsModal from '../components/StoreDetailsModal';

const InteractiveStars = ({ currentRating, onSelect }) => {
  const [hoverRating, setHoverRating] = useState(0);

  return (
    <div className="rating-stars-wrapper" style={{ marginTop: '0.5rem' }}>
      {[1, 2, 3, 4, 5].map((starVal) => (
        <Star
          key={starVal}
          size={24}
          className={`star interactive ${(hoverRating || currentRating) >= starVal ? 'active' : ''}`}
          fill={(hoverRating || currentRating) >= starVal ? 'currentColor' : 'none'}
          onMouseEnter={() => setHoverRating(starVal)}
          onMouseLeave={() => setHoverRating(0)}
          onClick={() => onSelect(starVal)}
        />
      ))}
      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginLeft: '0.5rem' }}>
        ({hoverRating || currentRating || 0} / 5)
      </span>
    </div>
  );
};

const UserDashboard = () => {
  const [activeTab, setActiveTab] = useState('stores');

  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('ASC');

  const [ratingEdits, setRatingEdits] = useState({});

  // Change Password State
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [changingPass, setChangingPass] = useState(false);

  const [selectedStoreId, setSelectedStoreId] = useState(null);
  const [isStoreModalOpen, setIsStoreModalOpen] = useState(false);

  const { token, changePassword, API_BASE_URL, logout } = useAuth();
  const { showToast } = useToast();

  const fetchStores = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        search: searchQuery,
        sortBy,
        sortOrder,
      });

      const response = await fetch(`${API_BASE_URL}/user/stores?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.status === 401 || response.status === 403) {
        logout();
        showToast('Your session has expired. Please log in again.', 'error');
        return;
      }
      const data = await response.json();
      if (response.ok) {
        setStores(data);
      }
    } catch {
      showToast('Failed to load store listings.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'stores') {
      fetchStores();
    }
  }, [activeTab, searchQuery, sortBy, sortOrder]);

  const handleRatingSubmit = async (storeId, score) => {
    try {
      const response = await fetch(`${API_BASE_URL}/user/ratings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ storeId, rating: score }),
      });

      if (response.status === 401 || response.status === 403) {
        logout();
        showToast('Your session has expired. Please log in again.', 'error');
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit rating.');
      }

      showToast('Rating submitted successfully! Thanks for your feedback.', 'success');
      fetchStores(); // Refresh listings
    } catch (error) {
      showToast(error.message, 'error');
    }
  };

  const handleRatingModify = async (ratingId, score, storeId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/user/ratings/${ratingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ rating: score }),
      });

      if (response.status === 401 || response.status === 403) {
        logout();
        showToast('Your session has expired. Please log in again.', 'error');
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update rating.');
      }

      showToast('Rating updated successfully!', 'success');
      
      // Close editing mode
      setRatingEdits(prev => {
        const copy = { ...prev };
        delete copy[storeId];
        return copy;
      });

      fetchStores(); // Refresh listings
    } catch (error) {
      showToast(error.message, 'error');
    }
  };

  const handlePassChangeSubmit = async (e) => {
    e.preventDefault();

    // Validations
    const isPassLengthValid = newPassword.length >= 8 && newPassword.length <= 16;
    const isPassUppercaseValid = /[A-Z]/.test(newPassword);
    const isPassSpecialValid = /[^A-Za-z0-9]/.test(newPassword);

    if (!isPassLengthValid || !isPassUppercaseValid || !isPassSpecialValid) {
      showToast('Please satisfy all password validation conditions.', 'warning');
      return;
    }

    setChangingPass(true);
    const result = await changePassword(oldPassword, newPassword);
    setChangingPass(false);

    if (result.success) {
      showToast('Password updated successfully!', 'success');
      setOldPassword('');
      setNewPassword('');
      setActiveTab('stores');
    } else {
      showToast(result.message || 'Failed to update password.', 'error');
    }
  };

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(prev => (prev === 'ASC' ? 'DESC' : 'ASC'));
    } else {
      setSortBy(field);
      setSortOrder('ASC');
    }
  };

  // Rating submission widgets

  // Settings tab form validation items
  const isNewPassLength = newPassword.length >= 8 && newPassword.length <= 16;
  const isNewPassUpper = /[A-Z]/.test(newPassword);
  const isNewPassSpec = /[^A-Za-z0-9]/.test(newPassword);
  const isPassFormValid = isNewPassLength && isNewPassUpper && isNewPassSpec;

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-title-row">
        <div>
          <h1>Customer Portal</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Explore shops, rate your experiences, and customize settings</p>
        </div>
        <div className="tabs-container" style={{ margin: 0, border: 'none' }}>
          <button
            className={`btn ${activeTab === 'stores' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('stores')}
            style={{ padding: '0.6rem 1.2rem', fontSize: '0.9rem' }}
          >
            Explore Stores
          </button>
          <button
            className={`btn ${activeTab === 'settings' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('settings')}
            style={{ padding: '0.6rem 1.2rem', fontSize: '0.9rem' }}
          >
            <Settings size={16} />
            <span>Settings</span>
          </button>
        </div>
      </div>

      {activeTab === 'stores' ? (
        <>
          {/* Filters Row */}
          <div className="search-filter-bar" style={{ gap: '1.5rem' }}>
            <div className="search-input-wrapper">
              <Search size={18} className="search-icon-inside" />
              <input
                type="text"
                className="form-input"
                placeholder="Search shops by Store Name or Address..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <SlidersHorizontal size={14} /> Sort:
              </span>
              <button
                className={`btn btn-secondary ${sortBy === 'name' ? 'active' : ''}`}
                onClick={() => toggleSort('name')}
                style={{ padding: '0.45rem 0.9rem', fontSize: '0.85rem', borderColor: sortBy === 'name' ? 'var(--color-indigo)' : '' }}
              >
                Name {sortBy === 'name' && (sortOrder === 'ASC' ? '▲' : '▼')}
              </button>
              <button
                className={`btn btn-secondary ${sortBy === 'address' ? 'active' : ''}`}
                onClick={() => toggleSort('address')}
                style={{ padding: '0.45rem 0.9rem', fontSize: '0.85rem', borderColor: sortBy === 'address' ? 'var(--color-indigo)' : '' }}
              >
                Address {sortBy === 'address' && (sortOrder === 'ASC' ? '▲' : '▼')}
              </button>
              <button
                className={`btn btn-secondary ${sortBy === 'overallRating' ? 'active' : ''}`}
                onClick={() => toggleSort('overallRating')}
                style={{ padding: '0.45rem 0.9rem', fontSize: '0.85rem', borderColor: sortBy === 'overallRating' ? 'var(--color-indigo)' : '' }}
              >
                Rating {sortBy === 'overallRating' && (sortOrder === 'ASC' ? '▲' : '▼')}
              </button>
            </div>
          </div>

          {/* Cards Grid */}
          {loading ? (
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
              <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>No registered stores were found.</p>
            </div>
          ) : (
            <div className="stores-cards-grid">
              {stores.map((store) => {
                const isEditing = ratingEdits[store.id] !== undefined;

                return (
                  <div key={store.id} className="glass-panel store-card">
                    <div style={{ width: '100%', height: '140px', borderRadius: '8px', overflow: 'hidden', marginBottom: '1rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <img 
                        src={store.imageUrl ? (store.imageUrl.startsWith('/') ? `${API_BASE_URL.replace('/api', '')}${store.imageUrl}` : store.imageUrl) : `https://images.unsplash.com/photo-1534723452862-4c874018d66d?w=300&h=140&fit=crop&q=80&sig=${store.id}`} 
                        alt={store.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        loading="lazy"
                      />
                    </div>
                    <div className="store-card-header">
                      <h3 className="store-card-name">{store.name}</h3>
                      <div className="store-card-address">
                        <MapPin size={16} style={{ minWidth: '16px', color: 'var(--text-muted)' }} />
                        <span>{store.address}</span>
                      </div>
                    </div>

                    <div>
                      {/* Overall Store Rating Row */}
                      <div className="store-ratings-row">
                        <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Overall Rating</span>
                        <span className="rating-badge overall">
                          <Star size={14} fill="currentColor" />
                          {store.overallRating > 0 ? store.overallRating.toFixed(2) : '0.00'}
                        </span>
                      </div>

                      {/* User's Rating Row */}
                      <div className="store-ratings-row" style={{ borderBottom: 'none' }}>
                        <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Your Rating</span>
                        {store.hasSubmitted ? (
                          <span className="rating-badge" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--color-success)' }}>
                            <Star size={14} fill="currentColor" />
                            {store.userSubmittedRating} ★
                          </span>
                        ) : (
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                            Unrated
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="store-card-actions">
                      <button
                        className="btn btn-secondary"
                        onClick={() => { setSelectedStoreId(store.id); setIsStoreModalOpen(true); }}
                        style={{ width: '100%', padding: '0.45rem', fontSize: '0.85rem', marginBottom: '0.5rem' }}
                      >
                        View Store Reviews
                      </button>
                      {!store.hasSubmitted ? (
                        // Case 1: Option to Submit a Rating
                        <div>
                          <span className="form-label" style={{ fontSize: '0.8rem', marginBottom: '0.25rem' }}>Submit a Rating</span>
                          <InteractiveStars currentRating={0} onSelect={(score) => handleRatingSubmit(store.id, score)} />
                        </div>
                      ) : isEditing ? (
                        // Case 2b: Form to Edit Rating
                        <div>
                          <span className="form-label" style={{ fontSize: '0.8rem', marginBottom: '0.25rem' }}>Adjust Rating</span>
                          <InteractiveStars currentRating={ratingEdits[store.id]} onSelect={(score) => handleRatingModify(store.userRatingId, score, store.id)} />
                          <button 
                            className="btn btn-secondary" 
                            onClick={() => setRatingEdits(prev => {
                              const copy = { ...prev };
                              delete copy[store.id];
                              return copy;
                            })}
                            style={{ width: '100%', marginTop: '0.5rem', padding: '0.35rem', fontSize: '0.8rem' }}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        // Case 2a: Display Option to edit Rating
                        <button 
                          className="btn btn-secondary" 
                          onClick={() => setRatingEdits(prev => ({ ...prev, [store.id]: store.userSubmittedRating }))}
                          style={{ width: '100%', padding: '0.5rem', fontSize: '0.85rem' }}
                        >
                          Modify My Rating
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      ) : (
        /* Settings panel - Change password */
        <div className="glass-panel" style={{ maxWidth: '500px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1rem' }}>
            <Key size={22} className="text-indigo" style={{ color: 'var(--color-indigo)' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Update Password Credentials</h3>
          </div>

          <form onSubmit={handlePassChangeSubmit}>
            <div className="form-group">
              <label className="form-label">Current Password (optional validation verification)</label>
              <input
                type="password"
                className="form-input"
                placeholder="Enter current password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">New Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="Enter new password (8-16 characters)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <div className="validation-checklist">
                <span className={`validation-item ${isNewPassLength ? 'valid' : 'invalid'}`}>
                  {isNewPassLength ? '✓' : '○'} Length must be 8-16 characters ({newPassword.length}/16)
                </span>
                <span className={`validation-item ${isNewPassUpper ? 'valid' : 'invalid'}`}>
                  {isNewPassUpper ? '✓' : '○'} Must include at least one uppercase letter
                </span>
                <span className={`validation-item ${isNewPassSpec ? 'valid' : 'invalid'}`}>
                  {isNewPassSpec ? '✓' : '○'} Must include at least one special character
                </span>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '1.5rem' }}
              disabled={changingPass || !isPassFormValid}
            >
              {changingPass ? 'Updating...' : 'Change Password'}
            </button>
          </form>
        </div>
      )}

      {/* Store Details Modal Popup */}
      <StoreDetailsModal
        isOpen={isStoreModalOpen}
        storeId={selectedStoreId}
        onClose={() => { setIsStoreModalOpen(false); setSelectedStoreId(null); }}
      />
    </div>
  );
};

export default UserDashboard;
