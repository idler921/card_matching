import { test, expect } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test('card matching game loads', async ({ page }) => {
  await page.goto('file://' + path.join(__dirname, '..', 'index.html'));
  
  // Wait for cards to load
  await page.waitForSelector('.card');
  
  const cards = page.locator('.card');
  await expect(cards).toHaveCount(8);
  
  // Check initial state: no cards flipped
  for (let i = 0; i < 8; i++) {
    await expect(cards.nth(i)).not.toHaveClass(/flipped/);
  }
  
  // Click a card
  await cards.nth(0).click();
  await expect(cards.nth(0)).toHaveClass(/flipped/);
  await expect(cards.nth(0)).toContainText(/飯盒|盒飯|睇波|看球|魚蛋|魚丸子|起樓|蓋房子/);
});