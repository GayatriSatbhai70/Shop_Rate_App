import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Star, Users, MapPin, Key, Settings, Calendar, Mail } from 'lucide-react';

const OwnerDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const [storeData, setStoreData] = useState(null);
  const [reviewers, setReviewers] = useState([]);
  const [loading, setLoading] = useState(false);

  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('DESC');

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [changingPass, setChangingPass] = useState(false);

  const { token, changePassword, API_BASE_URL, logout } = useAuth();
  const { showToast } = useToast();

  const fetchOwnerDashboard = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        sortBy,
        sortOrder,
      });

      const response = await fetch(`${API_BASE_URL}/owner/dashboard?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.status === 401 || response.status === 403) {
        logout();
        showToast('Your session has expired. Please log in again.', 'error');
        return;
      }
      const data = await response.json();
      if (response.ok) {
        setStoreData(data.store);
        setReviewers(data.reviewers);
      } else {
        showToast(data.message || 'Failed to load dashboard data.', 'error');
      }
    } catch {
      showToast('Failed to connect to the server.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'dashboard') {
      fetchOwnerDashboard();
    }
  }, [activeTab, sortBy, sortOrder]);

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
      setActiveTab('dashboard');
    } else {
      showToast(result.message || 'Failed to update password.', 'error');
    }
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(prev => (prev === 'ASC' ? 'DESC' : 'ASC'));
    } else {
      setSortBy(field);
      setSortOrder('ASC');
    }
  };

  const isNewPassLength = newPassword.length >= 8 && newPassword.length <= 16;
  const isNewPassUpper = /[A-Z]/.test(newPassword);
  const isNewPassSpec = /[^A-Za-z0-9]/.test(newPassword);
  const isPassFormValid = isNewPassLength && isNewPassUpper && isNewPassSpec;

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-title-row">
        <div>
          <h1>Store Manager Portal</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Monitor store ratings, view user feedback, and manage options</p>
        </div>
        <div className="tabs-container" style={{ margin: 0, border: 'none' }}>
          <button
            className={`btn ${activeTab === 'dashboard' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('dashboard')}
            style={{ padding: '0.6rem 1.2rem', fontSize: '0.9rem' }}
          >
            Dashboard
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

      {activeTab === 'dashboard' ? (
        loading && !storeData ? (
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
        ) : !storeData ? (
          <div className="glass-panel" style={{ textAlign: 'center', padding: '4rem 1rem' }}>
            <p style={{ color: 'var(--text-secondary)' }}>Failed to load your store profile. Please check with an admin.</p>
          </div>
        ) : (
          <div className="owner-dashboard-grid">
            {/* Left Column: Store Details & Rating Dial */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="glass-panel rating-radial-display">
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                  Store Score
                </h3>
                <div className="rating-radial-circle">
                  {storeData.averageRating > 0 ? storeData.averageRating.toFixed(2) : '0.0'}
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.2rem', color: 'var(--color-warning)' }}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      size={18}
                      fill={Math.round(storeData.averageRating) >= s ? 'currentColor' : 'none'}
                      style={{ opacity: Math.round(storeData.averageRating) >= s ? 1 : 0.2 }}
                    />
                  ))}
                </div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                  Average based on {reviewers.length} {reviewers.length === 1 ? 'rating' : 'ratings'}
                </span>
              </div>

              <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem' }}>
                  Store Profile
                </h3>
                
                <div className="detail-item">
                  <span className="detail-label">Name</span>
                  <span className="detail-value" style={{ fontWeight: 600 }}>{storeData.name}</span>
                </div>

                <div className="detail-item">
                  <span className="detail-label">Email</span>
                  <span className="detail-value">{storeData.email}</span>
                </div>

                <div className="detail-item">
                  <span className="detail-label">Physical Address</span>
                  <span className="detail-value" style={{ display: 'flex', alignItems: 'flex-start', gap: '0.25rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    <MapPin size={16} style={{ minWidth: '16px', marginTop: '0.15rem' }} />
                    {storeData.address}
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column: Reviewers List */}
            <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', minHeight: '400px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1rem' }}>
                <Users size={20} className="text-indigo" style={{ color: 'var(--color-indigo)' }} />
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Reviewer Feedback Log</h3>
              </div>

              {loading ? (
                <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    border: '3px solid rgba(255, 255, 255, 0.05)',
                    borderTopColor: 'var(--color-indigo)',
                    animation: 'spin 1s linear infinite'
                  }} />
                </div>
              ) : reviewers.length === 0 ? (
                <div style={{ display: 'flex', flex: 1, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', padding: '2rem' }}>
                  <Star size={40} style={{ opacity: 0.15, marginBottom: '1rem' }} />
                  <p style={{ fontStyle: 'italic' }}>No customer reviews have been submitted for your store yet.</p>
                </div>
              ) : (
                <div className="table-responsive" style={{ border: 'none', margin: 0 }}>
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th onClick={() => handleSort('name')}>
                          Customer Name {sortBy === 'name' && <span className="sort-indicator">{sortOrder === 'ASC' ? '▲' : '▼'}</span>}
                        </th>
                        <th onClick={() => handleSort('email')}>
                          Email Address {sortBy === 'email' && <span className="sort-indicator">{sortOrder === 'ASC' ? '▲' : '▼'}</span>}
                        </th>
                        <th onClick={() => handleSort('rating')} style={{ width: '120px' }}>
                          Rating {sortBy === 'rating' && <span className="sort-indicator">{sortOrder === 'ASC' ? '▲' : '▼'}</span>}
                        </th>
                        <th onClick={() => handleSort('createdAt')} style={{ width: '180px' }}>
                          Submission Date {sortBy === 'createdAt' && <span className="sort-indicator">{sortOrder === 'ASC' ? '▲' : '▼'}</span>}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {reviewers.map((rev) => (
                        <tr key={rev.id}>
                          <td style={{ fontWeight: 600 }}>{rev.user ? rev.user.name : 'Unknown User'}</td>
                          <td>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                              <Mail size={14} />
                              {rev.user ? rev.user.email : 'N/A'}
                            </span>
                          </td>
                          <td>
                            <span className="rating-badge">
                              <Star size={12} fill="currentColor" />
                              {rev.rating} ★
                            </span>
                          </td>
                          <td>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                              <Calendar size={14} />
                              {new Date(rev.createdAt).toLocaleDateString()}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )
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
    </div>
  );
};

export default OwnerDashboard;
