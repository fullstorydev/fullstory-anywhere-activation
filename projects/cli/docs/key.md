`fs key`
========

List API keys.

* [`fs key`](#fs-key)
* [`fs key:add [ORGID] [APIKEY] [DOMAIN]`](#fs-keyadd-orgid-apikey-domain)
* [`fs key:remove [ORGID]`](#fs-keyremove-orgid)
* [`fs key:use [ORGID]`](#fs-keyuse-orgid)

## `fs key`

List API keys.

```
USAGE
  $ fs key [--json] [--columns <value> | -x] [--filter <value>] [--no-header | [--csv | --no-truncate]]
    [--output csv|json|yaml |  | ] [--sort <value>]

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
  List API keys.

  List locally stored API keys and their corresponding org IDs.

EXAMPLES
  List locally stored API keys.

    $ fs key
```

## `fs key:add [ORGID] [APIKEY] [DOMAIN]`

Stores an API key.

```
USAGE
  $ fs key:add [ORGID] [APIKEY] [DOMAIN]

ARGUMENTS
  [ORGID]   The org ID associated with the API key, found in the Fullstory app under Settings > Integrations > API Keys.
  [APIKEY]  The Fullstory API key to store. API keys are prefixed with a region identifier (e.g. "na1." for US, "eu1."
            for EU) and can be created in the Fullstory app under Settings > Integrations > API Keys.
  [DOMAIN]  Fullstory API domain for your region (e.g. api.fullstory.com or api.eu1.fullstory.com). When omitted, the
            domain is inferred from the region prefix of the API key (e.g. "na1." → api.fullstory.com, "eu1." →
            api.eu1.fullstory.com). An error is raised when the provided domain is inconsistent with the key prefix.

DESCRIPTION
  Stores an API key.

  Stores an API key on the local machine to be used with commands.

  The domain is the Fullstory API host for your region:
  - US:  api.fullstory.com (API keys starting with "na1.")
  - EU:  api.eu1.fullstory.com (API keys starting with "eu1.")

  When no domain is provided it is inferred automatically from the API key prefix. An error is raised if the supplied
  domain does not match the region indicated by the key.

  For more information on creating API keys, see
  https://developer.fullstory.com/server/v1/authentication/getting-started/#creating-a-key.

EXAMPLES
  Store the provided API key, inferring the domain from the key prefix.

    $ fs key:add o-DEMO-na1 na1.by11Q...vs4u/DEMO

  Store the provided API key with an explicit domain.

    $ fs key:add o-DEMO-eu1 eu1.by11Q...vs4u/DEMO api.eu1.fullstory.com
```

## `fs key:remove [ORGID]`

Removes an API key.

```
USAGE
  $ fs key:remove [ORGID]

ARGUMENTS
  [ORGID]  The org ID associated with the API key to remove

DESCRIPTION
  Removes an API key.

  Removes an API key from local storage. If no org ID is provided, you will be prompted to select from stored keys.

EXAMPLES
  Interactively select which API key to remove.

    key:remove

  Remove the API key for the given org ID.

    key:remove o-DEMO-na1
```

## `fs key:use [ORGID]`

Select an API key for use.

```
USAGE
  $ fs key:use [ORGID]

ARGUMENTS
  [ORGID]  The org ID associated with the previously added API key

DESCRIPTION
  Select an API key for use.

  Select an API key to be used with commands. If no org ID is provided, you will be prompted to select from stored keys.

EXAMPLES
  Interactively select which API key to use with commands.

    key:use

  Use the API key for the given org ID with commands.

    key:use DEMO
```
