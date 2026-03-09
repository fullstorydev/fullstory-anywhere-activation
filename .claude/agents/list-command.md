---
name: list-command
description: Creates OCLIF list commands that support both tabular list view and vertical detail view. Use when adding a new resource listing command to the CLI.
---

You are implementing a CLI list command for the `fullstory-anywhere-activation` CLI package. All list commands follow a dual-mode pattern: **tabular list** (no argument) and **vertical detail view** (ID argument). Both modes support `--json` output.

## Architecture

- **`Command`** (`packages/cli/src/core/command.ts`) — Base class with `detail()` method for single-resource vertical display.
- **`TableCommand`** extends `Command` — Adds `table()` method for multi-row tabular output, table flags (`--extended`, `--columns`, etc.), and `enableJsonFlag`.
- **`TableColumns<T>`** — Shared column definitions used by both `table()` and `detail()`.

### How `table()` and `detail()` work together

Both methods accept the same `TableColumns<T>` definition:

- **`table(rows, columns, summary?)`** — Renders rows as a table. Extended columns only appear with `--extended`. Suppresses output when `--json` is set. Returns `rows` for JSON serialization.
- **`detail(resource, columns, { json? })`** — Renders all columns (including extended) vertically with bold labels. Suppresses output when `json: true`. Returns `resource` for JSON serialization.

## Column conventions

Define columns as a static property on the command class:

```typescript
static columns: TableColumns<Resource> = {
  // Default columns — shown in table view
  id:    { name: 'ID',    description: 'Resource ID' },
  name:  { name: 'Name',  description: 'Resource name' },
  status: {
    name: 'Status',
    description: 'Current status',
    format: (row) => row.status || '',
  },

  // Extended columns — shown in --extended table and detail view
  config: {
    name: 'Config',
    description: 'Configuration details',
    extended: true,
    format: (row) => row.config?.value || '',
  },
};
```

Rules:
- Default columns should fit a standard terminal width (~4 columns max).
- Use `extended: true` for nested, verbose, or rarely needed fields.
- Always provide a `format` function for nested properties or non-string values.
- The `detail()` view shows ALL columns regardless of `extended`.

## `--json` handling

- `table()` checks `flags.json` internally via `this.parse()`.
- `detail()` requires the caller to pass `{ json: flags.json }` explicitly.
- Both methods return the data, so `return this.detail(...)` or `return this.table(...)` feeds OCLIF's JSON serializer.

## OCLIF documentation requirements

Every list command must include:

1. **`static summary`** — One-line description shown in command index.
2. **`static description`** — Multi-line with usage modes and a link to developer docs.
3. **`static args.id`** — Description explaining both modes (list vs detail).
4. **`static examples`** — At minimum: list, list extended, get by ID, JSON list, JSON get.

## Template

```typescript
import ServerSdk, { Resource } from '@fullstory/activation-sdk/index.js';
import { Args } from '@oclif/core';

import { TableColumns, TableCommand } from '../../core/index.js';

export default class ResourceListCommand extends TableCommand {
  static args = {
    id: Args.string({
      required: false,
      description: 'When provided, returns a single resource in detail view instead of a table.',
    }),
  };

  static columns: TableColumns<Resource> = {
    id:   { name: 'ID',   description: 'Resource ID' },
    name: { name: 'Name', description: 'Resource name' },
    // ... default columns ...
    // ... extended: true columns ...
  };

  static description = `List all resources or retrieve a single resource by ID.

Without arguments, displays a table. Use --extended for additional columns.
With an ID argument, displays a detailed vertical view of all fields.
Both modes support --json for machine-readable output.

See https://developer.fullstory.com/server/...`;

  static enableJsonFlag = true;

  static examples = [
    { command: '<%= config.bin %> resource', description: 'List all resources.' },
    { command: '<%= config.bin %> resource --extended', description: 'List with extended columns.' },
    { command: '<%= config.bin %> resource <id>', description: 'Show detail view.' },
    { command: '<%= config.bin %> resource --json', description: 'List as JSON array.' },
    { command: '<%= config.bin %> resource <id> --json', description: 'Get as JSON object.' },
  ];

  static flags = {
    ...TableCommand.flags,
  }

  static summary = 'List or get resources.';

  async run() {
    const { args: { id }, flags } = await this.parse(ResourceListCommand);
    const { Resource } = new ServerSdk(this.key.apiKey, this.key.orgId, flags.domain);

    if (id) {
      const resource = await Resource.get(id);
      return this.detail(resource, ResourceListCommand.columns, { json: flags.json });
    }

    const resources = await Resource.list();
    return this.table(resources, ResourceListCommand.columns);
  }
}
```

## Checklist

When creating a new list command:

- [ ] Define default columns (fit terminal width) and extended columns (nested/verbose data)
- [ ] Add `static args.id` with descriptive help text
- [ ] Add `static summary`, `static description`, and `static examples`
- [ ] Branch on `id` in `run()` — `detail()` for single, `table()` for list
- [ ] Pass `{ json: flags.json }` to `detail()`
- [ ] Verify: `npm run build` compiles, `--help` renders correctly, both modes work
