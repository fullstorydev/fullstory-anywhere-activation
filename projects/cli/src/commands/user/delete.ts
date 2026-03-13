import { Args } from '@oclif/core';

import { Command, Prompt } from '../../core/index.js';

export default class UserDeleteCommand extends Command {
  static args = {
    id: Args.string({ required: true, description: 'The Fullstory-assigned user ID to delete.' }),
  };

  static description = `Delete a user by Fullstory-assigned ID.
This action is irreversible. You will be prompted to confirm unless --force is passed.

For more information, see https://developer.fullstory.com/server/users/delete-user/`;

  static enableJsonFlag = false;

  static examples = [
    { command: '<%= config.bin %> user:delete abc123', description: 'Delete a user (with confirmation).' },
  ];

  static flags = {
    ...Command.flags,
  }

  static summary = 'Delete a user.';

  async run() {
    const { args: { id } } = await this.parse(UserDeleteCommand);
    const { User } = this.Fullstory;

    const confirmed = await Prompt.confirm(`Are you sure you want to delete user "${id}"?`, false);
    if (!confirmed) {
      this.log('Cancelled.');
      return;
    }

    await User.delete(id);
    this.log(`User ${id} deleted.`);
  }
}
