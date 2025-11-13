import { env } from "$env/dynamic/private";

export default function serviceAcc() {
    const privkey = env.SVC_PRIVKEY.replace(/\\n/g, "\n");
    return {
        type: "service_account",
        project_id: "point-system-469113",
        private_key_id: env.SVC_PRIVKEYID,
        private_key: privkey,
        client_email:
            "discord-points-bot@point-system-469113.iam.gserviceaccount.com",
        client_id: "111555712920918496949",
        auth_uri: "https://accounts.google.com/o/oauth2/auth",
        token_uri: "https://oauth2.googleapis.com/token",
        auth_provider_x509_cert_url:
            "https://www.googleapis.com/oauth2/v1/certs",
        client_x509_cert_url:
            "https://www.googleapis.com/robot/v1/metadata/x509/discord-points-bot%40point-system-469113.iam.gserviceaccount.com",
        universe_domain: "googleapis.com",
    };
}
