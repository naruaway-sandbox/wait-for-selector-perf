import * as puppeteer from "puppeteer";
import { chromium } from "playwright";

const targetPageUrl =
  "data:text/html," +
  encodeURIComponent(`
<!doctype html>
<html>
  <head>
    <meta charset="UTF-8" />
  </head>
  <body>
    <script>
      setTimeout(() => {
        document.body.innerHTML = '<a href="#">LINK</a>';
        window._appearanceTimeStamp = Date.now();
      }, 3000);
    </script>
  </body>
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

await instance.waitForA();
const waitFinishTimeStamp = Date.now();
const appearanceTimeStamp = await instance.evaluate(
  () => window._appearanceTimeStamp,
);
console.log(
  `${target}: It took ${
    waitFinishTimeStamp - appearanceTimeStamp
  }ms to react to the appearance of <a> element`,
);
await instance.close();
