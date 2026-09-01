import createClient, { type Middleware } from "openapi-fetch";

type Recipient = {
  email: string;
  label?: string;
};

type Attachment = {
  filename: string;
  content: string;
  contentType?: string;
};

export async function main(
  nextcloud: RT.Nextcloud,
  accountId: number,
  fromEmail: string,
  to: Recipient[],
  subject: string,
  body: string,
  isHtml: boolean = false,
  attachments: Attachment[] = [],
  cc: Recipient[] = [],
  bcc: Recipient[] = [],
) {
  if (!to?.length) {
    throw new Error("Recipients (to) cannot be empty");
  }

  const client = createClient<paths>({ baseUrl: nextcloud.baseUrl });
  const authMiddleware: Middleware = {
    async onRequest({ request, options }) {
      request.headers.set("Authorization", `Basic ${btoa(nextcloud.userId + ':' + nextcloud.token)}`);
      return request;
    },
  };
  client.use(authMiddleware);

  if (attachments.length > 0) {
    const form = new FormData();
    form.append("accountId", String(accountId));
    form.append("fromEmail", fromEmail);
    form.append("subject", subject);
    form.append("body", body);
    form.append("isHtml", String(isHtml));

    to.forEach((r, i) => {
      form.append(`to[${i}][email]`, r.email);
      if (r.label) form.append(`to[${i}][label]`, r.label);
    });
    cc.forEach((r, i) => {
      form.append(`cc[${i}][email]`, r.email);
      if (r.label) form.append(`cc[${i}][label]`, r.label);
    });
    bcc.forEach((r, i) => {
      form.append(`bcc[${i}][email]`, r.email);
      if (r.label) form.append(`bcc[${i}][label]`, r.label);
    });

    attachments.forEach((a) => {
      form.append(
        "attachments[]",
        new Blob([a.content], { type: a.contentType }),
        a.filename,
      );
    });

    const resp = await client.POST("/ocs/v2.php/apps/mail/message/send", {
      params: {
        header: {
          "OCS-APIRequest": true,
        },
        query: {
          format: "json",
        },
      },
      body: form,
    });

    if (resp.error) {
      throw new Error(`Nextcloud Mail send failed: ${JSON.stringify(resp.error)}`);
    }

    return resp.data;
  }

  const resp = await client.POST("/ocs/v2.php/apps/mail/message/send", {
    params: {
      header: {
        "OCS-APIRequest": true,
      },
      query: {
        format: "json",
      },
    },
    body: {
      accountId,
      fromEmail,
      subject,
      body,
      isHtml,
      to,
      cc,
      bcc,
    },
  });

  if (resp.error) {
    throw new Error(`Nextcloud Mail send failed: ${JSON.stringify(resp.error)}`);
  }

  return resp.data;
}
