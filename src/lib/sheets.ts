import { google } from "googleapis";
import serviceAcc from "$lib/service-acc";
import { env } from "$env/dynamic/private";

const creds = serviceAcc();
const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];
const auth = new google.auth.GoogleAuth({
  scopes: SCOPES,
  credentials: creds,
});
const sheets = google.sheets({ version: "v4", auth });
let SHEET_ENTRY_FREEBIES_RANGE: string;

if (!env.SHEET_ID) {
  throw new Error("SHEET_ID env var undefined");
}
if (!env.SHEET_NAME) {
  throw new Error("SHEET_NAME env var undefined");
}
if (!env.SHEET_INFO) {
  throw new Error("SHEET_INFO env var undefined");
}
if (!env.SHEET_ENTRY_FREEBIES) {
  throw new Error("SHEET_ENTRY_FREEBIES env var undefined");
}
if (!env.SHEET_NAME_VIRTUAL) {
	throw new Error("SHEET_NAME_VIRTUAL env var undefined");
}
if (!env.SHEET_INFO_VIRTUAL) {
	throw new Error("SHEET_INFO_VIRTUAL env var undefined");
}

const SHEET_ID = env.SHEET_ID;
const SHEET_NAME = env.SHEET_NAME;
const SHEET_INFO = env.SHEET_INFO;
const SHEET_ENTRY_FREEBIES = env.SHEET_ENTRY_FREEBIES;
const SHEET_NAME_VIRTUAL = env.SHEET_NAME_VIRTUAL;
const SHEET_INFO_VIRTUAL = env.SHEET_INFO_VIRTUAL

try {
  const parsedFreebies = JSON.parse(SHEET_ENTRY_FREEBIES);
  const columnLetters = Object.values(parsedFreebies) as string[];
  if (columnLetters.length === 0) {
    throw new Error("Freebies environment variable is empty.");
  }
  columnLetters.sort();
  const startColumn = columnLetters[0];
  const endColumn = columnLetters[columnLetters.length - 1];
  SHEET_ENTRY_FREEBIES_RANGE = `${startColumn}:${endColumn}`;
} catch (e) {
  console.error("Error parsing or formatting SHEET_ENTRY_FREEBIES JSON:", e);
  throw new Error("SHEET_ENTRY_FREEBIES is not valid or cannot be formatted.");
}

export async function get(type: "physical" | "virtual") {
    if (type == "physical") {
        return await sheets.spreadsheets.values.get({
            spreadsheetId: SHEET_ID,
            range: SHEET_NAME + SHEET_INFO,
        });
    } else if (type == "virtual") {
        return await sheets.spreadsheets.values.get({
            spreadsheetId: SHEET_ID,
            range: SHEET_NAME_VIRTUAL + SHEET_INFO_VIRTUAL,
        });
    } else {
        return {
            data: null
        }
    }
}

export async function batchGet() {
  return await sheets.spreadsheets.values.batchGet({
    spreadsheetId: SHEET_ID,
    ranges: [SHEET_NAME + SHEET_INFO, SHEET_NAME + SHEET_ENTRY_FREEBIES_RANGE],
  });
}

export async function update(range: string, value?: string) {
  if (value == null) {
    return await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [["TRUE"]],
      },
    });
  } else {
    return await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[value]],
      },
    });
  }
}

export async function batchUpdate(ranges: string[]) {
	const data = ranges.map(r => ({
		range: `Sheet2!${r}`,
		values: [["TRUE"]]
	}));

	return await sheets.spreadsheets.values.batchUpdate({
		spreadsheetId: SHEET_ID,
		resource: {
			data,
			valueInputOption: "USER_ENTERED"
		}
	})
}
