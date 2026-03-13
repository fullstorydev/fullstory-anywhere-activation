import { Args, Flags } from '@oclif/core';
import jsonata from 'jsonata';

import { Command } from '../../core/index.js';

export default class SessionEventsCommand extends Command {
  static args = {
    sessionId: Args.string({ required: true, description: 'The session ID (UserId:SessionId format, or a Fullstory session URL).' }),
  };

  static description = `List all captured events for a session.
Optionally filter by event type and/or transform the output with a JSONata expression.

For more information, see https://developer.fullstory.com/server/sessions/get-session-events/`;

  static enableJsonFlag = true;

  static examples = [
    { command: '<%= config.bin %> session:events "1841382665432129521:4929353557192241189"', description: 'List all events for a session.' },
    { command: '<%= config.bin %> session:events "1841382665432129521:4929353557192241189" --type change', description: 'List only "change" events.' },
    { command: '<%= config.bin %> session:events "1841382665432129521:4929353557192241189" --type change --query $.event_properties.target.text', description: 'Extract text values from "change" events using JSONata.' },
    { command: '<%= config.bin %> session:events "1841382665432129521:4929353557192241189" --output events.json', description: 'Save events to a file.' },
  ];

  static flags = {
    ...Command.flags,
    type: Flags.string({ required: false, description: 'Filter events by event_type (e.g. navigate, click, change, custom).' }),
    query: Flags.string({ required: false, description: 'JSONata expression to transform or extract data from the events.' }),
    output: Flags.string({ char: 'o', required: false, description: 'Save JSON output to file.' }),
  }

  static summary = 'List all captured events for a session.';

  async run() {
    const { args: { sessionId }, flags } = await this.parse(SessionEventsCommand);

    const { Session } = this.Fullstory;

    let events = await Session.events(sessionId);

    if (flags.type) {
      events = events.filter(event => event.event_type === flags.type);
    }

    let result: unknown = events;

    if (flags.query) {
      const expression = jsonata(flags.query);
      result = await expression.evaluate(events);
    }

    if (flags.output) {
      const { writeJsonSync } = await import('fs-extra');
      writeJsonSync(flags.output, result, { spaces: 2 });
      this.print(`Events saved to ${flags.output}`, 'success');
      return result;
    }

    this.logJson(result);

    return result;
  }
}
