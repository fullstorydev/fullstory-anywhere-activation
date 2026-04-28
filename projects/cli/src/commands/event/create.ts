import { Args, Flags } from '@oclif/core';
import { readJsonSync } from 'fs-extra';

import { Command, Prompt } from '../../core/index.js';

export default class EventCreateCommand extends Command {
  static args = {
    sessionId: Args.string({ required: false, description: 'Session ID in "UserId:SessionId" format.' }),
    name: Args.string({ required: false, description: 'The event name.' }),
  };

  static description = `Create a single event on a session.
Supply the session ID and event name as arguments, with optional properties via flags.
Alternatively, provide a full event payload with --file.

For more information, see https://developer.fullstory.com/server/events/create-event/`;

  static enableJsonFlag = true;

  static examples = [
    { command: '<%= config.bin %> event:create 1841382665432129521:4929353557192241189 "Order Completed"', description: 'Create an event on a session.' },
    { command: '<%= config.bin %> event:create 1841382665432129521:4929353557192241189 "Order Completed" --properties ./event-props.json', description: 'Create an event with custom properties in a file.' },
    { command: '<%= config.bin %> event:create 1841382665432129521:4929353557192241189 "Order Completed" --properties \'{"item":"shirt","total":12.99}\'', description: 'Create an event with custom properties from the terminal.' },
    { command: '<%= config.bin %> event:create 1841382665432129521:4929353557192241189 "Order Completed" --timestamp 2024-08-01T00:00:00Z', description: 'Create an event with a specific timestamp.' },
    { command: '<%= config.bin %> event:create --file event.json', description: 'Create an event from a JSON file (calls batch import with a single event).' },
  ];

  static flags = {
    ...Command.flags,
    file: Flags.string({ char: 'f', required: false, description: 'Path to a JSON file containing event data (CreateEvent schema). Uses batch import endpoint.' }),
    properties: Flags.string({ required: false, description: 'JSON string or path to a JSON file of custom event properties.' }),
    timestamp: Flags.string({ required: false, description: 'Event timestamp in ISO 8601 format. Defaults to current server time.' }),
  }

  static summary = 'Create an event.';

  async run() {
    const { args: { sessionId, name }, flags } = await this.parse(EventCreateCommand);
    const { Event } = this.Fullstory;

    if (flags.file) {

      const event = readJsonSync(flags.file);
      const events = Array.isArray(event) ? event : [event];
      const response = await Event.import(events);
      this.log(`Import job created: ${response.job.id}`);
      return response;
    }

    let sid = sessionId;
    let eventName = name;

    if (!sid) {
      sid = await Prompt.input('Session ID (UserId:SessionId):');
    }

    if (!eventName) {
      eventName = await Prompt.input('Event name:');
    }

    if (!sid || !eventName) {
      this.error('Session ID and event name are required.');
    }

    if (eventName.startsWith('{')) {
      this.error('Event name appears to be JSON. Check the order of arguments.');
    }

    const options: Record<string, unknown> = {};

    // users can specify properties directly in the command or referenced from a file
    if (flags.properties) {
      const raw = flags.properties;
      options.properties = raw.trimStart().startsWith('{') ? JSON.parse(raw) : readJsonSync(raw);
    }

    if (flags.timestamp) options.timestamp = flags.timestamp;

    const response = await Event.create(sid, eventName, options);
    this.log('Event created.');
    return response;
  }
}
