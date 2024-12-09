import * as wmill from "npm:windmill-client@1";
import * as tb from "https://raw.githubusercontent.com/marcelklehr/nextcloud-client-deno/4432705a6ee46808e951b08cf3e9e3e1daece0f9/notifications-admin/index.ts";

export async function main(
  nextcloudResource: string,
  userId: string|null = null,
  notificationUserId: string,
  message: string,
  useAppApiAuth: boolean = false,
) {
  const ncResource = await wmill.getResource(
    nextcloudResource,
  );
  const config = new tb.Configuration({
    username: userId || ncResource.username,
    password: ncResource.password,
    basePath: ncResource.baseUrl,
    middleware: [{
      async pre(context) {
        if (!context.url.includes("?")) {
          context.url += "?";
        } else {
          context.url += "&";
        }
        context.url += "format=json";
        return context;
      },
    }],
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
  });
  const api = new tb.ApiApi(config);

  return await api.apiGenerateNotification({
    apiVersion: "v2",
    oCSAPIRequest: true,
    shortMessage: message,
    userId: notificationUserId,
  });
}

