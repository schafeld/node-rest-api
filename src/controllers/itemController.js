const dataService = require('../services/dataService');
const { NotFoundError, InternalServerError } = require('../utils/errors');
const logger = require('../utils/logger');

class ItemController {
  /**
   * Get all items with optional filtering and pagination
   */
  async getAllItems(req, res, next) {
    try {
      let items = await dataService.getAllItems();
      
      // Apply filters if provided
      const { category, inStock, search, sortBy, sortOrder, page, limit } = req.query;
      
      // Filter by category
      if (category) {
        items = items.filter(item => item.category === category);
      }
      
      // Filter by stock status
      if (inStock !== undefined) {
        items = items.filter(item => item.inStock === inStock);
      }
      
      // Search filter (name contains search term)
      if (search) {
        const searchTerm = search.toLowerCase();
        items = items.filter(item => 
          item.name.toLowerCase().includes(searchTerm) ||
          item.category.toLowerCase().includes(searchTerm)
        );
      }
      
      // Sort items
      items.sort((a, b) => {
        let aValue = a[sortBy];
        let bValue = b[sortBy];
        
        // Handle string comparison
        if (typeof aValue === 'string') {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }
        
        if (sortOrder === 'desc') {
          return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
        } else {
          return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
        }
      });
      
      // Calculate pagination
      const totalItems = items.length;
      const totalPages = Math.ceil(totalItems / limit);
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedItems = items.slice(startIndex, endIndex);
      
      res.json({
        success: true,
        data: {
          items: paginatedItems,
          pagination: {
            currentPage: page,
            totalPages,
            totalItems,
            limit,
            hasNext: page < totalPages,
            hasPrev: page > 1
          }
        },
        message: `Retrieved ${paginatedItems.length} items successfully`
      });
      
    } catch (error) {
      logger.error('Error retrieving items', { error: error.message });
      next(new InternalServerError('Failed to retrieve items'));
    }
  }

  /**
   * Get item by ID
   */
  async getItemById(req, res, next) {
    try {
      const { id } = req.params;
      const item = await dataService.getItemById(id);
      
      if (!item) {
        return next(new NotFoundError(`Item with ID ${id}`));
      }
      
      res.json({
        success: true,
        data: { item },
        message: 'Item retrieved successfully'
      });
      
    } catch (error) {
      logger.error('Error retrieving item by ID', { 
        itemId: req.params.id, 
        error: error.message 
      });
      next(new InternalServerError('Failed to retrieve item'));
    }
  }

  /**
   * Create new item
   */
  async createItem(req, res, next) {
    try {
      const newItem = await dataService.createItem(req.body);
      
      res.status(201).json({
        success: true,
        data: { item: newItem },
        message: `Item "${newItem.name}" created successfully`
      });
      
    } catch (error) {
      logger.error('Error creating item', { 
        itemData: req.body, 
        error: error.message 
      });
      next(new InternalServerError('Failed to create item'));
    }
  }

  /**
   * Update existing item
   */
  async updateItem(req, res, next) {
    try {
      const { id } = req.params;
      const updatedItem = await dataService.updateItem(id, req.body);
      
      if (!updatedItem) {
        return next(new NotFoundError(`Item with ID ${id}`));
      }
      
      res.json({
        success: true,
        data: { item: updatedItem },
        message: `Item "${updatedItem.name}" updated successfully`
      });
      
    } catch (error) {
      logger.error('Error updating item', { 
        itemId: req.params.id, 
        updateData: req.body, 
        error: error.message 
      });
      next(new InternalServerError('Failed to update item'));
    }
  }

  /**
   * Delete item
   */
  async deleteItem(req, res, next) {
    try {
      const { id } = req.params;
      const deletedItem = await dataService.deleteItem(id);
      
      if (!deletedItem) {
        return next(new NotFoundError(`Item with ID ${id}`));
      }
      
      res.json({
        success: true,
        data: { deletedItem },
        message: `Item "${deletedItem.name}" deleted successfully`
      });
      
    } catch (error) {
      logger.error('Error deleting item', { 
        itemId: req.params.id, 
        error: error.message 
      });
      next(new InternalServerError('Failed to delete item'));
    }
  }

  /**
   * Reset data to defaults
   */
  async resetData(req, res, next) {
    try {
      const itemCount = await dataService.resetData();
      
      res.json({
        success: true,
        data: { itemCount },
        message: `Data reset successfully. Restored ${itemCount} default items.`
      });
      
    } catch (error) {
      logger.error('Error resetting data', { error: error.message });
      next(new InternalServerError('Failed to reset data'));
    }
  }

  /**
   * Get statistics
   */
  async getStats(req, res, next) {
    try {
      const stats = await dataService.getStats();
      
      res.json({
        success: true,
        data: { stats },
        message: 'Statistics retrieved successfully'
      });
      
    } catch (error) {
      logger.error('Error retrieving statistics', { error: error.message });
      next(new InternalServerError('Failed to retrieve statistics'));
    }
  }
}

module.exports = new ItemController();