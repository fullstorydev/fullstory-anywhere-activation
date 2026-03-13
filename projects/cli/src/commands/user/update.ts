/* eslint-disable camelcase */
import { UpdateUser } from '@fullstory/activation-sdk/index.js';
import { Args, Flags } from '@oclif/core';
import { readJsonSync } from 'fs-extra';

import { Command, Prompt } from '../../core/index.js';

export default class UserUpdateCommand extends Command {
  static args = {
    id: Args.string({ required: true, description: 'The Fullstory-assigned user ID to update.' }),
  };

  static description = `Update an existing user by Fullstory-assigned ID.
Provide updated fields via flags, or supply a complete JSON payload with --file.

For more information, see https://developer.fullstory.com/server/users/update-user/`;

  static enableJsonFlag = true;

  static examples = [
    { command: '<%= config.bin %> user:update abc123 --email new@example.com', description: 'Update a user\'s email.' },
    { command: '<%= config.bin %> user:update abc123 --file user-update.json', description: 'Update a user from a JSON file.' },
  ];

  static flags = {
    ...Command.flags,
    file: Flags.string({ char: 'f', required: false, description: 'Path to a JSON file containing user update data (UpdateUser schema).' }),
    uid: Flags.string({ required: false, description: 'Application-specific user ID (max 256 characters).' }),
    email: Flags.string({ required: false, description: 'Email address (max 128 characters).' }),
    'display-name': Flags.string({ required: false, description: 'Display name (max 256 characters).' }),
    properties: Flags.string({ required: false, description: 'JSON string of custom properties.' }),
  }

  static summary = 'Update a user.';

  async run() {
    const { args: { id }, flags } = await this.parse(UserUpdateCommand);
    const { User } = this.Fullstory;

    let user: UpdateUser;

    if (flags.file) {
      user = readJsonSync(flags.file);
    } else if (flags.uid || flags.email || flags['display-name'] || flags.properties) {
      user = {
        uid: flags.uid,
        email: flags.email,
        display_name: flags['display-name'],
        properties: flags.properties ? JSON.parse(flags.properties) : undefined,
      };
    } else {
      const uid = await Prompt.input('UID (leave blank to skip):');
      const email = await Prompt.input('Email (leave blank to skip):');
      const displayName = await Prompt.input('Display name (leave blank to skip):');

      user = {
        uid: uid || undefined,
        email: email || undefined,
        display_name: displayName || undefined,
      };
    }

    const response = await User.update(id, user);
    this.log(`User ${response.id} updated.`);
    return response;
  }
}
