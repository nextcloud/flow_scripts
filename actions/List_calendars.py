import caldav
import base64

# You can import any PyPi package.
# See here for more info: https://www.windmill.dev/docs/advanced/dependencies_in_python

# you can use typed resources by doing a type alias to dict
nextcloud = dict


def main(Nextcloud: nextcloud):
    headers = {}

    with caldav.DAVClient(
        url=Nextcloud['baseUrl'] + '/remote.php/dav/calendars/'+ Nextcloud['userId'] +'/',
        username=Nextcloud['userId'],
        password=Nextcloud['token'],
        headers=headers,
    ) as client:
        my_principal = client.principal()
        return my_principal.calendars()

