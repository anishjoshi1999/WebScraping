const XLSX = require("xlsx");
const fs = require("fs");
const { searchGoogle } = require("./googleSearch");

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
      const name = jsonData[j].Name;
      const address = jsonData[j].Address;

      try {
        const addressInfo = await searchGoogle(name, address);
        jsonData[j].Suburb_PostalCode = addressInfo;
        // Now you can do whatever you want with the data
        console.log(`addressInfo: ${addressInfo}`);
        // Update the XLSX file with the modified data
        const updatedSheet = XLSX.utils.json_to_sheet(jsonData);
        workbook.Sheets[sheetName] = updatedSheet;
        XLSX.writeFile(workbook, filePath);
        console.log(`${j + 1} Record updated successfully`);
      } catch (error) {
        console.log(`Error processing data `, error);
        // If an error occurs, you may choose to handle it here
        // For example, you could log the error, skip this record, or perform other actions
      }
    }

    console.log(`Scraping for sheet ${sheetName} successful`);
  }

  for (let i = 0; i < 4; i++) {
    await processSheet(i);
  }
})();
