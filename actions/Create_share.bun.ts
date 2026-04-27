import axios from "axios";

type ShareSettings = {
  shareWith?: string;
  publicUpload?: boolean;
  password?: string;
  permissions?: number;
  expireDate?: string;
  note?: string;
  label?: string;
  sendMail?: boolean;
};

/**
 * Creates a Nextcloud share via OCS.
 *
 * shareType examples:
 * - 0: user
 * - 1: group
 * - 3: public link
 */
export async function main(
  ncResource: RT.Nextcloud,
  path: string,
  shareType: number,
  shareWith: string,
  settings: ShareSettings = {}
) {
  if (!path || !String(path).trim()) {
    throw new Error("path is required");
  }

  const body = new URLSearchParams();
  body.set("path", path);
  body.set("shareType", String(shareType));
  body.set("shareWith", shareWith);

  // Include only explicitly provided settings.
  setIfDefined(body, "publicUpload", settings.publicUpload);
  setIfDefined(body, "password", settings.password);
  setIfDefined(body, "permissions", settings.permissions);
  setIfDefined(body, "expireDate", settings.expireDate);
  setIfDefined(body, "note", settings.note);
  setIfDefined(body, "label", settings.label);
  setIfDefined(body, "sendMail", settings.sendMail);

  const response = await axios.post(
    `${ncResource.baseUrl.replace(/\/$/, "")}/ocs/v2.php/apps/files_sharing/api/v1/shares`,
    body.toString(),
    {
      auth: {
        username: ncResource.userId,
        password: ncResource.token,
      },
      headers: {
        "OCS-APIRequest": "true",
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      params: {
        format: "json",
      },
    }
  );

  const data = response.data;
  const statusCode = data?.ocs?.meta?.statuscode;
  if (statusCode !== 200) {
    const msg = data?.ocs?.meta?.message || "Unknown error";
    throw new Error(`Failed to create share: ${msg}`);
  }

  return data?.ocs?.data;
}

function setIfDefined(body: URLSearchParams, key: string, value: string | boolean | number | undefined) {
  if (value !== undefined) {
    body.set(key, String(value));
  }
}
