`fs annotation`
===============

Create an annotation.

* [`fs annotation:create [TEXT]`](#fs-annotationcreate-text)

## `fs annotation:create [TEXT]`

Create an annotation.

```
USAGE
  $ fs annotation:create [TEXT] [--json] [--source <value>] [--start <value>] [--end <value>]

ARGUMENTS
  [TEXT]  Annotation text (max 200 characters).

FLAGS
  --end=<value>     End time in ISO 8601 format. Defaults to start time.
  --source=<value>  Source or creator label displayed on the annotation (max 40 characters).
  --start=<value>   Start time in ISO 8601 format. Defaults to current server time.

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Create an annotation.

  Create an annotation that appears on Fullstory visualizations.
  Annotations mark a point or range in time, useful for tracking deployments, incidents, or feature launches.

  For more information, see https://developer.fullstory.com/server/annotations/create-annotation/

EXAMPLES
  Create an annotation at the current time.

    $ fs annotation:create "v2.1 deployed"

  Create an annotation with a time range and source.

    $ fs annotation:create "Feature launch" --source "CI/CD" --start 2024-08-01T12:00:00Z --end 2024-08-01T13:00:00Z

  Create an annotation interactively.

    $ fs annotation:create
```
