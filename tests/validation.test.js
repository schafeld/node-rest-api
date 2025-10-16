const Joi = require('joi');
const { validateItemData, validateItemId } = require('../src/utils/validation');

describe('Validation Utils Unit Tests', () => {
  describe('validateItemData', () => {
    const validItemData = {
      name: 'Test Item',
      category: 'Fruit',
      price: 9.99,
      quantity: 10
    };

    describe('Valid Data', () => {
      it('should validate correct item data', () => {
        const result = validateItemData(validItemData);
        expect(result.error).toBeUndefined();
        expect(result.value).toEqual(validItemData);
      });

      it('should apply default quantity when not provided', () => {
        const dataWithoutQuantity = { ...validItemData };
        delete dataWithoutQuantity.quantity;
        
        const result = validateItemData(dataWithoutQuantity);
        expect(result.error).toBeUndefined();
        expect(result.value.quantity).toBe(0);
      });

      it('should trim whitespace from name', () => {
        const dataWithWhitespace = {
          ...validItemData,
          name: '  Test Item  '
        };
        
        const result = validateItemData(dataWithWhitespace);
        expect(result.error).toBeUndefined();
        expect(result.value.name).toBe('Test Item');
      });

      it('should accept all valid categories', () => {
        const validCategories = ['Fruit', 'Vegetable', 'Dairy', 'Bakery', 'Beverage', 'Snack', 'Other'];
        
        validCategories.forEach(category => {
          const result = validateItemData({
            ...validItemData,
            category: category
          });
          expect(result.error).toBeUndefined();
        });
      });

      it('should accept decimal prices', () => {
        const dataWithDecimalPrice = {
          ...validItemData,
          price: 12.345 // Should be rounded to 2 decimal places
        };
        
        const result = validateItemData(dataWithDecimalPrice);
        expect(result.error).toBeUndefined();
        expect(result.value.price).toBe(12.35);
      });
    });

    describe('Invalid Data - Name Validation', () => {
      it('should reject missing name', () => {
        const dataWithoutName = { ...validItemData };
        delete dataWithoutName.name;
        
        const result = validateItemData(dataWithoutName);
        expect(result.error).toBeDefined();
        expect(result.error.details[0].path).toContain('name');
      });

      it('should reject empty name', () => {
        const result = validateItemData({
          ...validItemData,
          name: ''
        });
        expect(result.error).toBeDefined();
        expect(result.error.details[0].path).toContain('name');
      });

      it('should reject name that is too long', () => {
        const result = validateItemData({
          ...validItemData,
          name: 'A'.repeat(101) // Exceeds 100 character limit
        });
        expect(result.error).toBeDefined();
        expect(result.error.details[0].path).toContain('name');
      });

      it('should reject non-string name', () => {
        const result = validateItemData({
          ...validItemData,
          name: 123
        });
        expect(result.error).toBeDefined();
        expect(result.error.details[0].path).toContain('name');
      });
    });

    describe('Invalid Data - Category Validation', () => {
      it('should reject invalid category', () => {
        const result = validateItemData({
          ...validItemData,
          category: 'InvalidCategory'
        });
        expect(result.error).toBeDefined();
        expect(result.error.details[0].path).toContain('category');
      });

      it('should reject missing category', () => {
        const dataWithoutCategory = { ...validItemData };
        delete dataWithoutCategory.category;
        
        const result = validateItemData(dataWithoutCategory);
        expect(result.error).toBeDefined();
        expect(result.error.details[0].path).toContain('category');
      });

      it('should reject non-string category', () => {
        const result = validateItemData({
          ...validItemData,
          category: 123
        });
        expect(result.error).toBeDefined();
        expect(result.error.details[0].path).toContain('category');
      });
    });

    describe('Invalid Data - Price Validation', () => {
      it('should reject missing price', () => {
        const dataWithoutPrice = { ...validItemData };
        delete dataWithoutPrice.price;
        
        const result = validateItemData(dataWithoutPrice);
        expect(result.error).toBeDefined();
        expect(result.error.details[0].path).toContain('price');
      });

      it('should reject negative price', () => {
        const result = validateItemData({
          ...validItemData,
          price: -5.99
        });
        expect(result.error).toBeDefined();
        expect(result.error.details[0].path).toContain('price');
      });

      it('should reject zero price', () => {
        const result = validateItemData({
          ...validItemData,
          price: 0
        });
        expect(result.error).toBeDefined();
        expect(result.error.details[0].path).toContain('price');
      });

      it('should reject price that is too high', () => {
        const result = validateItemData({
          ...validItemData,
          price: 10001 // Exceeds 10000 limit
        });
        expect(result.error).toBeDefined();
        expect(result.error.details[0].path).toContain('price');
      });

      it('should reject non-numeric price', () => {
        const result = validateItemData({
          ...validItemData,
          price: 'expensive'
        });
        expect(result.error).toBeDefined();
        expect(result.error.details[0].path).toContain('price');
      });
    });

    describe('Invalid Data - Quantity Validation', () => {
      it('should reject negative quantity', () => {
        const result = validateItemData({
          ...validItemData,
          quantity: -5
        });
        expect(result.error).toBeDefined();
        expect(result.error.details[0].path).toContain('quantity');
      });

      it('should reject quantity that is too high', () => {
        const result = validateItemData({
          ...validItemData,
          quantity: 100001 // Exceeds 100000 limit
        });
        expect(result.error).toBeDefined();
        expect(result.error.details[0].path).toContain('quantity');
      });

      it('should reject non-integer quantity', () => {
        const result = validateItemData({
          ...validItemData,
          quantity: 5.5
        });
        expect(result.error).toBeDefined();
        expect(result.error.details[0].path).toContain('quantity');
      });

      it('should reject non-numeric quantity', () => {
        const result = validateItemData({
          ...validItemData,
          quantity: 'many'
        });
        expect(result.error).toBeDefined();
        expect(result.error.details[0].path).toContain('quantity');
      });
    });

    describe('Edge Cases', () => {
      it('should handle null input', () => {
        const result = validateItemData(null);
        expect(result.error).toBeDefined();
      });

      it('should handle undefined input', () => {
        const result = validateItemData(undefined);
        expect(result.error).toBeDefined();
      });

      it('should handle empty object', () => {
        const result = validateItemData({});
        expect(result.error).toBeDefined();
      });

      it('should ignore extra properties', () => {
        const dataWithExtraProps = {
          ...validItemData,
          extraProp: 'should be ignored',
          anotherId: 123
        };
        
        const result = validateItemData(dataWithExtraProps);
        expect(result.error).toBeUndefined();
        expect(result.value).not.toHaveProperty('extraProp');
        expect(result.value).not.toHaveProperty('anotherId');
      });
    });
  });

  describe('validateItemId', () => {
    describe('Valid IDs', () => {
      it('should validate positive integer', () => {
        const result = validateItemId(1);
        expect(result.error).toBeUndefined();
        expect(result.value).toBe(1);
      });

      it('should validate large positive integer', () => {
        const result = validateItemId(999999);
        expect(result.error).toBeUndefined();
        expect(result.value).toBe(999999);
      });

      it('should convert string numbers', () => {
        const result = validateItemId('123');
        expect(result.error).toBeUndefined();
        expect(result.value).toBe(123);
      });

      it('should convert string numbers with whitespace', () => {
        const result = validateItemId('  456  ');
        expect(result.error).toBeUndefined();
        expect(result.value).toBe(456);
      });
    });

    describe('Invalid IDs', () => {
      it('should reject negative numbers', () => {
        const result = validateItemId(-1);
        expect(result.error).toBeDefined();
        expect(result.error.details[0].path).toContain('id');
      });

      it('should reject zero', () => {
        const result = validateItemId(0);
        expect(result.error).toBeDefined();
        expect(result.error.details[0].path).toContain('id');
      });

      it('should reject decimal numbers', () => {
        const result = validateItemId(1.5);
        expect(result.error).toBeDefined();
        expect(result.error.details[0].path).toContain('id');
      });

      it('should reject non-numeric strings', () => {
        const result = validateItemId('abc');
        expect(result.error).toBeDefined();
        expect(result.error.details[0].path).toContain('id');
      });

      it('should reject null', () => {
        const result = validateItemId(null);
        expect(result.error).toBeDefined();
      });

      it('should reject undefined', () => {
        const result = validateItemId(undefined);
        expect(result.error).toBeDefined();
      });

      it('should reject objects', () => {
        const result = validateItemId({});
        expect(result.error).toBeDefined();
      });

      it('should reject arrays', () => {
        const result = validateItemId([]);
        expect(result.error).toBeDefined();
      });

      it('should reject boolean values', () => {
        const result = validateItemId(true);
        expect(result.error).toBeDefined();
      });
    });

    describe('Edge Cases', () => {
      it('should handle very large numbers within integer range', () => {
        const result = validateItemId(Number.MAX_SAFE_INTEGER);
        expect(result.error).toBeUndefined();
      });

      it('should reject numbers beyond safe integer range', () => {
        const result = validateItemId(Number.MAX_SAFE_INTEGER + 1);
        expect(result.error).toBeDefined();
      });

      it('should handle string representation of large numbers', () => {
        const result = validateItemId('1000000');
        expect(result.error).toBeUndefined();
        expect(result.value).toBe(1000000);
      });
    });
  });
});