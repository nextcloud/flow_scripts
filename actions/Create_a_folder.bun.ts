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
    path: string,
    useAppApiAuth: boolean = false,
) {

    try {
        const res = await axios.request(
            {
                method: "MKCOL",
                url: `/remote.php/dav/files/${userId || ncResource.username}/${path}`,
                baseURL: ncResource.baseUrl,
                headers: {
                    Authorization: `Basic ${btoa(`${userId || ncResource.username}:${ncResource.password}`)
                    }`,
                },
                ...(useAppApiAuth && ({
                    headers: {
                        "AA-VERSION": ncResource.aa_version,
                        "EX-APP-ID": ncResource.app_id,
                        "EX-APP-VERSION": ncResource.app_version,
                        "AUTHORIZATION-APP-API": btoa(
                            `${userId || ncResource.username}:${ncResource.password}`,
                        ),
                    },
                })),
            },
        );
        return res.data;
    } catch (e) {
        console.log(e.response.data);
    }
}