import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { TbBrain } from 'react-icons/tb';
import { HiOutlineEye, HiOutlineEyeSlash } from 'react-icons/hi2';
import toast from 'react-hot-toast';
import './Auth.css';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setIsLoading(true);
    const result = await register(name, email, password);
    setIsLoading(false);
    if (result.success) {
      toast.success('Account created! 🧠');
      navigate('/');
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg">
        <div className="auth-bg__orb auth-bg__orb--1" />
        <div className="auth-bg__orb auth-bg__orb--2" />
        <div className="auth-bg__orb auth-bg__orb--3" />
      </div>
      <motion.div className="auth-card glass-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="auth-card__header">
          <div className="auth-card__logo"><TbBrain /></div>
          <h1 className="auth-card__title">Create account</h1>
          <p className="auth-card__subtitle">Start building your AI Second Brain</p>
        </div>
        <form onSubmit={handleSubmit} className="auth-card__form">
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input type="text" className="input" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input type="email" className="input" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-password">
              <input type={showPassword ? 'text' : 'password'} className="input" placeholder="Min 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} required />
              <button type="button" className="input-password__toggle" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <HiOutlineEyeSlash /> : <HiOutlineEye />}
              </button>
            </div>
          </div>
          <button type="submit" className="btn-primary auth-card__submit" disabled={isLoading}>
            {isLoading ? <span className="spinner" /> : 'Create Account'}
          </button>
        </form>
        <p className="auth-card__footer">Already have an account? <Link to="/login">Sign In</Link></p>
      </motion.div>
    </div>
  );
};

export default Register;
