import createClient, { type Middleware } from "openapi-fetch";

function csvEscape(value: unknown): string {
  if (value === null || value === undefined) return "";
  const s = typeof value === "object" ? JSON.stringify(value) : String(value);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function toCsv(matrix: unknown[][]): string {
  return matrix.map((row) => row.map(csvEscape).join(",")).join("\n") + "\n";
}

export async function main(
  nextcloud: RT.Nextcloud,
  tableId: number,
  filename?: string,
) {
  const client = createClient<paths>({ baseUrl: nextcloud.baseUrl });
  const authMiddleware: Middleware = {
    async onRequest({ request, options }) {
      request.headers.set("Authorization", `Basic ${btoa(nextcloud.userId + ':' + nextcloud.token)}`);
      return request;
    },
  };
  client.use(authMiddleware);

  const [tableRes, rowsRes] = await Promise.all([
    client.GET("/index.php/apps/tables/api/1/tables/{tableId}", {
      params: {
        header: {
          "OCS-APIRequest": true,
        },
        query: {
          format: "json",
        },
        path: {
          tableId: tableId,
        },
      },
    }),
    client.GET("/index.php/apps/tables/api/1/tables/{tableId}/rows/simple", {
      params: {
        header: {
          "OCS-APIRequest": true,
        },
        query: {
          format: "json",
        },
        path: {
          tableId: tableId,
        },
      },
    }),
  ]);

  if (tableRes.error) {
    throw new Error(`Failed to load table ${tableId}: ${JSON.stringify(tableRes.error)}`);
  }
  if (rowsRes.error) {
    throw new Error(`Failed to load rows for table ${tableId}: ${JSON.stringify(rowsRes.error)}`);
  }

  const table = tableRes.data;
  const matrix = rowsRes.data as unknown[][];
  if (!Array.isArray(matrix) || matrix.length === 0) {
    throw new Error("Unexpected rows/simple payload (expected a matrix)");
  }

  const csv = toCsv(matrix);
  const safeTitle = String(table?.title || `table-${tableId}`)
    .replace(/[^\w.-]+/g, "_")
    .replace(/^_+|_+$/g, "");
  const stamp = new Date().toISOString().slice(0, 10);
  const outName = filename || `${safeTitle}_${stamp}.csv`;

  return {
    title: table?.title,
    filename: outName,
    csv,
  };
}
