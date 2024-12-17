import * as wmill from "windmill-client";
import type { paths } from "nextcloud-openapi-clients/tables.d.ts";
import createClient, { type Middleware } from "openapi-fetch";

export async function main(
  nextcloudResource: string,

  userId: string | null = null,

  useAppApiAuth: boolean = false,
) {
  const ncResource = await wmill.getResource(
    nextcloudResource,
  );

  const client = createClient<paths>({ baseUrl: ncResource.baseUrl });
  const authMiddleware: Middleware = {
    async onRequest({ request, options }) {
      // fetch token, if it doesn’t exist
      // add Authorization header to every request
      request.headers.set("Authorization", `Basic ${btoa((userId || ncResource.username) + ':' + ncResource.password)}`);
      if (useAppApiAuth) {
        request.headers.set("AA-VERSION", "2.3.0",);
        request.headers.set("EX-APP-ID", "flow",);
        request.headers.set("EX-APP-VERSION", "1.0.1",);
        request.headers.set("AUTHORIZATION-APP-API", btoa(
          `${userId || ncResource.username}:${ncResource.password}`,
        ));
      }
      return request;
    },
  };
  client.use(authMiddleware);

  try {

    const resp = await client.GET("/index.php/apps/tables/api/1/tables", {
      params: {
        header: {
          "OCS-APIRequest": true,
        },
        query: {
          format: "json",
        },

      },
    });

    console.debug('RESPONSE', resp.data)

    return resp.data

  } catch (e) {

    console.debug('error', e)

  }

  return {}

}