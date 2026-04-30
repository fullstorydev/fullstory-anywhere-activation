`fs summary`
============

Generate a session summary.

* [`fs summary SESSIONID [PROFILEID]`](#fs-summary-sessionid-profileid)

## `fs summary SESSIONID [PROFILEID]`

Generate a session summary.

```
USAGE
  $ fs summary SESSIONID [PROFILEID] [--json] [--endTimestamp <value>] [-f <value>]

ARGUMENTS
  SESSIONID    The session ID (UserId:SessionId format, or a Fullstory session URL).
  [PROFILEID]  The summarization profile ID. If omitted, you will be prompted to select one.

FLAGS
  -f, --file=<value>          Path to a JSON file containing summary profile configuration.
      --endTimestamp=<value>  Only include events before this ISO 8601 timestamp.

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Generate a session summary.

  Generate an AI summary of a session using a summarization profile.

  A summary profile contains prompting instructions and session context configuration. Profiles can be provided by:
  - Interatively choosing a previously created profile.
  - Providing the previously created profile ID.
  - Providing a local file containing a profile's JSON.
  - Providing both the profile ID and a local file.

  When both a profile ID and a local file are used, the local file's profile properties will override the same
  properties in the profile referenced by the ID.

  Template variables can be used in pre_prompt and post_prompt fields:
  - `{{tag:name}}` — inlines all session JSONs from the named tag directory (downloaded via session:context --download
  --tag).
  - `{{file:./path/to/file.txt}}` — inlines the contents of the referenced file.
  - `{{VARIABLE_NAME}}` — prompts you interactively for a value at runtime.

  For more information, see https://developer.fullstory.com/server/sessions/summarize/.

EXAMPLES
  Interactively select a profile and summarize the session.

    $ fs session:summary 1841382665432129521:4929353557192241189

  Summarize the session using a saved profile.

    $ fs session:summary 1841382665432129521:4929353557192241189 1c07280f-df08-494f-873e-6214cb6c46b

  Summarize from session start time until the end timestamp

    $ fs session:summary 1841382665432129521:4929353557192241189 1c07280f-df08-494f-873e-6214cb6c46b --endTimestamp \
      2024-08-01T13:00:00Z

  Summarize the session using a local profile.

    $ fs session:summary 1841382665432129521:4929353557192241189 --file profile.json

  Summarize the session using a saved profile with local overrides.

    $ fs session:summary 1841382665432129521:4929353557192241189 1c07280f-df08-494f-873e-6214cb6c46b --file \
      profile.json

  Summarize using a profile with template variables ({{VAR}} and {{file:path}}).

    $ fs session:summary 1841382665432129521:4929353557192241189 --file profile-with-vars.json

  Summarize using a profile with {{tag:experiment-1}} to include downloaded session contexts.

    $ fs session:summary 1841382665432129521:4929353557192241189 --file profile-with-tag.json
```
