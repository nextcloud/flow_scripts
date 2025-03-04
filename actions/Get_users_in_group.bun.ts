import axios from "axios";

type Nextcloud = {
    baseUrl: string,
    password: string,
    username: string
};

export async function main(
    ncResource: Nextcloud,
    userId: string | null = null,
    groupId: string,
    useAppApiAuth: boolean = false,
) {

    const res = await axios.get(
        `${ncResource.baseUrl}/ocs/v2.php/cloud/groups/${groupId}`,
        {
            auth: {
                username: userId || ncResource.username,
                password: ncResource.password,
            },
            headers: {
                'oCS-APIRequest': 'true',
                ...(useAppApiAuth && ({
                    "AA-VERSION": ncResource.aa_version,
                    "EX-APP-ID": ncResource.app_id,
                    "EX-APP-VERSION": ncResource.app_version,
                    "AUTHORIZATION-APP-API": btoa(
                        `${userId || ncResource.username}:${ncResource.password}`,
                    ),
                }))
            },
        }
    );

    return res.data.ocs.data.users
}
