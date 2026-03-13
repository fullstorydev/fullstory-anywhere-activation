import { CreateEvent } from '@fullstory/activation-sdk/index.js';
import { Flags } from '@oclif/core';
import { readJsonSync } from 'fs-extra';

import { Command } from '../../core/index.js';

const POLL_INTERVAL_MS = 3000;

export default class EventImportCommand extends Command {
  static args = {};

  static description = `Batch import events from a JSON file (max 50,000 events per batch).
The file must contain a JSON array of event objects matching the CreateEvent schema,
each with a session object included.
By default, polls until the job completes. Use --no-wait to return immediately with the job ID.

For more information, see https://developer.fullstory.com/server/events/create-batch-events-import-job/`;

  static enableJsonFlag = true;

  static examples = [
    { command: '<%= config.bin %> event:import --file events.json', description: 'Import events and wait for completion.' },
    { command: '<%= config.bin %> event:import --file events.json --no-wait', description: 'Import events and return the job ID immediately.' },
  ];

  static flags = {
    ...Command.flags,
    file: Flags.string({ char: 'f', required: true, description: 'Path to a JSON file containing an array of event objects.' }),
    wait: Flags.boolean({ default: true, allowNo: true, description: 'Wait for the import job to complete.' }),
  }

  static summary = 'Batch import events from a file.';

  async run() {
    const { flags } = await this.parse(EventImportCommand);
    const { Event } = this.Fullstory;

    const events: CreateEvent[] = readJsonSync(flags.file);
    this.log(`Importing ${events.length} event(s)...`);

    const { job } = await Event.import(events);
    this.log(`Job created: ${job.id} (status: ${job.status})`);

    if (!flags.wait) {
      return { job };
    }

    this.start('Waiting for import job to complete');
    let status = await Event.job(job.id);

    while (status.status === 'PROCESSING') {
      await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL_MS));
      status = await Event.job(job.id);
    }

    this.stop(status.status);

    if (status.status === 'FAILED') {
      this.print(`Job ${job.id} failed. Run "event:errors ${job.id}" to view errors.`, 'fail');
    } else {
      this.print(`Job ${job.id} completed.`, 'success');
    }

    return { job: status };
  }
}
