import axios from "axios";

export async function main(
    nextcloud: RT.Nextcloud,
    path: string,
) {

    const res = await axios.head(
        `${nextcloud.baseUrl}/remote.php/dav/files/${nextcloud.userId}/${path}`,
        {
            auth: {
                username: nextcloud.userId,
                password: nextcloud.token,
            },
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

