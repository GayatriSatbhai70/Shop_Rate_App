import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { X, Store, Mail, Lock, MapPin } from 'lucide-react';

const AddStoreModal = ({ isOpen, onClose, onRefresh }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [address, setAddress] = useState('');
  const [imageFile, setImageFile] = useState(null);
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
      const formData = new FormData();
      formData.append('name', name);
      formData.append('email', email);
      formData.append('password', password);
      formData.append('address', address);
      if (imageFile) {
        formData.append('image', imageFile);
      }

      const response = await fetch(`${API_BASE_URL}/admin/stores`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.errors && data.errors.length > 0) {
          throw new Error(data.errors.map(err => err.message).join(' | '));
        }
        throw new Error(data.message || 'Failed to create store.');
      }

      showToast(`Store "${name}" and owner login registered successfully!`, 'success');
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
    setImageFile(null);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Register New Store & Owner</h3>
          <button className="modal-close-btn" onClick={handleClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Store Name ({name.trim().length}/60 chars)</label>
              <div className="search-input-wrapper">
                <Store size={18} className="search-icon-inside" />
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter store name (Min 20 characters)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="validation-checklist">
                <span className={`validation-item ${isNameValid ? 'valid' : 'invalid'}`}>
                  {isNameValid ? '✓' : '○'} Store name must be 20 to 60 characters
                </span>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Store / Owner Email</label>
              <div className="search-input-wrapper">
                <Mail size={18} className="search-icon-inside" />
                <input
                  type="email"
                  className="form-input"
                  placeholder="store@shoprate.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Store Address ({address.trim().length}/400 chars)</label>
              <div className="search-input-wrapper">
                <MapPin size={18} className="search-icon-inside" />
                <textarea
                  className="form-input"
                  rows="2"
                  placeholder="Enter store physical address"
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
              <label className="form-label">Store Image File (Optional)</label>
              <div className="search-input-wrapper">
                <Store size={18} className="search-icon-inside" />
                <input
                  type="file"
                  accept="image/*"
                  className="form-input"
                  onChange={(e) => setImageFile(e.target.files[0])}
                  style={{ padding: '0.45rem 0.5rem 0.45rem 2.5rem' }}
                />
              </div>
            </div>

            <div className="form-group" style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.25rem' }}>
              <label className="form-label">Store Owner Password (for Owner login)</label>
              <div className="search-input-wrapper">
                <Lock size={18} className="search-icon-inside" />
                <input
                  type="password"
                  className="form-input"
                  placeholder="Create owner password"
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
              {submitting ? 'Registering...' : 'Register Store'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddStoreModal;
