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
  folderName: string,
  groupName: string,
  quota: number,
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


  try {
    const resp = await client.POST("/index.php/apps/groupfolders/folders", {
      params: {
        header: {
          "OCS-APIRequest": true,
        },
        query: {
          format: "json",
        },
      },
      body: {
        mountpoint: folderName
      },
    });

    const tableId = resp.data.ocs.data.id;

    await client.POST("/index.php/apps/groupfolders/folders/{id}/groups", {
      params: {
        header: {
          "OCS-APIRequest": true,
        },
        query: {
          format: "json",
        },
        path: {
          id: tableId,
        }
      },
      body: {
        group: groupName
      },
    });

    await client.POST("/index.php/apps/groupfolders/folders/{id}/quota", {
      params: {
        header: {
          "OCS-APIRequest": true,
        },
        query: {
          format: "json",
        },
        path: {
          id: tableId,
        }
      },
      body: {
        quota: quota
      },
    });

  } catch (e) {
    console.debug('error', e)
  }
}