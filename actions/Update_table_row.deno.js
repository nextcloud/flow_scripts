import * as wmill from "npm:windmill-client@1"
import axios from "npm:axios"

export async function main(
  nextcloudResource: string,
  userId: string|null = null,
  rowId: number, 
  columnId: number, 
  value: string,
  useAppApiAuth: boolean = false,
) {
  const ncResource = await wmill.getResource(
    nextcloudResource,
  );

  const data = {
    data: {
      [columnId]: value,
    }
  }
  const url = ncResource.baseUrl + '/index.php/apps/tables/api/1/rows/' + rowId
  const config = {
    ...(!useAppApiAuth && ({
      auth: {
        username: ncResource.username,
        password: ncResource.password,
      },
    })),
    headers: {
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
    const resp = await axios.put(url, data, config)
    console.debug('RESPONSE', resp.data)
    return {
      data
    }
  } catch(e) {
    console.debug('error', e)
  }
  
  
  return {}
}
