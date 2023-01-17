import { serverSideEnv } from "@env";
import { decryptAccessToken } from "../auth/index.js";

/**
 * You can get informations Like: Main repo, owner, updated at ....
 * https://docs.github.com/en/rest/repos/repos?apiVersion=2022-11-28#get-a-repository
 */
export async function repositoryInformation(args: {
	owner: string;
	repository: string;
}): Promise<any> {
	const response = await fetch(
		`https://api.github.com/repos/${args.owner}/${args.repository}`,
		{
			method: "GET",
			headers: {
				Authorization: `Bearer ${decryptedAccessToken}`,
				"X-GitHub-Api-Version": "2022-11-28",
			},
		}
	);
	if (response.ok) {
		return await response.json();
	} else {
		return undefined;
	}
}
