import { BatchEventImportError } from '@fullstory/activation-sdk/index.js';
import { Args, Flags } from '@oclif/core';

import { Fmt, TableColumns, TableCommand } from '../../core/index.js';

export default class EventErrorsCommand extends TableCommand {
  static args = {
    jobId: Args.string({ required: true, description: 'The batch import job ID.' }),
  };

  static columns: TableColumns<BatchEventImportError> = {
    code: { name: 'Code', description: 'Error code' },
    message: { name: 'Message', description: 'Error description' },
    eventName: { name: 'Event', format: (row) => row.event?.name || '-' },
    sessionId: { name: 'Session', format: (row) => row.event?.session?.id || '-' },
  };

  static description = `List errors from a batch event import job.

For more information, see https://developer.fullstory.com/server/events/get-batch-events-import-errors/`;

  static enableJsonFlag = true;

  static examples = [
    { command: '<%= config.bin %> event:errors abc-123', description: 'View errors from a batch import.' },
  ];

  static flags = {
    ...TableCommand.flags,
    output: Flags.string({ char: 'o', required: false, description: 'Save JSON output to file.' }),
  }

  static summary = 'List batch event import errors.';

  async run() {
    const { args: { jobId }, flags } = await this.parse(EventErrorsCommand);
    const { Event } = this.Fullstory;

    const response = await Event.errors(jobId);

    if (flags.output) {
      const { writeJsonSync } = await import('fs-extra');
      writeJsonSync(flags.output, response, { spaces: 2 });
      this.print(`Errors saved to ${flags.output}`, 'success');
      return response.results;
    }

    const summary = `${Fmt.number(response.total_records)} total errors` +
      (response.next_page_token ? ` (more available)` : '');

    return this.table(response.results, EventErrorsCommand.columns, summary);
  }
}
