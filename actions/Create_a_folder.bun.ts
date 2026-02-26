import axios from "axios";

export async function main(
    nextcloud: RT.Nextcloud,
    path: string,
) {

    try {
        const res = await axios.request(
            {
                method: "MKCOL",
                url: `/remote.php/dav/files/${nextcloud.userId}/${path}`,
                baseURL: nextcloud.baseUrl,
                headers: {
                    Authorization: `Basic ${btoa(`${nextcloud.userId}:${nextcloud.token}`)
                    }`,
                },
            },
        );
        return res.data;
    } catch (e) {
        console.log(e.response.data);
    }
}