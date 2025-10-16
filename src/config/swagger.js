const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Items Store Manager API',
      version: '1.0.0',
      description: `
        A production-ready REST API for managing an items inventory.
        
        ## Features
        - Full CRUD operations for items
        - Pagination and filtering
        - Input validation with detailed error messages
        - Rate limiting and security middleware
        - Environment-aware persistence (JSON files locally, in-memory on Netlify)
        - Comprehensive logging and error handling
        
        ## Authentication
        This is a demo API and does not require authentication.
        
        ## Rate Limiting
        The API is rate-limited to 100 requests per 15 minutes per IP address.
      `,
      contact: {
        name: 'API Support',
        email: 'support@example.com'
      },
      license: {
        name: 'ISC',
        url: 'https://opensource.org/licenses/ISC'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000/api/v1',
        description: 'Development server'
      },
      {
        url: 'https://your-app.netlify.app/api/v1',
        description: 'Production server (Netlify)'
      }
    ],
    components: {
      schemas: {
        Item: {
          type: 'object',
          required: ['name', 'category', 'price'],
          properties: {
            id: {
              type: 'integer',
              description: 'Unique identifier for the item',
              example: 1
            },
            name: {
              type: 'string',
              minLength: 1,
              maxLength: 100,
              description: 'Name of the item',
              example: 'Red Apple'
            },
            category: {
              type: 'string',
              enum: ['Fruit', 'Vegetable', 'Dairy', 'Bakery', 'Beverage', 'Snack', 'Other'],
              description: 'Category of the item',
              example: 'Fruit'
            },
            price: {
              type: 'number',
              minimum: 0.01,
              maximum: 10000,
              multipleOf: 0.01,
              description: 'Price of the item in USD',
              example: 1.99
            },
            quantity: {
              type: 'integer',
              minimum: 0,
              maximum: 100000,
              default: 0,
              description: 'Available quantity in stock',
              example: 50
            }
          }
        },
        ItemInput: {
          type: 'object',
          required: ['name', 'category', 'price'],
          properties: {
            name: {
              type: 'string',
              minLength: 1,
              maxLength: 100,
              description: 'Name of the item',
              example: 'Red Apple'
            },
            category: {
              type: 'string',
              enum: ['Fruit', 'Vegetable', 'Dairy', 'Bakery', 'Beverage', 'Snack', 'Other'],
              description: 'Category of the item',
              example: 'Fruit'
            },
            price: {
              type: 'number',
              minimum: 0.01,
              maximum: 10000,
              multipleOf: 0.01,
              description: 'Price of the item in USD',
              example: 1.99
            },
            quantity: {
              type: 'integer',
              minimum: 0,
              maximum: 100000,
              default: 0,
              description: 'Available quantity in stock',
              example: 50
            }
          }
        },
        PaginatedResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            data: {
              type: 'object',
              properties: {
                items: {
                  type: 'array',
                  items: {
                    $ref: '#/components/schemas/Item'
                  }
                },
                pagination: {
                  $ref: '#/components/schemas/Pagination'
                }
              }
            },
            message: {
              type: 'string',
              example: 'Items retrieved successfully'
            }
          }
        },
        Pagination: {
          type: 'object',
          properties: {
            currentPage: {
              type: 'integer',
              description: 'Current page number',
              example: 1
            },
            totalPages: {
              type: 'integer',
              description: 'Total number of pages',
              example: 5
            },
            totalItems: {
              type: 'integer',
              description: 'Total number of items',
              example: 47
            },
            hasNext: {
              type: 'boolean',
              description: 'Whether there is a next page',
              example: true
            },
            hasPrev: {
              type: 'boolean',
              description: 'Whether there is a previous page',
              example: false
            }
          }
        },
        SuccessResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            data: {
              oneOf: [
                { $ref: '#/components/schemas/Item' },
                { type: 'null' }
              ]
            },
            message: {
              type: 'string',
              example: 'Operation completed successfully'
            }
          }
        },
        Statistics: {
          type: 'object',
          properties: {
            totalItems: {
              type: 'integer',
              description: 'Total number of items in inventory',
              example: 47
            },
            totalValue: {
              type: 'number',
              description: 'Total value of all items in inventory',
              example: 234.56
            },
            categoryCounts: {
              type: 'object',
              description: 'Count of items by category',
              additionalProperties: {
                type: 'integer'
              },
              example: {
                'Fruit': 12,
                'Vegetable': 8,
                'Dairy': 5,
                'Other': 22
              }
            },
            averagePrice: {
              type: 'number',
              description: 'Average price per item',
              example: 4.99
            }
          }
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            error: {
              type: 'object',
              properties: {
                code: {
                  type: 'string',
                  example: 'VALIDATION_ERROR'
                },
                message: {
                  type: 'string',
                  example: 'Validation failed'
                },
                details: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      field: {
                        type: 'string',
                        example: 'name'
                      },
                      message: {
                        type: 'string',
                        example: 'Name is required'
                      }
                    }
                  }
                }
              }
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              example: '2025-10-16T10:30:00.000Z'
            },
            requestId: {
              type: 'string',
              format: 'uuid',
              example: 'abc123def-456-789-ghi-jklmnop890qr'
            }
          }
        }
      },
      parameters: {
        ItemId: {
          name: 'id',
          in: 'path',
          required: true,
          description: 'Unique identifier of the item',
          schema: {
            type: 'integer',
            minimum: 1
          },
          example: 1
        },
        Page: {
          name: 'page',
          in: 'query',
          description: 'Page number for pagination',
          schema: {
            type: 'integer',
            minimum: 1,
            default: 1
          },
          example: 1
        },
        Limit: {
          name: 'limit',
          in: 'query',
          description: 'Number of items per page',
          schema: {
            type: 'integer',
            minimum: 1,
            maximum: 100,
            default: 10
          },
          example: 10
        },
        Category: {
          name: 'category',
          in: 'query',
          description: 'Filter items by category',
          schema: {
            type: 'string',
            enum: ['Fruit', 'Vegetable', 'Dairy', 'Bakery', 'Beverage', 'Snack', 'Other']
          },
          example: 'Fruit'
        },
        Search: {
          name: 'search',
          in: 'query',
          description: 'Search items by name (case-insensitive)',
          schema: {
            type: 'string',
            minLength: 1
          },
          example: 'apple'
        }
      },
      responses: {
        BadRequest: {
          description: 'Bad request - validation error or malformed data',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              }
            }
          }
        },
        NotFound: {
          description: 'Resource not found',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              }
            }
          }
        },
        RateLimited: {
          description: 'Too many requests - rate limit exceeded',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              }
            }
          }
        },
        InternalError: {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              }
            }
          }
        }
      }
    },
    tags: [
      {
        name: 'Items',
        description: 'Operations for managing inventory items'
      },
      {
        name: 'Statistics',
        description: 'Operations for retrieving inventory statistics'
      }
    ]
  },
  apis: ['./src/routes/*.js', './src/controllers/*.js'] // Path to files containing OpenAPI definitions
};

const specs = swaggerJsdoc(options);

module.exports = {
  specs,
  swaggerUi,
  serve: swaggerUi.serve,
  setup: swaggerUi.setup(specs, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Items Store Manager API Documentation',
    swaggerOptions: {
      docExpansion: 'list',
      filter: true,
      showRequestHeaders: true,
      supportedSubmitMethods: ['get', 'post', 'put', 'delete']
    }
  })
};