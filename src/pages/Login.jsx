import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login, getErrorMessage } from '../services/authService.js';
import { validateEmail, validatePassword } from '../utils/validators.js';
import { useToast } from '../context/ToastContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useTranslation } from '../hooks/useTranslation.js';
import Input from '../components/ui/Input.jsx';
import Button from '../components/ui/Button.jsx';

export default function Login() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { user } = useAuth();
  const { t, translateError } = useTranslation();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Redirect to dashboard if user is already logged in
  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const validateForm = () => {
    const newErrors = {};

    const emailError = validateEmail(formData.email);
    if (emailError) newErrors.email = emailError;

    const passwordError = validatePassword(formData.password);
    if (passwordError) newErrors.password = passwordError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);
      await login(formData.email, formData.password);
      showToast(t('success.welcomeBack'), 'success');
      // Navigation will happen automatically via useEffect when auth state updates
    } catch (error) {
      console.error('Login failed:', error);
      const messageKey = getErrorMessage(error);
      const message = t(messageKey);
      setErrors({ general: message });
      showToast(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-sm p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">{t('auth.login')}</h1>

        {errors.general && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            id="email"
            name="email"
            type="email"
            label={t('auth.email')}
            value={formData.email}
            onChange={handleChange}
            error={translateError(errors.email)}
            required
            autoComplete="email"
          />

          <Input
            id="password"
            name="password"
            type="password"
            label={t('auth.password')}
            value={formData.password}
            onChange={handleChange}
            error={translateError(errors.password)}
            required
            autoComplete="current-password"
          />

          <Button type="submit" loading={loading} className="w-full" size="lg">
            {t('auth.login')}
          </Button>
        </form>

        <p className="mt-6 text-center text-gray-600">
          {t('auth.dontHaveAccount')}{' '}
          <Link to="/signup" className="text-green-600 hover:text-green-700 font-medium">
            {t('auth.signup')}
          </Link>
        </p>
      </div>
    </div>
  );
}
