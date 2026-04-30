`fs context`
============

Generate AI-ready session context.

* [`fs context SESSIONID`](#fs-context-sessionid)
* [`fs context:media SESSIONID`](#fs-contextmedia-sessionid)

## `fs context SESSIONID`

Generate AI-ready session context.

```
USAGE
  $ fs context SESSIONID... [--json] [--columns <value> | -x] [--filter <value>] [--no-header | [--csv |
    --no-truncate]] [--output csv|json|yaml |  | ] [--sort <value>] [-f <value>] [-p <value>] [-d] [--tag <value>]
    [--compact]

ARGUMENTS
  SESSIONID...  The session ID (UserId:SessionId format, or a Fullstory session URL).

FLAGS
  -d, --download           Download session context as JSON files to the local data directory.
  -f, --file=<value>       Path to a JSON file containing the ProfileConfiguration.
  -p, --profileId=<value>  ID of a saved summarization profile to use as the ProfileConfiguration.
      --compact            Write compact JSON with no indentation. Used with --download.
      --tag=<value>        Folder name for storing downloaded context. Used with --download.

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
  Generate AI-ready session context.

  Generate AI-ready context for one or more sessions.
  The format and contents of the response are controlled by the profile configuration to optimize the information
  included for the intended use case.
  Multiple session IDs can be provided as space-separated arguments.

  For more information, see https://developer.fullstory.com/server/sessions/generate-context/

EXAMPLES
  Generate context using defaults.

    $ fs session:context 1841382665432129521:4929353557192241189

  Generate context using a saved summary profile.

    $ fs session:context 1841382665432129521:4929353557192241189 --profile 1c07280f-df08-494f-873e-6214cb6c46b4

  Generate context using a summary profile from a JSON file.

    $ fs session:context 1841382665432129521:4929353557192241189 --file ./summmary-profile.json

  Generate context for multiple sessions.

    $ fs session:context 1841382665432129521:4929353557192241189 1841382665432129521:5039353557192241190

  Download context for multiple sessions into a named subfolder.

    $ fs session:context 1841382665432129521:4929353557192241189 1841382665432129521:5039353557192241190 --download \
      --tag experiment-1
```

## `fs context:media SESSIONID`

Generate AI-ready session context with screenshots.

```
USAGE
  $ fs context:media SESSIONID... [--json] [--columns <value> | -x] [--filter <value>] [--no-header | [--csv |
    --no-truncate]] [--output csv|json|yaml |  | ] [--sort <value>] [-f <value>] [-p <value>] [-d] [--tag <value>]
    [--compact] [--events <value>] [--element] [--page]

ARGUMENTS
  SESSIONID...  The session ID (UserId:SessionId format, or a Fullstory session URL).

FLAGS
  -d, --download           Download session context as JSON files to the local data directory.
  -f, --file=<value>       Path to a JSON file containing the ProfileConfiguration.
  -p, --profileId=<value>  ID of a saved summarization profile to use as the ProfileConfiguration.
      --compact            Write compact JSON with no indentation. Used with --download.
      --element            Crop screenshots to the target element bounding box instead of the full viewport.
      --events=<value>     Comma-separated event types to screenshot (e.g. navigate,click,input-change). Defaults to
                           navigate and click.
      --page               Render the entire page beyond the viewport bounds.
      --tag=<value>        Folder name for storing downloaded context. Used with --download.

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
  Generate AI-ready session context with screenshots.

  Generate AI-ready context for a session with screenshots.
  The default screenshot is the viewport. Flags for element or full page screenshots can be used to adjust the
  screenshot type.

  This API is experimental and must be manually enabled in your Fullstory org.

EXAMPLES
  Generate context with default screenshots.

    $ fs session:context:media 1841382665432129521:4929353557192241189

  Generate context with screenshots for specific events.

    $ fs session:context:media 1841382665432129521:4929353557192241189 --events navigate,click,input-change

  Generate context with cropped screenshots.

    $ fs session:context:media 1841382665432129521:4929353557192241189 --crop

  Generate context with full page screenshots.

    $ fs session:context:media 1841382665432129521:4929353557192241189 --page
```
