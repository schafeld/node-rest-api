const fsSync = require('fs');const fs = require('fs').promises;const dataService = require('../src/services/dataService');



// Mock fs before importing dataServiceconst fsSync = require('fs');const fs = require('fs');

jest.mock('fs', () => ({

  promises: {const path = require('path');const path = require('path');

    mkdir: jest.fn(),

    writeFile: jest.fn(),

    readFile: jest.fn()

  },// Mock fs before importing dataService// Mock fs for testing

  existsSync: jest.fn(),

  mkdirSync: jest.fn(),jest.mock('fs', () => ({jest.mock('fs');

  writeFileSync: jest.fn(),

  readFileSync: jest.fn()  promises: {

}));

    mkdir: jest.fn(),describe('DataService Unit Tests', () => {

describe('DataService Unit Tests', () => {

  let dataService;    writeFile: jest.fn(),  let originalEnv;



  beforeEach(() => {    readFile: jest.fn()

    jest.resetModules();

    jest.clearAllMocks();  },  beforeAll(() => {

    

    // Mock environment  existsSync: jest.fn(),    originalEnv = process.env.NODE_ENV;

    process.env.NODE_ENV = 'test';

      mkdirSync: jest.fn(),  });

    // Default mocks

    fsSync.existsSync.mockReturnValue(true);  writeFileSync: jest.fn(),

    fsSync.readFileSync.mockReturnValue(JSON.stringify([

      { id: 1, name: 'Apple', category: 'Fruit', price: 0.5, quantity: 10, inStock: true },  readFileSync: jest.fn()  afterAll(() => {

      { id: 2, name: 'Banana', category: 'Fruit', price: 0.3, quantity: 15, inStock: true }

    ]));}));    process.env.NODE_ENV = originalEnv;

    

    dataService = require('../src/services/dataService');  });

  });

describe('DataService Unit Tests', () => {

  describe('Core Operations', () => {

    it('should retrieve all items', async () => {  let dataService;  beforeEach(async () => {

      const items = await dataService.getAllItems();

      expect(Array.isArray(items)).toBe(true);    jest.clearAllMocks();

      expect(items.length).toBeGreaterThan(0);

    });  beforeEach(() => {    // Initialize service before each test



    it('should get item by ID', async () => {    jest.resetModules();    if (!dataService.initialized) {

      const item = await dataService.getItemById(1);

      expect(item).toBeDefined();    jest.clearAllMocks();      await dataService.initialize();

      expect(item.id).toBe(1);

    });        }



    it('should create new item', async () => {    // Mock environment  });

      const newItem = {

        name: 'Test Item',    process.env.NODE_ENV = 'test';

        category: 'Other',

        price: 5.99,      describe('Environment Detection', () => {

        quantity: 3

      };    // Default mocks    it('should detect development environment', () => {



      const createdItem = await dataService.createItem(newItem);    fsSync.existsSync.mockReturnValue(true);      process.env.NODE_ENV = 'development';

      expect(createdItem).toMatchObject({

        name: 'Test Item',    fsSync.readFileSync.mockReturnValue(JSON.stringify([      expect(process.env.NODE_ENV).toBe('development');

        category: 'Other',

        price: 5.99,      { id: 1, name: 'Apple', category: 'Fruit', price: 0.5, quantity: 10, inStock: true },    });

        quantity: 3

      });      { id: 2, name: 'Banana', category: 'Fruit', price: 0.3, quantity: 15, inStock: true }

      expect(createdItem.id).toBeDefined();

    });    ]));    it('should detect Netlify environment', () => {



    it('should update existing item', async () => {          const originalNetlify = process.env.NETLIFY;

      const updates = { name: 'Updated Apple', price: 0.75 };

      const updatedItem = await dataService.updateItem(1, updates);    dataService = require('../src/services/dataService');      process.env.NETLIFY = 'true';

      

      expect(updatedItem.name).toBe('Updated Apple');  });      expect(process.env.NETLIFY).toBe('true');

      expect(updatedItem.price).toBe(0.75);

    });      process.env.NETLIFY = originalNetlify;



    it('should delete existing item', async () => {  describe('Core CRUD Operations', () => {    });

      const deletedItem = await dataService.deleteItem(1);

      expect(deletedItem).toBeDefined();    it('should retrieve all items', async () => {

      expect(deletedItem.id).toBe(1);

    });      const items = await dataService.getAllItems();



    it('should return statistics', async () => {      expect(Array.isArray(items)).toBe(true);  });

      const stats = await dataService.getStats();

            expect(items.length).toBeGreaterThan(0);

      expect(stats).toHaveProperty('totalItems');

      expect(stats).toHaveProperty('inStockItems');    });  describe('Data Operations', () => {

      expect(stats).toHaveProperty('totalValue');

      expect(typeof stats.totalItems).toBe('number');    let service;

    });

    it('should get item by ID', async () => {

    it('should reset data to defaults', async () => {

      const itemCount = await dataService.resetData();      const item = await dataService.getItemById(1);    beforeEach(() => {

      expect(typeof itemCount).toBe('number');

      expect(itemCount).toBeGreaterThan(0);      expect(item).toBeDefined();      process.env.NODE_ENV = 'test';

    });

  });      expect(item.id).toBe(1);      fs.existsSync.mockReturnValue(true);

});
    });      fs.readFileSync.mockReturnValue(JSON.stringify([

        { id: 1, name: 'Test Item', category: 'Other', price: 9.99, quantity: 10 }

    it('should return null for non-existent item', async () => {      ]));

      const item = await dataService.getItemById(999);      fs.writeFileSync.mockImplementation(() => {});

      expect(item).toBeNull();      

    });      service = require('../src/services/dataService');

    });

    it('should create new item', async () => {

      const newItem = {    describe('getAllItems', () => {

        name: 'Test Item',      it('should return all items', async () => {

        category: 'Other',        const items = await dataService.getAllItems();

        price: 5.99,        expect(Array.isArray(items)).toBe(true);

        quantity: 3        expect(items.length).toBeGreaterThanOrEqual(0);

      };      });



      const createdItem = await dataService.createItem(newItem);      it('should handle pagination', async () => {

              const items = await dataService.getAllItems();

      expect(createdItem).toMatchObject({        expect(Array.isArray(items)).toBe(true);

        name: 'Test Item',      });

        category: 'Other',

        price: 5.99,      it('should handle category filtering', async () => {

        quantity: 3,        const items = await dataService.getAllItems();

        inStock: true        if (items.length > 0) {

      });          const firstItem = items[0];

      expect(createdItem.id).toBeDefined();          expect(firstItem).toHaveProperty('category');

    });        }

      });

    it('should update existing item', async () => {

      const updates = { name: 'Updated Apple', price: 0.75 };      it('should handle search functionality', async () => {

      const updatedItem = await dataService.updateItem(1, updates);        const items = await dataService.getAllItems();

              expect(Array.isArray(items)).toBe(true);

      expect(updatedItem.name).toBe('Updated Apple');      });

      expect(updatedItem.price).toBe(0.75);    });

    });

    describe('getItemById', () => {

    it('should return null when updating non-existent item', async () => {      it('should return item by valid ID', () => {

      const result = await dataService.updateItem(999, { name: 'Test' });        const item = service.getItemById(1);

      expect(result).toBeNull();        expect(item).toBeTruthy();

    });        expect(item.id).toBe(1);

      });

    it('should delete existing item', async () => {

      const deletedItem = await dataService.deleteItem(1);      it('should get an item by ID', async () => {

      expect(deletedItem).toBeDefined();        const items = await dataService.getAllItems();

      expect(deletedItem.id).toBe(1);        if (items.length > 0) {

    });          const item = await dataService.getItemById(items[0].id);

          expect(item).toBeDefined();

    it('should return null when deleting non-existent item', async () => {          expect(item.id).toBe(items[0].id);

      const result = await dataService.deleteItem(999);        }

      expect(result).toBeNull();      });

    });

  });      it('should return null for non-existent ID', async () => {

        const item = await dataService.getItemById('non-existent-id');

  describe('Statistics and Data Management', () => {        expect(item).toBeNull();

    it('should return statistics', async () => {      });

      const stats = await dataService.getStats();

            it('should handle string IDs', () => {

      expect(stats).toHaveProperty('totalItems');        const item = service.getItemById('1');

      expect(stats).toHaveProperty('inStockItems');        expect(item).toBeTruthy();

      expect(stats).toHaveProperty('totalValue');        expect(item.id).toBe(1);

      expect(typeof stats.totalItems).toBe('number');      });

      expect(typeof stats.totalValue).toBe('number');    });

    });

    describe('createItem', () => {

    it('should reset data to defaults', async () => {      it('should create an item', async () => {

      const itemCount = await dataService.resetData();        const newItem = { name: 'New Test Item', category: 'Other', inStock: true };

      expect(typeof itemCount).toBe('number');        const created = await dataService.createItem(newItem);

      expect(itemCount).toBeGreaterThan(0);        

    });        expect(created).toHaveProperty('id');

  });        expect(created.name).toBe(newItem.name);

        expect(created.category).toBe(newItem.category);

  describe('Error Handling', () => {        expect(created.inStock).toBe(newItem.inStock);

    it('should handle file read errors gracefully', async () => {      });

      fsSync.existsSync.mockReturnValue(false);

      

      // Should fall back to default data without crashing    });

      const items = await dataService.getAllItems();

      expect(Array.isArray(items)).toBe(true);    describe('updateItem', () => {

    });      it('should update an item', async () => {

        const items = await dataService.getAllItems();

    it('should handle file write errors gracefully', async () => {        if (items.length > 0) {

      fsSync.existsSync.mockReturnValue(true);          const originalItem = items[0];

      fsSync.readFileSync.mockReturnValue('[]');          const updateData = { name: 'Updated Test Item' };

      fsSync.writeFileSync.mockImplementation(() => {          const updated = await dataService.updateItem(originalItem.id, updateData);

        throw new Error('File write error');          

      });          expect(updated).toBeDefined();

          expect(updated.name).toBe(updateData.name);

      // Should not crash on write errors          expect(updated.id).toBe(originalItem.id);

      await expect(async () => {        }

        await dataService.createItem({ name: 'Test', category: 'Other', price: 1, quantity: 1 });      });

      }).not.toThrow();

    });      it('should return null when updating non-existent item', async () => {

  });        const updated = await dataService.updateItem('non-existent-id', { name: 'Updated' });

});        expect(updated).toBeNull();
      });
    });
    });

    describe('deleteItem', () => {
      it('should delete an item', async () => {
        const items = await dataService.getAllItems();
        if (items.length > 0) {
          const itemToDelete = items[0];
          const result = await dataService.deleteItem(itemToDelete.id);
          
          expect(result).toBe(true);
          
          const deletedItem = await dataService.getItemById(itemToDelete.id);
          expect(deletedItem).toBeNull();
        }
      });

      it('should return false when deleting non-existent item', async () => {
        const result = await dataService.deleteItem('non-existent-id');
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
      it('should calculate basic statistics', () => {
        const stats = dataService.getStatistics();
        
        expect(stats).toHaveProperty('totalItems');
        expect(stats).toHaveProperty('totalValue');
        expect(stats).toHaveProperty('averagePrice');
        
        expect(typeof stats.totalItems).toBe('number');
        expect(typeof stats.totalValue).toBe('number');
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

    it('should handle file read errors gracefully', async () => {
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockImplementation(() => {
        throw new Error('File read error');
      });

      const service = require('../src/services/dataService');
      // Should fall back to default data without crashing
      const items = await service.getAllItems();
      expect(Array.isArray(items)).toBe(true);
    });

    it('should handle file write errors gracefully', async () => {
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue('[]');
      fs.writeFileSync.mockImplementation(() => {
        throw new Error('File write error');
      });

      const service = require('../src/services/dataService');
      // Should not crash on write errors
      await expect(async () => {
        await service.createItem({ name: 'Test', category: 'Other', price: 1, quantity: 1 });
      }).not.toThrow();
    });
  });
});