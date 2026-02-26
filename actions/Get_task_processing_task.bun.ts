import createClient, { type Middleware } from "openapi-fetch";


export async function main(
  nextcloud: RT.Nextcloud,
  taskId: string,
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

  const res = await client.GET("/ocs/v2.php/taskprocessing/task/{id}", {
    params: {
      header: {
        "OCS-APIRequest": true,
      },
      query: {
        format: "json",
      },
      path: {
        id: taskId,
      },

    },
  });
  return res.data;
}