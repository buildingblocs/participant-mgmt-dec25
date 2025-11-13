import type { LayoutServerLoad } from "./$types";
import { redirect } from "@sveltejs/kit";

export const load: LayoutServerLoad = async (event) => {
    let session;

    try {
        session = await event.locals.auth();
    } catch (e) {
        console.error(e);
    }

    if (session == null && event.url.pathname != "/login") {
        redirect(307, "/login");
    } else if (session != null && event.url.pathname == "/login") {
        redirect(307, "/");
    }

    return {
        session,
    };
};
