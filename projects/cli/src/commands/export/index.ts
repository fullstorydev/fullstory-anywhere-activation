import { Operation } from '@fullstory/activation-sdk/index.js';
import { Flags, ux } from '@oclif/core';

import { TableColumns, TableCommand } from '../../core/command.js';
import { SegmentExportCommand } from './shared/index.js';

export default class ExportListCommand extends SegmentExportCommand {
  static columns: TableColumns<{ file: string | undefined, segmentId: string, segmentName: string, tags: string[] } & Operation> = {
    segmentId: { name: 'Segment ID', description: 'Segment ID', extended: true },
    segmentName: { name: 'Segment', description: 'Segment Name' },
    id: { name: 'Operation ID', description: 'Operation ID' },
    createdAt: { name: 'Created', description: 'Creation time of job', format: row => new Date(row.createdAt).toDateString() },
    state: { name: 'Status', description: 'Status of job' },
    tags: { name: 'Tags', description: 'Operation tags', format: row => row.tags.sort().join(',') },
    estimatePctComplete: { name: 'Progress', description: 'Percent of estimated progress', extended: true, format: row => `${row.estimatePctComplete}%` },
    exportId: { name: 'Export ID', description: 'Segment Export ID', extended: true, format: row => row.results?.searchExportId || '' },
    file: { name: 'Download File', description: 'Downloaded file of the export', format: row => row.file || '' },
    finishedAt: { name: 'Finished', description: 'Completion time of job', extended: true },
    expiration: { name: 'Expiration', description: 'Expiration time', extended: true, format: row => row.results?.expires || '' },
    errorDetails: { name: 'Error', description: 'Error details (if any)', extended: true },
  };

  static description = `List all segment export operations, both ongoing and completed.
Shows operation status, segment info, tags, and download file location for completed exports.
Use --extended to see progress percentage, export IDs, and error details.

For more information, see https://developer.fullstory.com/server/v1/segments/list-segment-exports`;

  static enableJsonFlag = true;

  static examples = [
    { command: '<%= config.bin %> export', description: 'List segment exports.' },
    { command: '<%= config.bin %> export --extended', description: 'List segment exports with extended metadata.' },
    { command: '<%= config.bin %> export --json', description: 'List segment exports as JSON.' },
    { command: '<%= config.bin %> export --output exports.json', description: 'Save export list to a file.' },
  ];

  static flags = {
    ...TableCommand.flags,
    output: Flags.string({ char: 'o', required: false, description: 'Save JSON output to file.' }),
  }

  static summary = 'List segment exports.';

  async run() {
    const { flags } = await this.parse(ExportListCommand);
    const { SegmentExport } = this.Fullstory;
    const { operations } = await SegmentExport.list();

    const rows = operations.map(operation => {
      const manifest = this.readManifest(this.config.dataDir, operation.id);

      return {
        ...operation,
        file: manifest ? manifest.file : '',
        segmentId: manifest ? manifest.segmentId : '',
        segmentName: manifest ? manifest.segmentName : '',
        tags: manifest ? manifest.tags : [],
      };
    }).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    if (flags.output) {
      const { writeJsonSync } = await import('fs-extra');
      writeJsonSync(flags.output, rows, { spaces: 2 });
      this.print(`Exports saved to ${flags.output}`, 'success');
      return rows;
    }

    const result = await this.table(rows, ExportListCommand.columns);

    this.log(`Run ${ux.colorize('magenta', `${this.config.bin} export:download EXPORTID`)} to save segment export locally.`);

    return result;
  }
}
