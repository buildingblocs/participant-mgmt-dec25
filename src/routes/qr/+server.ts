import { error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import QRCode from "qrcode";

export const GET: RequestHandler = async ({ url }) => {
    const data = url.searchParams.get("data");

    if (!data) {
        error(400, "No data");
    }

    const qrBuffer = await QRCode.toBuffer(data, { scale: 5 });

    return new Response(qrBuffer, {
        headers: {
            "Content-Type": "image/png",
        },
    });
};
