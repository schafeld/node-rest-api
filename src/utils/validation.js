const Joi = require('joi');

// Valid categories for items
const VALID_CATEGORIES = [
  'Fruit',
  'Vegetable', 
  'Dairy',
  'Bakery',
  'Beverage',
  'Snack',
  'Other'
];

// Item validation schemas
const itemSchemas = {
  // Schema for creating new items
  create: Joi.object({
    name: Joi.string()
      .trim()
      .min(1)
      .max(100)
      .required()
      .messages({
        'string.empty': 'Item name cannot be empty',
        'string.min': 'Item name must be at least 1 character long',
        'string.max': 'Item name cannot exceed 100 characters',
        'any.required': 'Item name is required'
      }),
    
    category: Joi.string()
      .valid(...VALID_CATEGORIES)
      .required()
      .messages({
        'any.only': `Category must be one of: ${VALID_CATEGORIES.join(', ')}`,
        'any.required': 'Category is required'
      }),
    
    price: Joi.number()
      .positive()
      .precision(2)
      .max(10000)
      .required()
      .messages({
        'number.positive': 'Price must be a positive number',
        'number.precision': 'Price cannot have more than 2 decimal places',
        'number.max': 'Price cannot exceed $10,000',
        'any.required': 'Price is required'
      }),
    
    quantity: Joi.number()
      .integer()
      .min(0)
      .max(100000)
      .default(0)
      .messages({
        'number.integer': 'Quantity must be a whole number',
        'number.min': 'Quantity cannot be negative',
        'number.max': 'Quantity cannot exceed 100,000'
      }),
    
    inStock: Joi.boolean()
      .default(true)
      .messages({
        'boolean.base': 'In stock status must be true or false'
      })
  }).options({ stripUnknown: true }),

  // Schema for updating existing items (all fields optional)
  update: Joi.object({
    name: Joi.string()
      .trim()
      .min(1)
      .max(100)
      .messages({
        'string.empty': 'Item name cannot be empty',
        'string.min': 'Item name must be at least 1 character long',
        'string.max': 'Item name cannot exceed 100 characters'
      }),
    
    category: Joi.string()
      .valid(...VALID_CATEGORIES)
      .messages({
        'any.only': `Category must be one of: ${VALID_CATEGORIES.join(', ')}`
      }),
    
    price: Joi.number()
      .positive()
      .precision(2)
      .max(10000)
      .messages({
        'number.positive': 'Price must be a positive number',
        'number.precision': 'Price cannot have more than 2 decimal places',
        'number.max': 'Price cannot exceed $10,000'
      }),
    
    quantity: Joi.number()
      .integer()
      .min(0)
      .max(100000)
      .messages({
        'number.integer': 'Quantity must be a whole number',
        'number.min': 'Quantity cannot be negative',
        'number.max': 'Quantity cannot exceed 100,000'
      }),
    
    inStock: Joi.boolean()
      .messages({
        'boolean.base': 'In stock status must be true or false'
      })
  }).min(1).options({ stripUnknown: true })
  .messages({
    'object.min': 'At least one field must be provided for update'
  }),

  // Schema for ID parameters (from route params - comes as string)
  id: Joi.object({
    id: Joi.alternatives()
      .try(
        Joi.number().integer().positive(),
        Joi.string().pattern(/^\d+$/).custom((value, helpers) => {
          const num = parseInt(value, 10);
          if (num <= 0) {
            return helpers.error('any.invalid');
          }
          return num;
        })
      )
      .required()
      .messages({
        'number.integer': 'ID must be a whole number',
        'number.positive': 'ID must be a positive number',
        'string.pattern.base': 'ID must be a valid number',
        'any.invalid': 'ID must be a positive number',
        'any.required': 'ID is required'
      })
  })
};

// Query parameter schemas
const querySchemas = {
  // Pagination and filtering
  list: Joi.object({
    page: Joi.number()
      .integer()
      .min(1)
      .default(1)
      .messages({
        'number.integer': 'Page must be a whole number',
        'number.min': 'Page must be at least 1'
      }),
    
    limit: Joi.number()
      .integer()
      .min(1)
      .max(100)
      .default(10)
      .messages({
        'number.integer': 'Limit must be a whole number',
        'number.min': 'Limit must be at least 1',
        'number.max': 'Limit cannot exceed 100'
      }),
    
    category: Joi.string()
      .valid(...VALID_CATEGORIES)
      .messages({
        'any.only': `Category filter must be one of: ${VALID_CATEGORIES.join(', ')}`
      }),
    
    inStock: Joi.boolean()
      .messages({
        'boolean.base': 'In stock filter must be true or false'
      }),
    
    search: Joi.string()
      .min(1)
      .max(50)
      .messages({
        'string.min': 'Search term must be at least 1 character',
        'string.max': 'Search term cannot exceed 50 characters'
      }),
    
    sortBy: Joi.string()
      .valid('name', 'category', 'price', 'quantity', 'id')
      .default('id')
      .messages({
        'any.only': 'Sort field must be one of: name, category, price, quantity, id'
      }),
    
    sortOrder: Joi.string()
      .valid('asc', 'desc')
      .default('asc')
      .messages({
        'any.only': 'Sort order must be either asc or desc'
      })
  }).options({ stripUnknown: true })
};

// Validation helper functions
const validateItemData = (data) => {
  if (data === undefined || data === null) {
    return {
      error: {
        details: [{ message: 'Data is required' }]
      }
    };
  }
  return itemSchemas.create.validate(data, { abortEarly: false });
};

const validateItemId = (id) => {
  return itemSchemas.id.validate({ id }, { abortEarly: false });
};

const validateItemUpdate = (data) => {
  return itemSchemas.update.validate(data, { abortEarly: false });
};

const validateQuery = (query) => {
  return querySchemas.list.validate(query, { abortEarly: false });
};

module.exports = {
  itemSchemas,
  querySchemas,
  VALID_CATEGORIES,
  validateItemData,
  validateItemId,
  validateItemUpdate,
  validateQuery
};