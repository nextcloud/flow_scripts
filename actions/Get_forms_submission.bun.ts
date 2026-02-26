import createClient, { type Middleware } from "openapi-fetch";

export async function main(
  nextcloud: RT.Nextcloud,
  formId: string,
  submissionId: number,
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

  try {
    const resp = await client.GET("/ocs/v2.php/apps/forms/api/v3/forms/{formId}/submissions", {
      params: {
        header: {
          "OCS-APIRequest": true,
        },
        query: {
          format: "json",
        },
        path: {
          formId: formId,
        },

      },
    });
    
    const submission = resp.data.ocs.data.submissions.find(s => s.id === submissionId)
    
    return {
      submission,
    }
  } catch(e) {
    console.debug('error', e)
  }

}