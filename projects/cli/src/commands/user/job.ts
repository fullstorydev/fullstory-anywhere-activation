import { Args } from '@oclif/core';

import { Command, Fmt } from '../../core/index.js';

export default class UserJobCommand extends Command {
  static args = {
    jobId: Args.string({ required: true, description: 'The batch import job ID.' }),
  };

  static description = `Get the status of a batch user import job.
Poll the job status endpoint until the status is COMPLETED or FAILED.

For more information, see https://developer.fullstory.com/server/users/get-batch-users-import-job/`;

  static enableJsonFlag = true;

  static examples = [
    { command: '<%= config.bin %> user:job abc-123', description: 'Check the status of a batch import job.' },
  ];

  static flags = {
    ...Command.flags,
  }

  static summary = 'Get batch user import job status.';

  async run() {
    const { args: { jobId } } = await this.parse(UserJobCommand);
    const { User } = this.Fullstory;

    const job = await User.job(jobId);

    this.log(`${Fmt.h3('id')}\t\t${Fmt.id(job.id)}`);
    this.log(`${Fmt.h3('status')}\t\t${job.status}`);
    this.log(`${Fmt.h3('created')}\t${job.created}`);
    if (job.finished) {
      this.log(`${Fmt.h3('finished')}\t${job.finished}`);
    }

    return job;
  }
}
