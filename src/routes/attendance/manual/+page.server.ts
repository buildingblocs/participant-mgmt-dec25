import type { Actions } from "./$types";
import type { PageServerLoad } from "./$types";
import { fail } from "@sveltejs/kit";
import { get, update } from "$lib/sheets";

const result = await get("Sheet1!A:C");

export const actions = {
    markPresent: async (event) => {
        const dayRow = {
            "1": "D",
            "2": "E",
            "3": "F",
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
} satisfies Actions;

export const load: PageServerLoad = async () => {
    return {
        ids: result.data.values,
        header: {
            heading: "Attendance",
            back: true,
        },
    };
};
