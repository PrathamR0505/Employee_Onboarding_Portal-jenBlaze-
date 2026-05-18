const validate = (schema) => {
  return (req, res, next) => {
    const errors = {};
    if (schema.body && req.body) {
      for (const [field, rules] of Object.entries(schema.body)) {
        const value = req.body[field];
        if (rules.required && (value === undefined || value === null || value === '')) {
          errors[field] = `${field} is required`;
          continue;
        }
        if (value !== undefined && value !== null && value !== '') {
          if (rules.type === 'string' && typeof value !== 'string') {
            errors[field] = `${field} must be a string`;
          }
          if (rules.type === 'number' && isNaN(Number(value))) {
            errors[field] = `${field} must be a number`;
          }
          if (rules.enum && !rules.enum.includes(value)) {
            errors[field] = `${field} must be one of: ${rules.enum.join(', ')}`;
          }
          if (rules.minLength && value.length < rules.minLength) {
            errors[field] = `${field} must be at least ${rules.minLength} characters`;
          }
          if (rules.maxLength && value.length > rules.maxLength) {
            errors[field] = `${field} must be at most ${rules.maxLength} characters`;
          }
          if (rules.pattern && !rules.pattern.test(value)) {
            errors[field] = `${field} format is invalid`;
          }
        }
      }
    }
    if (schema.params && req.params) {
      for (const [field, rules] of Object.entries(schema.params)) {
        const value = req.params[field];
        if (rules.required && !value) {
          errors[field] = `${field} is required`;
        }
      }
    }
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ error: 'Validation failed', details: errors });
    }
    next();
  };
};

module.exports = { validate };
