import createClient, { type Middleware } from "openapi-fetch";

const TASK_TYPE_ANALYZE_IMAGES = "core:analyze-images";
const POLL_INTERVAL_MS = 1000;
const DEFAULT_POLL_TIMEOUT_MS = 600_000; // 10 minutes (ensure one cron job finished)

/**
 * Creates an image analysis task via the Nextcloud OCS Task Processing API,
 * polls until the task completes, and returns the analysis text.
 */
export async function main(
  ncResource: RT.Nextcloud,
  prompt: string,
  imageFileIds: number | string | Array<number | string>,
  model: string | null = null,
  timeout_ms: number = DEFAULT_POLL_TIMEOUT_MS,
  interval_ms: number = POLL_INTERVAL_MS,
) {
  if (timeout_ms < 1) {
    timeout_ms = DEFAULT_POLL_TIMEOUT_MS;
  }
  if (interval_ms < 1) {
    interval_ms = POLL_INTERVAL_MS;
  }
  if (!Array.isArray(imageFileIds)) {
    imageFileIds = [imageFileIds];
  }
  if (imageFileIds.length < 1) {
    throw new Error("imageFileIds must be a non-empty array of Nextcloud file IDs");
  }

  const client = createClient({ baseUrl: ncResource.baseUrl }) as any;
  const authMiddleware: Middleware = {
    async onRequest({ request }) {
      request.headers.set(
        "Authorization",
        `Basic ${btoa(ncResource.userId + ":" + ncResource.token)}`,
      );
      return request;
    },
  };
  client.use(authMiddleware);

  // Schedule the image analysis task
  const { data: scheduleData, error: scheduleError } = await client.POST(
    "/ocs/v2.php/taskprocessing/schedule",
    {
      params: {
        header: {
          "OCS-APIRequest": true,
        },
        query: {
          format: "json",
        },
      },
      body: {
        type: TASK_TYPE_ANALYZE_IMAGES,
        input: {
          model: model,
          input: prompt,
          images: imageFileIds,
        },
        appId: "windmill",
      },
    },
  );

  if (scheduleError) {
    throw new Error(
      `Failed to schedule image analysis task: ${JSON.stringify(scheduleError)}`,
    );
  }
  const taskId = scheduleData?.ocs?.data?.task?.id;

  // Polls every interval until timeout or a result happens
  const deadline = Date.now() + timeout_ms;
  while (Date.now() < deadline) {
    console.log("Polling task output");
    const { data: taskData, error: taskError } = await client.GET(
      "/ocs/v2.php/taskprocessing/task/{id}",
      {
        params: {
          header: {
            "OCS-APIRequest": true,
          },
          query: {
            format: "json",
          },
          path: {
            id: taskId,
          },
        },
      },
    );

    if (taskError) {
      throw new Error(`Failed to get task ${taskId}: ${JSON.stringify(taskError)}`);
    }
    const task = taskData.ocs?.data?.task;
    const status = task.status;

    if (status === "STATUS_SUCCESSFUL") {
      const output = task.output;
      if (output && typeof output.output === "string") {
        return { analysisText: output.output, taskId };
      }
      return { analysisText: output, taskId };
    }

    if (status === "STATUS_FAILED" || status === "STATUS_CANCELLED") {
      const msg = JSON.stringify(task);
      throw new Error(`Image analysis task failed: ${msg}`);
    }
    if (!["STATUS_SCHEDULED", "STATUS_RUNNING"].includes(status)) {
      const msg = JSON.stringify(task);
      throw new Error(`Image analysis task failed with unknown status: ${msg}`);
    }
    await new Promise((r) => setTimeout(r, interval_ms));
  }

  throw new Error(
    `Image analysis task did not complete within ${timeout_ms}ms (taskId: ${taskId})`,
  );
}

