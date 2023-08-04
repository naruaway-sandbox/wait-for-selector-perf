import * as puppeteer from "puppeteer";
import { chromium } from "playwright";

const targetPageUrl = "data:text/html," +
  encodeURIComponent(`
<!doctype html>
<html>
  <head>
    <meta charset="UTF-8" />
  </head>
  <body></body>
</html>
`);

const target = process.env.TARGET;

const instance = await {
  puppeteer: async () => {
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    await page.goto(targetPageUrl);

    return {
      waitForA: () => page.waitForSelector("a"),
      close: () => browser.close(),
      evaluate: (fn) => page.evaluate(fn),
    };
  },
  playwright: async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    await page.goto(targetPageUrl);

    return {
      waitForA: () => page.waitForSelector("a"),
      close: () => browser.close(),
      evaluate: (fn) => page.evaluate(fn),
    };
  },
}[target]();

/*
 * This measures the duration between 3. and 4. in the following sequence.
 * Shorter duration means faster reaction of waitForSelector.
 *
 * 1. Start waitForA (waitForSelector)
 * 2. Sleep for enough duration
 * 3. Insert <a> tag
 * 4. waitForA resolves
 */
const runBenchmark = async (sleepDurationMs) => {
  let appearanceTimeStamp;

  instance.waitForA().then(async () => {
    const waitFinishTimeStamp = performance.now();

    console.log(
      `${target}: It took ${
        waitFinishTimeStamp - appearanceTimeStamp
      }ms to react to the appearance of <a> element`,
    );
    await instance.close();
  });

  setTimeout(() => {
    // Insert <a> tag in the DOM. Note that we know this evaluate() call itself is fast enough to be ignored (around 3ms for both Puppeteer and Playwright)
    instance.evaluate(() => document.body.innerHTML = '<a href="#">LINK</a>')
      .then(() => {
        appearanceTimeStamp = performance.now();
      });
  }, sleepDurationMs);
};

runBenchmark(3000);
