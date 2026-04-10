import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';

/**
 * useForm Hook - Advanced form state management
 * Handles form state, validation, and submission
 */
export const useForm = ({
  initialValues = {},
  validate,
  onSubmit,
}) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === 'checkbox' ? checked : value;

    setValues((prev) => ({
      ...prev,
      [name]: fieldValue,
    }));

    // Validate on change if field was touched
    if (touched[name] && validate) {
      const fieldError = validate({ ...values, [name]: fieldValue }, name);
      setErrors((prev) => ({
        ...prev,
        [name]: fieldError,
      }));
    }
  }, [touched, validate, values]);

  const handleBlur = useCallback((e) => {
    const { name } = e.target;
    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));

    // Validate on blur
    if (validate) {
      const fieldError = validate(values, name);
      setErrors((prev) => ({
        ...prev,
        [name]: fieldError,
      }));
    }
  }, [validate, values]);

  const handleSubmit = useCallback((e) => {
    if (e) {
      e.preventDefault();
    }

    // Validate all fields
    const newErrors = {};
    if (validate) {
      Object.keys(values).forEach((key) => {
        const error = validate(values, key);
        if (error) {
          newErrors[key] = error;
        }
      });
    }

    setErrors(newErrors);

    // If no errors, submit
    if (Object.keys(newErrors).length === 0) {
      setIsSubmitting(true);
      onSubmit?.(values)
        .catch((err) => {
          console.error('Form submission error:', err);
        })
        .finally(() => {
          setIsSubmitting(false);
        });
    }
  }, [values, validate, onSubmit]);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  const setFieldValue = useCallback((name, value) => {
    setValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  const setFieldError = useCallback((name, error) => {
    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  }, []);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
    setFieldValue,
    setFieldError,
  };
};

/**
 * Form Component - Advanced form wrapper
 */
const Form = React.forwardRef(({
  onSubmit,
  children,
  className = '',
  ...props
}, ref) => {
  
  return (
    <form
      ref={ref}
      onSubmit={onSubmit}
      className={`space-y-5 ${className}`}
      {...props}
    >
      {children}
    </form>
  );
});

Form.propTypes = {
  onSubmit: PropTypes.func,
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

Form.displayName = 'Form';

/**
 * FormGroup Component - Wrapper for form fields
 */
const FormGroup = React.forwardRef(({
  children,
  className = '',
  ...props
}, ref) => {
  
  return (
    <div ref={ref} className={`space-y-2 ${className}`} {...props}>
      {children}
    </div>
  );
});

FormGroup.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

FormGroup.displayName = 'FormGroup';

/**
 * FormField Component - Integrated field with validation
 */
const FormField = React.forwardRef(({
  name,
  label,
  type = 'text',
  error,
  value,
  onChange,
  onBlur,
  placeholder,
  disabled = false,
  required = false,
  hint,
  className = '',
  children,
  ...props
}, ref) => {
  
  const isCheckbox = type === 'checkbox';

  return (
    <div className={className}>
      {label && (
        <label className="flex items-center gap-2 text-sm font-medium text-white mb-2">
          {label}
          {required && <span className="text-red-400">*</span>}
        </label>
      )}

      {isCheckbox ? (
        <div className="flex items-center gap-2">
          <input
            ref={ref}
            type="checkbox"
            name={name}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            disabled={disabled}
            className="w-4 h-4 rounded border-slate-600 text-violet-500 focus:ring-2 focus:ring-violet-500"
            {...props}
          />
          {label && <label className="text-sm text-slate-300">{label}</label>}
        </div>
      ) : children ? (
        children
      ) : (
        <input
          ref={ref}
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full px-4 py-2.5 rounded-lg border-2 border-slate-600 bg-slate-900/50 text-white placeholder:text-slate-500 transition-all focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500 focus:ring-offset-1 focus:ring-offset-slate-950 ${
            error ? 'border-red-500' : ''
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          {...props}
        />
      )}

      {error && (
        <p className="text-sm text-red-400 mt-1">{error}</p>
      )}

      {hint && !error && (
        <p className="text-xs text-slate-500 mt-1">{hint}</p>
      )}
    </div>
  );
});

FormField.propTypes = {
  name: PropTypes.string,
  label: PropTypes.string,
  type: PropTypes.string,
  error: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.bool]),
  onChange: PropTypes.func,
  onBlur: PropTypes.func,
  placeholder: PropTypes.string,
  disabled: PropTypes.bool,
  required: PropTypes.bool,
  hint: PropTypes.string,
  className: PropTypes.string,
  children: PropTypes.node,
};

FormField.displayName = 'FormField';

export { Form, FormGroup, FormField };
export default useForm;
