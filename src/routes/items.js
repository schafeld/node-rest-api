const express = require('express');
const itemController = require('../controllers/itemController');
const { validate } = require('../middleware/validation');

const router = express.Router();

/**
 * @swagger
 * /items:
 *   get:
 *     summary: Retrieve all items
 *     description: Get a paginated list of all items with optional filtering by category and search functionality
 *     tags: [Items]
 *     parameters:
 *       - $ref: '#/components/parameters/Page'
 *       - $ref: '#/components/parameters/Limit'
 *       - $ref: '#/components/parameters/Category'
 *       - $ref: '#/components/parameters/Search'
 *     responses:
 *       200:
 *         description: Items retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedResponse'
 *             examples:
 *               success:
 *                 summary: Successful response with items
 *                 value:
 *                   success: true
 *                   data:
 *                     items:
 *                       - id: 1
 *                         name: "Red Apple"
 *                         category: "Fruit"
 *                         price: 1.99
 *                         quantity: 50
 *                       - id: 2
 *                         name: "Organic Banana"
 *                         category: "Fruit"
 *                         price: 0.79
 *                         quantity: 30
 *                     pagination:
 *                       currentPage: 1
 *                       totalPages: 3
 *                       totalItems: 25
 *                       hasNext: true
 *                       hasPrev: false
 *                   message: "Items retrieved successfully"
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       429:
 *         $ref: '#/components/responses/RateLimited'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.get('/', 
  validate.listItems,
  itemController.getAllItems
);

/**
 * @swagger
 * /items/{id}:
 *   get:
 *     summary: Retrieve a specific item
 *     description: Get a single item by its unique identifier
 *     tags: [Items]
 *     parameters:
 *       - $ref: '#/components/parameters/ItemId'
 *     responses:
 *       200:
 *         description: Item retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             examples:
 *               success:
 *                 summary: Successful response with single item
 *                 value:
 *                   success: true
 *                   data:
 *                     id: 1
 *                     name: "Red Apple"
 *                     category: "Fruit"
 *                     price: 1.99
 *                     quantity: 50
 *                   message: "Item retrieved successfully"
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       429:
 *         $ref: '#/components/responses/RateLimited'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.get('/:id', 
  validate.itemId,
  itemController.getItemById
);

/**
 * @swagger
 * /items:
 *   post:
 *     summary: Create a new item
 *     description: Add a new item to the inventory with validation
 *     tags: [Items]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ItemInput'
 *           examples:
 *             fruit:
 *               summary: Create a fruit item
 *               value:
 *                 name: "Green Apple"
 *                 category: "Fruit"
 *                 price: 2.49
 *                 quantity: 25
 *             vegetable:
 *               summary: Create a vegetable item
 *               value:
 *                 name: "Fresh Carrots"
 *                 category: "Vegetable"
 *                 price: 1.99
 *                 quantity: 40
 *     responses:
 *       201:
 *         description: Item created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               success: true
 *               data:
 *                 id: 48
 *                 name: "Green Apple"
 *                 category: "Fruit"
 *                 price: 2.49
 *                 quantity: 25
 *               message: "Item created successfully"
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       429:
 *         $ref: '#/components/responses/RateLimited'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.post('/', 
  validate.createItem,
  itemController.createItem
);

/**
 * @swagger
 * /items/{id}:
 *   put:
 *     summary: Update an existing item
 *     description: Update all fields of an existing item by its ID
 *     tags: [Items]
 *     parameters:
 *       - $ref: '#/components/parameters/ItemId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ItemInput'
 *           examples:
 *             update_price:
 *               summary: Update item price and quantity
 *               value:
 *                 name: "Red Apple"
 *                 category: "Fruit"
 *                 price: 2.99
 *                 quantity: 75
 *     responses:
 *       200:
 *         description: Item updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               success: true
 *               data:
 *                 id: 1
 *                 name: "Red Apple"
 *                 category: "Fruit"
 *                 price: 2.99
 *                 quantity: 75
 *               message: "Item updated successfully"
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       429:
 *         $ref: '#/components/responses/RateLimited'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.put('/:id', 
  validate.itemId,
  validate.updateItem,
  itemController.updateItem
);

/**
 * @swagger
 * /items/{id}:
 *   delete:
 *     summary: Delete an item
 *     description: Remove an item from the inventory by its ID
 *     tags: [Items]
 *     parameters:
 *       - $ref: '#/components/parameters/ItemId'
 *     responses:
 *       200:
 *         description: Item deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: 'null'
 *                   example: null
 *                 message:
 *                   type: string
 *                   example: "Item deleted successfully"
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       429:
 *         $ref: '#/components/responses/RateLimited'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.delete('/:id', 
  validate.itemId,
  itemController.deleteItem
);

/**
 * @swagger
 * /items/reset:
 *   post:
 *     summary: Reset inventory to default data
 *     description: Reset all items to the original default dataset (useful for demo purposes)
 *     tags: [Items]
 *     responses:
 *       200:
 *         description: Items reset successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: 'null'
 *                   example: null
 *                 message:
 *                   type: string
 *                   example: "Items reset successfully to default data"
 *       429:
 *         $ref: '#/components/responses/RateLimited'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.post('/reset', 
  itemController.resetData
);

/**
 * @swagger
 * /stats:
 *   get:
 *     summary: Get inventory statistics
 *     description: Retrieve comprehensive statistics about the current inventory
 *     tags: [Statistics]
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Statistics'
 *                 message:
 *                   type: string
 *                   example: "Statistics retrieved successfully"
 *             example:
 *               success: true
 *               data:
 *                 totalItems: 47
 *                 totalValue: 234.56
 *                 categoryCounts:
 *                   Fruit: 12
 *                   Vegetable: 8
 *                   Dairy: 5
 *                   Bakery: 7
 *                   Beverage: 6
 *                   Snack: 4
 *                   Other: 5
 *                 averagePrice: 4.99
 *               message: "Statistics retrieved successfully"
 *       429:
 *         $ref: '#/components/responses/RateLimited'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.get('/stats',
  itemController.getStats
);

module.exports = router;