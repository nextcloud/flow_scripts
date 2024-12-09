// This must be an approval script!

import * as wmill from "npm:windmill-client@1";
import * as nc from "https://raw.githubusercontent.com/marcelklehr/nextcloud-client-deno/c57692db56e9292b252c9b8aca7516753881409c/core/index.ts";

export async function main(
  nextcloudResource: string,
  userId: string | null = null,
  taskType: string,
  input: object,
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
        "EX-APP-ID": "windmill_app",
        "EX-APP-VERSION": "1.0.0",
        "AUTHORIZATION-APP-API": btoa(
          `${userId || ncResource.username}:${ncResource.password}`,
        ),
      },
    })),
  });
  const api = new nc.TaskProcessingApiApi(config);

  const resumeUrls = await wmill.getResumeUrls()

  const res = await api.taskProcessingApiScheduleRaw({
    taskProcessingApiScheduleRequest: {
      type: taskType,
      input,
      appId: 'windmill',
      webhookUri: resumeUrls.resume,
      webhookMethod: 'HTTP:POST',
    },
    oCSAPIRequest: true,
  });
  return {
    urls: resumeUrls,
    task: await res.raw.json()
  }
}


