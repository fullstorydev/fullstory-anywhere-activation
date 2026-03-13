import { EventFields, ExportFields, ExportFormat, ExportScope, ExportType, IndividualFields, LoadFields, MobileFields, PageFields, RequestFields, SegmentExportEvent, SegmentExportField } from '@fullstory/activation-sdk/index.js';
import { Args, Flags, ux } from '@oclif/core';

import { Fmt, Prompt } from '../../core/index.js';
import { SegmentExportCommand } from './shared/index.js';

const templates: { [key: string]: (keyof SegmentExportEvent)[] } = {
  IdentityFields: [
    'IndvId',
    'UserId',
    'SessionId',
    'PageId',
    'UserAppKey',
    'SessionStart',
    'PageIp',
    'PageLatLong',
    'PageUserAgent',
    'PageBrowser',
    'PageBrowserVersion',
    'PageDevice',
    'PagePlatform',
    'PageOperatingSystem',
    'PageScreenWidth',
    'PageScreenHeight',
  ],
}

export default class ExportCreateCommand extends SegmentExportCommand {
  static args = {
    segmentId: Args.string({ required: true, description: 'Segment ID or name. Use "everyone" for the built-in all-users segment.' }),
  };

  static description = `Create a segment export operation.
Two types of segment data are available: events and individuals.
An event export contains events performed by individuals that match the segment.
An individual export contains information about each matching individual.

For more information, see https://developer.fullstory.com/server/v1/segments/create-segment-export`;

  static enableJsonFlag = true;

  static examples = [
    { command: '<%= config.bin %> export:create everyone', description: 'Create a segment export for the "everyone" segment.' },
    { command: '<%= config.bin %> export:create tziYRtIU1RW8', description: 'Create a segment export for a specific segment ID.' },
    { command: '<%= config.bin %> export:create tziYRtIU1RW8 --skip', description: 'Skip segment verification (avoids "Too Many Requests").' },
    { command: '<%= config.bin %> export:create everyone --tag my_first_export', description: 'Create an export with tags.' },
    { command: '<%= config.bin %> export:create everyone --format CSV', description: 'Create an export in CSV format.' },
    { command: '<%= config.bin %> export:create everyone --fields UserId SessionId EventStart EventType', description: 'Create an export with specific fields.' },
    { command: '<%= config.bin %> export:create everyone --start 2024-01-01T00:00:00Z --end 2024-01-31T23:59:59Z', description: 'Create an export for a specific time range.' },
    { command: '<%= config.bin %> export:create everyone --scope SCOPE_SESSIONS', description: 'Export all events in matching sessions, not just matching events.' },
  ];

  static flags = {
    ...SegmentExportCommand.flags,
    fields: Flags.string({
      multiple: true,
      description: 'Fields to include in the export. If omitted, you will be prompted to select interactively.',
      options: [
        ...Object.keys(ExportFields),
        ...Object.keys(EventFields),
        ...Object.keys(PageFields),
        ...Object.keys(LoadFields),
        ...Object.keys(RequestFields),
        ...Object.keys(MobileFields),
        ...Object.keys(IndividualFields),
      ], required: false
    }),
    format: Flags.string({ default: ExportFormat.NDJSON, required: false, options: [ExportFormat.CSV, ExportFormat.JSON, ExportFormat.NDJSON], description: 'Export data format.' }),
    skip: Flags.boolean({ default: false, description: 'Skip segment verification (use when "Too Many Requests" error occurs).' }),
    tag: Flags.string({ multiple: true, required: false, description: 'Tags to attach to the export operation.' }),
    template: Flags.string({ multiple: false, required: false, options: Object.keys(templates), description: 'Predefined field template (e.g. IdentityFields).' }),
    type: Flags.string({ default: ExportType.Event, required: false, options: [ExportType.Event, ExportType.Individual], description: 'Export type: event data or individual data.' }),
    start: Flags.string({ required: false, description: 'Time range start (UTC RFC 3339). Defaults to 7 days ago.' }),
    end: Flags.string({ required: false, description: 'Time range end (UTC RFC 3339). Defaults to now.' }),
    timezone: Flags.string({ required: false, description: 'IANA timezone for relative date calculations (defaults to UTC).' }),
    scope: Flags.string({ required: false, options: [ExportScope.Event, ExportScope.Individual, ExportScope.Pages, ExportScope.Sessions], description: 'Event scope relative to segment filters (TYPE_EVENT only).' }),
  }

  static summary = 'Create a segment export.';

  async run() {
    const { args: { segmentId }, flags } = await this.parse(ExportCreateCommand);
    const { fields, format, skip, tag, template, type, start, end, timezone, scope } = flags;

    let exportFields: string[] = [];
    let segmentName = '';

    exportFields = template ? templates[template] : fields ?? (await Prompt.checkbox([
      Fmt.bold('Export Fields - Provide details for individuals and sessions.'),
      ...this.mapFieldChoices(ExportFields),
      Fmt.bold('Event Fields - Provide details for the kind of event that was triggered.'),
      ...this.mapFieldChoices(EventFields),
      Fmt.bold('Page Fields - Describe browser display and page statistics.'),
      ...this.mapFieldChoices(PageFields),
      Fmt.bold('Load Fields - Describe content loading performance.'),
      ...this.mapFieldChoices(LoadFields),
      Fmt.bold('Request Fields - Included for events that describe XHR requests.'),
      ...this.mapFieldChoices(RequestFields),
      Fmt.bold('Mobile Fields - For accounts with mobile apps features.'),
      ...this.mapFieldChoices(MobileFields),
      Fmt.bold('Individual Fields - User variables set with FS.identify() or FS.setUserVars().'),
      ...this.mapFieldChoices(IndividualFields),
    ], 'Select fields to include in segment export:'));

    const { SegmentExport, Segment } = this.Fullstory;

    // NOTE for sufficiently large orgs like staging, this can result in "Too Many Requests" error
    // so use the --skip flag to skip retrieval if there are too many segments to page through
    if (!skip) {
      const segments = await Segment.list();
      const segment = segments.find(s => s.id === segmentId || s.name === segmentId);

      if (segment) {
        segmentName = segment.name;
      } else {
        this.error(`Segment ${segmentId} not found`);
      }
    }

    // Build optional parameters from flags
    const options: Record<string, unknown> = {
      format,
      type,
      fields: exportFields as SegmentExportField[],
    };

    if (start || end) {
      options.timeRange = { start: start || '', end: end || '' };
      options.segmentTimeRange = { start: start || '', end: end || '' };
    }

    if (timezone) {
      options.timezone = timezone;
    }

    if (scope) {
      options.eventDetails = { scope };
    }

    const response = await SegmentExport.create(segmentId, options);
    const { operationId, error } = response;

    if (error) {
      this.error(error);
    } else {
      this.saveManifest(this.config.dataDir, operationId!, {
        segmentId,
        segmentName,
        operationId,
        orgId: this.key.orgId,
        tags: tag || [],
      })

      this.log(`Operation ${operationId} created. Run ${ux.colorize('magenta', `${this.config.bin} export`)} to list status.`);

      return response;
    }
  }

  private mapFieldChoices(fields: { [key: string]: string }): { name: string, value: string }[] {
    return Object.keys(fields).map(key => ({ name: `${key}${this.pad(key)}${this.short(fields[key])}`, value: key }))
  }

  private pad(field: string) {
    // 27 is the longest field name
    return ' '.repeat(27 - field.length);
  }

  private short(text: string) {
    const pos = text.indexOf('. ');
    return pos === -1 ? text : text.slice(0, pos + 1);
  }
}
