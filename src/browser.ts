import path from "path";
import puppeteer from "puppeteer";
import { fileURLToPath } from "url";
import mime from "mime";
import { readFile } from "fs";
import adblock, { Rules } from "./adblocker.js";

// puppeteer.defau

const browser = await puppeteer.launch({
  // headless: false,
  defaultViewport: {
    width: 1280,
    height: 720,
  },
  args: [
    "--disable-web-security",
    "--disable-features=IsolateOrigins,site-per-process",
    "--use-gl=desktop",
    "--allow-file-access-from-files",
    "--silent-launch",
  ],
  userDataDir: "userdata",
  // dumpio: true,
  waitForInitialPage: false,
});

export default browser;

const base = path.join(fileURLToPath(import.meta.url), "../../web/");

const rules: Rules = {
  "*.doubleclick.net": [],
  "www.youtube.com": [
    "/youtubei/v1/player/ad_break",
    "/youtubei/v1/log_event*",
    "/ptracking*",
    "/api/stats/*",
    "/ad*",
    "/pagead*",
  ],
};

export async function create() {
  const page = await browser.newPage();
  try {
    await page.setBypassCSP(true);
    await page.setRequestInterception(true);
    page.on("request", (req) => {
      const url = new URL(req.url());

      if (adblock(rules, url)) {
        req.abort();
      } else if (url.hostname == "data") {
        const file = path.join(base, url.pathname);
        const contentType = mime.getType(file);
        readFile(file, (err, body) => {
          if (err) {
            req.respond({
              status: 404,
              contentType,
            });
          } else {
            req.respond({
              body,
              contentType,
            });
          }
        });
      } else {
        req.continue();
      }
    });
    return page;
  } catch (e) {
    await page.close({ runBeforeUnload: false });
    throw e;
  }
}
