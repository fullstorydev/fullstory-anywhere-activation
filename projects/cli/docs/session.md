`fs session`
============

Run session --help to list topics.

* [`fs session USERID`](#fs-session-userid)

## `fs session USERID`

List user sessions.

```
USAGE
  $ fs session USERID [--json] [--columns <value> | -x] [--filter <value>] [--no-header | [--csv |
    --no-truncate]] [-o <value>] [--sort <value>] [-d]

ARGUMENTS
  USERID  Email address or UID of the user.

FLAGS
  -d, --download        Download all session events as JSON files to the local data directory.
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

    $ fs session fsuser26

  List sessions as JSON.

    $ fs session user@fullstory.com --json

  Save sessions to a file.

    $ fs session user@fullstory.com --output sessions.json

  Download all session events as JSON files.

    $ fs session user@fullstory.com --download
```
