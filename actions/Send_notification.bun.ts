import * as wmill from "windmill-client";
import createClient, { type Middleware } from "openapi-fetch";

type Nextcloud = {
  baseUrl: string,
  password: string,
  username: string
};

export async function main(
  ncResource: Nextcloud,
  userId: string | null = null,
  notificationUserId: string,
  subject: string,
  message: string,
  subjectParameters: Array | null = null,
  messageParameters: Array | null = null,
  useAppApiAuth: boolean = false,
) {

  const client = createClient<paths>({ baseUrl: ncResource.baseUrl });
  const authMiddleware: Middleware = {
    async onRequest({ request, options }) {
      // fetch token, if it doesn’t exist
      // add Authorization header to every request
      request.headers.set("Authorization", `Basic ${btoa(ncResource.username + ':' + ncResource.password)}`);
      if (useAppApiAuth) {
        request.headers.set("AA-VERSION", ncResource.aa_version,);
        request.headers.set("EX-APP-ID", ncResource.app_id,);
        request.headers.set("EX-APP-VERSION", ncResource.app_version,);
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
  } = await client.POST("/ocs/v2.php/apps/notifications/api/{apiVersion3}/admin_notifications/{userId}", {
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
}