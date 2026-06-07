import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { User, Lock, Mail, MapPin } from 'lucide-react';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { register, user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'owner') navigate('/owner');
      else navigate('/user');
    }
  }, [user, navigate]);


  const isNameLengthValid = name.trim().length >= 20 && name.trim().length <= 60;
  const isAddressLengthValid = address.trim().length <= 400 && address.trim().length > 0;
  
  const isPassLengthValid = password.length >= 8 && password.length <= 16;
  const isPassUppercaseValid = /[A-Z]/.test(password);
  const isPassSpecialValid = /[^A-Za-z0-9]/.test(password);

  const isFormValid = 
    isNameLengthValid && 
    isAddressLengthValid && 
    isPassLengthValid && 
    isPassUppercaseValid && 
    isPassSpecialValid && 
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isFormValid) {
      showToast('Please satisfy all validation requirements.', 'warning');
      return;
    }

    setSubmitting(true);
    const result = await register(name, email, password, address);
    setSubmitting(false);

    if (result.success) {
      showToast(`Welcome, ${result.user.name}! Your account has been created.`, 'success');
      navigate('/user');
    } else {
      showToast(result.message || 'Registration failed.', 'error');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card glass-panel" style={{ maxWidth: '550px' }}>
        <div className="auth-header">
          <h2>Create Account</h2>
          <p>Join ShopRate to submit and edit ratings for your favorite stores</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name ({name.trim().length}/60 chars)</label>
            <div className="search-input-wrapper">
              <User size={18} className="search-icon-inside" />
              <input
                type="text"
                className="form-input"
                placeholder="Enter your name (Min 20 characters)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="validation-checklist">
              <span className={`validation-item ${isNameLengthValid ? 'valid' : 'invalid'}`}>
                {isNameLengthValid ? '✓' : '○'} Must be between 20 and 60 characters
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
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Address ({address.trim().length}/400 chars)</label>
            <div className="search-input-wrapper">
              <MapPin size={18} className="search-icon-inside" />
              <textarea
                className="form-input"
                rows="2.5"
                placeholder="Enter your residential address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                style={{ resize: 'none', paddingLeft: '2.75rem' }}
                required
              />
            </div>
            <div className="validation-checklist">
              <span className={`validation-item ${address.trim().length > 0 && isAddressLengthValid ? 'valid' : 'invalid'}`}>
                {address.trim().length > 0 && isAddressLengthValid ? '✓' : '○'} Address is required (Max 400 characters)
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
                placeholder="Create password"
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

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '1rem' }}
            disabled={submitting || !isFormValid}
          >
            {submitting ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <div className="auth-footer">
          <span>Already registered? </span>
          <Link to="/login" style={{ fontWeight: 600 }}>Login here</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
