import createClient, { type Middleware } from "openapi-fetch";

export async function main(
  nextcloud: RT.Nextcloud,
  talkRoomToken: string,
  message: string,
) {

  const client = createClient<paths>({ baseUrl: nextcloud.baseUrl });
  const authMiddleware: Middleware = {
    async onRequest({ request, options }) {
      // fetch token, if it doesn’t exist
      // add Authorization header to every request
      request.headers.set("Authorization", `Basic ${btoa((nextcloud.userId) + ':' + nextcloud.token)}`);
      return request;
    },
  };
  client.use(authMiddleware);

  const data = await client.POST("/ocs/v2.php/apps/spreed/api/{apiVersion}/chat/{token}", {
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
  return data;
}