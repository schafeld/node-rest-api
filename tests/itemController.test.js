const itemController = require('../src/controllers/itemController');
const dataService = require('../src/services/dataService');

// Mock the data service
jest.mock('../src/services/dataService');

describe('ItemController Unit Tests', () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();

    // Mock request object
    mockReq = {
      params: {},
      body: {},
      query: {},
      headers: {}
    };

    // Mock response object
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis()
    };

    // Mock next function
    mockNext = jest.fn();
  });

  describe('getAllItems', () => {
    it('should return paginated items successfully', async () => {
      const mockItems = [
        { id: 1, name: 'Apple', category: 'Fruit', price: 1.99, quantity: 10, inStock: true }
      ];
      
      // Set default query parameters
      mockReq.query = {
        page: 1,
        limit: 10,
        sortBy: 'id',
        sortOrder: 'asc'
      };

      dataService.getAllItems.mockResolvedValue(mockItems);

      await itemController.getAllItems(mockReq, mockRes, mockNext);

      expect(dataService.getAllItems).toHaveBeenCalled();
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({
          items: mockItems,
          pagination: expect.objectContaining({
            currentPage: 1,
            totalPages: 1,
            totalItems: 1,
            limit: 10,
            hasNext: false,
            hasPrev: false
          })
        }),
        message: expect.stringContaining('Retrieved')
      });
    });

    it('should handle query parameters correctly', async () => {
      mockReq.query = {
        page: 2,
        limit: 5,
        category: 'Fruit',
        search: 'apple',
        sortBy: 'name',
        sortOrder: 'desc'
      };

      const mockItems = [
        { id: 1, name: 'Apple', category: 'Fruit', price: 1.99, quantity: 10, inStock: true }
      ];
      dataService.getAllItems.mockResolvedValue(mockItems);

      await itemController.getAllItems(mockReq, mockRes, mockNext);

      expect(dataService.getAllItems).toHaveBeenCalled();
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        data: expect.objectContaining({
          pagination: expect.objectContaining({
            currentPage: 2,
            limit: 5
          })
        })
      }));
    });

    it('should handle service errors', async () => {
      const error = new Error('Service error');
      dataService.getAllItems.mockRejectedValue(error);

      await itemController.getAllItems(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('getItemById', () => {
    it('should return specific item successfully', async () => {
      mockReq.params = { id: '1' };
      const mockItem = { id: 1, name: 'Apple', category: 'Fruit', price: 1.99, quantity: 10 };
      
      dataService.getItemById.mockResolvedValue(mockItem);

      await itemController.getItemById(mockReq, mockRes, mockNext);

      expect(dataService.getItemById).toHaveBeenCalledWith('1');
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: { item: mockItem },
        message: 'Item retrieved successfully'
      });
    });

    it('should handle non-existent item', async () => {
      mockReq.params = { id: '999' };
      dataService.getItemById.mockResolvedValue(null);

      await itemController.getItemById(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 404
        })
      );
    });

    it('should handle invalid ID format', async () => {
      mockReq.params = { id: 'invalid' };

      await itemController.getItemById(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 400,
          code: 'VALIDATION_ERROR'
        })
      );
    });
  });

  describe('createItem', () => {
    it('should create new item successfully', async () => {
      const itemData = {
        name: 'New Item',
        category: 'Other',
        price: 9.99,
        quantity: 5
      };
      mockReq.body = itemData;

      const createdItem = { id: 1, ...itemData };
      dataService.createItem.mockResolvedValue(createdItem);

      await itemController.createItem(mockReq, mockRes, mockNext);

      expect(dataService.createItem).toHaveBeenCalledWith(itemData);
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: { item: createdItem },
        message: expect.stringContaining('created successfully')
      });
    });

    it('should handle validation errors', async () => {
      mockReq.body = {
        name: '', // Invalid: empty name
        category: 'InvalidCategory',
        price: -5
      };

      await itemController.createItem(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 400,
          code: 'VALIDATION_ERROR'
        })
      );
    });

    it('should handle service errors during creation', async () => {
      mockReq.body = {
        name: 'Test Item',
        category: 'Other',
        price: 9.99,
        quantity: 1
      };

      const error = new Error('Creation failed');
      dataService.createItem.mockImplementation(() => {
        throw error;
      });

      await itemController.createItem(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
      const passedError = mockNext.mock.calls[0][0];
      expect(passedError.message).toBe('Failed to create item');
      expect(passedError.code).toBe('INTERNAL_SERVER_ERROR');
      expect(passedError.statusCode).toBe(500);
    });
  });

  describe('updateItem', () => {
    it('should update existing item successfully', async () => {
      mockReq.params = { id: '1' };
      mockReq.body = {
        name: 'Updated Item',
        category: 'Vegetable',
        price: 15.99,
        quantity: 8
      };

      const updatedItem = { id: 1, ...mockReq.body };
      dataService.updateItem.mockResolvedValue(updatedItem);

      await itemController.updateItem(mockReq, mockRes, mockNext);

      expect(dataService.updateItem).toHaveBeenCalledWith('1', mockReq.body);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: { item: updatedItem },
        message: expect.stringContaining('updated successfully')
      });
    });

    it('should handle non-existent item update', async () => {
      mockReq.params = { id: '999' };
      mockReq.body = { name: 'Updated Item', category: 'Other', price: 9.99 };

      dataService.updateItem.mockReturnValue(null);

      await itemController.updateItem(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 404,
          code: 'NOT_FOUND'
        })
      );
    });

    it('should validate update data', async () => {
      mockReq.params = { id: '1' };
      mockReq.body = {
        price: -10, // Invalid negative price
        quantity: 'invalid'
      };

      await itemController.updateItem(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 400,
          code: 'VALIDATION_ERROR'
        })
      );
    });

    it('should validate item ID', async () => {
      mockReq.params = { id: 'invalid-id' };
      mockReq.body = { name: 'Updated Item', category: 'Other', price: 9.99 };

      await itemController.updateItem(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 400,
          code: 'VALIDATION_ERROR'
        })
      );
    });
  });

  describe('deleteItem', () => {
    it('should delete existing item successfully', async () => {
      mockReq.params = { id: '1' };
      const deletedItem = { id: 1, name: 'Apple', category: 'Fruit', price: 1.99, quantity: 10 };
      dataService.deleteItem.mockResolvedValue(deletedItem);

      await itemController.deleteItem(mockReq, mockRes, mockNext);

      expect(dataService.deleteItem).toHaveBeenCalledWith('1');
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: { deletedItem },
        message: expect.stringContaining('deleted successfully')
      });
    });

    it('should handle non-existent item deletion', async () => {
      mockReq.params = { id: '999' };
      dataService.deleteItem.mockReturnValue(false);

      await itemController.deleteItem(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 404,
          code: 'NOT_FOUND'
        })
      );
    });

    it('should validate item ID for deletion', async () => {
      mockReq.params = { id: 'invalid-id' };

      await itemController.deleteItem(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 400,
          code: 'VALIDATION_ERROR'
        })
      );
    });
  });

  describe('resetData', () => {
    it('should reset items successfully', async () => {
      const itemCount = 5;
      dataService.resetData.mockResolvedValue(itemCount);

      await itemController.resetData(mockReq, mockRes, mockNext);

      expect(dataService.resetData).toHaveBeenCalled();
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: { itemCount },
        message: `Data reset successfully. Restored ${itemCount} default items.`
      });
    });

    it('should handle service errors during reset', async () => {
      const error = new Error('Reset failed');
      dataService.resetData.mockImplementation(() => {
        throw error;
      });

      await itemController.resetData(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
      const passedError = mockNext.mock.calls[0][0];
      expect(passedError.message).toBe('Failed to reset data');
      expect(passedError.code).toBe('INTERNAL_SERVER_ERROR');
      expect(passedError.statusCode).toBe(500);
    });
  });

  describe('getStats', () => {
    it('should return statistics successfully', async () => {
      const mockStats = {
        totalItems: 10,
        totalValue: 99.90,
        categoryCounts: { Fruit: 3, Vegetable: 2 },
        averagePrice: 9.99
      };

      dataService.getStats.mockResolvedValue(mockStats);

      await itemController.getStats(mockReq, mockRes, mockNext);

      expect(dataService.getStats).toHaveBeenCalled();
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: { stats: mockStats },
        message: 'Statistics retrieved successfully'
      });
    });

    it('should handle service errors during statistics retrieval', async () => {
      const error = new Error('Statistics failed');
      dataService.getStats.mockImplementation(() => {
        throw error;
      });

      await itemController.getStats(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
      const passedError = mockNext.mock.calls[0][0];
      expect(passedError.message).toBe('Failed to retrieve statistics');
      expect(passedError.code).toBe('INTERNAL_SERVER_ERROR');
      expect(passedError.statusCode).toBe(500);
    });
  });
});