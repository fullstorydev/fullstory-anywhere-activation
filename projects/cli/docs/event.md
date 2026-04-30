`fs event`
==========

Run event --help to list topics.

* [`fs event SESSIONID`](#fs-event-sessionid)
* [`fs event:create [SESSIONID] [NAME]`](#fs-eventcreate-sessionid-name)
* [`fs event:errors JOBID`](#fs-eventerrors-jobid)
* [`fs event:import`](#fs-eventimport)
* [`fs event:job JOBID`](#fs-eventjob-jobid)

## `fs event SESSIONID`

List all captured events for a session.

```
USAGE
  $ fs event SESSIONID... [--json] [--columns <value> | -x] [--filter <value>] [--no-header | [--csv |
    --no-truncate]] [--output csv|json|yaml |  | ] [--sort <value>] [--type <value>] [--query <value>] [-d] [--tag
    <value>] [--compact]

ARGUMENTS
  SESSIONID...  The session ID or a Fullstory session URL.

FLAGS
  -d, --download       Download session events as JSON files to the local data directory.
      --compact        Write compact JSON with no indentation. Used with --download.
      --query=<value>  JSONata expression to transform or extract data from the events (outputs JSON).
      --tag=<value>    Folder name for storing downloaded events. Used with --download.
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

  List all captured events for one or more sessions.
  Optionally filter by event type and/or transform the output with a JSONata expression.
  Multiple session IDs can be provided as space-separated arguments.

  For more information, see https://developer.fullstory.com/server/sessions/get-session-events/

EXAMPLES
  List all events for a session.

    $ fs event 1841382665432129521:4929353557192241189

  List only "change" events.

    $ fs event 1841382665432129521:4929353557192241189 --type change

  Extract text values from "change" events using JSONata (outputs JSON).

    $ fs event 1841382665432129521:4929353557192241189 --type change --query $.event_properties.target.text

  Output all events as JSON.

    $ fs event 1841382665432129521:4929353557192241189 --json

  List events for multiple sessions.

    $ fs event 1841382665432129521:4929353557192241189 1841382665432129521:5039353557192241190

  Download events for multiple sessions into a named subfolder.

    $ fs event 1841382665432129521:4929353557192241189 1841382665432129521:5039353557192241190 --download --tag \
      experiment-1
```

## `fs event:create [SESSIONID] [NAME]`

Create an event.

```
USAGE
  $ fs event:create [SESSIONID] [NAME] [--json] [-f <value>] [--properties <value>] [--timestamp <value>]

ARGUMENTS
  [SESSIONID]  Session ID in "UserId:SessionId" format.
  [NAME]       The event name.

FLAGS
  -f, --file=<value>        Path to a JSON file containing event data (CreateEvent schema). Uses batch import endpoint.
      --properties=<value>  JSON string or path to a JSON file of custom event properties.
      --timestamp=<value>   Event timestamp in ISO 8601 format. Defaults to current server time.

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Create an event.

  Create a single event on a session.
  Supply the session ID and event name as arguments, with optional properties via flags.
  Alternatively, provide a full event payload with --file.

  For more information, see https://developer.fullstory.com/server/events/create-event/

EXAMPLES
  Create an event on a session.

    $ fs event:create 1841382665432129521:4929353557192241189 "Order Completed"

  Create an event with custom properties in a file.

    $ fs event:create 1841382665432129521:4929353557192241189 "Order Completed" --properties ./event-props.json

  Create an event with custom properties from the terminal.

    $ fs event:create 1841382665432129521:4929353557192241189 "Order Completed" --properties \
      '{"item":"shirt","total":12.99}'

  Create an event with a specific timestamp.

    $ fs event:create 1841382665432129521:4929353557192241189 "Order Completed" --timestamp 2024-08-01T00:00:00Z

  Create an event from a JSON file (calls batch import with a single event).

    $ fs event:create --file event.json
```

## `fs event:errors JOBID`

List batch event import errors.

```
USAGE
  $ fs event:errors JOBID [--json] [--columns <value> | -x] [--filter <value>] [--no-header | [--csv |
    --no-truncate]] [-o <value>] [--sort <value>]

ARGUMENTS
  JOBID  The batch import job ID.

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
  List batch event import errors.

  List errors from a batch event import job.

  For more information, see https://developer.fullstory.com/server/events/get-batch-events-import-errors/

EXAMPLES
  View errors from a batch import.

    $ fs event:errors abc-123
```

## `fs event:import`

Batch import events from a file.

```
USAGE
  $ fs event:import -f <value> [--json] [--wait]

FLAGS
  -f, --file=<value>  (required) Path to a JSON file containing an array of event objects.
      --[no-]wait     Wait for the import job to complete.

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Batch import events from a file.

  Batch import events from a JSON file (max 50,000 events per batch).
  The file must contain a JSON array of event objects matching the CreateEvent schema,
  each with a session object included.
  By default, polls until the job completes. Use --no-wait to return immediately with the job ID.

  For more information, see https://developer.fullstory.com/server/events/create-batch-events-import-job/

EXAMPLES
  Import events and wait for completion.

    $ fs event:import --file events.json

  Import events and return the job ID immediately.

    $ fs event:import --file events.json --no-wait
```

## `fs event:job JOBID`

Get batch event import job status.

```
USAGE
  $ fs event:job JOBID [--json]

ARGUMENTS
  JOBID  The batch import job ID.

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Get batch event import job status.

  Get the status of a batch event import job.
  Poll the job status endpoint until the status is COMPLETED or FAILED.

  For more information, see https://developer.fullstory.com/server/events/get-batch-events-import-job/

EXAMPLES
  Check the status of a batch import job.

    $ fs event:job abc-123
```
