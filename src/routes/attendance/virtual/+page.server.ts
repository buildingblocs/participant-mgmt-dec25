import type { Actions, PageServerLoad } from './$types';
import { fail } from '@sveltejs/kit';
import { get, update, batchUpdate } from '$lib/sheets';
import {env} from "$env/dynamic/private";

const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ['text/csv'];
const SHEET_NAME_VIRTUAL = env.SHEET_NAME_VIRTUAL;

const workshops = {
	"Git and Github": {
		hours: 2.5,
		col: "D1S1"
	},
	"HTML and CSS": {
		hours: 3,
		col: "D1S2"
	},
	"UI/UX and Figma": {
		hours: 2.5,
		col: "D1S3"
	},
	"JavaScript for Web Dev": {
		hours: 3.5,
		col: "D2S1"
	},
	"SQL Databases": {
		hours: 3,
		col: "D2S2"
	},
	"Tailwind CSS": {
		hours: 2,
		col: "D2S3"
	},
	"React and Next.js": {
		hours: 3,
		col: "D3S1"
	},
	"Anime.js": {
		hours: 3,
		col: "D3S2"
	}
}
type WorkshopKey = keyof typeof workshops;

const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K'];

async function fetchSheetData() {
	const result = await get("virtual");
	if (!result.data) {
		throw new Error("Unexpected data received");
	}
	return result;
}


export const actions = {
    mark: async (event) => {
        const formData = await event.request.formData();
        const file = formData.get("file") as File;
		const workshop = formData.get("workshop") as WorkshopKey;

        if (!file || file.size === 0) {
            return fail(400, { errorMsg: 'No file uploaded' });
        }

        if (!ALLOWED_TYPES.includes(file.type)) {
            return fail(400, {
                errorMsg: `Invalid file type. Allowed: ${ALLOWED_TYPES.join(', ')}`
            });
        }

        if (file.size > MAX_SIZE) {
            return fail(400, {
                errorMsg: 'File is too large. Max size is 5MB.'
            });
        }

			if (!workshop ||!workshops[workshop as WorkshopKey]) {
				return fail(400, {
					errorMsg: 'Invalid workshop selected. Please try again.'
				});
			}

        const text = await file.text();
        const rows = text.split('\n').map(row => row.split(','));
        const cleanRows = rows.filter(r => r.length > 1);

		// 1. find column to update
		const sheetReq = await fetchSheetData();
		const sheetData = sheetReq.data.values
		if (!sheetData) {
			return fail(502, {
				errorMsg: "Sheet data not received"
			})
		}
		const col = letters[sheetData[0].indexOf(workshops[workshop].col)]

			// 2. build index from cleanrows
			const googleIndex = [] as string[];
			cleanRows.slice(1).forEach((row) => {
				if (row[1] == "") {
					googleIndex.push(row[0])
				} else {
					googleIndex.push(`${row[0]} ${row[1]}`)
				}
			});
			const namesToMatch = new Set(googleIndex);

			// 3. match google full name against registration full name
			const ranges = []
			const unmatched = new Set();

			for (let i = 1; i < sheetData.length; i++) {
				const row = sheetData[i];
				const currentName = row[0];
				if (namesToMatch.has(currentName)) {
					// await update(`Sheet2!${col}${i+1}`);
					ranges.push(`${col}${i+1}`);
					namesToMatch.delete(currentName);
					unmatched.add(i + 1);
				}
			}

			// 4. match google full name against user-submitted name
			for (let i = 1; i < sheetData.length; i++) {
				const row = sheetData[i];
				const userNames = row[1];
				if (userNames) {
					const userNamesArray = userNames.split(',')
						.map(name => name.trim())
						.filter(name => name.length > 0);

					for (const name of userNamesArray) {
						if (namesToMatch.has(name)) {
							// await update(`Sheet2!${col}${i+1}`)
							ranges.push(`${col}${i+1}`);
							unmatched.add(i + 1);
							namesToMatch.delete(name);
							break;
						}
					}
				}
			}

			//5. update sheet
			try {
				await batchUpdate(ranges)
			} catch (e) {
				return fail(500, {errorMsg: String(e)})
			}

			// 6. return only unmatched rows
			const unmatchedRows = sheetData
				.map((row, idx) => ({ rowNumber: idx + 1, row }))
				.filter(({ rowNumber }) => rowNumber > 1 && !unmatched.has(rowNumber))
				.map(({ row }) => row);

			//7. get user to match names
        if (namesToMatch.size == 0) {
            return {
                state: "success"
            }
        } else {
            return {
                state: "intervention",
                left: Array.from(namesToMatch).map((name) => ({
					name: name,
					done: false
				})),
                list: unmatchedRows
            }
        }
    },
	markSpecific: async (event) => {
		const formData = await event.request.formData();
		const gmeetName = formData.get("uploadedName");
		const sheetName = formData.get("sheetName");
		const workshop = formData.get("workshop") as WorkshopKey;

		// 1. find column to update
		const sheetReq = await fetchSheetData();
		const sheetData = sheetReq.data.values
		if (!sheetData) {
			return fail(502, {
				errorMsg: "Sheet data not received"
			})
		}
		const col = letters[sheetData[0].indexOf(workshops[workshop].col)]

		console.log(sheetData)

		// 2. find row
		const rowIndex = sheetData.findIndex(row => row[0] === sheetName);

		if (rowIndex === -1) {
			return fail(404, {errorMsg: "User not found in sheet"});
		}
		const rowNumber = rowIndex + 1;

		await update(`${SHEET_NAME_VIRTUAL}!${col}${rowNumber}`);
	}
} satisfies Actions;

export const load: PageServerLoad = async () => {
    return {
			workshops: Object.keys(workshops),
			header: {
					heading: "Virtual<br>Attendance",
					back: true,
			},
    };
};
