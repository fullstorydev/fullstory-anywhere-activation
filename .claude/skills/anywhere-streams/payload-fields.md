# Customizable Payload — Available Fields

These are the **only** fields available for use in Fullstory Stream payload mapping. Do not accept or suggest any field not listed here.

In the Customizable Payload UI, these fields are selected from a menu. In Advanced JSON Mapping, they are referenced using `["var", "path"]` where `path` is the variable path shown below.

---

## Event Properties

These fields describe the specific event that triggered the stream.

| Field | Variable Path | Description |
|---|---|---|
| `event_time` | `event.0.event_time` | UTC timestamp of when the event occurred (ISO 8601) |
| `event_type` | `event.0.event_type` | Event classification: `Click`, `Change`, or a Custom Event name |
| `source_type` | `event.0.source_type` | Origin point: `Web`, `Mobile`, or `API` |
| `app_url_event` | `event.0.app_url_event` | Session Replay URL deep-linked to this specific event |
| `target_text` | `event.0.target_text` | Text content of the interacted element |
| `element_name` | `event.0.element_name` | Identifier of the interacted element |

---

## Page Properties

These fields describe the page where the event occurred.

| Field | Variable Path | Description |
|---|---|---|
| `url` | `event.0.url` | Full URL of the page |
| `referer_url` | `event.0.referer_url` | Referrer URL from the first page view in the session |
| `page_name` | `event.0.page_name` | Page name set via `FS('setProperties', { type: 'page' })` |

---

## Session Properties

These fields describe the session in which the event occurred.

| Field | Variable Path | Description |
|---|---|---|
| `session_id` | `session.session_id` | Fullstory unique session identifier — format: `orgId:sessionId` |
| `client_session_id` | `session.client_session_id` | Client-side session identifier — format: `{guid:guid}` |
| `session_uid` | `session.session_uid` | Custom session identifier set via the Fullstory API |
| `ua_browser` | `session.ua_browser` | Browser name parsed from the user agent |
| `ua_browser_version` | `session.ua_browser_version` | Browser version parsed from the user agent |
| `ua_device` | `session.ua_device` | Device type parsed from the user agent |
| `ua_operating_system` | `session.ua_operating_system` | Operating system parsed from the user agent |
| `ip_address` | `session.ip_address` | Visitor IP address |
| `country` | `session.country` | Country derived from IP geolocation |
| `region` | `session.region` | Region derived from IP geolocation |
| `city` | `session.city` | City derived from IP geolocation |
| `device_manufacturer` | `session.device_manufacturer` | Mobile device manufacturer |
| `device_model` | `session.device_model` | Mobile device model |
| `device_os_version` | `session.device_os_version` | Mobile device OS version |
| `app_screen_name` | `session.app_screen_name` | Mobile app screen name |
| `app_id` | `session.app_id` | Mobile app identifier |
| `app_name` | `session.app_name` | Mobile app name |
| `app_version` | `session.app_version` | Mobile app version |
| `app_build_variant` | `session.app_build_variant` | Mobile app build variant (e.g., `debug`, `release`) |

---

## User Properties

These fields describe the user associated with the session.

| Field | Variable Path | Description |
|---|---|---|
| `device_id` | `session.device_id` | Unique capture device identifier |
| `user_id` | `user.user_id` | User identifier set via the Fullstory API |
| `user_email` | `user.user_email` | User email address |
| `user_display_name` | `user.user_display_name` | User display name |
| `app_url_user` | `user.app_url_user` | URL to the user's detail page in Fullstory |

---

## Stream Metadata

| Field | Variable Path | Description |
|---|---|---|
| `stream_name` | `stream.name` | Name of the stream that fired |

---

## Notes

**Event index:** Event fields use zero-based indexing. For single-event streams, always use `event.0`. For event pattern streams (multiple events), you may reference earlier events as `event.1`, `event.2`, etc., where `event.0` is the most recent (triggering) event.

**Custom properties:** Properties set on the user or page via the Fullstory API (e.g., `FS('setProperties', { type: 'user', properties: { accountId: '...' } })`) may also be available in the payload. Their variable paths follow the same prefix pattern: `user.accountId`, `event.0.myCustomProp`, etc. Confirm the exact property name with the Fullstory instrumentation in your codebase.

**Session replay URL:** The `session_id` field uses the `orgId:sessionId` format. Build the replay URL like this:
```json
["concat", "https://app.fullstory.com/ui/sessions/", ["var", "session.session_id"]]
```
