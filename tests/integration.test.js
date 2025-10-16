const request = require('supertest');
const app = require('../src/app');

describe('Items API Integration Tests', () => {
  let server;

  beforeAll(() => {
    // Start server for testing
    server = app.listen(0); // Use random available port
  });

  afterAll((done) => {
    server.close(done);
  });

  describe('GET /api/v1/items', () => {
    it('should return paginated items with success response', async () => {
      const response = await request(app)
        .get('/api/v1/items')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: expect.objectContaining({
          items: expect.any(Array),
          pagination: expect.objectContaining({
            currentPage: expect.any(Number),
            totalPages: expect.any(Number),
            totalItems: expect.any(Number),
            hasNext: expect.any(Boolean),
            hasPrev: expect.any(Boolean)
          })
        }),
        message: expect.any(String)
      });
    });

    it('should handle pagination parameters', async () => {
      const response = await request(app)
        .get('/api/v1/items?page=1&limit=5')
        .expect(200);

      expect(response.body.data.pagination.currentPage).toBe(1);
      expect(response.body.data.items.length).toBeLessThanOrEqual(5);
    });

    it('should handle category filtering', async () => {
      const response = await request(app)
        .get('/api/v1/items?category=Fruit')
        .expect(200);

      if (response.body.data.items.length > 0) {
        response.body.data.items.forEach(item => {
          expect(item.category).toBe('Fruit');
        });
      }
    });

    it('should handle search functionality', async () => {
      const response = await request(app)
        .get('/api/v1/items?search=apple')
        .expect(200);

      if (response.body.data.items.length > 0) {
        response.body.data.items.forEach(item => {
          expect(item.name.toLowerCase()).toContain('apple');
        });
      }
    });
  });

  describe('GET /api/v1/items/:id', () => {
    it('should return a specific item', async () => {
      const response = await request(app)
        .get('/api/v1/items/1')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: {
          item: expect.objectContaining({
            id: 1,
            name: expect.any(String),
            category: expect.any(String),
            price: expect.any(Number),
            quantity: expect.any(Number)
          })
        },
        message: expect.any(String)
      });
    });

    it('should return 404 for non-existent item', async () => {
      const response = await request(app)
        .get('/api/v1/items/999999')
        .expect(404);

      expect(response.body).toEqual({
        success: false,
        error: expect.objectContaining({
          code: 'NOT_FOUND',
          message: expect.stringContaining('Item with ID 999999 not found')
        }),
        timestamp: expect.any(String),
        requestId: expect.any(String)
      });
    });

    it('should return 400 for invalid item ID', async () => {
      const response = await request(app)
        .get('/api/v1/items/invalid-id')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('POST /api/v1/items', () => {
    it('should create a new item with valid data', async () => {
      const newItem = {
        name: 'Test Item',
        category: 'Other',
        price: 9.99,
        quantity: 10
      };

      const response = await request(app)
        .post('/api/v1/items')
        .send(newItem)
        .expect(201);

      expect(response.body).toEqual({
        success: true,
        data: {
          item: expect.objectContaining({
            id: expect.any(Number),
            name: 'Test Item',
            category: 'Other',
            price: 9.99,
            quantity: 10
          })
        },
        message: expect.stringContaining('created successfully')
      });
    });

    it('should validate required fields', async () => {
      const invalidItem = {
        category: 'Other',
        price: 9.99
      };

      const response = await request(app)
        .post('/api/v1/items')
        .send(invalidItem)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
      expect(response.body.error.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'name',
            message: expect.stringContaining('required')
          })
        ])
      );
    });

    it('should validate price constraints', async () => {
      const invalidItem = {
        name: 'Test Item',
        category: 'Other',
        price: -5.99, // Negative price
        quantity: 10
      };

      const response = await request(app)
        .post('/api/v1/items')
        .send(invalidItem)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'price',
            message: expect.stringContaining('positive')
          })
        ])
      );
    });

    it('should validate category enum values', async () => {
      const invalidItem = {
        name: 'Test Item',
        category: 'InvalidCategory',
        price: 9.99,
        quantity: 10
      };

      const response = await request(app)
        .post('/api/v1/items')
        .send(invalidItem)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'category',
            message: expect.stringContaining('must be one of')
          })
        ])
      );
    });
  });

  describe('PUT /api/v1/items/:id', () => {
    it('should update an existing item', async () => {
      const updateData = {
        name: 'Updated Item Name',
        category: 'Vegetable',
        price: 12.99,
        quantity: 15
      };

      const response = await request(app)
        .put('/api/v1/items/1')
        .send(updateData)
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: {
          item: expect.objectContaining({
            id: 1,
            name: 'Updated Item Name',
            category: 'Vegetable',
            price: 12.99,
            quantity: 15
          })
        },
        message: expect.stringContaining('updated successfully')
      });
    });

    it('should return 404 for updating non-existent item', async () => {
      const updateData = {
        name: 'Updated Item',
        category: 'Other',
        price: 9.99,
        quantity: 10
      };

      const response = await request(app)
        .put('/api/v1/items/999999')
        .send(updateData)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });
  });

  describe('DELETE /api/v1/items/:id', () => {
    it('should delete an existing item', async () => {
      // First create an item to delete
      const newItem = {
        name: 'Item to Delete',
        category: 'Other',
        price: 5.99,
        quantity: 1
      };

      const createResponse = await request(app)
        .post('/api/v1/items')
        .send(newItem)
        .expect(201);

      const itemId = createResponse.body.data.item.id;

      // Now delete it
      const response = await request(app)
        .delete(`/api/v1/items/${itemId}`);
      
      expect(response.status).toBe(200);

      expect(response.body).toEqual({
        success: true,
        data: { 
          deletedItem: expect.objectContaining({
            id: itemId,
            name: 'Item to Delete'
          })
        },
        message: expect.stringContaining('deleted successfully')
      });

      // Verify it's actually deleted
      await request(app)
        .get(`/api/v1/items/${itemId}`)
        .expect(404);
    });

    it('should return 404 for deleting non-existent item', async () => {
      const response = await request(app)
        .delete('/api/v1/items/999999')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });
  });

  describe('POST /api/v1/items/reset', () => {
    it('should reset items to default data', async () => {
      const response = await request(app)
        .post('/api/v1/items/reset')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: {
          itemCount: expect.any(Number)
        },
        message: expect.stringContaining('reset successfully')
      });

      // Verify items are reset by checking if we have default items
      const itemsResponse = await request(app)
        .get('/api/v1/items')
        .expect(200);

      expect(itemsResponse.body.data.items.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/v1/stats', () => {
    it('should return statistics about items', async () => {
      const response = await request(app)
        .get('/api/v1/stats')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: {
          stats: expect.objectContaining({
            totalItems: expect.any(Number),
            inStockItems: expect.any(Number),
            outOfStockItems: expect.any(Number),
            totalQuantity: expect.any(Number),
            totalValue: expect.any(Number),
            categories: expect.any(Object)
          })
        },
        message: expect.any(String)
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed JSON', async () => {
      const response = await request(app)
        .post('/api/v1/items')
        .set('Content-Type', 'application/json')
        .send('{"invalid": json}')
        .expect(400);

      expect(response.body.success).toBe(false);
    });



    it('should handle 404 for non-existent routes', async () => {
      const response = await request(app)
        .get('/api/v1/nonexistent')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });
  });

  describe('Security Headers', () => {


    it('should handle CORS', async () => {
      const response = await request(app)
        .options('/api/v1/items')
        .expect(204);

      expect(response.headers['access-control-allow-methods']).toContain('GET');
      expect(response.headers['access-control-allow-methods']).toContain('POST');
    });
  });
});