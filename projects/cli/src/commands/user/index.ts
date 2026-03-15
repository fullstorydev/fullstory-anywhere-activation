/* eslint-disable camelcase */
import { GetUserResponse } from '@fullstory/activation-sdk/index.js';
import { Args, Flags } from '@oclif/core';

import { Fmt, TableColumns, TableCommand } from '../../core/index.js';

export default class UserListCommand extends TableCommand {
  static args = {
    id: Args.string({ required: false, description: 'Returns a specific user\'s details.' }),
  };

  static columns: TableColumns<GetUserResponse> = {
    id: { name: 'ID', description: 'Fullstory-assigned user ID' },
    uid: { name: 'UID', description: 'Application-specific user ID' },
    display_name: { name: 'Display Name', description: 'User display name' },
    email: { name: 'Email', description: 'User email address' },
    is_being_deleted: { name: 'Deleting', extended: true, description: 'Whether the user is being deleted' },
    app_url: { name: 'URL', description: 'Link to user in Fullstory', extended: true },
  };

  static description = `List users or retrieve a single user by Fullstory-assigned ID.
Without arguments, lists users in a table. Use filter flags to narrow results.
With a user ID argument, displays full user details including properties and schema.
Both modes support --json for machine-readable output and --output to save to a file.

For more information, see https://developer.fullstory.com/server/users/list-users/`;

  static enableJsonFlag = true;

  static examples = [
    { command: '<%= config.bin %> user', description: 'List users.' },
    { command: '<%= config.bin %> user --uid 01117503', description: 'Find a user by application UID.' },
    { command: '<%= config.bin %> user --email user@example.com', description: 'Find a user by email.' },
    { command: '<%= config.bin %> user 6388424976856404220 --json', description: 'Get a single user as JSON.' },
    { command: '<%= config.bin %> user 6388424976856404220 --output user.json', description: 'Save user details to a file.' },
  ];

  static flags = {
    ...TableCommand.flags,
    uid: Flags.string({ required: false, description: 'Filter by application-specific user ID.' }),
    email: Flags.string({ required: false, description: 'Filter by email address.' }),
    'display-name': Flags.string({ required: false, description: 'Filter by display name.' }),
    identified: Flags.boolean({ required: false, description: 'Filter to identified users only.' }),
    schema: Flags.boolean({ required: false, description: 'Include property schemas in the response.' }),
    page: Flags.string({ required: false, description: 'Fetch the next page using a next_page_token from a previous response.' }),
    output: Flags.string({ char: 'o', required: false, description: 'Save JSON output to file.' }),
  }

  static summary = 'List or get users.';

  printDetails(user: GetUserResponse): string {
    return `${Fmt.h1('user')}
${Fmt.h3('id')}\t\t\t${Fmt.id(user.id)}
${Fmt.h3('uid')}\t\t\t${Fmt.text(user.uid)}
${Fmt.h3('display_name')}\t\t${Fmt.text(user.display_name)}
${Fmt.h3('email')}\t\t\t${Fmt.text(user.email ? Fmt.email(user.email) : undefined)}
${Fmt.h3('is_being_deleted')}\t${user.is_being_deleted}
${Fmt.h3('app_url')}\t\t${Fmt.text(user.app_url)}

${Fmt.h1('properties')}
${user.properties ? JSON.stringify(user.properties, null, 2) : '-'}

${Fmt.h1('schema')}
${user.schema ? JSON.stringify(user.schema, null, 2) : '-'}
`;
  }

  async run() {
    const { args: { id }, flags } = await this.parse(UserListCommand);
    const { User } = this.Fullstory;

    if (id) {
      const user = await User.get(id, flags.schema);

      if (flags.output) {
        const { writeJsonSync } = await import('fs-extra');
        writeJsonSync(flags.output, user, { spaces: 2 });
        this.print(`User saved to ${flags.output}`, 'success');
        return user;
      }

      if (flags.json) {
        return user;
      }

      return this.print(this.printDetails(user));
    }

    const response = await User.list({
      uid: flags.uid,
      email: flags.email,
      display_name: flags['display-name'],
      is_identified: flags.identified,
      include_schema: flags.schema,
      page_token: flags.page,
    });

    if (flags.output) {
      const { writeJsonSync } = await import('fs-extra');
      writeJsonSync(flags.output, response, { spaces: 2 });
      this.print(`Users saved to ${flags.output}`, 'success');
      return response.results;
    }

    const summary = `${Fmt.number(response.total_records)} total users` +
      (response.next_page_token ? ` (run ${Fmt.cmd(this.config.bin, `user --page ${response.next_page_token}`)} to see more)` : '');

    return this.table(response.results, UserListCommand.columns, summary);
  }
}
