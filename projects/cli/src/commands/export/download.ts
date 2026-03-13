import { Args, Flags } from '@oclif/core';

import { SegmentExportCommand } from './shared/index.js';

export default class ExportDownloadCommand extends SegmentExportCommand {
  static args = {
    operationId: Args.string({ required: true, description: 'The export operation ID returned by export:create.' }),
  };

  static description = `Download a completed segment export to this local machine.
The resulting download will be unzipped and the original gzip file deleted.
The export must be in COMPLETED state before downloading.

For more information, see https://developer.fullstory.com/server/v1/segments/get-segment-export-results`;

  static enableJsonFlag = true;

  static examples = [
    { command: '<%= config.bin %> export:download OPERATION_ID', description: 'Download and unzip the export.' },
    { command: '<%= config.bin %> export:download OPERATION_ID --link', description: 'Print the download URL without downloading.' },
  ];

  static flags = {
    ...SegmentExportCommand.flags,
    link: Flags.boolean({ default: false, description: 'Print the download link instead of downloading the export.', required: false }),
  }

  static summary = 'Download a segment export.';

  async run() {
    const { args: { operationId }, flags: { link } } = await this.parse(ExportDownloadCommand);

    this.start('Finding export');

    // retrieve the URL (location) to the export file
    const { SegmentExport } = this.Fullstory;
    const { state, results } = await SegmentExport.operation(operationId);

    if (state === 'COMPLETED' && results) {
      const { location } = await SegmentExport.results(results.searchExportId);

      // prints only the link and skip downloading the file
      if (link) {
        this.stop();
        this.log(location);
        return;
      }

      this.start('Downloading export');
      const zipFile = await SegmentExport.download(location, `${this.config.dataDir}/exports/${operationId}`);

      this.start('Unzipping export');
      const unzipFile = await SegmentExport.unzip(zipFile);

      this.start('Saving manifest');
      const lines = await SegmentExport.count(unzipFile);

      // add a manifest with helpful metadata
      this.saveManifest(this.config.dataDir, operationId, {
        count: lines,
        exportId: results.searchExportId,
        file: unzipFile,
      });
    } else {
      this.error(`Export is not ready (${state}).`);
    }

    this.stop();
  }
}
