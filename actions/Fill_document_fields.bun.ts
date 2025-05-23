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
  formFieldValue: string, 
  destination: string, 
  fields: { [index: string]: string },
  convertToPdf: boolean = false,
  useAppApiAuth: boolean = false,
) {

  let data: any = { fields: {}, destination };

  const selectors: { [index: string]: string } = {
    id: 'ById',
    title: 'ByAlias',
    index: 'ByIndex',
    tag: 'ByTag',
  }
  const selector: string = selectors[formFieldValue] ?? 'ById'
  console.debug('SELECTOR ----', selector)
  data.fields = Object.keys(fields).reduce((carry: { [index: string]: object }, key: string) => {
    carry['ContentControls.' + selector + '.' + key] = { content: fields[key] }
    return carry
  }, {});
  
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