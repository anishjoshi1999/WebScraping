const cheerio = require("cheerio");
const puppeteerExtra = require("puppeteer-extra");
const stealthPlugin = require("puppeteer-extra-plugin-stealth");

async function searchGoogle(Name, Address) {
  try {
    const start = Date.now();

    puppeteerExtra.use(stealthPlugin());

    const browser = await puppeteerExtra.launch({
      headless: false,
      args: ["--lang=en-US,en"],
      executablePath: "", // your path here
    });

    const page = await browser.newPage();

    const query = `${Name}, ${
      Address !== undefined ? Address : ""
    } in Australia`;

    try {
      await page.goto(
        `https://www.google.com/search?q=${query.split(" ").join("+")}`
      );
    } catch (error) {
      console.log("error going to page");
    }

    const html = await page.content();
    const pages = await browser.pages();
    await Promise.all(pages.map((page) => page.close()));

    await browser.close();
    console.log("browser closed");

    const $ = cheerio.load(html);

    // Extract address
    const address = $(
      ".wDYxhc[data-attrid='kc:/location/location:address'] .LrzXr"
    )
      .text()
      .trim();
    const end = Date.now();
    console.log(`time in seconds ${Math.floor((end - start) / 1000)}`);
    console.log("Address:", address);
    // 4 Prince of Wales Ave, South West Rocks NSW 2431, अस्ट्रेलिया
    let outputString = address.replace(/, अस्ट्रेलिया/g, "");
    return outputString;
  } catch (error) {
    console.log("error at googleMaps", error.message);
  }
}
module.exports = { searchGoogle };
