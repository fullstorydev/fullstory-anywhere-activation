import { CreateUser } from '@fullstory/activation-sdk/index.js';
import { Args, Flags } from '@oclif/core';
import { readJsonSync } from 'fs-extra';

import { Command } from '../../core/index.js';

const POLL_INTERVAL_MS = 3000;

export default class UserImportCommand extends Command {
  static args = {};

  static description = `Batch import users from a JSON file (max 50,000 users per batch).
The file must contain a JSON array of user objects matching the CreateUser schema.
By default, polls until the job completes. Use --no-wait to return immediately with the job ID.

For more information, see https://developer.fullstory.com/server/users/create-batch-users-import-job/`;

  static enableJsonFlag = true;

  static examples = [
    { command: '<%= config.bin %> user:import --file users.json', description: 'Import users and wait for completion.' },
    { command: '<%= config.bin %> user:import --file users.json --no-wait', description: 'Import users and return the job ID immediately.' },
  ];

  static flags = {
    ...Command.flags,
    file: Flags.string({ char: 'f', required: true, description: 'Path to a JSON file containing an array of user objects.' }),
    wait: Flags.boolean({ default: true, allowNo: true, description: 'Wait for the import job to complete.' }),
  }

  static summary = 'Batch import users from a file.';

  async run() {
    const { flags } = await this.parse(UserImportCommand);
    const { User } = this.Fullstory;

    const users: CreateUser[] = readJsonSync(flags.file);
    this.log(`Importing ${users.length} user(s)...`);

    const { job } = await User.import(users);
    this.log(`Job created: ${job.id} (status: ${job.status})`);

    if (!flags.wait) {
      return { job };
    }

    this.start('Waiting for import job to complete');
    let status = await User.job(job.id);

    while (status.status === 'PROCESSING') {
      await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL_MS));
      status = await User.job(job.id);
    }

    this.stop(status.status);

    if (status.status === 'FAILED') {
      this.print(`Job ${job.id} failed. Run "user:errors ${job.id}" to view errors.`, 'fail');
    } else {
      this.print(`Job ${job.id} completed.`, 'success');
    }

    return { job: status };
  }
}
