const errorHandler = require('../src/middleware/errorHandler');
const { ValidationError, NotFoundError, InternalServerError } = require('../src/utils/errors');

describe('Error Handler Middleware Unit Tests', () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    mockReq = {
      method: 'GET',
      path: '/api/v1/items',
      ip: '127.0.0.1',
      headers: { 'user-agent': 'test' }
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      headersSent: false
    };

    mockNext = jest.fn();
  });

  describe('Custom Error Types', () => {
    it('should handle ValidationError correctly', () => {
      const validationError = new ValidationError('Validation failed', [
        { field: 'name', message: 'Name is required' },
        { field: 'price', message: 'Price must be positive' }
      ]);

      errorHandler(validationError, mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details: [
            { field: 'name', message: 'Name is required' },
            { field: 'price', message: 'Price must be positive' }
          ]
        },
        timestamp: expect.any(String),
        requestId: expect.any(String)
      });
    });

    it('should handle NotFoundError correctly', () => {
      const notFoundError = new NotFoundError('Item not found');

      errorHandler(notFoundError, mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Item not found'
        },
        timestamp: expect.any(String),
        requestId: expect.any(String)
      });
    });

    it('should handle InternalServerError correctly', () => {
      const internalError = new InternalServerError('Database connection failed');

      errorHandler(internalError, mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Database connection failed'
        },
        timestamp: expect.any(String),
        requestId: expect.any(String)
      });
    });
  });

  describe('Joi Validation Errors', () => {
    it('should handle Joi validation errors', () => {
      const joiError = {
        isJoi: true,
        name: 'ValidationError',
        details: [
          {
            path: ['name'],
            message: '"name" is required',
            type: 'any.required',
            context: { key: 'name' }
          },
          {
            path: ['price'],
            message: '"price" must be a positive number',
            type: 'number.positive',
            context: { key: 'price' }
          }
        ]
      };

      errorHandler(joiError, mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details: [
            { field: 'name', message: '"name" is required' },
            { field: 'price', message: '"price" must be a positive number' }
          ]
        },
        timestamp: expect.any(String),
        requestId: expect.any(String)
      });
    });

    it('should handle single Joi validation error', () => {
      const joiError = {
        isJoi: true,
        name: 'ValidationError',
        details: [
          {
            path: ['name'],
            message: '"name" must be a string',
            type: 'string.base',
            context: { key: 'name' }
          }
        ]
      };

      errorHandler(joiError, mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            details: [{ field: 'name', message: '"name" must be a string' }]
          })
        })
      );
    });
  });

  describe('Express Built-in Errors', () => {
    it('should handle SyntaxError (malformed JSON)', () => {
      const syntaxError = new SyntaxError('Unexpected token in JSON');
      syntaxError.status = 400;
      syntaxError.type = 'entity.parse.failed';

      errorHandler(syntaxError, mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'INVALID_JSON',
          message: 'Invalid JSON format in request body'
        },
        timestamp: expect.any(String),
        requestId: expect.any(String)
      });
    });

    it('should handle PayloadTooLargeError', () => {
      const payloadError = new Error('request entity too large');
      payloadError.status = 413;
      payloadError.type = 'entity.too.large';

      errorHandler(payloadError, mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(413);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'PAYLOAD_TOO_LARGE',
          message: 'Request payload too large'
        },
        timestamp: expect.any(String),
        requestId: expect.any(String)
      });
    });
  });

  describe('Generic Error Handling', () => {
    it('should handle generic Error objects', () => {
      const genericError = new Error('Something went wrong');

      errorHandler(genericError, mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Internal server error'
        },
        timestamp: expect.any(String),
        requestId: expect.any(String)
      });
    });

    it('should handle errors with custom status codes', () => {
      const customError = new Error('Rate limit exceeded');
      customError.statusCode = 429;
      customError.code = 'RATE_LIMIT_EXCEEDED';

      errorHandler(customError, mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(429);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Rate limit exceeded'
        },
        timestamp: expect.any(String),
        requestId: expect.any(String)
      });
    });

    it('should handle non-Error objects', () => {
      const stringError = 'String error message';

      errorHandler(stringError, mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Internal server error'
        },
        timestamp: expect.any(String),
        requestId: expect.any(String)
      });
    });
  });

  describe('Response Properties', () => {
    it('should include proper timestamp format', () => {
      const error = new Error('Test error');

      errorHandler(error, mockReq, mockRes, mockNext);

      const response = mockRes.json.mock.calls[0][0];
      expect(response.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });

    it('should include unique request ID', () => {
      const error1 = new Error('Test error 1');
      const error2 = new Error('Test error 2');

      errorHandler(error1, mockReq, mockRes, mockNext);
      const response1 = mockRes.json.mock.calls[0][0];

      // Reset mocks for second call
      mockRes.json.mockClear();
      
      errorHandler(error2, mockReq, mockRes, mockNext);
      const response2 = mockRes.json.mock.calls[0][0];

      expect(response1.requestId).toBeDefined();
      expect(response2.requestId).toBeDefined();
      expect(response1.requestId).not.toBe(response2.requestId);
    });

    it('should always set success to false', () => {
      const errors = [
        new ValidationError('Validation error'),
        new NotFoundError('Not found'),
        new Error('Generic error')
      ];

      errors.forEach(error => {
        mockRes.json.mockClear();
        errorHandler(error, mockReq, mockRes, mockNext);
        const response = mockRes.json.mock.calls[0][0];
        expect(response.success).toBe(false);
      });
    });
  });

  describe('Edge Cases', () => {
    it('should not send response if headers already sent', () => {
      mockRes.headersSent = true;
      const error = new Error('Test error');

      errorHandler(error, mockReq, mockRes, mockNext);

      expect(mockRes.status).not.toHaveBeenCalled();
      expect(mockRes.json).not.toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalledWith(error);
    });

    it('should handle null error', () => {
      errorHandler(null, mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            code: 'INTERNAL_SERVER_ERROR'
          })
        })
      );
    });

    it('should handle undefined error', () => {
      errorHandler(undefined, mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            code: 'INTERNAL_SERVER_ERROR'
          })
        })
      );
    });
  });

  describe('Production vs Development Behavior', () => {
    let originalEnv;

    beforeAll(() => {
      originalEnv = process.env.NODE_ENV;
    });

    afterAll(() => {
      process.env.NODE_ENV = originalEnv;
    });

    it('should not expose stack trace in production', () => {
      process.env.NODE_ENV = 'production';
      const error = new Error('Test error');
      error.stack = 'Error: Test error\n    at test.js:1:1';

      errorHandler(error, mockReq, mockRes, mockNext);

      const response = mockRes.json.mock.calls[0][0];
      expect(response.error.stack).toBeUndefined();
    });

    it('should include stack trace in development', () => {
      process.env.NODE_ENV = 'development';
      const error = new Error('Test error');
      error.stack = 'Error: Test error\n    at test.js:1:1';

      errorHandler(error, mockReq, mockRes, mockNext);

      const response = mockRes.json.mock.calls[0][0];
      expect(response.error.stack).toBeDefined();
    });
  });
});