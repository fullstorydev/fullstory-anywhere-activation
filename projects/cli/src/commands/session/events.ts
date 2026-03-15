import { SessionEvent } from '@fullstory/activation-sdk/index.js';
import { Args, Flags } from '@oclif/core';
import jsonata from 'jsonata';

import { TableColumns, TableCommand } from '../../core/index.js';

export default class SessionEventsCommand extends TableCommand {
  static args = {
    sessionId: Args.string({ required: true, description: 'The session ID (UserId:SessionId format, or a Fullstory session URL).' }),
  };

  static columns: TableColumns<SessionEvent> = {
    eventTimestamp: {
      name: 'Event Timestamp', description: 'Event timestamp', extended: true,
      format: event => event.event_time,
    },
    eventTime: {
      name: 'Event Time', description: 'Formatted event time',
      format: event => new Date(event.event_time).toLocaleString(),
    },
    sourceType: {
      name: 'Source', description: 'Source platform (web, ios, android, server)', extended: true,
      format: event => event.source_type ?? '',
    },
    eventType: {
      name: 'Event', description: 'Event type (navigate, click, change, custom, etc.)',
      format: event => event.event_type,
    },
    details: {
      name: 'Event Properties', description: 'Key details relevant to the event type (destination URL, target text, custom event name, etc.)',
      format: event => JSON.stringify(event.event_properties ?? {}),
    },
  };

  static description = `List all captured events for a session.
Optionally filter by event type and/or transform the output with a JSONata expression.

For more information, see https://developer.fullstory.com/server/sessions/get-session-events/`;

  static enableJsonFlag = true;

  static examples = [
    { command: '<%= config.bin %> session:events 1841382665432129521:4929353557192241189', description: 'List all events for a session.' },
    { command: '<%= config.bin %> session:events 1841382665432129521:4929353557192241189 --type change', description: 'List only "change" events.' },
    { command: '<%= config.bin %> session:events 1841382665432129521:4929353557192241189 --type change --query $.event_properties.target.text', description: 'Extract text values from "change" events using JSONata (outputs JSON).' },
    { command: '<%= config.bin %> session:events 1841382665432129521:4929353557192241189 --json', description: 'Output all events as JSON.' },
  ];

  static flags = {
    ...TableCommand.flags,
    // type and querying events is only available in the CLI (it is not an API option)
    type: Flags.string({ required: false, description: 'Filter events by event_type (e.g. navigate, click, change, custom).' }),
    query: Flags.string({ required: false, description: 'JSONata expression to transform or extract data from the events (outputs JSON).' }),
  };

  static summary = 'List all captured events for a session.';

  async run() {
    const { args: { sessionId }, flags: { query, type } } = await this.parse(SessionEventsCommand);

    const { Session } = this.Fullstory;

    let events = await Session.events(sessionId);

    if (type) {
      events = events.filter(event => event.event_type === type);
    }

    if (query) {
      const expression = jsonata(query);
      const result = await expression.evaluate(events);
      this.logJson(result);
      return result;
    }

    return this.table(events, SessionEventsCommand.columns);
  }
}
