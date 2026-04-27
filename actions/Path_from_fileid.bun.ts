import { createClient } from "webdav";

/**
 * Resolves a Nextcloud file path from its fileid.
 */
export async function main(
  ncResource: RT.Nextcloud,
  fileid: string
): Promise<string> {

  const baseUrl = ncResource.baseUrl;
  const davBaseUrl = `${baseUrl}/remote.php/dav`;
  const client = createClient(davBaseUrl, {
    username: ncResource.userId,
    password: ncResource.token,
  });

  const searchXml = buildSearchRequestXml(ncResource.userId, fileid);
  const rawResponse = await client.customRequest("/", {
    method: "SEARCH",
    data: searchXml,
    headers: {
      "Content-Type": "text/xml; charset=utf-8",
      Accept: "application/xml, text/xml",
    },
    responseType: "text",
  });
  const responseXml = await rawResponse.text();
  const path = extractPathFromSearchResponse(responseXml, ncResource.userId);
  if (!path) {
    throw new Error(`Could not resolve path for fileid "${fileid}"`);
  }

  return path;
}

function buildSearchRequestXml(userId: string, fileId: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<d:searchrequest xmlns:d="DAV:" xmlns:oc="http://owncloud.org/ns">
  <d:basicsearch>
    <d:select>
      <d:prop>
        <d:displayname/>
        <oc:fileid/>
      </d:prop>
    </d:select>
    <d:from>
      <d:scope>
        <d:href>/files/${encodeURIComponent(userId)}</d:href>
        <d:depth>infinity</d:depth>
      </d:scope>
    </d:from>
    <d:where>
      <d:eq>
        <d:prop><oc:fileid/></d:prop>
        <d:literal>${encodeURIComponent(fileId)}</d:literal>
      </d:eq>
    </d:where>
  </d:basicsearch>
</d:searchrequest>`;
}

function extractPathFromSearchResponse(xml: string, userId: string): string | null {
  const hrefRegex = /<d:href>(.*?)<\/d:href>/g;
  let match: RegExpExecArray | null = null;
  while ((match = hrefRegex.exec(xml)) !== null) {
    console.log(match[1]);
    const href = decodeURIComponent(match[1] || "").trim();
    if (!href) continue;

    // Expected shape: /remote.php/dav/files/{userId}/path/to/file
    const marker = `/files/${userId}/`;
    const markerIndex = href.indexOf(marker);
    if (markerIndex !== -1) {
      return `/${href.slice(markerIndex + marker.length)}`;
    }
  }
  return null;
}