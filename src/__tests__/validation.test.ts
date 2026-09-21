// Basic test to verify Jest setup works
describe('Jest Setup', () => {
  test('should be true', () => {
    expect(true).toBe(true);
  });
});

// Test for validation schemas
import { materialSchema, movementSchema } from '../lib/validation/schemas';

describe('Validation Schemas', () => {
  test('materialSchema should validate correct data', () => {
    const result = materialSchema.safeParse({
      name: 'Test Material',
      unit: 'kg',
      minStock: 10,
      initialStock: 100,
      categoryId: 'cat-1',
      locationId: 'loc-1',
    });
    
    expect(result.success).toBe(true);
    expect(result.data).toEqual({
      name: 'Test Material',
      unit: 'kg',
      minStock: 10,
      initialStock: 100,
      categoryId: 'cat-1',
      locationId: 'loc-1',
    });
  });

  test('materialSchema should reject invalid data', () => {
    const result = materialSchema.safeParse({
      name: '', // Invalid: empty name
      unit: 'kg',
      minStock: -5, // Invalid: negative
    });
    
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  test('movementSchema should validate correct data', () => {
    const result = movementSchema.safeParse({
      materialId: 'mat-1',
      type: 'IN',
      quantity: 50,
      date: '2026-03-18T10:00',
      notes: 'Test movement',
    });
    
    expect(result.success).toBe(true);
    expect(result.data).toEqual({
      materialId: 'mat-1',
      type: 'IN',
      quantity: 50,
      date: '2026-03-18T10:00',
      notes: 'Test movement',
    });
  });

  test('movementSchema should reject invalid data', () => {
    const result = movementSchema.safeParse({
      materialId: '', // Invalid: empty ID
      type: 'INVALID', // Invalid: not IN/OUT
      quantity: -10, // Invalid: negative
      date: 'invalid-date', // Invalid: wrong format
    });
    
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });
});