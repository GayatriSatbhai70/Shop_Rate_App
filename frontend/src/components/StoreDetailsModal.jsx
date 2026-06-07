import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { X, Store, Mail, MapPin, Star, Calendar, User } from 'lucide-react';

const StoreDetailsModal = ({ isOpen, storeId, onClose }) => {
  const [storeData, setStoreData] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(false);

  const { API_BASE_URL, user } = useAuth();
  const { showToast } = useToast();

  const fetchStoreDetails = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/public/stores/${storeId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch store details.');
      }

      setStoreData(data.store);
      setRatings(data.ratings);
    } catch (error) {
      showToast(error.message, 'error');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && storeId) {
      fetchStoreDetails();
    }
  }, [isOpen, storeId]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '550px' }}>
        <div className="modal-header">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Store size={20} className="text-indigo" style={{ color: 'var(--color-indigo)' }} />
            <span>Store Performance Profile</span>
          </h3>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {loading || !storeData ? (
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
            <>
              <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <div style={{ width: '100%', height: '200px', borderRadius: '8px', overflow: 'hidden', marginBottom: '0.5rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <img 
                    src={storeData.imageUrl ? (storeData.imageUrl.startsWith('/') ? `${API_BASE_URL.replace('/api', '')}${storeData.imageUrl}` : storeData.imageUrl) : `https://images.unsplash.com/photo-1534723452862-4c874018d66d?w=500&h=200&fit=crop&q=80&sig=${storeData.id}`} 
                    alt={storeData.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    loading="lazy"
                  />
                </div>
                <div className="detail-item">
                  <span className="detail-label">Store Name</span>
                  <span className="detail-value" style={{ fontWeight: 700, fontSize: '1.2rem', color: 'var(--text-primary)' }}>
                    {storeData.name}
                  </span>
                </div>

                <div className="detail-item">
                  <span className="detail-label">Location Address</span>
                  <span className="detail-value" style={{ display: 'flex', alignItems: 'flex-start', gap: '0.35rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    <MapPin size={16} style={{ minWidth: '16px', marginTop: '0.15rem' }} />
                    {storeData.address}
                  </span>
                </div>

                <div className="detail-item">
                  <span className="detail-label">Public Email Contact</span>
                  <span className="detail-value" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    <Mail size={14} />
                    {storeData.email}
                  </span>
                </div>

                {/* Aggregate Rating Banner */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem 1rem',
                  background: 'rgba(99, 102, 241, 0.08)',
                  border: '1px solid rgba(99, 102, 241, 0.15)',
                  borderRadius: '10px',
                  marginTop: '0.25rem'
                }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                      Overall Reception Score
                    </span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      Based on {ratings.length} user reviews
                    </span>
                  </div>
                  <span className="rating-badge overall" style={{ fontSize: '1.1rem', padding: '0.35rem 0.75rem' }}>
                    <Star size={16} fill="currentColor" />
                    {storeData.averageRating > 0 ? storeData.averageRating.toFixed(2) : '0.00'}
                  </span>
                </div>

                {/* Owner Information (Admin-Only) */}
                {user && user.role === 'admin' && storeData.owner && (
                  <div style={{
                    marginTop: '0.5rem',
                    paddingTop: '0.85rem',
                    borderTop: '1px solid rgba(255,255,255,0.05)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.35rem'
                  }}>
                    <span className="detail-label" style={{ color: 'var(--color-violet)' }}>Owner Credentials (Admin Only)</span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                      <span className="detail-value" style={{ fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <User size={14} />
                        Name: {storeData.owner.name}
                      </span>
                      <span className="detail-value" style={{ fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Mail size={14} />
                        Email: {storeData.owner.email}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Customer Feedback logs */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Customer Feedback Log ({ratings.length})
                </h4>

                <div style={{
                  maxHeight: '220px',
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                  paddingRight: '0.25rem'
                }}>
                  {ratings.length === 0 ? (
                    <div style={{
                      textAlign: 'center',
                      padding: '2.5rem',
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px dashed var(--border-color)',
                      borderRadius: '12px',
                      color: 'var(--text-muted)',
                      fontStyle: 'italic'
                    }}>
                      No customers have reviewed this store yet.
                    </div>
                  ) : (
                    ratings.map((rating) => (
                      <div key={rating.id} className="glass-panel" style={{
                        padding: '1rem',
                        borderRadius: '12px',
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px solid rgba(255,255,255,0.04)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.5rem'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                            {rating.reviewerName}
                            {user && user.role === 'admin' && rating.reviewerEmail && (
                              <span style={{ fontWeight: 400, fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '0.35rem' }}>
                                ({rating.reviewerEmail})
                              </span>
                            )}
                          </span>

                          <span className="rating-badge" style={{ padding: '0.15rem 0.45rem', fontSize: '0.8rem' }}>
                            <Star size={12} fill="currentColor" />
                            {rating.rating} ★
                          </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          <Calendar size={12} />
                          <span>Submitted on {new Date(rating.createdAt).toLocaleDateString()} at {new Date(rating.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Close Window
          </button>
        </div>
      </div>
    </div>
  );
};

export default StoreDetailsModal;
