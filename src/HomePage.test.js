const puppeteer = require('puppeteer');
const async = require("async");

// await page.waitForTimeout(4000)
// console.log(value)
// browser = await puppeteer.launch({headless: false})

async function fileInput(page, file) {
  const elementHandle = await page.$("input[type=file]")
  await elementHandle.uploadFile(file)
}

async function clickUpload(page) {
  await page.waitForSelector('button[name="upload button"]')
  await page.click('button[name="upload button"]')
}

describe('HomePage test suit', () => {
  let browser
  let page

  const selector_Password_check_box = 'input#PasswordCheckBox'
  const selector_Password_input = 'input#PasswordInput'
  const selector_File_goto_button = 'button#fancyFileUploaded'
  const selector_re_upload_button = 'button#fb_re_upload'
  const selector_remove_button = 'button#fb_remove'
  const selector_Error = '#error'
  const selector_File_history = 'button.fancyListButton'

  const file_legit = 'raw/legit.txt'
  const file_legit_2 = 'raw/legit_2.txt'
  const file_legit_3 = 'raw/legit_3.txt'
  const file_empty = 'raw/empty.txt'
  const file_big = 'raw/big.txt'

  beforeAll(async () => {
    // browser = await puppeteer.launch({headless: false})
    browser = await puppeteer.launch()
  })

  beforeEach(async () => {
    const context = await browser.createIncognitoBrowserContext()
    page = await context.newPage()
    await page.goto('http://localhost:3000')
  })

  afterEach(async () => {
    await page.close()
  })

  afterAll(async () => {
    await browser.close()
  })

  it('Simple upload legit file', async () => {

    await fileInput(page, file_legit)
    await clickUpload(page)
    await page.waitForSelector(selector_File_goto_button)
    let element = await page.$(selector_File_goto_button)
    let value = await page.evaluate(el => el.textContent, element)

    await expect(value).toMatch("Go to file")
  })

  it('File upload with empty file', async () => {
    await fileInput(page, file_empty)
    await clickUpload(page)
    await page.waitForSelector(selector_Error)
    let element = await page.$(selector_Error)
    let value = await page.evaluate(el => el.textContent, element)

    await expect(value).toMatch("File size cannot be empty")
  })

  it('File upload with file exceeding 20MB', async () => {
    await fileInput(page, file_big)
    await clickUpload(page)
    await page.waitForSelector(selector_Error)
    let element = await page.$(selector_Error)
    let value = await page.evaluate(el => el.textContent, element)

    await expect(value).toMatch("File size cannot exceed 20MB")
  })

  it('File uploaded with empty password', async () => {

    await fileInput(page, file_legit)
    await page.waitForSelector(selector_Password_check_box)
    await page.click(selector_Password_check_box)
    await page.waitForSelector(selector_Password_input)
    let element = await page.$(selector_Password_input)
    let value = await page.evaluate(el => el.placeholder, element)
    if (value === "Password") {
      await page.waitForSelector(selector_File_goto_button)
      let element = await page.$(selector_File_goto_button)
      let value = await page.evaluate(el => el.textContent, element)
      return await expect(value).toMatch("Go to file")
    }
    return false
  })

  it('File uploaded with password', async () => {

    await fileInput(page, file_legit)
    await page.waitForSelector(selector_Password_check_box)
    await page.click(selector_Password_check_box)
    await page.waitForSelector(selector_Password_input)
    await page.focus(selector_Password_input)
    await page.keyboard.type('test')
    await clickUpload(page)
    await page.waitForSelector(selector_File_goto_button)
    let element = await page.$(selector_File_goto_button)
    let value = await page.evaluate(el => el.textContent, element)

    await expect(value).toMatch("Go to file")
  })

  it('File uploaded and added to history', async () => {
    try {
      await fileInput(page, file_legit)
      await clickUpload(page)
      await page.waitForSelector(selector_File_goto_button)
      await page.click(selector_File_goto_button)
      await page.waitForSelector(selector_File_history)
      let element = await page.$(selector_File_history)
      let value = await page.evaluate(el => el.textContent, element)

      await expect(value).toMatch("legit.txt")
    } catch (e) {
      console.log(e)
    }
  })

  it('File uploaded and added to history multiple times', async () => {
    try {
      await fileInput(page, file_legit)
      await clickUpload(page)
      await page.waitForTimeout(50)
      await page.goto('http://localhost:3000')
      await fileInput(page, file_legit_2)
      await clickUpload(page)
      await page.waitForTimeout(50)
      await page.goto('http://localhost:3000')
      await fileInput(page, file_legit_3)
      await clickUpload(page)
      await page.waitForTimeout(50)
      await page.goto('http://localhost:3000')
      await page.waitForTimeout(50)
      await page.waitForSelector(selector_File_history)
      let element = await page.$$(selector_File_history)
      await page.waitForTimeout(50)
      await expect(element.length.toString()).toMatch("3")
    } catch (e) {
      console.log(e)
    }
  })

  it('Remove file', async () => {
    let check
    await fileInput(page, file_legit)
    await clickUpload(page)
    await page.waitForSelector(selector_File_goto_button)
    await page.click(selector_File_goto_button)
    await page.waitForSelector(selector_remove_button)
    await page.click(selector_remove_button)
    await page.goto('http://localhost:3000') // aga nado pofiksit'
    await page.goto('http://localhost:3000')
    if (await page.$("#RingLoader") !== null)
      check = true
    else check = false

    await expect(check.toString()).toMatch("true")
  })

  it('File re-upload', async () => {
    await fileInput(page, file_legit)
    await clickUpload(page)
    await page.waitForSelector(selector_File_goto_button)
    await page.click(selector_File_goto_button)
    await page.waitForSelector(selector_re_upload_button)
    await fileInput(page, file_legit_2)
    await page.waitForSelector("input[type=file]")
    await page.click(selector_re_upload_button)
    await page.goto('http://localhost:3000')
    await page.waitForTimeout(50)
    await page.waitForSelector(selector_File_history)
    let element = await page.$(selector_File_history)
    let value = await page.evaluate(el => el.textContent, element)
    await expect(value).toMatch("legit_2.txt")
  })

  // it('', async () => {
  // })
  //
  // it('', async () => {
  // })
  //
  // it('', async () => {
  // })

})
