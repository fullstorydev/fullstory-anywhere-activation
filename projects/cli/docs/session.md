`fs session`
============

Run session --help to list topics.

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

    $ fs session user@fullstory.com

  List sessions by UID.

    $ fs session 1841382665432129521:4929353557192241189

  List sessions as JSON.

    $ fs session user@fullstory.com --json

  Save sessions to a file.

    $ fs session user@fullstory.com --output sessions.json
```

## `fs session:context SESSIONID`

Generate AI-ready session context.

```
USAGE
  $ fs session:context SESSIONID [--json] [-f <value>] [-p <value>]

ARGUMENTS
  SESSIONID  The session ID (UserId:SessionId format, or a Fullstory session URL).

FLAGS
  -f, --file=<value>       Path to a JSON file containing the ProfileConfiguration.
  -p, --profileId=<value>  ID of a saved summarization profile to use as the ProfileConfiguration.

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Generate AI-ready session context.

  Generate AI-ready context for a session.
  The format and contents of the response are controlled by the profile configuration to optimize the information
  included for the intended use case.

  For more information, see https://developer.fullstory.com/server/sessions/generate-context/

EXAMPLES
  Generate context using defaults.

    $ fs session:context 1841382665432129521:4929353557192241189

  Generate context using a saved summary profile.

    $ fs session:context 1841382665432129521:4929353557192241189 --profile 1c07280f-df08-494f-873e-6214cb6c46b4

  Generate context using a summary profile from a JSON file.

    $ fs session:context 1841382665432129521:4929353557192241189 --file ./summmary-profile.json
```

## `fs session:events SESSIONID`

List all captured events for a session.

```
USAGE
  $ fs session:events SESSIONID [--json] [--columns <value> | -x] [--filter <value>] [--no-header | [--csv |
    --no-truncate]] [--output csv|json|yaml |  | ] [--sort <value>] [--type <value>] [--query <value>]

ARGUMENTS
  SESSIONID  The session ID (UserId:SessionId format, or a Fullstory session URL).

FLAGS
  --query=<value>  JSONata expression to transform or extract data from the events (outputs JSON).
  --type=<value>   Filter events by event_type (e.g. navigate, click, change, custom).

TABLE FLAGS
  -x, --extended         show extra columns
      --columns=<value>  only show provided columns (comma-separated)
      --csv              output is csv format [alias: --output=csv]
      --filter=<value>   filter property by partial string matching, ex: name=foo
      --no-header        hide table header from output
      --no-truncate      do not truncate output to fit screen
      --output=<option>  output in a more machine friendly format
                         <options: csv|json|yaml>
      --sort=<value>     property to sort by (prepend '-' for descending)

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  List all captured events for a session.

  List all captured events for a session.
  Optionally filter by event type and/or transform the output with a JSONata expression.

  For more information, see https://developer.fullstory.com/server/sessions/get-session-events/

EXAMPLES
  List all events for a session.

    $ fs session:events 1841382665432129521:4929353557192241189

  List only "change" events.

    $ fs session:events 1841382665432129521:4929353557192241189 --type change

  Extract text values from "change" events using JSONata (outputs JSON).

    $ fs session:events 1841382665432129521:4929353557192241189 --type change --query $.event_properties.target.text

  Output all events as JSON.

    $ fs session:events 1841382665432129521:4929353557192241189 --json
```

## `fs session:summary SESSIONID [PROFILEID]`

Generate a session summary.

```
USAGE
  $ fs session:summary SESSIONID [PROFILEID] [--json] [--endTimestamp <value>]

ARGUMENTS
  SESSIONID    The session ID (UserId:SessionId format, or a Fullstory session URL).
  [PROFILEID]  The summarization profile ID. If omitted, you will be prompted to select one.

FLAGS
  --endTimestamp=<value>  Only include events before this ISO 8601 timestamp.

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Generate a session summary.

  Generate an AI summary of a session using a summarization profile.
  The profile specifies prompting instructions and session context configuration.

  For more information, see https://developer.fullstory.com/server/sessions/summarize/.

EXAMPLES
  Interactively select a profile and summarize the session.

    $ fs session:summary 1841382665432129521:4929353557192241189

  Summarize the session using a specific summary profile.

    $ fs session:summary 1841382665432129521:4929353557192241189 1c07280f-df08-494f-873e-6214cb6c46b

  Summarize from session start time until the end timestamp

    $ fs session:summary 1841382665432129521:4929353557192241189 1c07280f-df08-494f-873e-6214cb6c46b --endTimestamp \
      2024-08-01T13:00:00Z
```
