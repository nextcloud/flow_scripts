import axios from "axios";

export async function main(
  nextcloud: RT.Nextcloud,
  path: string,
) {

  const res = await axios.get(
    `${nextcloud.baseUrl}/remote.php/dav/files/${nextcloud.userId}/${path}`,
    {
      auth: {
        username: nextcloud.userId,
        password: nextcloud.token,
      },
    },
  );
  if (res.status !== 200) {
    throw new Error(res.statusText)
  }
  return res.data
}