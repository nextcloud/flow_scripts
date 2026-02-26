import createClient, { type Middleware } from "openapi-fetch";

export async function main(
  nextcloud: RT.Nextcloud,
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