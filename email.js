const axios = require("axios");
const cheerio = require("cheerio");

// Function to extract email addresses from a website using regex
async function getEmailsFromWebsite(url) {
  try {
    const response = await axios.get(url);
    const html = response.data;

    // Use cheerio to load the HTML content
    const $ = cheerio.load(html);

    // Extract email addresses using regex
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    const emails = html.match(emailRegex) || [];

    const uniqueEmails = [...new Set(emails)];

    return { url, emails: uniqueEmails };
  } catch (error) {
    return "Empty";
  }
}

// List of website links
const websiteLinks = [
  "https://www.terrywhitechemmart.com.au/stores/terrywhite-chemmart-esperance?utm_source=google&utm_medium=organic&utm_campaign=Google%20My%20Business&utm_content=TerryWhite%20Chemmart%20Esperance%20-%20Esperance&utm_term=plcid_8375819604839726737",
  "http://www.castletownchemist.com/",
  "https://yancheppharmacy.com.au/",
  "http://www.pharmacy777.com.au/",
  "https://yanchepbeachpharmacy.com.au/",
  "https://www.pharmacy777.com.au/find-a-pharmacy",
  "http://www.kimberleypharmacyservices.com.au/",
];

// Use Promise.all to make requests in parallel
async function processWebsites() {
  const promises = websiteLinks.map(getEmailsFromWebsite);

  try {
    const results = await Promise.all(promises);
    results.forEach((result) => {
      if (result.error) {
        console.error(`Error fetching or parsing ${result.url}:`, result.error);
      } else {
        console.log(`Emails from ${result.url}:`, result.emails);
      }
    });
  } catch (error) {
    console.error("Error processing websites:", error);
  }
}

// Call the function to start processing websites
processWebsites();
