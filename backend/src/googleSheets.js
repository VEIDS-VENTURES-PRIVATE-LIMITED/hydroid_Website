import { google } from 'googleapis';

/**
 * Escapes formula characters (=, +, -, @, tab, carriage return)
 * to prevent CSV / Formula Injection attacks in Google Sheets or Excel.
 */
function sanitizeCell(val) {
  const str = String(val || '').trim();
  if (/^[=+\-@\t\r]/.test(str)) {
    return `'${str}`;
  }
  return str;
}

/**
 * Appends a new form submission row into the configured Google Sheet.
 *
 * @param {Object} params
 * @param {string} params.name
 * @param {string} [params.contactNumber]
 * @param {string} params.email
 * @param {string} params.city
 */
export async function appendInquiryToSheet({ name, contactNumber, email, city }) {
  const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const rawPrivateKey = process.env.GOOGLE_PRIVATE_KEY;
  const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;
  const sheetName = process.env.GOOGLE_SHEET_TAB_NAME || 'Inquiries';

  if (!serviceAccountEmail || !rawPrivateKey || !spreadsheetId) {
    throw new Error('Google Sheets configuration is incomplete in environment variables.');
  }

  // Handle both literal and escaped \n in private key
  const privateKey = rawPrivateKey.replace(/\\n/g, '\n');

  const auth = new google.auth.JWT({
    email: serviceAccountEmail,
    key: privateKey,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });

  // Format timestamp in local / ISO human readable format
  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);

  const rowValues = [
    timestamp,
    sanitizeCell(name),
    sanitizeCell(contactNumber || 'N/A'),
    sanitizeCell(email),
    sanitizeCell(city),
  ];

  try {
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${sheetName}!A:E`,
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: {
        values: [rowValues],
      },
    });
  } catch (err) {
    if (err.message && err.message.includes('Unable to parse range')) {
      // Fallback to primary sheet range if tab name doesn't match
      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: 'A:E',
        valueInputOption: 'USER_ENTERED',
        insertDataOption: 'INSERT_ROWS',
        requestBody: {
          values: [rowValues],
        },
      });
    } else {
      throw err;
    }
  }
}
