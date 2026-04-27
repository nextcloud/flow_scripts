import createClient, { type Middleware } from "openapi-fetch";


export async function main(
  nextcloud: RT.Nextcloud,
  notificationUserId: string,
  subject: string,
  message: string,
  subjectParameters: Array | null = null,
  messageParameters: Array | null = null,
) {

  const client = createClient<paths>({ baseUrl: nextcloud.baseUrl });
  const authMiddleware: Middleware = {
    async onRequest({ request, options }) {
      // fetch token, if it doesn’t exist
      // add Authorization header to every request
      request.headers.set("Authorization", `Basic ${btoa(nextcloud.userId + ':' + nextcloud.token)}`);
      return request;
    },
  };
  client.use(authMiddleware);

  const data = await client.POST("/ocs/v2.php/apps/notifications/api/{apiVersion3}/admin_notifications/{userId}", {
    params: {
      header: {
        "OCS-APIRequest": true,
      },
      query: {
        format: "json",
      },
      path: {
        apiVersion3: "v3",
        userId: notificationUserId,
      },

    },
    body: {
      subject: subject,
      message: message,
      subjectParameters: subjectParameters,
      messageParameters: messageParameters
    },
  });
  return data;
}