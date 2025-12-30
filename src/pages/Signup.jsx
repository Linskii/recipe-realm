import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signUp, getErrorMessage } from '../services/authService.js';
import {
  validateEmail,
  validatePassword,
  validateUsername,
} from '../utils/validators.js';
import { useToast } from '../context/ToastContext.jsx';
import Input from '../components/ui/Input.jsx';
import Button from '../components/ui/Button.jsx';

export default function Signup() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    username: '',
    displayName: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

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

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    const usernameError = validateUsername(formData.username);
    if (usernameError) newErrors.username = usernameError;

    if (!formData.displayName || formData.displayName.trim().length < 2) {
      newErrors.displayName = 'Display name must be at least 2 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);
      await signUp(formData.email, formData.password, formData.username, formData.displayName);
      showToast('Account created successfully!', 'success');
      navigate('/dashboard');
    } catch (error) {
      console.error('Signup failed:', error);
      const message = getErrorMessage(error);
      setErrors({ general: message });
      showToast(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-lg shadow-sm p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">Sign Up</h1>

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
            label="Email"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            required
            autoComplete="email"
          />

          <Input
            id="username"
            name="username"
            type="text"
            label="Username"
            value={formData.username}
            onChange={handleChange}
            error={errors.username}
            required
            autoComplete="username"
            placeholder="lowercase, numbers, underscores"
          />

          <Input
            id="displayName"
            name="displayName"
            type="text"
            label="Display Name"
            value={formData.displayName}
            onChange={handleChange}
            error={errors.displayName}
            required
            placeholder="How your name will appear"
          />

          <Input
            id="password"
            name="password"
            type="password"
            label="Password"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            required
            autoComplete="new-password"
          />

          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            label="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword}
            required
            autoComplete="new-password"
          />

          <Button type="submit" loading={loading} className="w-full" size="lg">
            Sign Up
          </Button>
        </form>

        <p className="mt-6 text-center text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-green-600 hover:text-green-700 font-medium">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
