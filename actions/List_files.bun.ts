import { createClient, FileStat } from "webdav";

type Nextcloud = {
  baseUrl: string;
  userId: string;
  token: string;
};

/**
 * Lists files in a Nextcloud folder via WebDAV.
 * Optionally filter results by content type (e.g. "application/pdf" or ["image/jpeg", "image/png"]).
 */
export async function main(
  ncResource: Nextcloud,
  folderPath: string,
  contentTypesFilter: string | string[] | null = null,
  recursive: boolean = false
): Promise<FileStat[]> {
  const baseUrl = ncResource.baseUrl.replace(/\/$/, "");
  const davBaseUrl = `${baseUrl}/remote.php/dav/files/${encodeURIComponent(ncResource.userId)}`;

  const client = createClient(davBaseUrl, {
    username: ncResource.userId,
    password: ncResource.token,
  });

  let path = `${folderPath}/`;
  if (path.startsWith("/")) {
    path = path.slice(1);
  }

  const items = await client.getDirectoryContents(path, {
    deep: recursive,
  });

  const contentTypes = normalizeContentFilter(contentTypesFilter);
  if (contentTypes.length === 0) {
    return items;
  }

  return items.filter((item) =>
    contentTypes.includes((item.mime || "").toLowerCase())
  );
}

function normalizeContentFilter(
  filter: string | string[] | null
): string[] {
  if (filter == null || filter === "") return [];
  if (Array.isArray(filter)) {
    return filter.map((f) => String(f).trim().toLowerCase()).filter(Boolean);
  }
  return [String(filter).trim().toLowerCase()].filter(Boolean);
}
