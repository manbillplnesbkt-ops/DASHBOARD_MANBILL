
/**
 * GOOGLE APPS SCRIPT - DASHBOARD CONNECTOR
 * Pasang kode ini di Extensions > Apps Script pada Google Sheet Anda.
 */

const SHEET_ID = '1k5pvZnvK7xkC9lTgirWEXxfQZ5xgX4-GiRfD5JlmPHg';
const SHEET_NAME = 'DATA LPB';

function doGet(e) {
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAME);
    
    if (!sheet) {
      throw new Error("Sheet dengan nama '" + SHEET_NAME + "' tidak ditemukan.");
    }
    
    const data = sheet.getDataRange().getValues();
    
    // Konversi ke CSV String (lebih ringan daripada JSON untuk data besar)
    const csvContent = data.map(row => {
      return row.map(cell => {
        // Handle newline dan tanda kutip dalam data
        let val = String(cell).replace(/"/g, '""');
        return '"' + val + '"';
      }).join(',');
    }).join('\n');
    
    return ContentService.createTextOutput(csvContent)
      .setMimeType(ContentService.MimeType.TEXT);
      
  } catch (error) {
    return ContentService.createTextOutput("Error: " + error.message)
      .setMimeType(ContentService.MimeType.TEXT);
  }
}
