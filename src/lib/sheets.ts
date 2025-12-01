import { google } from "googleapis";
import serviceAcc from "$lib/service-acc";

const creds = serviceAcc();
const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];
const auth = new google.auth.GoogleAuth({
  scopes: SCOPES,
  credentials: creds,
});
const sheets = google.sheets({ version: "v4", auth });
const sheetId = "1wG-PYckva-b5buAsl-R2atFYD0byaW4N0YdKd9XGBlE";

export async function get(range: string) {
  return await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range,
  });
}

export async function batchGet(ranges: string[]) {
  return await sheets.spreadsheets.values.batchGet({
    spreadsheetId: sheetId,
    ranges,
  });
}

export async function update(range: string, value: string) {
  if (value == null) {
    return await sheets.spreadsheets.values.update({
      spreadsheetId: sheetId,
      range,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [["TRUE"]],
      },
    });
  } else {
    return await sheets.spreadsheets.values.update({
      spreadsheetId: sheetId,
      range,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[value]],
      },
    });
  }
}
