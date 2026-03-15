import { Args } from '@oclif/core';
import { writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { Command, Fmt } from '../../core/index.js';

export default class ProfileDeleteCommand extends Command {
  static args = {
    id: Args.string({ required: true, description: 'The profile ID to delete.' }),
  };

  static description = `Delete a summary profile.
This action is irreversible. A backup of the profile will be saved to a tmp file before deletion.

For more information, see https://developer.fullstory.com/server/sessions/delete/`;

  static enableJsonFlag = false;

  static examples = [
    { command: '<%= config.bin %> profile:delete 1c07280f-df08-494f-873e-6214cb6c46b', description: 'Delete a profile with the given ID.' },
  ];

  static flags = {
    ...Command.flags,
  }

  static summary = 'Delete a summary profile.';

  async run() {
    const { args: { id } } = await this.parse(ProfileDeleteCommand);
    const { SummaryProfile } = this.Fullstory;

    const profile = await SummaryProfile.get(id);

    const tmpPath = join(tmpdir(), `profile-${id}-${Date.now()}.json`);
    writeFileSync(tmpPath, JSON.stringify(profile, null, 2));

    await SummaryProfile.remove(id);
    this.log(`Profile ${Fmt.key(id)} deleted (backup saved to ${Fmt.key(tmpPath)})`);
  }
}
