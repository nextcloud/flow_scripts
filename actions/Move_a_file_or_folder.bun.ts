import axios from "axios";

export async function main(
    nextcloud: RT.Nextcloud,
    sourcePath: string,
    destinationPath: string,
) {

    try {
        console.log("Test");
        console.log(`${nextcloud.baseUrl}/remote.php/dav/files/${nextcloud.userId}/${destinationPath}`);
        const res = await axios.request(
            {
                method: "MOVE",
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