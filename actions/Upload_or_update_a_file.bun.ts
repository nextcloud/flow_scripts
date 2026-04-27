import axios from "axios";

export async function main(
  nextcloud: RT.Nextcloud,
  path: string,
  data: string,
) {

  try {
    const res = await axios.request(
      {
        method: "PUT",
        url: `/remote.php/dav/files/${nextcloud.userId}/${path}`,
        baseURL: nextcloud.baseUrl,
        data,
        headers: {
          Authorization: `Basic ${btoa(`${nextcloud.userId}:${nextcloud.token}`)
            }`,
        },
      },
    );
    return res.data;
  } catch (e) {
    console.log(e);
    console.log(e.response.data);
  }
}