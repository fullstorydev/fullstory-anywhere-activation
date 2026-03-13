import { Args } from '@oclif/core';

import { Command, Prompt } from '../../core/index.js';

export default class ProfileDeleteCommand extends Command {
  static args = {
    id: Args.string({ required: true, description: 'The profile ID to delete.' }),
  };

  static description = `Delete a summarization profile.
This action is irreversible. You will be prompted to confirm.

For more information, see https://developer.fullstory.com/server/sessions/delete/`;

  static enableJsonFlag = false;

  static examples = [
    { command: '<%= config.bin %> profile:delete abc-123', description: 'Delete a profile (with confirmation).' },
  ];

  static flags = {
    ...Command.flags,
  }

  static summary = 'Delete a summarization profile.';

  async run() {
    const { args: { id } } = await this.parse(ProfileDeleteCommand);
    const { SummaryProfile } = this.Fullstory;

    const confirmed = await Prompt.confirm(`Are you sure you want to delete profile "${id}"?`, false);
    if (!confirmed) {
      this.log('Cancelled.');
      return;
    }

    await SummaryProfile.remove(id);
    this.log(`Profile ${id} deleted.`);
  }
}
