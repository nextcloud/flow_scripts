import * as wmill from "windmill-client";
import type { paths } from "nextcloud-openapi-clients/talk.d.ts";
import createClient, { type Middleware } from "openapi-fetch";

export async function main(
  nextcloudResource: string,

  userId: string | null = null,

  talkRoomToken: string,

  message: string,

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

  const {
    data, // only present if 2XX response
    error, // only present if 4XX or 5XX response
  } = await client.POST("/ocs/v2.php/apps/spreed/api/{apiVersion}/chat/{token}", {
    params: {
      header: {
        "OCS-APIRequest": true,
      },
      query: {
        format: "json",
      },
      path: {
        apiVersion: "v1",
        token: talkRoomToken,
      },

    },
    body: {
      message: message,
    },
  });
}