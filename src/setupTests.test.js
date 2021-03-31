const puppeteer = require('puppeteer');
let browser;
let page;

describe('HomePage', () => {
  beforeAll(async () => {
    browser = await puppeteer.launch();
    page = await browser.newPage();
    await page.goto('http://localhost:3000/');
  });

  it('should be titled "React App"', async () => {
    await expect(page.title()).resolves.toMatch('React App');
  });
});
