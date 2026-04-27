import axios from "axios"

export async function main(
  nextcloud: RT.Nextcloud,
  templateFileId: number,
  formFieldValue: string, 
  destination: string, 
  fields: { [index: string]: string },
  convertToPdf: boolean = false,
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

  const url = nextcloud.baseUrl + '/ocs/v2.php/apps/richdocuments/api/v1/template/fields/fill/' + templateFileId
  const config = {
    auth: {
      username: nextcloud.userId,
      password: nextcloud.token,
    },
    headers: {
      'content-type': 'application/json',
      'ocs-apirequest': true,
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