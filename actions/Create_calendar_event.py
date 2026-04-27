import caldav
import base64
import datetime

# You can import any PyPi package.
# See here for more info: https://www.windmill.dev/docs/advanced/dependencies_in_python

# you can use typed resources by doing a type alias to dict
nextcloud = dict
datetime = dict


def main(
    Nextcloud: nextcloud,
    calendarName: str,
    event_start: datetime,
    event_end: datetime,
):
    headers = {}

    with caldav.DAVClient(
        url=Nextcloud["baseUrl"] + "/remote.php/dav/calendars/" + Nextcloud["userId"] + "/",
        username=Nextcloud["userId"],
        password=Nextcloud["token"],
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

