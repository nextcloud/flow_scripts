import * as wmill from "npm:windmill-client@1";
import * as tb from "https://raw.githubusercontent.com/marcelklehr/nextcloud-client-deno/1629b11dc919b99d8dfadf2870a02128a24333fa/tables/index.ts";

// fill the type, or use the +Resource type to get a type-safe reference to a resource
// type Postgresql = object

interface Data {
  [p: number]: any
}

export async function main(
  nextcloudResource: string,
  userId: string|null = null,
  tableId: number,
  data: Data,
  useAppApiAuth: boolean = false
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
        "AUTHORIZATION-APP-API": btoa(`${userId || ncResource.username}:${ncResource.password}`),
      },
    })),
  });
  const api = new tb.Api1Api(config);

  return await api.api1CreateRowInTable({
    tableId,
    data: JSON.stringify(data)
  });
}

