import caldav
import base64
import datetime

# You can import any PyPi package.
# See here for more info: https://www.windmill.dev/docs/advanced/dependencies_in_python

# you can use typed resources by doing a type alias to dict
nextcloud = dict
datetime = dict


def main(
    NextcloudResource: nextcloud,
    userId: str,
    calendarName: str,
    event_start: datetime,
    event_end: datetime,
    useAppApiAuth: bool = False,
):
    if useAppApiAuth:
        headers = {
            "AA-VERSION": "2.3.0",
            "EX-APP-ID": "flow",
            "EX-APP-VERSION": "1.0.0",
            "AUTHORIZATION-APP-API": base64.b64encode(
                f"{userId}:{NextcloudResource['password']}".encode("utf-8")
            ).decode("utf-8"),
        }
    else:
        headers = {}

    with caldav.DAVClient(
        url=NextcloudResource["baseUrl"] + "/remote.php/dav/calendars/" + userId + "/",
        username=userId,
        password=NextcloudResource["password"],
        headers=headers,
    ) as client:
        my_principal = client.principal()
        calendar = next(
            filter(
                lambda calendar: calendar.name == calendarName, my_principal.calendars()
            )
        )
        if calendar is None:
            raise ValueError("Could not find calendar by the name you provided")

        my_event = calendar.save_event(
            dtstart=event_start,
            dtend=event_end,
            summary="Do the needful",
        )
        return my_event

