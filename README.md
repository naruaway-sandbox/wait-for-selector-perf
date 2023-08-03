# Puppeteer has much faster waitForSelector than Playwright

**Note that this repro just compares waitForSelector performance. This alone does NOT mean "Puppeteer is faster in general"**

Since Puppeteer is internally [using `polling: 'mutation'` option in `waitForFunction`](https://github.com/puppeteer/puppeteer/blob/9a814a365644a1e404eb36266a08f579bb2c26ac/packages/puppeteer-core/src/common/IsolatedWorld.ts#L443-L443) for `waitForSelector`, it will use MutationObserver to efficiently react to newly appeared DOM node.

On the other hand, Playwright removed `polling: 'mutation'` completely in [this PR](https://github.com/microsoft/playwright/pull/2048) and its `waitForSelector` is purely relying on repeated retries on the hardcoded intervals [here](https://github.com/microsoft/playwright/blob/b0473b71cd8ba183baa81547cb45013194251d13/packages/playwright-core/src/server/frames.ts#L777-L777).

This repro has minimal demo to reproduce the performance difference caused by this implementation difference.
Please check out `./main.js` to see what is benchmarked first.

## How to run the benchmark

```sh
npm ci
npm run puppeteer
npm run playwright
```

## The result in my environment

I ran the above on my MacBook Air (M2) and the result was the following:

```
puppeteer: It took 15ms to react to the appearance of <a> element
playwright: It took 328ms to react to the appearance of <a> element
```

So Puppeteer has around **20x faster** `waitForSelector` compared with the one from Playwright.
