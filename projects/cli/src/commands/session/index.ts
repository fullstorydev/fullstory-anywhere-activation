import { Session } from '@fullstory/activation-sdk/index.js';
import { Args, Flags } from '@oclif/core';

import { TableColumns, TableCommand } from '../../core/index.js';

export default class SessionListCommand extends TableCommand {
  static args = {
    userId: Args.string({ required: true, description: 'Email address or UID of the user.' }),
  };

  static columns: TableColumns<Session> = {
    createdTime: { name: 'Created', description: 'Create time', format: session => new Date(Number(session.createdTime) * 1000).toLocaleString() },
    sessionId: { name: 'Session ID', description: 'Session ID', format: session => `${session.userId}:${session.sessionId}` },
    fsUrl: { name: 'Session Replay URL', description: 'Link to session replay' },
  };

  static description = `List session replay URLs for a user, queried by email address or UID.
Automatically paginates through all results.

For more information, see https://developer.fullstory.com/server/sessions/`;

  static enableJsonFlag = true;

  static examples = [
    { command: '<%= config.bin %> session user@fullstory.com', description: 'List sessions by email.' },
    { command: '<%= config.bin %> session fsuser26', description: 'List sessions by UID.' },
    { command: '<%= config.bin %> session user@fullstory.com --json', description: 'List sessions as JSON.' },
    { command: '<%= config.bin %> session user@fullstory.com --output sessions.json', description: 'Save sessions to a file.' },
  ];

  static flags = {
    ...TableCommand.flags,
    output: Flags.string({ char: 'o', required: false, description: 'Save JSON output to file.' }),
  }

  static summary = 'List user sessions.';

  async run() {
    const { args: { userId }, flags } = await this.parse(SessionListCommand);

    const { Session } = this.Fullstory;
    const sessions = await Session.list(userId);

    if (flags.output) {
      const { writeJsonSync } = await import('fs-extra');
      writeJsonSync(flags.output, sessions, { spaces: 2 });
      this.print(`Sessions saved to ${flags.output}`, 'success');
      return sessions;
    }

    return this.table(sessions, SessionListCommand.columns);
  }
}
