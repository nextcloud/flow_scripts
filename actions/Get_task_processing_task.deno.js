import * as wmill from "npm:windmill-client@1";
import * as nc from "https://raw.githubusercontent.com/marcelklehr/nextcloud-client-deno/c57692db56e9292b252c9b8aca7516753881409c/core/index.ts";

// fill the type, or use the +Resource type to get a type-safe reference to a resource
// type Postgresql = object

export async function main(
  nextcloudResource: string,
  userId: string | null = null,
  taskId: string,
  useAppApiAuth: boolean = false,
) {
  const ncResource = await wmill.getResource(
    nextcloudResource,
  );
  const config = new nc.Configuration({
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
  const api = new nc.TaskProcessingApiApi(config);

  const res = await api.taskProcessingApiGetTaskRaw({
    id: taskId,
    oCSAPIRequest: true,
  });
  return await res.raw.json()
}


