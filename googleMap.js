const cheerio = require("cheerio");
const puppeteerExtra = require("puppeteer-extra");
const stealthPlugin = require("puppeteer-extra-plugin-stealth");
const fs = require("fs");
const { arrayToCSV } = require("./googleMaptoCSV");

async function searchGoogleMaps(cityName, stateName) {
  try {
    const start = Date.now();

    puppeteerExtra.use(stealthPlugin());

    const browser = await puppeteerExtra.launch({
      headless: false,
      args: ["--lang=en-US,en"],
      executablePath: "", // your path here
    });

    const page = await browser.newPage();

    const query = `Pharmacies in ${cityName} ${stateName} australia`;

    try {
      await page.goto(
        `https://www.google.com/maps/search/${query.split(" ").join("+")}`
      );
    } catch (error) {
      console.log("error going to page");
    }

    async function autoScroll(page) {
      await page.evaluate(async () => {
        const wrapper = document.querySelector('div[role="feed"]');

        await new Promise((resolve, reject) => {
          var totalHeight = 0;
          var distance = 1000;
          var scrollDelay = 3000;

          var timer = setInterval(async () => {
            var scrollHeightBefore = wrapper.scrollHeight;
            wrapper.scrollBy(0, distance);
            totalHeight += distance;

            if (totalHeight >= scrollHeightBefore) {
              totalHeight = 0;
              await new Promise((resolve) => setTimeout(resolve, scrollDelay));

              var scrollHeightAfter = wrapper.scrollHeight;

              if (scrollHeightAfter > scrollHeightBefore) {
                return;
              } else {
                clearInterval(timer);
                resolve();
              }
            }
          }, 200);
        });
      });
    }

    await autoScroll(page);

    const html = await page.content();
    const pages = await browser.pages();
    await Promise.all(pages.map((page) => page.close()));

    await browser.close();
    console.log("browser closed");

    const $ = cheerio.load(html);
    const aTags = $("a");
    const parents = [];

    aTags.each((i, el) => {
      const href = $(el).attr("href");
      if (!href) {
        return;
      }
      if (href.includes("/maps/place/")) {
        parents.push($(el).parent());
      }
    });

    console.log("parents", parents.length);

    const businesses = [];

    parents.forEach((parent) => {
      const url = parent.find("a").attr("href");
      const storeName = parent.find("div.fontHeadlineSmall").text();
      const bodyDiv = parent.find("div.fontBodyMedium").first();
      const children = bodyDiv.children();
      const lastChild = children.last();
      const firstOfLast = lastChild.children().first();
      const lastOfLast = lastChild.children().last();
      const website = parent.find(".S9kvJb").attr("href");

      let business = {
        storeName,
        address: firstOfLast?.text()?.split("·")?.[1]?.trim(),
        phone: lastOfLast?.text()?.split("·")?.[1]?.trim(),
        Website: website,
      };
      console.log(business);
      businesses.push(business);
    });

    const end = Date.now();
    console.log(`time in seconds ${Math.floor((end - start) / 1000)}`);
    // Convert the array of objects to CSV
    const csvString = arrayToCSV(businesses);
    // Save the CSV string to a file
    fs.writeFileSync(`output${cityName}_${stateName}.csv`, csvString);
  } catch (error) {
    console.log("error at googleMaps", error.message);
  }
}
let citiesNewSouthWales = [
  // "Sydney",
  // "Newcastle",
  // "Central Coast",
  // "Wollongong",
  // "Maitland",
  // "Blue Mountains",
  // "Tweed Heads",
  // "Coffs Harbour",
  // "Wagga Wagga",
  // "Albury",
  // "Port Macquarie",
  // "Tamworth",
  // "Dubbo",
  // "Orange",
  // "Nowra - Bomaderry",
  // "Queanbeyan",
  // "Bathurst",
  // "Lismore",
  // "Bowral - Mittagong",
  // "Armidale",
  // "Goulburn",
  // "Cessnock",
  // "Nelson Bay",
  // "Kurri Kurri",
  // "Forster - Tuncurry",
  // "Griffith",
  // "Grafton",
  // "Ballina",
  // "Morisset - Cooranbong",
  // "Broken Hill",
  // "Batemans Bay",
  // "Ulladulla",
  // "Singleton",
  // "Taree",
  // "Kempsey",
  // "St Georges Basin - Sanctuary Point",
  // "Kiama",
  // "Raymond Terrace",
  // "Mudgee",
  // "Lithgow",
  // "Muswellbrook",
  // "Inverell",
  // "Merimbula",
  // "Parkes",
  // "Casino",
  // "Byron Bay",
  // "Young",
  // "Gunnedah",
  // "Cowra",
  // "Murwillumbah",
  // "Moss Vale",
  // "Leeton",
  // "Moree",
  // "Forbes",
  // "Lennox Head",
  // "Deniliquin",
  // "Narrabri",
  // "Moama",
  // "Cootamundra",
  // "Yass",
  // "Cooma",
  // "Nambucca Heads",
  // "Tumut",
  // "Wauchope",
  // "Yamba",
  // "Glen Innes",
  // "Woolgoolga",
  // "Alstonville",
  // "Wingham",
  // "South West Rocks",
];
for (let i = 0; i < citiesNewSouthWales.length; i++) {
  searchGoogleMaps(citiesNewSouthWales[i], "New South Wales");
}
// let value = searchGoogleMaps();
