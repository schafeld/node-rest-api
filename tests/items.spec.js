import { test, expect } from '@playwright/test';

test.describe('Items Store Manager', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for the page to load completely
    await page.waitForSelector('#itemsList');
  });

  test('should display the initial items', async ({ page }) => {
    // Check if initial items are displayed
    await expect(page.locator('.item-card')).toHaveCount(5);
    
    // Check if specific items exist
    await expect(page.locator('text=Apple')).toBeVisible();
    await expect(page.locator('text=Banana')).toBeVisible();
    await expect(page.locator('text=Carrot')).toBeVisible();
    await expect(page.locator('text=Bread')).toBeVisible();
    await expect(page.locator('text=Milk')).toBeVisible();
  });

  test('should have a working toggle switch', async ({ page }) => {
    // Find the toggle switch container (visible part)
    const toggleContainer = page.locator('.switch');
    await expect(toggleContainer).toBeVisible();
    
    // Find the actual input (hidden but functional)
    const toggleInput = page.locator('#itemInStock');
    
    // Check initial state (should be checked)
    await expect(toggleInput).toBeChecked();
    
    // Click the visible toggle container to toggle it
    await toggleContainer.click();
    await expect(toggleInput).not.toBeChecked();
    
    // Click again to check it
    await toggleContainer.click();
    await expect(toggleInput).toBeChecked();
  });

  test('should add a new item', async ({ page }) => {
    // Fill the form
    await page.fill('#itemName', 'Test Item');
    await page.selectOption('#itemCategory', 'Fruit');
    await page.fill('#itemPrice', '2.50');
    
    // Ensure toggle is checked
    const toggle = page.locator('#itemInStock');
    const toggleContainer = page.locator('.switch');
    if (!(await toggle.isChecked())) {
      await toggleContainer.click();
    }
    
    // Submit the form
    await page.click('#submitBtn');
    
    // Wait for the item to appear
    await page.waitForSelector('text=Test Item');
    
    // Check if the new item exists
    await expect(page.locator('text=Test Item')).toBeVisible();
    
    // Check if the count increased
    const itemCards = page.locator('.item-card');
    await expect(itemCards).toHaveCount(6);
  });

  test('should edit an item', async ({ page }) => {
    // Click the edit button for the first item (Apple)
    await page.click('.item-card:first-child .btn-icon.edit');
    
    // Check if the form is populated
    await expect(page.locator('#itemName')).toHaveValue('Apple');
    
    // Change the name
    await page.fill('#itemName', 'Green Apple');
    
    // Submit the form
    await page.click('#submitBtn');
    
    // Check if the item was updated
    await expect(page.locator('text=Green Apple')).toBeVisible();
    await expect(page.locator('text=Apple').first()).not.toBeVisible();
  });

  test('should delete an item', async ({ page }) => {
    // Listen to console messages for debugging
    page.on('console', msg => {
      if (msg.type() === 'error' || msg.text().includes('delete') || msg.text().includes('null')) {
        console.log('BROWSER CONSOLE:', msg.text());
      }
    });
    
    // Get initial count
    const initialCount = await page.locator('.item-card').count();
    console.log('Initial count:', initialCount);
    
    // Click delete button for the first item
    await page.click('.item-card:first-child .btn-icon.delete');
    
    // Confirm deletion in the dialog
    page.once('dialog', dialog => {
      console.log('Dialog text:', dialog.message());
      dialog.accept();
    });
    
    // Wait for the item to be removed
    await page.waitForTimeout(1000);
    
    // Check if count decreased
    const newCount = await page.locator('.item-card').count();
    console.log('New count:', newCount);
    expect(newCount).toBe(initialCount - 1);
  });

  test('should reset to default data', async ({ page }) => {
    // Add a new item first
    await page.fill('#itemName', 'Temporary Item');
    await page.selectOption('#itemCategory', 'Fruit');
    await page.fill('#itemPrice', '1.00');
    await page.click('#submitBtn');
    
    // Wait for item to be added
    await page.waitForSelector('text=Temporary Item');
    
    // Verify we have more than 5 items
    const itemsBeforeReset = await page.locator('.item-card').count();
    expect(itemsBeforeReset).toBeGreaterThan(5);
    
    // Click reset button
    await page.click('text=Reset to Sample Data');
    
    // Confirm reset in dialog
    page.once('dialog', dialog => dialog.accept());
    
    // Wait for reset to complete
    await page.waitForTimeout(1000);
    
    // Check if we're back to 5 original items
    await expect(page.locator('.item-card')).toHaveCount(5);
    
    // Check if temporary item is gone
    await expect(page.locator('text=Temporary Item')).not.toBeVisible();
    
    // Check if original items are back
    await expect(page.locator('text=Apple')).toBeVisible();
    await expect(page.locator('text=Banana')).toBeVisible();
  });

  test('should display toggle switch with proper styling', async ({ page }) => {
    const toggle = page.locator('.switch');
    await expect(toggle).toBeVisible();
    
    // Check if slider exists
    const slider = page.locator('.slider');
    await expect(slider).toBeVisible();
    
    // Get computed styles to verify CSS is applied
    const sliderStyles = await slider.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return {
        borderRadius: styles.borderRadius,
        backgroundColor: styles.backgroundColor,
        position: styles.position
      };
    });
    
    expect(sliderStyles.position).toBe('absolute');
    expect(sliderStyles.borderRadius).toBe('16px');
  });
});