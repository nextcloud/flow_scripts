/*
 * We expect that the group comes from a Nextcloud Table where you can
 * define a datatype "Users and groups". The result is a list of groups,
 * each list item consist of the fields "id", "type" and "displayName". 
 * This script uses the "id" value of each list item.
 */
import createClient, { type Middleware } from "openapi-fetch";

export async function main(
  nextcloud: RT.Nextcloud,
  folderName: string,
  groups: Array<{
    id: string,
    key: string,
    type: number,
    displayName: string,
  }>,
  quota: number,
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

    for (const group of groups) {
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
            group: group.id
          },
        });
    }

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
