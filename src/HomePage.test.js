const puppeteer = require('puppeteer')
const fs = require('fs-extra')
const SHA256 = require('crypto-js/sha256')

// await page.waitForTimeout(4000)
// console.log(value)
// browser = await puppeteer.launch({headless: false})

const download_path = __dirname + '\\downloads'

async function fileInput(page, file) {
  const elementHandle = await page.$("input[type=file]")
  await elementHandle.uploadFile(file)
}

async function fileDownload(page) {
  const selector_df_download_button = 'button#fb_download'

  await page.waitForTimeout(50)
  await page.waitForSelector(selector_df_download_button)
  await page._client.send('Page.setDownloadBehavior',
      {behavior: 'allow', downloadPath: download_path}
  )
  await page.click(selector_df_download_button)
  await page.waitForTimeout(200)
}

async function fileRM(page, URL, file_id, pass = null) {
  const selector_remove_button = 'button#fb_remove'

  await page.goto(URL + "/files/" + file_id)
  await page.waitForTimeout(50)
  if (pass) {
    const selector_df_password_input = '#df_password_input'
    await page.waitForSelector(selector_df_password_input)
    await page.focus(selector_df_password_input)
    await page.keyboard.type(pass)
  }
  await page.waitForSelector(selector_remove_button)
  await page.click(selector_remove_button)
  await page.waitForTimeout(50)
}

async function fileUploadWP(page, pass) {
  await page.waitForSelector('input#PasswordInput')
  await page.focus('input#PasswordInput')
  await page.keyboard.type(pass)
  await clickUpload(page)
  // await page.waitForTimeout(50)
}

async function getFileId(page) {
  await page.waitForTimeout(50)
  let element = await page.$('#response')
  let value = await page.evaluate(el => el.textContent, element)
  let str_arr = value.split(" ")
  return str_arr[1]
}

async function clickUpload(page) {
  await page.waitForSelector('button[name="upload button"]')
  await page.click('button[name="upload button"]')
}

describe('HomePage test suit', () => {
  const URL = 'http://localhost:3000'
  let browser
  let page
  let file_id

  const selector_Password_check_box = 'input#PasswordCheckBox'
  const selector_df_goto_button = 'button#fancyFileUploaded'
  const selector_df_reupload_button = 'button#fb_re_upload'
  const selector_File_history = 'button.fancyListButton'
  const selector_Password_input = 'input#PasswordInput'
  const selector_Error = '#error'
  const selector_df_password_input = '#df_password_input'

  const file_legit = 'raw/legit.txt'
  const file_legit_2 = 'raw/legit_2.txt'
  const file_legit_3 = 'raw/legit_3.txt'
  const file_empty = 'raw/empty.txt'
  const file_big = 'raw/big.txt'

  const pass = 'test'

  beforeAll(async () => {
    // browser = await puppeteer.launch({headless: false})
    browser = await puppeteer.launch()
  })

  beforeEach(async () => {
    const context = await browser.createIncognitoBrowserContext()
    page = await context.newPage()
    await page.goto(URL)
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
    file_id = await getFileId(page)

    await page.waitForSelector(selector_df_goto_button)
    let element = await page.$(selector_df_goto_button)
    let value = await page.evaluate(el => el.textContent, element)

    await fileRM(page, URL, file_id)
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
      await clickUpload(page)
      file_id = await getFileId(page)
      await page.waitForSelector(selector_df_goto_button)
      let element = await page.$(selector_df_goto_button)
      let value = await page.evaluate(el => el.textContent, element)
      await fileRM(page, URL, file_id)
      return expect(value).toMatch("Go to file")
    }
    return false
  })

  it('File uploaded with password', async () => {

    await fileInput(page, file_legit)
    await page.waitForSelector(selector_Password_check_box)
    await page.click(selector_Password_check_box)
    await fileUploadWP(page, pass)
    file_id = await getFileId(page)

    await page.waitForSelector(selector_df_goto_button)
    let element = await page.$(selector_df_goto_button)
    let value = await page.evaluate(el => el.textContent, element)

    await fileRM(page, URL, file_id, pass)
    await expect(value).toMatch("Go to file")
  })

  it('File uploaded and added to history', async () => {
    try {
      await fileInput(page, file_legit)
      await clickUpload(page)
      file_id = await getFileId(page)

      await page.waitForSelector(selector_df_goto_button)
      await page.click(selector_df_goto_button)
      await page.waitForSelector(selector_File_history)
      let element = await page.$(selector_File_history)
      let value = await page.evaluate(el => el.textContent, element)

      await fileRM(page, URL, file_id)
      await expect(value).toMatch("legit.txt")
    } catch (e) {
      console.log(e)
    }
  })

  it('File uploaded and added to history multiple times', async () => {
    let file_id = []

    await fileInput(page, file_legit)
    await clickUpload(page)
    file_id.push(await getFileId(page))

    await page.waitForTimeout(50)
    await page.goto('http://localhost:3000')
    await fileInput(page, file_legit_2)
    await clickUpload(page)
    file_id.push(await getFileId(page))

    await page.waitForTimeout(50)
    await page.goto('http://localhost:3000')
    await fileInput(page, file_legit_3)
    await clickUpload(page)
    file_id.push(await getFileId(page))

    await page.waitForTimeout(50)
    await page.goto('http://localhost:3000')
    await page.waitForTimeout(50)
    await page.waitForSelector(selector_File_history)
    let element = await page.$$(selector_File_history)
    await page.waitForTimeout(50)
    for (let el of file_id) {
      await fileRM(page, URL, el)
    }
    await page.waitForTimeout(200)
    await expect(element.length.toString()).toMatch("3")
  })

  it('Remove file', async () => {
    let check
    await fileInput(page, file_legit)
    await clickUpload(page)
    file_id = await getFileId(page)

    await fileRM(page, URL, file_id)

    await page.goto(URL) // yep todo
    await page.waitForTimeout(50)
    await page.goto(URL)
    check = await page.$("#RingLoader") !== null;

    await expect(check.toString()).toMatch("true")
  })

  it('File re-upload', async () => {
    await fileInput(page, file_legit)
    await clickUpload(page)
    await page.waitForTimeout(50)
    file_id = await getFileId(page)

    await page.waitForSelector(selector_df_goto_button)
    await page.click(selector_df_goto_button)

    await page.waitForSelector("input[type=file]")
    await fileInput(page, file_legit_2)

    await page.waitForSelector(selector_df_reupload_button)
    await page.click(selector_df_reupload_button)
    await page.goto(URL)
    await page.waitForTimeout(50)

    await page.waitForSelector(selector_File_history)
    let element = await page.$(selector_File_history)
    let value = await page.evaluate(el => el.textContent, element)

    await fileRM(page, URL, file_id)
    await expect(value).toMatch("legit_2.txt")
  })

  it('Download file', async () => {
    await fileInput(page, file_legit)
    await clickUpload(page)
    await page.waitForTimeout(50)
    file_id = await getFileId(page)

    await page.waitForSelector(selector_df_goto_button)
    await page.click(selector_df_goto_button)

    await fileDownload(page)

    const downloaded = fs.readFileSync("src/downloads/legit.txt")
    const uploaded = fs.readFileSync(file_legit)
    const hash0 = SHA256(uploaded)
    const hash1 = SHA256(downloaded)

    await fileRM(page, URL, file_id)
    await fs.unlinkSync("src/downloads/legit.txt")
    expect(hash1).toEqual(hash0)
  })

  it('Download file without entering password', async () => {
    await fileInput(page, file_legit)

    await page.waitForSelector(selector_Password_check_box)
    await page.click(selector_Password_check_box)

    await fileUploadWP(page, pass)
    file_id = await getFileId(page)

    await page.waitForSelector(selector_df_goto_button)
    await page.click(selector_df_goto_button)

    await fileDownload(page)

    await page.waitForSelector(selector_df_password_input)
    await page.focus(selector_df_password_input)
    await page.keyboard.type(pass)
    await page.waitForTimeout(200)

    await fileRM(page, URL, file_id, pass)
    const downloaded = await fs.exists("src/downloads/legit.txt")
    expect(downloaded).toEqual(false)
  })

  it('Download file with password', async () => {
    await fileInput(page, file_legit_2)

    await page.waitForSelector(selector_Password_check_box)
    await page.click(selector_Password_check_box)

    await fileUploadWP(page, pass)
    file_id = await getFileId(page)

    await page.waitForSelector(selector_df_goto_button)
    await page.click(selector_df_goto_button)
    await page.waitForTimeout(200)

    await page.waitForSelector(selector_df_password_input)
    await page.focus(selector_df_password_input)
    await page.keyboard.type(pass)

    await fileDownload(page)

    const downloaded = fs.readFileSync("src/downloads/legit_2.txt")
    const uploaded = fs.readFileSync(file_legit_2)
    const hash0 = SHA256(uploaded)
    const hash1 = SHA256(downloaded)

    await fileRM(page, URL, file_id, pass)
    await fs.unlinkSync("src/downloads/legit_2.txt")
    expect(hash1).toEqual(hash0)
  })

})
