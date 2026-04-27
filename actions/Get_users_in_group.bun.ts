import axios from "axios";

export async function main(
    nextcloud: RT.Nextcloud,
    groupId: string,
) {

    const res = await axios.get(
        `${nextcloud.baseUrl}/ocs/v2.php/cloud/groups/${groupId}`,
        {
            auth: {
                username: nextcloud.userId,
                password: nextcloud.token,
            },
            headers: {
                'OCS-APIRequest': 'true',
            },
        }
    );

    return res.data.ocs.data.users
}
