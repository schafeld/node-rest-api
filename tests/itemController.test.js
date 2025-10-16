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
      const mockData = {
        items: [
          { id: 1, name: 'Apple', category: 'Fruit', price: 1.99, quantity: 10 }
        ],
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalItems: 1,
          hasNext: false,
          hasPrev: false
        }
      };

      dataService.getAllItems.mockReturnValue(mockData);

      await itemController.getAllItems(mockReq, mockRes, mockNext);

      expect(dataService.getAllItems).toHaveBeenCalledWith(mockReq.query);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockData,
        message: 'Items retrieved successfully'
      });
    });

    it('should pass query parameters to dataService', async () => {
      mockReq.query = {
        page: '2',
        limit: '5',
        category: 'Fruit',
        search: 'apple'
      };

      const mockData = { items: [], pagination: {} };
      dataService.getAllItems.mockReturnValue(mockData);

      await itemController.getAllItems(mockReq, mockRes, mockNext);

      expect(dataService.getAllItems).toHaveBeenCalledWith(mockReq.query);
    });

    it('should handle service errors', async () => {
      const error = new Error('Service error');
      dataService.getAllItems.mockImplementation(() => {
        throw error;
      });

      await itemController.getAllItems(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('getItemById', () => {
    it('should return specific item successfully', async () => {
      mockReq.params = { id: '1' };
      const mockItem = { id: 1, name: 'Apple', category: 'Fruit', price: 1.99, quantity: 10 };
      
      dataService.getItemById.mockReturnValue(mockItem);

      await itemController.getItemById(mockReq, mockRes, mockNext);

      expect(dataService.getItemById).toHaveBeenCalledWith(1);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockItem,
        message: 'Item retrieved successfully'
      });
    });

    it('should handle non-existent item', async () => {
      mockReq.params = { id: '999' };
      dataService.getItemById.mockReturnValue(null);

      await itemController.getItemById(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectMatching({
          statusCode: 404,
          code: 'NOT_FOUND'
        })
      );
    });

    it('should handle invalid ID format', async () => {
      mockReq.params = { id: 'invalid' };

      await itemController.getItemById(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectMatching({
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
      dataService.createItem.mockReturnValue(createdItem);

      await itemController.createItem(mockReq, mockRes, mockNext);

      expect(dataService.createItem).toHaveBeenCalledWith(itemData);
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: createdItem,
        message: 'Item created successfully'
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
        expect.objectMatching({
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

      expect(mockNext).toHaveBeenCalledWith(error);
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
      dataService.updateItem.mockReturnValue(updatedItem);

      await itemController.updateItem(mockReq, mockRes, mockNext);

      expect(dataService.updateItem).toHaveBeenCalledWith(1, mockReq.body);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: updatedItem,
        message: 'Item updated successfully'
      });
    });

    it('should handle non-existent item update', async () => {
      mockReq.params = { id: '999' };
      mockReq.body = { name: 'Updated Item', category: 'Other', price: 9.99 };

      dataService.updateItem.mockReturnValue(null);

      await itemController.updateItem(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectMatching({
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
        expect.objectMatching({
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
        expect.objectMatching({
          statusCode: 400,
          code: 'VALIDATION_ERROR'
        })
      );
    });
  });

  describe('deleteItem', () => {
    it('should delete existing item successfully', async () => {
      mockReq.params = { id: '1' };
      dataService.deleteItem.mockReturnValue(true);

      await itemController.deleteItem(mockReq, mockRes, mockNext);

      expect(dataService.deleteItem).toHaveBeenCalledWith(1);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: null,
        message: 'Item deleted successfully'
      });
    });

    it('should handle non-existent item deletion', async () => {
      mockReq.params = { id: '999' };
      dataService.deleteItem.mockReturnValue(false);

      await itemController.deleteItem(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectMatching({
          statusCode: 404,
          code: 'NOT_FOUND'
        })
      );
    });

    it('should validate item ID for deletion', async () => {
      mockReq.params = { id: 'invalid-id' };

      await itemController.deleteItem(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectMatching({
          statusCode: 400,
          code: 'VALIDATION_ERROR'
        })
      );
    });
  });

  describe('resetItems', () => {
    it('should reset items successfully', async () => {
      dataService.resetToDefaults.mockImplementation(() => {});

      await itemController.resetItems(mockReq, mockRes, mockNext);

      expect(dataService.resetToDefaults).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: null,
        message: 'Items reset successfully to default data'
      });
    });

    it('should handle service errors during reset', async () => {
      const error = new Error('Reset failed');
      dataService.resetToDefaults.mockImplementation(() => {
        throw error;
      });

      await itemController.resetItems(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('getStatistics', () => {
    it('should return statistics successfully', async () => {
      const mockStats = {
        totalItems: 10,
        totalValue: 99.90,
        categoryCounts: { Fruit: 3, Vegetable: 2 },
        averagePrice: 9.99
      };

      dataService.getStatistics.mockReturnValue(mockStats);

      await itemController.getStatistics(mockReq, mockRes, mockNext);

      expect(dataService.getStatistics).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockStats,
        message: 'Statistics retrieved successfully'
      });
    });

    it('should handle service errors during statistics retrieval', async () => {
      const error = new Error('Statistics failed');
      dataService.getStatistics.mockImplementation(() => {
        throw error;
      });

      await itemController.getStatistics(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
});