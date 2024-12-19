import * as wmill from "windmill-client@1";
import axios from "axios";

// fill the type, or use the +Resource type to get a type-safe reference to a resource
// type Postgresql = object

export async function main(
  nextcloudResource: string,
  userId: string | null = null,
  path: string,
  useAppApiAuth: boolean = false,
) {
  const ncResource = await wmill.getResource(
    nextcloudResource,
  );
  const res = await axios.get(
    `${ncResource.baseUrl}/remote.php/dav/files/${userId || ncResource.username}/${path}`,
    {
      auth: {
        username: userId || ncResource.username,
        password: ncResource.password,
      },
      ...(useAppApiAuth && ({
        headers: {
          "AA-VERSION": "2.3.0",
          "EX-APP-ID": "flow",
          "EX-APP-VERSION": "1.0.0",
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
