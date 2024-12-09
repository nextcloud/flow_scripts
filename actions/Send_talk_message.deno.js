import * as wmill from "npm:windmill-client@1";
import * as tb from "https://raw.githubusercontent.com/marcelklehr/nextcloud-client-deno/6f973bfdcaed0d8b4f35b6cf5d0368d8bec73ed4/talk/index.ts";

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
  const api = new tb.ChatApi(config);

  const res = await api.chatSendMessageRaw({
    apiVersion: "v1",
    message,
    oCSAPIRequest: true,
    token: talkRoomToken,
  });
  return await res.raw.json();
}

