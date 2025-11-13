import { SvelteKitAuth } from "@auth/sveltekit";
import GitHub from "@auth/sveltekit/providers/github";
import { Octokit } from "octokit";

async function inOrg(accessToken: string, orgName: string): Promise<boolean> {
    try {
        const octokit = new Octokit({ auth: accessToken });

        const response = await octokit.request("GET /user/orgs");

        if (response.status !== 200) {
            console.error(response.status);
            return false;
        }

        return response.data.some(
            (org: { login: string }) => org.login === orgName,
        );
    } catch (error) {
        console.error(error);
        return false;
    }
}

export const { handle, signIn, signOut } = SvelteKitAuth({
    providers: [
        GitHub({
            authorization: {
                params: {
                    scope: "read:org",
                },
            },
        }),
    ],
    callbacks: {
        async jwt({ token, account }) {
            if (account?.provider === "github" && account.access_token) {
                token.accessToken = account.access_token;
                const isMember = await inOrg(
                    account.access_token,
                    "buildingblocs",
                );
                token.isOrgMember = isMember;
            }
            return token;
        },
        async session({ session, token }) {
            session.isOrgMember = token.isOrgMember;
            return session;
        },
    },
});
