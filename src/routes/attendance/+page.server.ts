import type { Actions } from "./$types";
import type { PageServerLoad } from "./$types";
import { fail } from "@sveltejs/kit";
import { get, update } from "$lib/sheets";

async function fetchSheetData() {
  const result = await get("Sheet1!A:D");
  if (!result.data) {
    throw new Error("Unexpected data received");
  }
  return result;
}

export const actions = {
  markPresent: async (event) => {
    const result = await fetchSheetData();
    const dayRow = {
      "1": "E",
      "2": "F",
      "3": "G",
    };
    type dayEnums = keyof typeof dayRow;

    const formData = await event.request.formData();
    const day = formData.get("day") as dayEnums;

    if (!day || !(day in dayRow)) {
      return fail(400, { errorMsg: "Something wrong bro" });
    }
    // get row num
    const index = result.data.values?.findIndex(
      (entry) => entry[0] === formData.get("id"),
    );

    if (index === undefined || index === -1) {
      return fail(400, { errorMsg: "ID not in sheet" });
    }
    // update Attendance
    try {
      await update(dayRow[day] + (index! + 1));
      // return fail(400, { errorMsg: "ID not in sheet" });
      return { success: true };
    } catch (e) {
      console.error(e);
      return fail(502, { errorMsg: e });
    }
  },
  comment: async (event) => {
    const result = await fetchSheetData();
    const formData = await event.request.formData();
    const comment = formData.get("comment") as string;
    const id = formData.get("id");

    if (comment && id) {
      try {
        // get index
        const index = result.data.values?.findIndex((entry) => entry[0] === id);

        await update("D" + (index! + 1), comment);
        // return fail(400, { errorMsg: "ID not in sheet" });
        return { success: true };
      } catch (e) {
        console.error(e);
        return fail(502, { errorMsg: e });
      }
    } else {
      return fail(400, { errorMsg: "Bro what" });
    }
  },
} satisfies Actions;

export const load: PageServerLoad = async () => {
  const result = await fetchSheetData();
  return {
    ids: result.data.values,
    header: {
      heading: "Attendance",
      back: true,
    },
  };
};
