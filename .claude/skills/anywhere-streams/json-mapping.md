# Advanced JSON Mapping — Syntax Reference

Advanced JSON Mapping lets you construct any JSON structure as a Stream's outgoing request body. Instead of a fixed flat payload, you compose the output using a small set of functions written in a Lisp-style array syntax.

**When to use it:** Use Advanced JSON Mapping (rather than the Customizable Payload UI) when the destination requires a nested JSON structure (e.g., Slack Block Kit, Teams Adaptive Cards) or when you need to transform values (concatenate strings, convert types, reformat timestamps).

---

## How the syntax works

Every function is a JSON array. The first element is the function name (a string). Remaining elements are arguments — which can be literals, field lookups, or other function calls (fully nestable).

```json
["function-name", argument1, argument2, ...]
```

Plain JSON values (strings, numbers, booleans, objects, arrays) are passed through unchanged. Only values that need to be dynamic use the function syntax.

---

## Functions

### `["var", "path"]` — Read a field value

Looks up a field from the stream event data. This is how every dynamic value is accessed.

```json
["var", "event.0.ip_address"]
["var", "session.session_id"]
["var", "user.user_id"]
["var", "stream.name"]
```

**Path prefixes:**

| Prefix | Used for |
|---|---|
| `event.0.` | Event and page properties (triggering event) |
| `event.N.` | Earlier events in a pattern stream (1-based for prior events) |
| `session.` | Session and device properties |
| `user.` | User properties |
| `stream.` | Stream metadata |

See [payload-fields.md](payload-fields.md) for the complete list of valid paths.

---

### `["concat", item1, item2, ...]` — Join values into a string

Concatenates multiple values into a single string. Items can be string literals or any expression (including `["var", ...]`).

```json
// Session Replay URL
["concat", "https://app.fullstory.com/ui/sessions/", ["var", "session.session_id"]]

// Human-readable label
["concat", "User ", ["var", "user.user_id"], " visited ", ["var", "event.0.url"]]

// Alert subject line
["concat", "⚠️ Suspicious IP: ", ["var", "event.0.ip_address"]]
```

---

### `["list", item1, item2, ...]` — Build a JSON array

Creates a JSON array from multiple items. Items can be literals, `["var", ...]`, or other expressions.

```json
["list", ["var", "event.0.ip_address"], ["var", "event.0.url"]]
// → ["203.0.113.42", "https://app.example.com/login"]
```

Use this when a destination field expects an array value.

---

### `["toUnixTimestamp", expr]` — Convert timestamp to Unix seconds

Converts an ISO 8601 timestamp string (as stored in Fullstory event fields) to a Unix timestamp (integer seconds since January 1, 1970 UTC). Use this when a destination expects epoch seconds instead of ISO 8601.

```json
["toUnixTimestamp", ["var", "event.0.event_time"]]
// "2024-11-01T14:32:00Z" → 1730468720
```

---

### `["asString", expr]` / `["asStrings", expr]` — Convert to string

Converts a single value to a string, or each element of an array to strings (with `asStrings`).

- Numbers: drops unnecessary decimals (`1.0` → `"1"`, `3.14` → `"3.14"`)
- Booleans: `"true"` or `"false"`
- Arrays: comma-separated string (`["asString", ["list", "a", "b"]]` → `"a, b"`)

```json
["asString", ["var", "event.0.some_numeric_field"]]
```

---

### `["asNumber", expr]` / `["asNumbers", expr]` — Convert to number

Converts a single value to a number, or each element of an array (with `asNumbers`).

- Numeric strings parse directly: `"42"` → `42`
- Booleans: `true` → `1.0`, `false` → `0.0`

```json
["asNumber", ["var", "event.0.some_string_field"]]
```

---

### `["asBool", expr]` / `["asBools", expr]` — Convert to boolean

Converts a single value to a boolean, or each element of an array (with `asBools`). String matching is case-insensitive:

- `"true"`, `"t"`, `"1"` → `true`
- `"false"`, `"f"`, `"0"`, `""` → `false`

```json
["asBool", ["var", "event.0.some_field"]]
```

---

## Tips and gotchas

- **All field references must use `["var", ...]`** — you cannot write a field name as a plain string and have it resolve dynamically.
- **Static strings are plain JSON strings** — only dynamic values need the function syntax. `"hello"` is just `"hello"`.
- **Nesting is unlimited** — you can nest `["concat", ...]` inside object values inside arrays inside other objects. The full depth of Slack Block Kit or Teams Adaptive Cards is achievable.
- **`event_time` is ISO 8601** — e.g., `"2024-11-01T14:32:00Z"`. Use `["toUnixTimestamp", ...]` if the destination needs epoch seconds.
- **Session replay URL pattern** — always build with `["concat", "https://app.fullstory.com/ui/sessions/", ["var", "session.session_id"]]`.

---

## Complete payload examples

### Flat payload (equivalent to Customizable Payload UI output)

```json
{
  "ip_address": ["var", "event.0.ip_address"],
  "session_id": ["var", "session.session_id"],
  "user_id":    ["var", "user.user_id"],
  "event_time": ["var", "event.0.event_time"],
  "page_url":   ["var", "event.0.url"],
  "replay_url": ["concat", "https://app.fullstory.com/ui/sessions/", ["var", "session.session_id"]]
}
```

---

### Slack Block Kit payload

Slack Incoming Webhooks require Block Kit — a nested structure that cannot be produced with Customizable Payload alone.

```json
{
  "text": ["concat", "⚠️ Suspicious IP detected: ", ["var", "event.0.ip_address"]],
  "blocks": [
    {
      "type": "header",
      "text": { "type": "plain_text", "text": "⚠️ Suspicious IP Detected" }
    },
    {
      "type": "section",
      "fields": [
        { "type": "mrkdwn", "text": ["concat", "*IP Address:*\n", ["var", "event.0.ip_address"]] },
        { "type": "mrkdwn", "text": ["concat", "*User ID:*\n",    ["var", "user.user_id"]] },
        { "type": "mrkdwn", "text": ["concat", "*Page:*\n",       ["var", "event.0.url"]] },
        { "type": "mrkdwn", "text": ["concat", "*Time:*\n",       ["var", "event.0.event_time"]] }
      ]
    },
    {
      "type": "actions",
      "elements": [
        {
          "type": "button",
          "text": { "type": "plain_text", "text": "View Session Replay" },
          "url": ["concat", "https://app.fullstory.com/ui/sessions/", ["var", "session.session_id"]]
        }
      ]
    }
  ]
}
```

---

### Microsoft Teams Adaptive Card payload

Power Automate's "Post to a channel when a webhook request is received" trigger expects an Adaptive Card structure.

```json
{
  "type": "message",
  "attachments": [
    {
      "contentType": "application/vnd.microsoft.card.adaptive",
      "content": {
        "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
        "type": "AdaptiveCard",
        "version": "1.2",
        "body": [
          {
            "type": "TextBlock",
            "text": "⚠️ Suspicious IP Detected",
            "weight": "Bolder",
            "size": "Large",
            "color": "Attention"
          },
          {
            "type": "FactSet",
            "facts": [
              { "title": "IP Address", "value": ["var", "event.0.ip_address"] },
              { "title": "User ID",    "value": ["var", "user.user_id"] },
              { "title": "Page",       "value": ["var", "event.0.url"] },
              { "title": "Time",       "value": ["var", "event.0.event_time"] }
            ]
          }
        ],
        "actions": [
          {
            "type": "Action.OpenUrl",
            "title": "View Session Replay",
            "url": ["concat", "https://app.fullstory.com/ui/sessions/", ["var", "session.session_id"]]
          }
        ]
      }
    }
  ]
}
```

---

### PagerDuty Events API v2 payload

```json
{
  "routing_key": "YOUR_PAGERDUTY_INTEGRATION_KEY",
  "event_action": "trigger",
  "payload": {
    "summary": ["concat", "Suspicious IP detected: ", ["var", "event.0.ip_address"]],
    "severity": "warning",
    "source": ["var", "event.0.url"],
    "timestamp": ["var", "event.0.event_time"],
    "custom_details": {
      "ip_address": ["var", "event.0.ip_address"],
      "user_id":    ["var", "user.user_id"],
      "session_id": ["var", "session.session_id"],
      "browser":    ["var", "session.ua_browser"],
      "country":    ["var", "session.country"]
    }
  },
  "links": [
    {
      "href": ["concat", "https://app.fullstory.com/ui/sessions/", ["var", "session.session_id"]],
      "text": "View Session Replay"
    }
  ]
}
```
