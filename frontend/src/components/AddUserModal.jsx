import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { X, User, Mail, Lock, MapPin } from 'lucide-react';

const AddUserModal = ({ isOpen, onClose, onRefresh }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [address, setAddress] = useState('');
  const [role, setRole] = useState('user');
  const [submitting, setSubmitting] = useState(false);

  const { token, API_BASE_URL } = useAuth();
  const { showToast } = useToast();

  if (!isOpen) return null;

  const isNameValid = name.trim().length >= 20 && name.trim().length <= 60;
  const isAddressValid = address.trim().length <= 400 && address.trim().length > 0;
  const isPassLengthValid = password.length >= 8 && password.length <= 16;
  const isPassUppercaseValid = /[A-Z]/.test(password);
  const isPassSpecialValid = /[^A-Za-z0-9]/.test(password);

  const isFormValid =
    isNameValid &&
    isAddressValid &&
    isPassLengthValid &&
    isPassUppercaseValid &&
    isPassSpecialValid &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isFormValid) {
      showToast('Please satisfy all validation checks.', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/admin/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ name, email, password, address, role }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.errors && data.errors.length > 0) {
          throw new Error(data.errors.map(err => err.message).join(' | '));
        }
        throw new Error(data.message || 'Failed to create user.');
      }

      showToast(`User "${name}" created successfully!`, 'success');
      onRefresh();
      handleClose();
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setName('');
    setEmail('');
    setPassword('');
    setAddress('');
    setRole('user');
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Create New User Account</h3>
          <button className="modal-close-btn" onClick={handleClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Full Name ({name.trim().length}/60 chars)</label>
              <div className="search-input-wrapper">
                <User size={18} className="search-icon-inside" />
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter name (Min 20 characters)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="validation-checklist">
                <span className={`validation-item ${isNameValid ? 'valid' : 'invalid'}`}>
                  {isNameValid ? '✓' : '○'} Name must be 20 to 60 characters
                </span>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div className="search-input-wrapper">
                <Mail size={18} className="search-icon-inside" />
                <input
                  type="email"
                  className="form-input"
                  placeholder="user@shoprate.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Role</label>
              <div className="search-input-wrapper" style={{ display: 'flex', gap: '1rem', marginTop: '0.25rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="modal-role"
                    value="user"
                    checked={role === 'user'}
                    onChange={() => setRole('user')}
                  />
                  <span>Normal User</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="modal-role"
                    value="admin"
                    checked={role === 'admin'}
                    onChange={() => setRole('admin')}
                  />
                  <span>System Admin</span>
                </label>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Address ({address.trim().length}/400 chars)</label>
              <div className="search-input-wrapper">
                <MapPin size={18} className="search-icon-inside" />
                <textarea
                  className="form-input"
                  rows="2"
                  placeholder="Enter residential address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  style={{ resize: 'none', paddingLeft: '2.75rem' }}
                  required
                />
              </div>
              <div className="validation-checklist">
                <span className={`validation-item ${address.trim().length > 0 && isAddressValid ? 'valid' : 'invalid'}`}>
                  {address.trim().length > 0 && isAddressValid ? '✓' : '○'} Address is required (Max 400 characters)
                </span>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="search-input-wrapper">
                <Lock size={18} className="search-icon-inside" />
                <input
                  type="password"
                  className="form-input"
                  placeholder="Set temporary password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="validation-checklist">
                <span className={`validation-item ${isPassLengthValid ? 'valid' : 'invalid'}`}>
                  {isPassLengthValid ? '✓' : '○'} Length must be 8-16 characters ({password.length}/16)
                </span>
                <span className={`validation-item ${isPassUppercaseValid ? 'valid' : 'invalid'}`}>
                  {isPassUppercaseValid ? '✓' : '○'} Must include at least one uppercase letter
                </span>
                <span className={`validation-item ${isPassSpecialValid ? 'valid' : 'invalid'}`}>
                  {isPassSpecialValid ? '✓' : '○'} Must include at least one special character
                </span>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={handleClose} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting || !isFormValid}>
              {submitting ? 'Saving...' : 'Create Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUserModal;
