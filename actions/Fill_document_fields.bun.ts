import * as wmill from "windmill-client"
import axios from "axios"

type Nextcloud = {
  baseUrl: string,
  password: string,
  username: string
};

export async function main(
  ncResource: Nextcloud,
  userId: string|null = null,
  templateFileId: number,
  destination: string, 
  fields: object,
  convertToPdf: boolean = false,
  useAppApiAuth: boolean = false,
) {

  const data = {
    fields: Object.keys(fields).reduce((carry: object, key: string) => {
      carry['ContentControls.ByIndex.' + key] = { content: fields[key] }
      return carry
    }, {}),
    destination,
  }
  if (convertToPdf) {
    data.convert = 'pdf'
  }
  
  console.debug('data', data)

  const url = ncResource.baseUrl + '/ocs/v2.php/apps/richdocuments/api/v1/template/fields/fill/' + templateFileId
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
        "AA-VERSION": ncResource.aa_version,
        "EX-APP-ID": ncResource.app_id,
        "EX-APP-VERSION": ncResource.app_version,
        "AUTHORIZATION-APP-API": btoa(
          `${userId || ncResource.username}:${ncResource.password}`,
        ),
    })),
    },
  }
  console.debug('config', config)
  try {
    const resp = await axios.post(url, data, config)
    console.debug('RESPONSE', resp.data)
    return {
      data: resp.data,
    }
  } catch(e) {
    console.debug('error', e)
  }
  
  
  return {}
}