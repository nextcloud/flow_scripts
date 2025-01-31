// This must be an approval script!

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
  taskType: string,
  input: object,
  useAppApiAuth: boolean = false,
) {

  const client = createClient<paths>({ baseUrl: ncResource.baseUrl });
  const authMiddleware: Middleware = {
    async onRequest({ request, options }) {
      // fetch token, if it doesn’t exist
      // add Authorization header to every request
      request.headers.set("Authorization", `Basic ${btoa((ncResource.username) + ':' + ncResource.password)}`);
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