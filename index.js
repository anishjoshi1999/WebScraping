const XLSX = require("xlsx");
const fs = require("fs");
const { processWebsite } = require("./scraping");

// Specify the path to your XLSX file
const filePath = "./myfile.xlsx";

// Read the XLSX file
const workbook = XLSX.readFile(filePath);

(async () => {
  async function processSheet(sheetIndex) {
    let sheetName = workbook.SheetNames[sheetIndex];
    const sheet = workbook.Sheets[sheetName];

    // Convert the sheet data to JSON
    const jsonData = XLSX.utils.sheet_to_json(sheet);

    for (let j = 0; j < jsonData.length; j++) {
      const Name = jsonData[j].Name;
      const Website = jsonData[j].Website;

      try {
        const Email = await processWebsite(Website);
        jsonData[j].Email = Email;
        // Now you can do whatever you want with the data
        console.log(`Email: ${Email}`);
        // Update the XLSX file with the modified data
        const updatedSheet = XLSX.utils.json_to_sheet(jsonData);
        workbook.Sheets[sheetName] = updatedSheet;
        XLSX.writeFile(workbook, filePath);
        console.log(`${j + 1} Record updated successfully`);
      } catch (error) {
        console.error(`Error processing data for URL: ${Website}`, error);
        // If an error occurs, you may choose to handle it here
        // For example, you could log the error, skip this record, or perform other actions
      }
    }

    console.log(`Scraping for sheet ${sheetName} successful`);
  }

  for (let i = 7; i < 8; i++) {
    await processSheet(i);
  }
})();
