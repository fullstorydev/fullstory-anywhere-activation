import { Segment } from '@fullstory/activation-sdk/index.js';
import { Args, Flags } from '@oclif/core';

import { TableColumns, TableCommand } from '../../core/index.js';

export default class SegmentListCommand extends TableCommand {
  static args = {
    creator: Args.string({ required: false, description: 'Filter segments by creator email address.' }),
  };

  static columns: TableColumns<Segment> = {
    id: { name: 'ID', description: 'Segment ID' },
    name: { name: 'Name', description: 'Segment name' },
    creator: { name: 'Creator', description: 'Segment creator (email address)' },
    created: { name: 'Created', description: 'Segment creation time' },
    url: { name: 'Segment Link', description: 'Link to segment' },
  };

  static description = `List segments with automatic pagination.
If CREATOR is provided, filters the returned segments by the provided creator. This should be an email associated with a Fullstory account.

For more information, see https://developer.fullstory.com/server/segments/list-segments/`;

  static enableJsonFlag = true;

  static examples = [
    { command: '<%= config.bin %> segment', description: 'List all segments.' },
    { command: '<%= config.bin %> segment user@example.com', description: 'List segments created by a specific user.' },
    { command: '<%= config.bin %> segment --json', description: 'List segments as JSON.' },
    { command: '<%= config.bin %> segment --output segments.json', description: 'Save segments to a file.' },
  ];

  static flags = {
    ...TableCommand.flags,
    limit: Flags.integer({ default: 100, required: false, description: 'Maximum number of segments per page (max 100).' }),
    output: Flags.string({ char: 'o', required: false, description: 'Save JSON output to file.' }),
  }

  static summary = 'List segments.';

  async run() {
    const { args: { creator }, flags } = await this.parse(SegmentListCommand);

    const { Segment } = this.Fullstory;
    const segments = await Segment.list({ limit: flags.limit, creator });

    if (flags.output) {
      const { writeJsonSync } = await import('fs-extra');
      writeJsonSync(flags.output, segments, { spaces: 2 });
      this.print(`Segments saved to ${flags.output}`, 'success');
      return segments;
    }

    return this.table(segments, SegmentListCommand.columns);
  }
}
