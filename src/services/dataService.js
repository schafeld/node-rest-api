const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');
const config = require('../config/environment');
const logger = require('../utils/logger');

class DataService {
  constructor() {
    this.items = [];
    this.dataFilePath = config.DATA.filePath;
    this.useFileStorage = config.DATA.useFileStorage;
    this.initialized = false;
  }

  /**
   * Initialize the data service
   * Loads data from file (if available) or uses default data
   */
  async initialize() {
    if (this.initialized) return;

    try {
      if (this.useFileStorage) {
        await this.loadFromFile();
      } else {
        // Netlify mode: use default data
        await this.loadDefaultData();
      }
      
      this.initialized = true;
      logger.info('Data service initialized', {
        mode: this.useFileStorage ? 'file-storage' : 'in-memory',
        itemCount: this.items.length
      });
    } catch (error) {
      logger.error('Failed to initialize data service', { error: error.message });
      // Fall back to default data
      await this.loadDefaultData();
      this.initialized = true;
    }
  }

  /**
   * Load data from JSON file (development mode)
   */
  async loadFromFile() {
    try {
      // Ensure data directory exists
      const dataDir = path.dirname(this.dataFilePath);
      await fs.mkdir(dataDir, { recursive: true });

      // Try to read existing file
      const data = await fs.readFile(this.dataFilePath, 'utf8');
      this.items = JSON.parse(data);
      logger.info(`Loaded ${this.items.length} items from file`, { filePath: this.dataFilePath });
    } catch (error) {
      if (error.code === 'ENOENT') {
        // File doesn't exist, create it with default data
        logger.info('Data file not found, creating with default data');
        await this.loadDefaultData();
        await this.saveToFile();
      } else {
        throw error;
      }
    }
  }

  /**
   * Load default data (fallback or Netlify mode)
   */
  async loadDefaultData() {
    // Load from the original items.json file
    try {
      const originalDataPath = path.join(process.cwd(), 'items.json');
      const data = await fs.readFile(originalDataPath, 'utf8');
      this.items = JSON.parse(data);
      logger.info(`Loaded ${this.items.length} default items`);
    } catch (error) {
      // Fallback to hardcoded data if items.json is missing
      logger.warn('Could not load items.json, using hardcoded fallback data');
      this.items = [
        { id: 1, name: "Apple", category: "Fruit", price: 0.5, quantity: 25, inStock: true },
        { id: 2, name: "Banana", category: "Fruit", price: 0.3, quantity: 15, inStock: true },
        { id: 3, name: "Carrot", category: "Vegetable", price: 0.2, quantity: 0, inStock: false },
        { id: 4, name: "Bread", category: "Bakery", price: 1.5, quantity: 8, inStock: true },
        { id: 5, name: "Milk", category: "Dairy", price: 1.0, quantity: 0, inStock: false }
      ];
    }
  }

  /**
   * Get default data array
   */
  getDefaultData() {
    return [
      { id: 1, name: "Apple", category: "Fruit", price: 0.5, quantity: 25, inStock: true },
      { id: 2, name: "Banana", category: "Fruit", price: 0.3, quantity: 15, inStock: true },
      { id: 3, name: "Carrot", category: "Vegetable", price: 0.2, quantity: 0, inStock: false },
      { id: 4, name: "Bread", category: "Bakery", price: 1.5, quantity: 8, inStock: true },
      { id: 5, name: "Milk", category: "Dairy", price: 1.0, quantity: 0, inStock: false }
    ];
  }

  /**
   * Save data to file (development mode only)
   */
  async saveToFile() {
    if (!this.useFileStorage) {
      logger.debug('File storage disabled, skipping save');
      return;
    }

    try {
      const dataDir = path.dirname(this.dataFilePath);
      
      // Use sync methods in test environment for mocking
      if (process.env.NODE_ENV === 'test') {
        if (!fsSync.existsSync(dataDir)) {
          fsSync.mkdirSync(dataDir, { recursive: true });
        }
        fsSync.writeFileSync(this.dataFilePath, JSON.stringify(this.items, null, 2));
      } else {
        await fs.mkdir(dataDir, { recursive: true });
        await fs.writeFile(this.dataFilePath, JSON.stringify(this.items, null, 2));
      }
      
      logger.debug(`Saved ${this.items.length} items to file`);
    } catch (error) {
      logger.error('Failed to save data to file', { error: error.message });
      throw error;
    }
  }

  /**
   * Get all items
   */
  async getAllItems() {
    if (!this.initialized) await this.initialize();
    return [...this.items]; // Return a copy
  }

  /**
   * Get item by ID
   */
  async getItemById(id) {
    if (!this.initialized) await this.initialize();
    return this.items.find(item => item.id === parseInt(id));
  }

  /**
   * Create new item
   */
  async createItem(itemData) {
    if (!this.initialized) await this.initialize();
    
    const newItem = {
      id: this.getNextId(),
      ...itemData,
      price: parseFloat(itemData.price),
      quantity: parseInt(itemData.quantity) || 0
    };

    this.items.push(newItem);
    
    try {
      await this.saveToFile();
      logger.info('Item created', { itemId: newItem.id, name: newItem.name });
      return newItem;
    } catch (error) {
      // Rollback on save failure
      this.items.pop();
      throw error;
    }
  }

  /**
   * Update existing item
   */
  async updateItem(id, updateData) {
    if (!this.initialized) await this.initialize();
    
    const itemIndex = this.items.findIndex(item => item.id === parseInt(id));
    if (itemIndex === -1) {
      return null;
    }

    const currentItem = this.items[itemIndex];
    const updatedItem = {
      ...currentItem,
      ...updateData,
      id: currentItem.id, // ID should not change
      price: updateData.price !== undefined ? parseFloat(updateData.price) : currentItem.price,
      quantity: updateData.quantity !== undefined ? parseInt(updateData.quantity) : currentItem.quantity
    };

    // Store backup for rollback
    const backup = { ...currentItem };
    this.items[itemIndex] = updatedItem;

    try {
      await this.saveToFile();
      logger.info('Item updated', { itemId: id, name: updatedItem.name });
      return updatedItem;
    } catch (error) {
      // Rollback on save failure
      this.items[itemIndex] = backup;
      throw error;
    }
  }

  /**
   * Delete item
   */
  async deleteItem(id) {
    if (!this.initialized) await this.initialize();
    
    const itemIndex = this.items.findIndex(item => item.id === parseInt(id));
    if (itemIndex === -1) {
      return null;
    }

    const deletedItem = this.items.splice(itemIndex, 1)[0];

    try {
      await this.saveToFile();
      logger.info('Item deleted', { itemId: id, name: deletedItem.name });
      return deletedItem;
    } catch (error) {
      // Rollback on save failure
      this.items.splice(itemIndex, 0, deletedItem);
      throw error;
    }
  }

  /**
   * Reset data to defaults
   */
  async resetData() {
    if (!this.initialized) await this.initialize();
    
    const backup = [...this.items];
    
    try {
      await this.loadDefaultData();
      await this.saveToFile();
      logger.info('Data reset to defaults', { itemCount: this.items.length });
      return this.items.length;
    } catch (error) {
      // Rollback on failure
      this.items = backup;
      throw error;
    }
  }

  /**
   * Generate next available ID
   */
  getNextId() {
    if (this.items.length === 0) return 1;
    return Math.max(...this.items.map(item => item.id)) + 1;
  }

  /**
   * Get data statistics
   */
  async getStats() {
    if (!this.initialized) await this.initialize();
    
    const totalItems = this.items.length;
    const inStockItems = this.items.filter(item => item.inStock).length;
    const outOfStockItems = totalItems - inStockItems;
    const totalQuantity = this.items.reduce((sum, item) => sum + (item.quantity || 0), 0);
    const totalValue = this.items.reduce((sum, item) => sum + (item.price * (item.quantity || 0)), 0);

    return {
      totalItems,
      inStockItems,
      outOfStockItems,
      totalQuantity,
      totalValue: parseFloat(totalValue.toFixed(2)),
      categories: this.getCategoryStats()
    };
  }

  /**
   * Get category statistics
   */
  getCategoryStats() {
    const categoryStats = {};
    this.items.forEach(item => {
      if (!categoryStats[item.category]) {
        categoryStats[item.category] = { count: 0, totalQuantity: 0, totalValue: 0 };
      }
      categoryStats[item.category].count++;
      categoryStats[item.category].totalQuantity += item.quantity || 0;
      categoryStats[item.category].totalValue += item.price * (item.quantity || 0);
    });
    
    // Round values
    Object.values(categoryStats).forEach(stat => {
      stat.totalValue = parseFloat(stat.totalValue.toFixed(2));
    });
    
    return categoryStats;
  }

  /**
   * Initialize data directory and default data
   */
  initializeData() {
    const dataDir = path.dirname(this.dataFilePath);
    
    // Use sync methods in test environment
    if (process.env.NODE_ENV === 'test') {
      if (!fsSync.existsSync(dataDir)) {
        fsSync.mkdirSync(dataDir, { recursive: true });
      }
      if (!fsSync.existsSync(this.dataFilePath)) {
        fsSync.writeFileSync(this.dataFilePath, JSON.stringify(this.getDefaultData(), null, 2));
      }
    }
  }

  /**
   * Reset data to defaults
   */
  async resetToDefaults() {
    this.items = this.getDefaultData();
    await this.saveToFile();
    return { itemCount: this.items.length };
  }

  /**
   * Get statistics
   */
  getStatistics() {
    const totalItems = this.items.length;
    const totalValue = this.items.reduce((sum, item) => {
      return sum + (item.price * (item.quantity || 0));
    }, 0);
    
    return {
      totalItems,
      totalValue: parseFloat(totalValue.toFixed(2)),
      averagePrice: totalItems > 0 ? parseFloat((totalValue / totalItems).toFixed(2)) : 0,
      categories: this.getCategoryStats()
    };
  }
}

// Create singleton instance
const dataService = new DataService();

module.exports = dataService;