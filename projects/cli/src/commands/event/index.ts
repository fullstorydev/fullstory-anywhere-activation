import { SessionEvent } from '@fullstory/activation-sdk/index.js';
import { Args, Flags } from '@oclif/core';
import { ensureDirSync, writeJsonSync } from 'fs-extra';
import jsonata from 'jsonata';
import { join } from 'node:path';

import { Fmt, TableColumns, TableCommand } from '../../core/index.js';

export default class SessionEventsCommand extends TableCommand {
  static args = {
    sessionId: Args.string({ required: true, description: 'The session ID or a Fullstory session URL.' }),
  };

  static columns: TableColumns<SessionEvent> = {
    eventTimestamp: {
      name: 'Event Timestamp', description: 'Event timestamp',
      format: event => event.event_time,
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

  static description = `List all captured events for one or more sessions.
Optionally filter by event type and/or transform the output with a JSONata expression.
Multiple session IDs can be provided as space-separated arguments.

For more information, see https://developer.fullstory.com/server/sessions/get-session-events/`;

  static enableJsonFlag = true;

  static examples = [
    { command: '<%= config.bin %> event 1841382665432129521:4929353557192241189', description: 'List all events for a session.' },
    { command: '<%= config.bin %> event 1841382665432129521:4929353557192241189 --type change', description: 'List only "change" events.' },
    { command: '<%= config.bin %> event 1841382665432129521:4929353557192241189 --type change --query $.event_properties.target.text', description: 'Extract text values from "change" events using JSONata (outputs JSON).' },
    { command: '<%= config.bin %> event 1841382665432129521:4929353557192241189 --json', description: 'Output all events as JSON.' },
    { command: '<%= config.bin %> event 1841382665432129521:4929353557192241189 1841382665432129521:5039353557192241190', description: 'List events for multiple sessions.' },
    { command: '<%= config.bin %> event 1841382665432129521:4929353557192241189 1841382665432129521:5039353557192241190 --download --tag experiment-1', description: 'Download events for multiple sessions into a named subfolder.' },
  ];

  static flags = {
    ...TableCommand.flags,
    // type and querying events is only available in the CLI (it is not an API option)
    type: Flags.string({ required: false, description: 'Filter events by event_type (e.g. navigate, click, change, custom).' }),
    query: Flags.string({ required: false, description: 'JSONata expression to transform or extract data from the events (outputs JSON).' }),
    download: Flags.boolean({ char: 'd', default: false, description: 'Download session events as JSON files to the local data directory.' }),
    tag: Flags.string({ required: false, description: 'Folder name for storing downloaded events. Used with --download.' }),
    spaces: Flags.integer({ required: false, default: 2, description: 'Number of spaces for JSON indentation. Use 0 for compact output. Used with --download.' }),
  };

  static strict = false;

  static summary = 'List all captured events for a session.';

  async run() {
    const { args: { sessionId }, argv, flags: { query, type, download, tag, spaces } } = await this.parse(SessionEventsCommand);

    const sessionIds = [sessionId, ...(argv as string[])];
    const { Session } = this.Fullstory;

    // if multiple session IDs are provided, events from multiple sessions are aggregated
    const allEvents: SessionEvent[] = [];

    // separate map of events by session ID
    const eventsBySession = new Map<string, SessionEvent[]>();

    if (sessionIds.length > 1) {
      this.showProgress('sessions fetched', sessionIds.length);
    }

    for (const id of sessionIds) {
      let events = await Session.events(id);

      if (type) {
        events = events.filter(event => event.event_type === type);
      }

      eventsBySession.set(id, events);
      allEvents.push(...events);
      this.progress?.increment();
    }

    this.progress?.stop();

    if (download) {
      const dir = tag ? join(this.config.dataDir, 'events', tag) : join(this.config.dataDir, 'events');
      ensureDirSync(dir);

      for (const [id, events] of eventsBySession) {
        const filename = id.replaceAll(':', '-') + '.json';
        writeJsonSync(join(dir, filename), events, { spaces });
      }

      this.print(`Session events saved to ${Fmt.constant(dir)}`);
      return allEvents;
    }

    if (query) {
      const expression = jsonata(query);
      const result = await expression.evaluate(allEvents);
      this.logJson(result);
      return result;
    }

    return this.table(allEvents, SessionEventsCommand.columns);
  }
}
