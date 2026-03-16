`fs user`
=========

Run user --help to list topics.

* [`fs user [ID]`](#fs-user-id)
* [`fs user:create`](#fs-usercreate)
* [`fs user:delete ID`](#fs-userdelete-id)
* [`fs user:errors JOBID`](#fs-usererrors-jobid)
* [`fs user:import`](#fs-userimport)
* [`fs user:job JOBID`](#fs-userjob-jobid)
* [`fs user:update ID`](#fs-userupdate-id)

## `fs user [ID]`

List or get users.

```
USAGE
  $ fs user [ID] [--json] [--columns <value> | -x] [--filter <value>] [--no-header | [--csv |
    --no-truncate]] [-o <value>] [--sort <value>] [--uid <value>] [--email <value>] [--display-name <value>]
    [--identified] [--schema] [--page <value>]

ARGUMENTS
  [ID]  Returns a specific user's details.

FLAGS
  -o, --output=<value>        Save JSON output to file.
      --display-name=<value>  Filter by display name.
      --email=<value>         Filter by email address.
      --identified            Filter to identified users only.
      --page=<value>          Fetch the next page using a next_page_token from a previous response.
      --schema                Include property schemas in the response.
      --uid=<value>           Filter by application-specific user ID.

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
  List or get users.

  List users or retrieve a single user by Fullstory-assigned ID.
  Without arguments, lists users in a table. Use filter flags to narrow results.
  With a user ID argument, displays full user details including properties and schema.
  Both modes support --json for machine-readable output and --output to save to a file.

  For more information, see https://developer.fullstory.com/server/users/list-users/

EXAMPLES
  List users.

    $ fs user

  Find a user by application UID.

    $ fs user --uid 01117503

  Find a user by email.

    $ fs user --email user@example.com

  Get a single user as JSON.

    $ fs user 6388424976856404220 --json

  Save user details to a file.

    $ fs user 6388424976856404220 --output user.json
```

## `fs user:create`

Create or upsert a user.

```
USAGE
  $ fs user:create [--json] [-f <value>] [--uid <value>] [--email <value>] [--display-name <value>] [--properties
    <value>]

FLAGS
  -f, --file=<value>          Path to a JSON file containing user data (CreateUser schema).
      --display-name=<value>  Display name (max 256 characters).
      --email=<value>         Email address (max 128 characters).
      --properties=<value>    JSON string of custom properties.
      --uid=<value>           Application-specific user ID (max 256 characters).

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Create or upsert a user.

  Create or upsert a user in Fullstory.
  If a user with the given UID already exists, the user properties will be updated (upsert behavior).
  Provide user fields via flags, or supply a complete JSON payload with --file.

  For more information, see https://developer.fullstory.com/server/users/create-user/

EXAMPLES
  Create a user with common fields.

    $ fs user:create --uid user-123 --email user@example.com --display-name "Jane Doe"

  Create a user from a JSON file.

    $ fs user:create --file user.json

  Create a user interactively.

    $ fs user:create
```

## `fs user:delete ID`

Delete a user.

```
USAGE
  $ fs user:delete ID

ARGUMENTS
  ID  The Fullstory-assigned user ID to delete.

DESCRIPTION
  Delete a user.

  Delete a user by Fullstory-assigned ID.
  This action is irreversible. You will be prompted to confirm unless --force is passed.

  For more information, see https://developer.fullstory.com/server/users/delete-user/

EXAMPLES
  Delete a user (with confirmation).

    $ fs user:delete abc123
```

## `fs user:errors JOBID`

List batch user import errors.

```
USAGE
  $ fs user:errors JOBID [--json] [--columns <value> | -x] [--filter <value>] [--no-header | [--csv |
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
  List batch user import errors.

  List errors from a batch user import job.

  For more information, see https://developer.fullstory.com/server/users/get-batch-users-import-errors/

EXAMPLES
  View errors from a batch import.

    $ fs user:errors abc-123
```

## `fs user:import`

Batch import users from a file.

```
USAGE
  $ fs user:import -f <value> [--json] [--wait]

FLAGS
  -f, --file=<value>  (required) Path to a JSON file containing an array of user objects.
      --[no-]wait     Wait for the import job to complete.

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Batch import users from a file.

  Batch import users from a JSON file (max 50,000 users per batch).
  The file must contain a JSON array of user objects matching the CreateUser schema.
  By default, polls until the job completes. Use --no-wait to return immediately with the job ID.

  For more information, see https://developer.fullstory.com/server/users/create-batch-users-import-job/

EXAMPLES
  Import users and wait for completion.

    $ fs user:import --file users.json

  Import users and return the job ID immediately.

    $ fs user:import --file users.json --no-wait
```

## `fs user:job JOBID`

Get batch user import job status.

```
USAGE
  $ fs user:job JOBID [--json]

ARGUMENTS
  JOBID  The batch import job ID.

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Get batch user import job status.

  Get the status of a batch user import job.
  Poll the job status endpoint until the status is COMPLETED or FAILED.

  For more information, see https://developer.fullstory.com/server/users/get-batch-users-import-job/

EXAMPLES
  Check the status of a batch import job.

    $ fs user:job abc-123
```

## `fs user:update ID`

Update a user.

```
USAGE
  $ fs user:update ID [--json] [-f <value>] [--uid <value>] [--email <value>] [--display-name <value>]
    [--properties <value>]

ARGUMENTS
  ID  The Fullstory-assigned user ID to update.

FLAGS
  -f, --file=<value>          Path to a JSON file containing user update data (UpdateUser schema).
      --display-name=<value>  Display name (max 256 characters).
      --email=<value>         Email address (max 128 characters).
      --properties=<value>    JSON string of custom properties.
      --uid=<value>           Application-specific user ID (max 256 characters).

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Update a user.

  Update an existing user by Fullstory-assigned ID.
  Provide updated fields via flags, or supply a complete JSON payload with --file.

  For more information, see https://developer.fullstory.com/server/users/update-user/

EXAMPLES
  Update a user's email.

    $ fs user:update abc123 --email new@example.com

  Update a user from a JSON file.

    $ fs user:update abc123 --file user-update.json
```
