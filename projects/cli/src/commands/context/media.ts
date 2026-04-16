/* eslint-disable camelcase */
import { ContextEvent, MediaOptions } from '@fullstory/activation-sdk/index.js';
import { Flags } from '@oclif/core';

import { TableColumns } from '../../core/index.js';
import SessionContextCommand from './index.js';

export default class SessionContextMediaCommand extends SessionContextCommand {
  static args = {
    ...SessionContextCommand.args,
  };

  static columns: TableColumns<ContextEvent> = {
    timestamp: { name: 'Timestamp', description: 'Event timestamp', format: (event) => event.timestamp ?? '' },
    type: { name: 'Event Type', description: 'Type of event', format: (event) => event.type ?? '' },
    url: { name: 'Screenshot URL', description: 'Screenshot URL', format: (event) => event.screenshot_url ?? '' },
  };

  static description = `Generate AI-ready context for a session with screenshots.
The default screenshot is the viewport. Flags for element or full page screenshots can be used to adjust the screenshot type.

This API is experimental and must be manually enabled in your Fullstory org.`;

  static examples = [
    { command: '<%= config.bin %> session:context:media 1841382665432129521:4929353557192241189', description: 'Generate context with default screenshots.' },
    { command: '<%= config.bin %> session:context:media 1841382665432129521:4929353557192241189 --events navigate,click,input-change', description: 'Generate context with screenshots for specific events.' },
    { command: '<%= config.bin %> session:context:media 1841382665432129521:4929353557192241189 --crop', description: 'Generate context with cropped screenshots.' },
    { command: '<%= config.bin %> session:context:media 1841382665432129521:4929353557192241189 --page', description: 'Generate context with full page screenshots.' },
  ];

  static flags = {
    ...SessionContextCommand.flags,
    events: Flags.string({ description: 'Comma-separated event types to screenshot (e.g. navigate,click,input-change). Defaults to navigate and click.' }),
    element: Flags.boolean({ default: false, description: 'Crop screenshots to the target element bounding box instead of the full viewport.' }),
    page: Flags.boolean({ default: false, description: 'Render the entire page beyond the viewport bounds.' }),
  };

  static summary = 'Generate AI-ready session context with screenshots.';

  async run() {
    const { args: { sessionId }, flags } = await this.parse(SessionContextMediaCommand);
    const { events, element, page } = flags;

    const configuration = await this.parseConfiguration();

    const media: MediaOptions = { include_screenshots: true };
    if (events) media.screenshot_event_types = events.split(',').map((s: string) => s.trim()) as MediaOptions['screenshot_event_types'];
    if (element) media.crop_screenshot_to_selector = true;
    if (page) media.full_page_screenshots = true;

    const { Session } = this.Fullstory;
    const response = await Session.context(sessionId, configuration, media);

    const rows = (response.context_data?.pages ?? [])
      .flatMap((p) => p.events ?? [])
      .filter((e) => e.screenshot_url);

    return this.table(rows, SessionContextMediaCommand.columns);
  }
}
