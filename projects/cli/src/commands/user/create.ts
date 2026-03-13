/* eslint-disable camelcase */
import { CreateUser } from '@fullstory/activation-sdk/index.js';
import { Args, Flags } from '@oclif/core';
import { readJsonSync } from 'fs-extra';

import { Command, Prompt } from '../../core/index.js';

export default class UserCreateCommand extends Command {
  static args = {};

  static description = `Create or upsert a user in Fullstory.
If a user with the given UID already exists, the user properties will be updated (upsert behavior).
Provide user fields via flags, or supply a complete JSON payload with --file.

For more information, see https://developer.fullstory.com/server/users/create-user/`;

  static enableJsonFlag = true;

  static examples = [
    { command: '<%= config.bin %> user:create --uid user-123 --email user@example.com --display-name "Jane Doe"', description: 'Create a user with common fields.' },
    { command: '<%= config.bin %> user:create --file user.json', description: 'Create a user from a JSON file.' },
    { command: '<%= config.bin %> user:create', description: 'Create a user interactively.' },
  ];

  static flags = {
    ...Command.flags,
    file: Flags.string({ char: 'f', required: false, description: 'Path to a JSON file containing user data (CreateUser schema).' }),
    uid: Flags.string({ required: false, description: 'Application-specific user ID (max 256 characters).' }),
    email: Flags.string({ required: false, description: 'Email address (max 128 characters).' }),
    'display-name': Flags.string({ required: false, description: 'Display name (max 256 characters).' }),
    properties: Flags.string({ required: false, description: 'JSON string of custom properties.' }),
  }

  static summary = 'Create or upsert a user.';

  async run() {
    const { flags } = await this.parse(UserCreateCommand);
    const { User } = this.Fullstory;

    let user: CreateUser;

    if (flags.file) {
      user = readJsonSync(flags.file);
    } else if (flags.uid || flags.email || flags['display-name'] || flags.properties) {
      user = {
        uid: flags.uid,
        email: flags.email,
        displayName: flags['display-name'],
        properties: flags.properties ? JSON.parse(flags.properties) : undefined,
      };
    } else {
      const uid = await Prompt.input('UID (application-specific user ID):');
      const email = await Prompt.input('Email:');
      const displayName = await Prompt.input('Display name:');

      user = {
        uid: uid || undefined,
        email: email || undefined,
        displayName: displayName || undefined,
      };
    }

    const response = await User.create(user);
    this.log(`User created with ID: ${response.id}`);
    return response;
  }
}
