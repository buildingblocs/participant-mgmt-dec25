import { fail } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { batchGet, update } from "$lib/sheets";

const result = await batchGet(["Sheet1!A:B", "Sheet1!G:H"]);

export const actions = {
  markPresent: async (event) => {
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
        type freebieEnums = keyof typeof freebies;
        const formData = await event.request.formData();
        const freebieCollected = formData.get("item") as string;
        if (freebies.includes(freebieCollected)) {
          // get row num
          const index = firstRange.values.findIndex(
            (entry) => entry[0] === formData.get("id"),
          );

          if (index === undefined || index === -1) {
            return fail(400, { errorMsg: "ID not in sheet" });
          }

          const freebieColumns = {
            "Freebie 1": "G",
            "Freebie 2": "H",
          };

          // update collection status
          try {
            await update(
              freebieColumns[freebieCollected as keyof typeof freebieColumns] +
                (index! + 1),
            );
            // return fail(400, { errorMsg: "ID not in sheet" });
            return { success: true };
          } catch (e) {
            return fail(502, { errorMsg: e });
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
  return {
    ids: result.data.valueRanges,
    header: {
      heading: "Freebie<br>Collection",
      back: true,
    },
  };
};
