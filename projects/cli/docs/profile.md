`fs profile`
============

Run profile --help to list topics.

* [`fs profile [ID]`](#fs-profile-id)
* [`fs profile:create [NAME]`](#fs-profilecreate-name)
* [`fs profile:delete ID`](#fs-profiledelete-id)
* [`fs profile:format`](#fs-profileformat)
* [`fs profile:update ID`](#fs-profileupdate-id)

## `fs profile [ID]`

List or get summarization profiles.

```
USAGE
  $ fs profile [ID] [--json] [--columns <value> | -x] [--filter <value>] [--no-header | [--csv |
    --no-truncate]] [--output csv|json|yaml |  | ] [--sort <value>]

ARGUMENTS
  [ID]  Returns a specific profile's details.

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
  List or get summarization profiles.

  List all summarization profiles or retrieve a single profile by ID.
  Without arguments, displays a table of all profiles with ID, name, model, and temperature columns. Use --extended to
  include prompt and configuration columns.
  With a profile ID argument, displays a detailed vertical view of all profile fields including LLM prompts, slice
  configuration, context exclusions, and event filtering settings.
  Both modes support --json for machine-readable output.

  For more information, see https://developer.fullstory.com/server/sessions/list-profiles

EXAMPLES
  List all profiles in a table.

    $ fs profile

  List all profiles with prompt and configuration columns.

    $ fs profile --extended

  Show detail view for a specific profile.

    $ fs profile 5371ea1b-625c-4773-b038-0dacb0b4d08a

  List all profiles as a JSON array.

    $ fs profile --json

  Get a single profile as a JSON object.

    $ fs profile 5371ea1b-625c-4773-b038-0dacb0b4d08a --json
```

## `fs profile:create [NAME]`

Create a summarization profile.

```
USAGE
  $ fs profile:create [NAME] [--json] [-f <value>] [--prePrompt <value>] [--postPrompt <value>] [--temperature
    <value>] [--responseSchema <value>] [--sliceMode FIRST|LAST|TIMESTAMP|UNSPECIFIED] [--eventLimit <value>]
    [--durationLimit <value>] [--startTimestamp <value>] [--endTimestamp <value>] [--excludeContext <value>]
    [--includeContext <value>] [--excludeEventTypes <value>] [--includeEventTypes <value>] [--cache]

ARGUMENTS
  [NAME]  The display name of the profile.

FLAGS
  -f, --file=<value>               Path to a JSON file containing the full ProfileConfiguration.
      --cache                      Enable cached event responses.
      --durationLimit=<value>      Duration limit in milliseconds for the slice.
      --endTimestamp=<value>       End timestamp (ISO 8601) for TIMESTAMP slice mode.
      --eventLimit=<value>         Maximum number of events to include in the slice.
      --excludeContext=<value>     Comma-separated context elements to exclude: device, location, org, user.
      --excludeEventTypes=<value>  Comma-separated event types to exclude (e.g. click,navigate,dead-click).
      --includeContext=<value>     Comma-separated context elements to include: device, location, org, user.
      --includeEventTypes=<value>  Comma-separated event types to include (e.g. click,navigate,error-click).
      --postPrompt=<value>         Custom instructions included after the session context.
      --prePrompt=<value>          Text included before the session context in the prompt.
      --responseSchema=<value>     Path to a JSON file defining the LLM response schema (ResponseSchema).
      --sliceMode=<option>         Slicing strategy: FIRST (earliest events), LAST (latest events), TIMESTAMP (time
                                   range).
                                   <options: FIRST|LAST|TIMESTAMP|UNSPECIFIED>
      --startTimestamp=<value>     Start timestamp (ISO 8601) for TIMESTAMP slice mode.
      --temperature=<value>        LLM temperature as a floating-point number.

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Create a summarization profile.

  Create a summarization profile that specifies prompting instructions and session context configuration.
  Provide the full configuration via --file, use flags for common settings, or run interactively to walk through each
  section.

  Configuration sections:
  LLM      Pre/post prompts, response schema, temperature
  Slice    Which portion of the session to analyze (FIRST, LAST, TIMESTAMP)
  Context  Session metadata to include/exclude (device, location, org, user)
  Events   Event type filtering and formatting options
  Cache    Enable cached event responses

  For more information, see https://developer.fullstory.com/server/sessions/create-profile/

EXAMPLES
  Create a profile with a pre-prompt.

    $ fs profile:create "My Profile" --prePrompt "Summarize this session."

  Create a profile from a JSON configuration file.

    $ fs profile:create "My Profile" --file config.json

  Create a profile analyzing the last 50 events.

    $ fs profile:create "My Profile" --sliceMode LAST --eventLimit 50

  Create a profile that excludes device and location context.

    $ fs profile:create "My Profile" --excludeContext device,location

  Create a profile interactively.

    $ fs profile:create
```

## `fs profile:delete ID`

Delete a summary profile.

```
USAGE
  $ fs profile:delete ID

ARGUMENTS
  ID  The profile ID to delete.

DESCRIPTION
  Delete a summary profile.

  Delete a summary profile.
  This action is irreversible. A backup of the profile will be saved to a tmp file before deletion.

  For more information, see https://developer.fullstory.com/server/sessions/delete/

EXAMPLES
  Delete a profile with the given ID.

    $ fs profile:delete 1c07280f-df08-494f-873e-6214cb6c46b
```

## `fs profile:format`

Format a multi-line prompt into a single-line JSON string value.

```
USAGE
  $ fs profile:format [-f <value>]

FLAGS
  -f, --file=<value>  Path to a text file containing the prompt.

DESCRIPTION
  Format a multi-line prompt into a single-line JSON string value.

  Format multi-line prompt text into a single-line JSON string value for use with pre_prompt and post_prompt properties.

  Reads text from a file (--file) or stdin. Outputs a JSON-encoded single-line string that can be pasted directly as a
  JSON string value.

EXAMPLES
  Format text from the clipboard (macOS).

    pbpaste | fs profile:format

  Format text piped from a file.

    cat prompt.txt | fs profile:format

  Format text from a file path.

    $ fs profile:format --file prompt.txt
```

## `fs profile:update ID`

Update a summarization profile.

```
USAGE
  $ fs profile:update ID [--json] [-f <value>] [--prePrompt <value>] [--postPrompt <value>] [--temperature <value>]

ARGUMENTS
  ID  The profile ID to update.

FLAGS
  -f, --file=<value>         Path to a JSON file containing profile configuration (ProfileConfiguration schema).
      --postPrompt=<value>   Custom instructions included after the session context.
      --prePrompt=<value>    Text included before the session context in the prompt.
      --temperature=<value>  LLM temperature (floating-point number).

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Update a summarization profile.

  Update an existing summarization profile.
  Provide updated configuration via flags or a JSON file matching the ProfileConfiguration schema.
  Only the fields you provide will be updated; other fields remain unchanged.

  For more information, see https://developer.fullstory.com/server/sessions/update/

EXAMPLES
  Update a profile's pre-prompt.

    $ fs profile:update abc-123 --prePrompt "Summarize this session."

  Update a profile from a JSON configuration file.

    $ fs profile:update abc-123 --file profile-config.json
```
