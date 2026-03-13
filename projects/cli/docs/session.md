`fs session`
============

List user sessions.

* [`fs session USERID`](#fs-session-userid)
* [`fs session:context SESSIONID`](#fs-sessioncontext-sessionid)
* [`fs session:events SESSIONID`](#fs-sessionevents-sessionid)
* [`fs session:summary SESSIONID [PROFILEID]`](#fs-sessionsummary-sessionid-profileid)

## `fs session USERID`

List user sessions.

```
USAGE
  $ fs session USERID [--json] [--columns <value> | -x] [--filter <value>] [--no-header | [--csv |
    --no-truncate]] [-o <value>] [--sort <value>]

ARGUMENTS
  USERID  Email address or UID of the user.

FLAGS
  -o, --output=<value>  Save JSON output to file.

TABLE FLAGS
  -x, --extended         show extra columns
      --columns=<value>  only show provided columns (comma-separated)
      --csv              output is csv format [alias: --output=csv]
      --filter=<value>   filter property by partial string matching, ex: name=foo
      --no-header        hide table header from output
      --no-truncate      do not truncate output to fit screen
      --sort=<value>     property to sort by (prepend '-' for descending)

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  List user sessions.

  List session replay URLs for a user, queried by email address or UID.
  Automatically paginates through all results.

  For more information, see https://developer.fullstory.com/server/sessions/

EXAMPLES
  List sessions by email.

    $ fs session user@example.com

  List sessions by UID.

    $ fs session my-app-uid-123

  List sessions as JSON.

    $ fs session user@example.com --json

  Save sessions to a file.

    $ fs session user@example.com --output sessions.json
```

## `fs session:context SESSIONID`

Generate AI-ready session context.

```
USAGE
  $ fs session:context SESSIONID [--json] [-f <value>] [-p <value>] [-o <value>]

ARGUMENTS
  SESSIONID  The session ID (UserId:SessionId format, or a Fullstory session URL).

FLAGS
  -f, --file=<value>     Path to a JSON file containing the ProfileConfiguration.
  -o, --output=<value>   Save JSON output to file.
  -p, --profile=<value>  ID of a saved summarization profile to use as the ProfileConfiguration.

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Generate AI-ready session context.

  Generate AI-ready context for a session.
  The format and contents of the response are controlled by the profile configuration to optimize the information
  included for the intended use case.

  For more information, see https://developer.fullstory.com/server/sessions/generate-context/

EXAMPLES
  Generate context using a saved summarization profile.

    $ fs session:context 1841382665432129521:4929353557192241189 --profile my-profile-id

  Generate context using a ProfileConfiguration JSON file.

    $ fs session:context 1841382665432129521:4929353557192241189 --file ./config.json

  Generate context and select a profile interactively.

    $ fs session:context 1841382665432129521:4929353557192241189

  Save context to a file.

    $ fs session:context 1841382665432129521:4929353557192241189 --profile my-profile-id --output context.json
```

## `fs session:events SESSIONID`

List all captured events for a session.

```
USAGE
  $ fs session:events SESSIONID [--json] [--type <value>] [--query <value>] [-o <value>]

ARGUMENTS
  SESSIONID  The session ID (UserId:SessionId format, or a Fullstory session URL).

FLAGS
  -o, --output=<value>  Save JSON output to file.
      --query=<value>   JSONata expression to transform or extract data from the events.
      --type=<value>    Filter events by event_type (e.g. navigate, click, change, custom).

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  List all captured events for a session.

  List all captured events for a session.
  Optionally filter by event type and/or transform the output with a JSONata expression.

  For more information, see https://developer.fullstory.com/server/sessions/get-session-events/

EXAMPLES
  List all events for a session.

    $ fs session:events "1841382665432129521:4929353557192241189"

  List only "change" events.

    $ fs session:events "1841382665432129521:4929353557192241189" --type change

  Extract text values from "change" events using JSONata.

    $ fs session:events "1841382665432129521:4929353557192241189" --type change --query \
      $.event_properties.target.text

  Save events to a file.

    $ fs session:events "1841382665432129521:4929353557192241189" --output events.json
```

## `fs session:summary SESSIONID [PROFILEID]`

Generate a session summary.

```
USAGE
  $ fs session:summary SESSIONID [PROFILEID] [--json] [--endTimestamp <value>] [-o <value>]

ARGUMENTS
  SESSIONID    The session ID (UserId:SessionId format, or a Fullstory session URL).
  [PROFILEID]  The summarization profile ID. If omitted, you will be prompted to select one.

FLAGS
  -o, --output=<value>        Save JSON output to file.
      --endTimestamp=<value>  Only include events before this ISO 8601 timestamp.

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Generate a session summary.

  Generate an AI summary of a session using a summarization profile.
  The profile specifies prompting instructions and session context configuration.

  For more information, see https://developer.fullstory.com/server/sessions/summarize/

EXAMPLES
  Generate a summary for a session.

    $ fs session:summary 1841382665432129521:4929353557192241189 abc-profile-id

  Interactively select a profile and generate a summary.

    $ fs session:summary 1841382665432129521:4929353557192241189

  Summarize events up to a specific time.

    $ fs session:summary 1841382665432129521:4929353557192241189 abc-profile-id --endTimestamp 2024-08-01T13:00:00Z

  Save the summary to a file.

    $ fs session:summary 1841382665432129521:4929353557192241189 abc-profile-id --output summary.json
```
