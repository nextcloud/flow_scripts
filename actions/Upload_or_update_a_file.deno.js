import * as wmill from "npm:windmill-client@1";
import axios from "npm:axios";

// fill the type, or use the +Resource type to get a type-safe reference to a resource
// type Postgresql = object

export async function main(
  nextcloudResource: string,
  userId: string | null = null,
  path: string,
  data: string,
  useAppApiAuth: boolean = false,
) {
  const ncResource = await wmill.getResource(
    nextcloudResource,
  );
  try {
    const res = await axios.request(
      {
        method: "PUT",
        url: `/remote.php/dav/files/${userId}/${path}`,
        baseURL: ncResource.baseUrl,
        data,
        headers: {
          Authorization: `Basic ${
            btoa(`${userId || ncResource.username}:${ncResource.password}`)
          }`,
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
    return res.data;
  } catch (e) {
    console.log(e);
    console.log(e.response.data);
  }
}

