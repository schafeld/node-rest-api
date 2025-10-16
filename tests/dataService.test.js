const dataService = require('../src/services/dataService');
const fs = require('fs');
const path = require('path');

// Mock fs for testing
jest.mock('fs');

describe('DataService Unit Tests', () => {
  let originalEnv;

  beforeAll(() => {
    originalEnv = process.env.NODE_ENV;
  });

  afterAll(() => {
    process.env.NODE_ENV = originalEnv;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset the service for each test
    jest.resetModules();
  });

  describe('Environment Detection', () => {
    it('should detect development environment', () => {
      process.env.NODE_ENV = 'development';
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue('[]');
      
      const service = require('../src/services/dataService');
      expect(service.isFileStorageAvailable()).toBe(true);
    });

    it('should detect Netlify environment', () => {
      process.env.NODE_ENV = 'production';
      process.env.NETLIFY = 'true';
      
      const service = require('../src/services/dataService');
      expect(service.isFileStorageAvailable()).toBe(false);
    });

    it('should handle missing data directory', () => {
      process.env.NODE_ENV = 'development';
      fs.existsSync.mockReturnValue(false);
      fs.mkdirSync.mockImplementation(() => {});
      fs.writeFileSync.mockImplementation(() => {});
      
      const service = require('../src/services/dataService');
      service.initializeData();
      
      expect(fs.mkdirSync).toHaveBeenCalled();
      expect(fs.writeFileSync).toHaveBeenCalled();
    });
  });

  describe('Data Operations', () => {
    let service;

    beforeEach(() => {
      process.env.NODE_ENV = 'test';
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue(JSON.stringify([
        { id: 1, name: 'Test Item', category: 'Other', price: 9.99, quantity: 10 }
      ]));
      fs.writeFileSync.mockImplementation(() => {});
      
      service = require('../src/services/dataService');
    });

    describe('getAllItems', () => {
      it('should return all items', () => {
        const items = service.getAllItems();
        expect(Array.isArray(items)).toBe(true);
        expect(items.length).toBeGreaterThanOrEqual(0);
      });

      it('should handle pagination', () => {
        const result = service.getAllItems({ page: 1, limit: 5 });
        expect(result).toHaveProperty('items');
        expect(result).toHaveProperty('pagination');
        expect(result.pagination).toHaveProperty('currentPage', 1);
        expect(result.pagination).toHaveProperty('totalPages');
        expect(result.pagination).toHaveProperty('totalItems');
      });

      it('should handle category filtering', () => {
        const result = service.getAllItems({ category: 'Other' });
        if (result.items.length > 0) {
          result.items.forEach(item => {
            expect(item.category).toBe('Other');
          });
        }
      });

      it('should handle search functionality', () => {
        const result = service.getAllItems({ search: 'test' });
        if (result.items.length > 0) {
          result.items.forEach(item => {
            expect(item.name.toLowerCase()).toContain('test');
          });
        }
      });
    });

    describe('getItemById', () => {
      it('should return item by valid ID', () => {
        const item = service.getItemById(1);
        expect(item).toBeTruthy();
        expect(item.id).toBe(1);
      });

      it('should return null for non-existent ID', () => {
        const item = service.getItemById(999999);
        expect(item).toBeNull();
      });

      it('should handle string IDs', () => {
        const item = service.getItemById('1');
        expect(item).toBeTruthy();
        expect(item.id).toBe(1);
      });
    });

    describe('createItem', () => {
      it('should create a new item', () => {
        const newItemData = {
          name: 'New Test Item',
          category: 'Fruit',
          price: 15.99,
          quantity: 5
        };

        const createdItem = service.createItem(newItemData);
        
        expect(createdItem).toHaveProperty('id');
        expect(createdItem.name).toBe(newItemData.name);
        expect(createdItem.category).toBe(newItemData.category);
        expect(createdItem.price).toBe(newItemData.price);
        expect(createdItem.quantity).toBe(newItemData.quantity);
      });

      it('should generate sequential IDs', () => {
        const item1 = service.createItem({ name: 'Item 1', category: 'Other', price: 1, quantity: 1 });
        const item2 = service.createItem({ name: 'Item 2', category: 'Other', price: 2, quantity: 2 });
        
        expect(item2.id).toBeGreaterThan(item1.id);
      });
    });

    describe('updateItem', () => {
      it('should update existing item', () => {
        const updateData = {
          name: 'Updated Item',
          category: 'Vegetable',
          price: 20.99,
          quantity: 15
        };

        const updatedItem = service.updateItem(1, updateData);
        
        expect(updatedItem).toBeTruthy();
        expect(updatedItem.id).toBe(1);
        expect(updatedItem.name).toBe(updateData.name);
        expect(updatedItem.category).toBe(updateData.category);
        expect(updatedItem.price).toBe(updateData.price);
        expect(updatedItem.quantity).toBe(updateData.quantity);
      });

      it('should return null for non-existent item', () => {
        const updateData = { name: 'Updated Item', category: 'Other', price: 9.99, quantity: 10 };
        const result = service.updateItem(999999, updateData);
        
        expect(result).toBeNull();
      });

      it('should preserve item ID during update', () => {
        const updateData = { id: 999, name: 'Hacked Item' };
        const updatedItem = service.updateItem(1, updateData);
        
        expect(updatedItem.id).toBe(1); // Should preserve original ID
      });
    });

    describe('deleteItem', () => {
      it('should delete existing item', () => {
        // First ensure item exists
        const item = service.getItemById(1);
        expect(item).toBeTruthy();

        // Delete the item
        const result = service.deleteItem(1);
        expect(result).toBe(true);

        // Verify it's deleted
        const deletedItem = service.getItemById(1);
        expect(deletedItem).toBeNull();
      });

      it('should return false for non-existent item', () => {
        const result = service.deleteItem(999999);
        expect(result).toBe(false);
      });
    });

    describe('resetToDefaults', () => {
      it('should reset data to defaults', () => {
        // Add some items first
        service.createItem({ name: 'Custom Item', category: 'Other', price: 1, quantity: 1 });
        
        // Reset to defaults
        service.resetToDefaults();
        
        // Verify reset worked
        const items = service.getAllItems();
        expect(Array.isArray(items.items)).toBe(true);
        // Should have default items (exact count may vary, but should be > 0)
        expect(items.items.length).toBeGreaterThan(0);
      });
    });

    describe('getStatistics', () => {
      it('should calculate correct statistics', () => {
        const stats = service.getStatistics();
        
        expect(stats).toHaveProperty('totalItems');
        expect(stats).toHaveProperty('totalValue');
        expect(stats).toHaveProperty('categoryCounts');
        expect(stats).toHaveProperty('averagePrice');
        
        expect(typeof stats.totalItems).toBe('number');
        expect(typeof stats.totalValue).toBe('number');
        expect(typeof stats.categoryCounts).toBe('object');
        expect(typeof stats.averagePrice).toBe('number');
      });

      it('should handle empty inventory', () => {
        // Mock empty data
        fs.readFileSync.mockReturnValue('[]');
        jest.resetModules();
        const emptyService = require('../src/services/dataService');
        
        const stats = emptyService.getStatistics();
        expect(stats.totalItems).toBe(0);
        expect(stats.totalValue).toBe(0);
        expect(stats.averagePrice).toBe(0);
      });
    });
  });

  describe('File Operations', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'development';
    });

    it('should handle file read errors gracefully', () => {
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockImplementation(() => {
        throw new Error('File read error');
      });

      const service = require('../src/services/dataService');
      // Should fall back to default data without crashing
      const items = service.getAllItems();
      expect(Array.isArray(items.items)).toBe(true);
    });

    it('should handle file write errors gracefully', () => {
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue('[]');
      fs.writeFileSync.mockImplementation(() => {
        throw new Error('File write error');
      });

      const service = require('../src/services/dataService');
      // Should not crash on write errors
      expect(() => {
        service.createItem({ name: 'Test', category: 'Other', price: 1, quantity: 1 });
      }).not.toThrow();
    });

    it('should create directory if it does not exist', () => {
      fs.existsSync.mockImplementation((path) => {
        // Return false for directory, true for file
        return path.includes('items.json');
      });
      fs.mkdirSync.mockImplementation(() => {});
      fs.readFileSync.mockReturnValue('[]');

      const service = require('../src/services/dataService');
      service.initializeData();

      expect(fs.mkdirSync).toHaveBeenCalledWith(
        expect.stringContaining('data'),
        { recursive: true }
      );
    });
  });
});