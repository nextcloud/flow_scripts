import createClient, { type Middleware } from "openapi-fetch";

interface Data {
  [p: number]: any
}

export async function main(
  nextcloud: RT.Nextcloud,
  tableId: number,
  data: Data,
) {

  const client = createClient<paths>({ baseUrl: nextcloud.baseUrl });
  const authMiddleware: Middleware = {
    async onRequest({ request, options }) {
      // fetch token, if it doesn’t exist
      // add Authorization header to every request
      request.headers.set("Authorization", `Basic ${btoa((nextcloud.userId) + ':' + nextcloud.password)}`);
      return request;
    },
  };
  client.use(authMiddleware);

  const resp = await client.POST("/index.php/apps/tables/api/1/tables/{tableId}/rows", {
    params: {
      header: {
        "OCS-APIRequest": true,
      },
      query: {
        format: "json",
      },
      path: {
        tableId: tableId,
      },

    },
    body: {
      data: data
    },
  });

  return resp.data;

}