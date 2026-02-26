import axios from "axios";

export async function main(
    nextcloud: RT.Nextcloud,
    sourcePath: string,
    destinationPath: string,
) {

    try {
        const res = await axios.request(
            {
                method: "COPY",
                url: `/remote.php/dav/files/${nextcloud.userId}/${sourcePath}`,
                baseURL: nextcloud.baseUrl,
                headers: {
                    Authorization: `Basic ${btoa(`${nextcloud.userId}:${nextcloud.token}`)
                    }`,
                    Destination: `${nextcloud.baseUrl}/remote.php/dav/files/${nextcloud.userId}/${destinationPath}`,
                },
            },
        );

        return res.data;
    } catch (e) {
        console.log(e.response.data);
    }
}