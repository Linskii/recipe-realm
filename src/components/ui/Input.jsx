import React from 'react';

export default function Input({
  label,
  error,
  id,
  type = 'text',
  required = false,
  className = '',
  ...props
}) {
  const inputClasses = `w-full h-10 px-3 text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
    error ? 'border-red-500' : 'border-gray-200'
  }`;

  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-900">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input id={id} type={type} className={inputClasses} {...props} />
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
