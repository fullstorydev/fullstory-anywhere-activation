import { EventTypes, SegmentExportEvent } from '@fullstory/activation-sdk/index.js';
import { Args, Flags } from '@oclif/core';
import jsonata from 'jsonata';

import { TableColumns } from '../../core/index.js';
import { SegmentExportCommand } from './shared/index.js';

export default class ExportViewCommand extends SegmentExportCommand {
  static args = {
    operationId: Args.string({ required: true, description: 'The export operation ID. If omitted, you will be prompted to select one.' }),
  };

  static description = `View the contents of a downloaded segment export.
The export must have been downloaded first with export:download.
Only NDJSON exports can be viewed.

For more information, see https://developer.fullstory.com/server/v1/segments/`;

  static enableJsonFlag = true;

  static examples = [
    { command: '<%= config.bin %> export:view OPERATION_ID', description: 'View all events in an export.' },
    { command: '<%= config.bin %> export:view OPERATION_ID --type click', description: 'View only click events.' },
    { command: '<%= config.bin %> export:view OPERATION_ID --query "$[EventType=\'click\'].EventTargetText"', description: 'Extract data with a JSONata expression.' },
    { command: '<%= config.bin %> export:view OPERATION_ID --output events.json', description: 'Save export contents to a file.' },
  ];

  static flags = {
    ...SegmentExportCommand.flags,
    type: Flags.string({ required: false, options: Object.keys(EventTypes), description: 'Filter events by EventType.' }),
    query: Flags.string({ required: false, description: 'JSONata expression to transform or extract data from events.' }),
    output: Flags.string({ char: 'o', required: false, description: 'Save JSON output to file.' }),
  }

  static summary = 'View segment export contents.';

  async run() {
    const { args: { operationId }, flags } = await this.parse(ExportViewCommand);

    const { count, file } = this.validate(await this.findManifest(operationId));

    if (file) {
      const { SegmentExport } = this.Fullstory;

      this.showProgress('Events parsed', count);

      let events = await SegmentExport.parse(file, () => { this.progress?.increment() });

      this.progress?.stop();

      if (flags.type) {
        events = events.filter(event => event.EventType === flags.type);
      }

      let result: unknown = events;

      if (flags.query) {
        const expression = jsonata(flags.query);
        result = await expression.evaluate(events);
      }

      if (events.length === 0) {
        this.log('No events found.');
        return;
      }

      if (flags.output) {
        const { writeJsonSync } = await import('fs-extra');
        writeJsonSync(flags.output, result, { spaces: 2 });
        this.print(`Export saved to ${flags.output}`, 'success');
        return result;
      }

      // If a query was used, output as JSON since the shape is unknown
      if (flags.query) {
        this.logJson(result);
        return result;
      }

      return this.table(events, this.toColumns(Object.getOwnPropertyNames(events[0])));
    }

    this.error('Segment Export has not been downloaded.');
  }

  toColumns(fields: string[]): TableColumns<Partial<SegmentExportEvent>> {
    const columns: TableColumns<Partial<SegmentExportEvent>> = {};
    for (const field of fields) {
      columns[field] = { name: field, description: field };
    }

    return columns;
  }
}
