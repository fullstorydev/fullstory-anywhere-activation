`fs export`
===========

Run export --help to list topics.

* [`fs export`](#fs-export)
* [`fs export:create SEGMENTID`](#fs-exportcreate-segmentid)
* [`fs export:download OPERATIONID`](#fs-exportdownload-operationid)
* [`fs export:view OPERATIONID`](#fs-exportview-operationid)

## `fs export`

List segment exports.

```
USAGE
  $ fs export [--json] [--columns <value> | -x] [--filter <value>] [--no-header | [--csv | --no-truncate]]
    [-o <value>] [--sort <value>]

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
  List segment exports.

  List all segment export operations, both ongoing and completed.
  Shows operation status, segment info, tags, and download file location for completed exports.
  Use --extended to see progress percentage, export IDs, and error details.

  For more information, see https://developer.fullstory.com/server/v1/segments/list-segment-exports

EXAMPLES
  List segment exports.

    $ fs export

  List segment exports with extended metadata.

    $ fs export --extended

  List segment exports as JSON.

    $ fs export --json

  Save export list to a file.

    $ fs export --output exports.json
```

## `fs export:create SEGMENTID`

Create a segment export.

```
USAGE
  $ fs export:create SEGMENTID [--json] [--columns <value> | -x] [--filter <value>] [--no-header | [--csv |
    --no-truncate]] [--output csv|json|yaml |  | ] [--sort <value>] [--fields
    IndvId|UserId|SessionId|PageId|UserCreated|UserAppKey|UserDisplayName|UserEmail|SessionStart|EventStart|EventType|Ev
    entSubType|EventCustomName|EventTargetText|EventTargetSelector|EventDuration|EventSecondaryDuration|EventPageOffset|
    EventSessionOffset|EventModFrustrated|EventModDead|EventModError|EventModSuspicious|EventCumulativeLayoutShift|Event
    FirstInputDelay|EventVarErrorKind|EventVarFields|EventWebSourceFileUrl|EventMobileSourceFile|PageName|PageStart|Page
    Duration|PageActiveDuration|PageUrl|PageRefererUrl|PageIp|PageLatLong|PageUserAgent|PageBrowser|PageBrowserVersion|P
    ageDevice|PagePlatform|PageOperatingSystem|PageScreenWidth|PageScreenHeight|PageViewportWidth|PageViewportHeight|Pag
    eNumEvents|PageNumDerivedEvents|PageNumInfos|PageNumWarnings|PageNumErrors|PageClusterId|PageMaxScrollDepthPercent|L
    oadDomContentTime|LoadEventTime|LoadFirstPaintTime|LoadLargestPaintTime|ReqUrl|ReqMethod|ReqStatus|AppName|AppPackag
    eName|AppDeviceModel|AppDeviceVendor|AppVersion|AppOsVersion|AppViewName|IndvId|Created|Uid|DisplayName|Email|NumSes
    sions|NumPages|NumEvents|TotalSec|ActiveSec|AvgSessionSec|AvgSessionActiveSec|MaxSessionSec|LastSessionNumPages|Last
    SessionNumEvents|LastSessionSec|LastSessionActiveSec|LastSessionStart|LastPage|LastIp|LastLatLong|LastEventStart|Las
    tBrowser|LastDevice|LastPlatform|LastOperatingSystem|UserVars...] [--format FORMAT_CSV|FORMAT_JSON|FORMAT_NDJSON]
    [--skip] [--tag <value>...] [--template IdentityFields] [--type TYPE_EVENT|TYPE_INDIVIDUAL] [--start <value>] [--end
    <value>] [--timezone <value>] [--scope SCOPE_EVENTS|SCOPE_INDIVIDUAL|SCOPE_PAGES|SCOPE_SESSIONS]

ARGUMENTS
  SEGMENTID  Segment ID or name. Use "everyone" for the built-in all-users segment.

FLAGS
  --end=<value>
      Time range end (UTC RFC 3339). Defaults to now.

  --fields=<option>...
      Fields to include in the export. If omitted, you will be prompted to select interactively.
      <options: IndvId|UserId|SessionId|PageId|UserCreated|UserAppKey|UserDisplayName|UserEmail|SessionStart|EventStart|Ev
      entType|EventSubType|EventCustomName|EventTargetText|EventTargetSelector|EventDuration|EventSecondaryDuration|EventP
      ageOffset|EventSessionOffset|EventModFrustrated|EventModDead|EventModError|EventModSuspicious|EventCumulativeLayoutS
      hift|EventFirstInputDelay|EventVarErrorKind|EventVarFields|EventWebSourceFileUrl|EventMobileSourceFile|PageName|Page
      Start|PageDuration|PageActiveDuration|PageUrl|PageRefererUrl|PageIp|PageLatLong|PageUserAgent|PageBrowser|PageBrowse
      rVersion|PageDevice|PagePlatform|PageOperatingSystem|PageScreenWidth|PageScreenHeight|PageViewportWidth|PageViewport
      Height|PageNumEvents|PageNumDerivedEvents|PageNumInfos|PageNumWarnings|PageNumErrors|PageClusterId|PageMaxScrollDept
      hPercent|LoadDomContentTime|LoadEventTime|LoadFirstPaintTime|LoadLargestPaintTime|ReqUrl|ReqMethod|ReqStatus|AppName
      |AppPackageName|AppDeviceModel|AppDeviceVendor|AppVersion|AppOsVersion|AppViewName|IndvId|Created|Uid|DisplayName|Em
      ail|NumSessions|NumPages|NumEvents|TotalSec|ActiveSec|AvgSessionSec|AvgSessionActiveSec|MaxSessionSec|LastSessionNum
      Pages|LastSessionNumEvents|LastSessionSec|LastSessionActiveSec|LastSessionStart|LastPage|LastIp|LastLatLong|LastEven
      tStart|LastBrowser|LastDevice|LastPlatform|LastOperatingSystem|UserVars>

  --format=<option>
      [default: FORMAT_NDJSON] Export data format.
      <options: FORMAT_CSV|FORMAT_JSON|FORMAT_NDJSON>

  --scope=<option>
      Event scope relative to segment filters (TYPE_EVENT only).
      <options: SCOPE_EVENTS|SCOPE_INDIVIDUAL|SCOPE_PAGES|SCOPE_SESSIONS>

  --skip
      Skip segment verification (use when "Too Many Requests" error occurs).

  --start=<value>
      Time range start (UTC RFC 3339). Defaults to 7 days ago.

  --tag=<value>...
      Tags to attach to the export operation.

  --template=<option>
      Predefined field template (e.g. IdentityFields).
      <options: IdentityFields>

  --timezone=<value>
      IANA timezone for relative date calculations (defaults to UTC).

  --type=<option>
      [default: TYPE_EVENT] Export type: event data or individual data.
      <options: TYPE_EVENT|TYPE_INDIVIDUAL>

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
  Create a segment export.

  Create a segment export operation.
  Two types of segment data are available: events and individuals.
  An event export contains events performed by individuals that match the segment.
  An individual export contains information about each matching individual.

  For more information, see https://developer.fullstory.com/server/v1/segments/create-segment-export

EXAMPLES
  Create a segment export for the "everyone" segment.

    $ fs export:create everyone

  Create a segment export for a specific segment ID.

    $ fs export:create tziYRtIU1RW8

  Skip segment verification (avoids "Too Many Requests").

    $ fs export:create tziYRtIU1RW8 --skip

  Create an export with tags.

    $ fs export:create everyone --tag my_first_export

  Create an export in CSV format.

    $ fs export:create everyone --format CSV

  Create an export with specific fields.

    $ fs export:create everyone --fields UserId SessionId EventStart EventType

  Create an export for a specific time range.

    $ fs export:create everyone --start 2024-01-01T00:00:00Z --end 2024-01-31T23:59:59Z

  Export all events in matching sessions, not just matching events.

    $ fs export:create everyone --scope SCOPE_SESSIONS
```

## `fs export:download OPERATIONID`

Download a segment export.

```
USAGE
  $ fs export:download OPERATIONID [--json] [--columns <value> | -x] [--filter <value>] [--no-header | [--csv |
    --no-truncate]] [--output csv|json|yaml |  | ] [--sort <value>] [--link]

ARGUMENTS
  OPERATIONID  The export operation ID returned by export:create.

FLAGS
  --link  Print the download link instead of downloading the export.

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
  Download a segment export.

  Download a completed segment export to this local machine.
  The resulting download will be unzipped and the original gzip file deleted.
  The export must be in COMPLETED state before downloading.

  For more information, see https://developer.fullstory.com/server/v1/segments/get-segment-export-results

EXAMPLES
  Download and unzip the export.

    $ fs export:download OPERATION_ID

  Print the download URL without downloading.

    $ fs export:download OPERATION_ID --link
```

## `fs export:view OPERATIONID`

View segment export contents.

```
USAGE
  $ fs export:view OPERATIONID [--json] [--columns <value> | -x] [--filter <value>] [--no-header | [--csv |
    --no-truncate]] [-o <value>] [--sort <value>] [--type abandon|backgrounded|change|click|click_error|console_message|
    copy|crashed|cumulative_layout_shift|custom|custom_error|exception|first_input_delay|highlight|keyboard_open|keyboar
    d_close|load|low_memory|navigate|pageview|paste|pinch_gesture|request|seen|seen_error|thrash] [--query <value>]

ARGUMENTS
  OPERATIONID  The export operation ID. If omitted, you will be prompted to select one.

FLAGS
  -o, --output=<value>  Save JSON output to file.
      --query=<value>   JSONata expression to transform or extract data from events.
      --type=<option>   Filter events by EventType.
                        <options: abandon|backgrounded|change|click|click_error|console_message|copy|crashed|cumulative_
                        layout_shift|custom|custom_error|exception|first_input_delay|highlight|keyboard_open|keyboard_cl
                        ose|load|low_memory|navigate|pageview|paste|pinch_gesture|request|seen|seen_error|thrash>

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
  View segment export contents.

  View the contents of a downloaded segment export.
  The export must have been downloaded first with export:download.
  Only NDJSON exports can be viewed.

  For more information, see https://developer.fullstory.com/server/v1/segments/

EXAMPLES
  View all events in an export.

    $ fs export:view OPERATION_ID

  View only click events.

    $ fs export:view OPERATION_ID --type click

  Extract data with a JSONata expression.

    $ fs export:view OPERATION_ID --query "$[EventType='click'].EventTargetText"

  Save export contents to a file.

    $ fs export:view OPERATION_ID --output events.json
```
