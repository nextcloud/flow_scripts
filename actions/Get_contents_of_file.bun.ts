import * as wmill from "windmill-client";
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

  const res = await axios.get(
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
    },
  );
  if (res.status !== 200) {
    throw new Error(res.statusText)
  }
  return res.data
}