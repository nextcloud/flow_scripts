// This must be an approval script!

import * as wmill from "windmill-client";
import createClient, { type Middleware } from "openapi-fetch";

export async function main(
  nextcloud: RT.Nextcloud,
  taskType: string,
  input: object,
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

  const resumeUrls = await wmill.getResumeUrls()

  const res = await client.POST("/ocs/v2.php/taskprocessing/schedule", {
    params: {
      header: {
        "OCS-APIRequest": true,
      },
      query: {
        format: "json",
      },

    },
    body: {
      type: taskType,
      input: input,
      appId: 'windmill',
      webhookUri: resumeUrls.resume,
      webhookMethod: 'HTTP:POST',
    }
  });
  return {
    urls: resumeUrls,
    task: await res.data,
  }
}