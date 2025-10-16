const { ValidationError } = require('../utils/errors');
const { itemSchemas, querySchemas } = require('../utils/validation');

/**
 * Validation middleware factory
 * Creates middleware to validate different parts of the request
 */
function createValidationMiddleware(schema, source = 'body') {
  return (req, res, next) => {
    let dataToValidate;
    
    switch (source) {
      case 'body':
        dataToValidate = req.body;
        break;
      case 'params':
        dataToValidate = req.params;
        break;
      case 'query':
        dataToValidate = req.query;
        break;
      default:
        return next(new Error('Invalid validation source'));
    }

    const { error, value } = schema.validate(dataToValidate, { abortEarly: false });
    
    if (error) {
      const validationDetails = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value
      }));
      
      return next(new ValidationError('Validation failed', validationDetails));
    }

    // Replace original data with validated and sanitized data
    switch (source) {
      case 'body':
        req.body = value;
        break;
      case 'params':
        req.params = value;
        break;
      case 'query':
        req.query = value;
        break;
    }

    next();
  };
}

// Pre-configured validation middleware
const validate = {
  // Item validation
  createItem: createValidationMiddleware(itemSchemas.create, 'body'),
  updateItem: createValidationMiddleware(itemSchemas.update, 'body'),
  itemId: createValidationMiddleware(itemSchemas.id, 'params'),
  
  // Query validation
  listItems: createValidationMiddleware(querySchemas.list, 'query')
};

module.exports = { validate, createValidationMiddleware };