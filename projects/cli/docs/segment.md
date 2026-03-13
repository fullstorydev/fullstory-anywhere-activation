`fs segment`
============

List segments.

* [`fs segment [CREATOR]`](#fs-segment-creator)

## `fs segment [CREATOR]`

List segments.

```
USAGE
  $ fs segment [CREATOR] [--json] [--columns <value> | -x] [--filter <value>] [--no-header | [--csv |
    --no-truncate]] [-o <value>] [--sort <value>] [--limit <value>]

ARGUMENTS
  [CREATOR]  Filter segments by creator email address.

FLAGS
  -o, --output=<value>  Save JSON output to file.
      --limit=<value>   [default: 100] Maximum number of segments per page (max 100).

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
  List segments.

  List segments with automatic pagination.
  If CREATOR is provided, filters the returned segments by the provided creator. This should be an email associated with
  a Fullstory account.

  For more information, see https://developer.fullstory.com/server/segments/list-segments/

EXAMPLES
  List all segments.

    $ fs segment

  List segments created by a specific user.

    $ fs segment user@example.com

  List segments as JSON.

    $ fs segment --json

  Save segments to a file.

    $ fs segment --output segments.json
```
