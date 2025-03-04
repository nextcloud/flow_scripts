import * as wmill from "windmill-client@1";
import axios from "axios";

type Nextcloud = {
    baseUrl: string,
    password: string,
    username: string
};

export async function main(
    ncResource: Nextcloud,
    userId: string | null = null,
    sourcePath: string,
    destinationPath: string,
    useAppApiAuth: boolean = false,
) {

    try {
        console.log("Test");
        console.log(`${ncResource.baseUrl}/remote.php/dav/files/${userId || ncResource.username}/${destinationPath}`);
        const res = await axios.request(
            {
                method: "MOVE",
                url: `/remote.php/dav/files/${userId || ncResource.username}/${sourcePath}`,
                baseURL: ncResource.baseUrl,
                headers: {
                    Authorization: `Basic ${btoa(`${userId || ncResource.username}:${ncResource.password}`)
                    }`,
                    Destination: `${ncResource.baseUrl}/remote.php/dav/files/${userId || ncResource.username}/${destinationPath}`,
                },
                ...(useAppApiAuth && ({
                    headers: {
                        "AA-VERSION": ncResource.aa_version,
                        "EX-APP-ID": ncResource.app_id,
                        "EX-APP-VERSION": ncResource.app_version,
                        "AUTHORIZATION-APP-API": btoa(
                            `${userId || ncResource.username}:${ncResource.password}`,
                        ),
                        "Destination": `${ncResource.baseUrl}/remote.php/dav/files/${userId || ncResource.username}/${destinationPath}`,
                    },
                })),
            },
        );

        return res.data;
    } catch (e) {
        console.log(e.response.data);
    }
}