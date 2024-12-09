import * as wmill from "npm:windmill-client@1"
import axios from "npm:axios"

export async function main(
  nextcloudResource: string,
  userId: string|null = null,
  formHash: string, 
  submissionId: number,
  useAppApiAuth: boolean = false,
) {
  const ncResource = await wmill.getResource(
    nextcloudResource,
  );

  const url = ncResource.baseUrl + '/ocs/v2.php/apps/forms/api/v2/submissions/' + formHash
  console.debug('url', url)
  const config = {
    ...(!useAppApiAuth && ({
      auth: {
        username: ncResource.username,
        password: ncResource.password,
      },
    })),
    headers: {
      //'authorization' : 'basic ' + btoa(ncResource.username + ':' + ncResource.password),
      'content-type': 'application/json',
      'ocs-apirequest': true,
      ...(useAppApiAuth && ({
        "AA-VERSION": "2.3.0",
        "EX-APP-ID": "flow",
        "EX-APP-VERSION": "1.0.0",
        "AUTHORIZATION-APP-API": btoa(
          `${userId || ncResource.username}:${ncResource.password}`,
        ),
      })),
    },
  }
  console.debug('config', config)
  try {
    const resp = await axios.get(url, config)
    console.debug('RESPONSE', resp.data)
    const submission = resp.data.ocs.data.submissions.find(s => s.id === submissionId)
    //console.debug('SUBMISSION', submission)
    return {
      submission,
    }
  } catch(e) {
    console.debug('error', e)
  }
}
