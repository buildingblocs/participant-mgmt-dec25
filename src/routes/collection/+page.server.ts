import { fail } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { batchGet, update } from "$lib/sheets";
import { env } from "$env/dynamic/private";

async function fetchSheetData() {
  const result = await batchGet();
  if (!result.data) {
    throw new Error("Unexpected data received");
  }
  console.log(result.data.valueRanges);
  return result;
}

export const actions = {
  markPresent: async (event) => {
    const result = await fetchSheetData();

    if (result.data.valueRanges && result.data.valueRanges.length > 1) {
      const secondRange = result.data.valueRanges[1];
      const firstRange = result.data.valueRanges[0];
      if (
        secondRange.values &&
        secondRange.values.length > 0 &&
        firstRange.values &&
        firstRange.values.length > 0
      ) {
        const freebies = secondRange.values[0];
        const formData = await event.request.formData();
        const freebieCollected = formData.get("item") as string;
        if (freebies.includes(freebieCollected)) {
          // get row num
          const index = firstRange.values.findIndex(
            (entry) => entry[2] === formData.get("id"),
          );

          if (index === undefined || index === -1) {
            return fail(400, { errorMsg: "ID not in sheet" });
          }

          const freebieColumns = JSON.parse(env.SHEET_ENTRY_FREEBIES);
          // update collection status
          try {
            await update(
              `${freebieColumns[freebieCollected as keyof typeof freebieColumns]}${index + 1}`,
            );
            // return fail(400, { errorMsg: "ID not in sheet" });
            return { success: true };
          } catch (e) {
            return fail(502, { errorMsg: String(e) });
          }
        } else {
          return fail(400, {
            errorMsg: "Freebie not in sheet",
          });
        }
      } else {
        return fail(502, {
          errorMsg: "Sheets API did not return properly",
        });
      }
    } else {
      return fail(502, {
        errorMsg: "Sheets API did not return properly",
      });
    }
  },
} satisfies Actions;

export const load: PageServerLoad = async () => {
  const result = await fetchSheetData();
  return {
    ids: result.data.valueRanges,
    header: {
      heading: "Freebie<br>Collection",
      back: true,
    },
  };
};
