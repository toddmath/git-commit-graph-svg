import puppeteer from "puppeteer"
import { promisify } from "util"
import { exec } from "child_process"
// const util = require("util")
// const exec = util.promisify(require("child_process").exec)

// import { createEnum } from "./utils/index.js"

const pexec = promisify(exec)

const logRequest = req => console.log("Request was made =>", req.url())

async function runGitLog() {
  try {
    const { stdout, stderr } = await pexec(
      'git log --all --date-order --pretty="%h|%p|%d"'
    )
    console.log("stdout:", stdout)
    console.log("stderr:", stderr)
    return { stdout, stderr }
  } catch (error) {
    throw Error(`[Error] running git log: ${error.message}`)
  }
}

const DEFAULT_VIEWPORT = Object.freeze({
  width: 1600,
  height: 1000,
  deviceScaleFactor: 1,
})

const DEFAULT_NOTHEADLESS_OPTIONS = Object.freeze({
  headless: false,
  defaultViewport: DEFAULT_VIEWPORT,
})

const DEFAULT_HEADLESS_OPTIONS = Object.freeze({
  headless: true,
  defaultViewport: DEFAULT_VIEWPORT,
})

/**
 * Helper function to launch a puppetter browser.
 * @param {{headless: boolean, defaultVieport: {width: number, height: number, deviceScaleFactor: number}}} [options=DEFAULT_HEADLESS_OPTIONS]
 * @returns {puppeteer.Browser}
 */
async function launchBrowser(options = DEFAULT_HEADLESS_OPTIONS) {
  const browser = await puppeteer.launch(options)
  return browser
}

/**
 * Helper function to launch a broswer page inside puppeteer.
 * @param {puppeteer.Browser} browser puppeteer broswer object.
 * @returns {puppeteer.Page} puppeteer page.
 */
async function launchPage(browser) {
  const page = await browser.newPage()
  page.on("request", logRequest)
  page.on("dialog", async dialog => {
    console.log(dialog.message())
    await dialog.accept()
  })
  return page
}

/**
 * Get the "viewport" of the page, as reported by the page.
 * @param {puppeteer.Page} page
 * @returns {{ width: number, height: number, deviceScaleFactor: number }} Object with `clientWidth`, `clientHeight` and `window.devicePixelRatio`
 */
const getDimensions = async page => {
  const dimensions = await page.evaluate(() => ({
    width: document.documentElement.clientWidth,
    height: document.documentElement.clientHeight,
    deviceScaleFactor: window.devicePixelRatio,
  }))

  return dimensions
}

/**
 * get element from puppeteer page.
 * @param {puppeteer.Page} page
 * @param {string} selector
 * @returns {puppeteer.ElementHandle<Element>}
 */
const getElement = async (page, selector) => {
  const elem = await page.$(selector)
  return elem
}

/**
 * Click an element on puppeteer page.
 * @param {puppeteer.Page} page
 * @param {string} selector
 * @param {{ button: string, clickCount: number, delay: number }} options
 */
const clickElement = async (
  page,
  selector,
  options = { button: "left", clickCount: 1, delay: 0 }
) => {
  await page.click(selector, options)
}

/**
 * Type text into input field or other element.
 * @param {puppeteer.Page} page
 * @param {string} selector
 * @param {string} text
 */
const typeElement = async (page, selector, text) => {
  await page.type(selector, text)
}

async function getGraph(stdout) {
  const browser = await launchBrowser(DEFAULT_NOTHEADLESS_OPTIONS)
  const page = await browser.newPage()

  const { width, height, deviceScaleFactor } = await getDimensions(page)
  const biggerWindow = { width: width + 800, height: height + 400 }
  console.log({
    deviceScaleFactor,
    width,
    height,
  })

  await page.goto("http://bit-booster.com/graph.html", { waitUntil: "networkidle0" })
  /* click clear button to clear textare */
  // await clickElement(
  //   page,
  //   "body > table:nth-child(7) > tbody:nth-child(1) > tr:nth-child(1) > td:nth-child(1) > button:nth-child(5)"
  // )

  /* run cg(), the function tied to the onclick handler of the clear button element */
  await page.evaluate(() => {
    cg()
  })

  /* click on textarea */
  await clickElement(page, "#data")

  /* type output from git command into textarea */
  await typeElement(page, "#data", stdout.toString())

  // await clickElement(
  //   page,
  //   "body > table:nth-child(7) > tbody:nth-child(1) > tr:nth-child(1) > td:nth-child(1) > button:nth-child(7)"
  // )
  await page.evaluate(() => {
    dg(document.getElementById("data").value)
  })

  // page.on("dialog", async dialog => {
  //   console.log(dialog.message())
  //   await dialog.accept()
  // })

  await clickElement(page, "div#download a")

  page.removeListener("request", logRequest)
  await browser.close()
}

async function takeScreenShot(
  url = "http://bit-booster.com/graph.html",
  fileName = "graph.jpeg"
) {
  const browser = await launchBrowser({ headless: false })
  const page = await launchPage(browser)
  // page.on("request", logRequest)
  const { width, height, deviceScaleFactor } = await getDimensions(page)
  const biggerWindow = { width: width + 800, height: height + 400 }
  console.log({
    deviceScaleFactor,
    width: biggerWindow.width,
    height: biggerWindow.height,
  })
  await page.setViewport({
    width: biggerWindow.width,
    height: biggerWindow.height,
    deviceScaleFactor,
  })
  await page.goto(url, { waitUntil: "networkidle0" })
  await page.screenshot({
    path: fileName,
    type: "jpeg",
    quality: 90,
    fullPage: true,
  })
  page.removeListener("request", logRequest)
  await browser.close()
}

export { runGitLog, getGraph, takeScreenShot }
// module.exports = { getGraph, takeScreenShot }
