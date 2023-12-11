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
    return { url, error: "Empty" };
  }
}

// Function to process a single website
async function processWebsite(url) {
  try {
    const result = await getEmailsFromWebsite(url);

    if (result.error) {
      console.error(`Error fetching or parsing ${result.url}:`, result.error);
    } else {
      let temp = result.emails.join(", ");
      return temp;
    }
  } catch (error) {
    console.error("Error processing website:", error);
  }
}

// Export the processWebsite function for use in other modules
module.exports = { processWebsite };
