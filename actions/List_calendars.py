import caldav
import base64

# You can import any PyPi package.
# See here for more info: https://www.windmill.dev/docs/advanced/dependencies_in_python

# you can use typed resources by doing a type alias to dict
nextcloud = dict


def main(NextcloudResource: nextcloud, userId: str, useAppApiAuth: bool = False):
    if useAppApiAuth:
        headers = {
            "AA-VERSION": "2.3.0",
            "EX-APP-ID": "flow",
            "EX-APP-VERSION": "1.0.0",
            "AUTHORIZATION-APP-API": base64.b64encode(
              f"{userId}:{NextcloudResource['password']}".encode('utf-8')).decode('utf-8'),
          }
    else:
        headers = {}

    with caldav.DAVClient(
        url=NextcloudResource['baseUrl'] + '/remote.php/dav/calendars/'+userId+'/',
        username=userId,
        password=NextcloudResource['password'],
        headers=headers,
    ) as client:
        my_principal = client.principal()
        return my_principal.calendars()

