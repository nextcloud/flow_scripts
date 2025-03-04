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

    const res = await axios.head(
        `${ncResource.baseUrl}/remote.php/dav/files/${userId || ncResource.username}/${path}`,
        {
            auth: {
                username: userId || ncResource.username,
                password: ncResource.password,
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
            validateStatus: function (status) {
                return status < 500; // Reject only if status code is 500 or greater
            }
        }
    );
    if (Math.round(res.status / 100) === 4) {
        if (res.status !== 404) {
            throw new Error('Error ' + res.status)
        }
    }
    return res.status === 200// file exists
}

