import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { X, User, Mail, MapPin, Shield, Star, Store, Calendar } from 'lucide-react';

const UserDetailsModal = ({ isOpen, userId, onClose }) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);

  const { token, API_BASE_URL, logout } = useAuth();
  const { showToast } = useToast();

  const fetchUserDetails = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.status === 401 || response.status === 403) {
        logout();
        showToast('Your session has expired. Please log in again.', 'error');
        onClose();
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch user details.');
      }

      setUserData(data);
    } catch (error) {
      showToast(error.message, 'error');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && userId) {
      fetchUserDetails();
    }
  }, [isOpen, userId]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '500px' }}>
        <div className="modal-header">
          <h3>User Profile Details</h3>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {loading || !userData ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
              <div style={{
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                border: '3px solid rgba(255, 255, 255, 0.05)',
                borderTopColor: 'var(--color-indigo)',
                animation: 'spin 1s linear infinite'
              }} />
            </div>
          ) : (
            <div className="detail-grid">
              <div className="detail-item">
                <span className="detail-label">Full Name</span>
                <span className="detail-value" style={{ fontWeight: 600, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <User size={18} className="text-indigo" style={{ color: 'var(--color-indigo)' }} />
                  {userData.name}
                </span>
              </div>

              <div className="detail-item">
                <span className="detail-label">Email Address</span>
                <span className="detail-value" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Mail size={16} className="text-secondary" style={{ color: 'var(--text-secondary)' }} />
                  {userData.email}
                </span>
              </div>

              <div className="detail-item">
                <span className="detail-label">Role System Tag</span>
                <span className="detail-value" style={{ display: 'flex' }}>
                  <span className={`role-tag ${userData.role}`} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Shield size={12} />
                    {userData.role}
                  </span>
                </span>
              </div>

              <div className="detail-item">
                <span className="detail-label">Residential Address</span>
                <span className="detail-value" style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', lineHeight: '1.4' }}>
                  <MapPin size={16} className="text-secondary" style={{ color: 'var(--text-secondary)', marginTop: '0.15rem' }} />
                  {userData.address}
                </span>
              </div>

              {userData.role === 'owner' && (
                <div style={{
                  marginTop: '1rem',
                  paddingTop: '1.25rem',
                  borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem'
                }}>
                  <div className="detail-item">
                    <span className="detail-label">Owned Store</span>
                    <span className="detail-value" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                      <Store size={16} style={{ color: 'var(--color-success)' }} />
                      {userData.storeName || 'N/A'}
                    </span>
                  </div>

                  <div className="detail-item">
                    <span className="detail-label">Average Store Rating</span>
                    <span className="detail-value" style={{ display: 'flex', alignItems: 'center' }}>
                      <span className="rating-badge" style={{ fontSize: '0.95rem', padding: '0.3rem 0.6rem' }}>
                        <Star size={16} fill="currentColor" />
                        {userData.rating !== undefined ? userData.rating.toFixed(2) : '0.00'} / 5.00
                      </span>
                    </span>
                  </div>
                </div>
              )}

              <div className="detail-item" style={{ marginTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.03)', paddingTop: '0.75rem' }}>
                <span className="detail-label">Registration Date</span>
                <span className="detail-value" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  <Calendar size={14} />
                  {new Date(userData.createdAt).toLocaleString()}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserDetailsModal;
