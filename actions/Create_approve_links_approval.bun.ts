import createClient, { type Middleware } from "openapi-fetch";

export async function main(
  nextcloud: RT.Nextcloud,
  approveCallbackUri: string,
  rejectCallbackUri: string,
  description: string,
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

  const data = {
    approveCallbackUri,
    rejectCallbackUri,
    description,
  }

  try {
    const resp = await await client.POST("/ocs/v2.php/apps/approve_links/api/v1/link", {
      params: {
        header: {
          "OCS-APIRequest": true,
        },
        query: {
          format: "json",
        },

      },
      body: data,
    });
    console.debug('RESPONSE', resp.data)
    return {
      link: resp.data.ocs.data.link,
    }
  } catch (e) {
    console.debug('error', e)
  }


  return {}

}