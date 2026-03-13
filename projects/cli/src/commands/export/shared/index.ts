import { ux } from '@oclif/core';
import { ensureFileSync, existsSync, readJsonSync, writeJsonSync } from 'fs-extra';

import { Prompt, TableCommand } from '../../../core/index.js';

export interface ExportManifest {
  count: number,
  exportId?: string;
  file?: string;
  operationId: string;
  orgId: string;
  segmentId: string;
  segmentName: string;
  tags: string[],
}

export abstract class SegmentExportCommand extends TableCommand {
  async findManifest(operationId?: string) {
    let manifest: ExportManifest | undefined;

    if (operationId === undefined) {
      const { SegmentExport } = this.Fullstory;
      const { operations } = await SegmentExport.list();

      const manifests = operations.map(o => this.readManifest(this.config.dataDir, o.id)).filter(m => m !== undefined);

      manifest = await Prompt.list(manifests.map(m => ({ name: `${m.segmentName} ${m.operationId} ${m.tags}`, value: m })), 'Select export:');
    } else {
      manifest = this.readManifest(this.config.dataDir, operationId);
    }

    return manifest;
  }

  readManifest(dataDir: string, operationId: string,): ExportManifest | undefined {
    const file = `${dataDir}/exports/${operationId}/manifest.json`;
    return existsSync(file) ? readJsonSync(file) : undefined;
  }

  saveManifest(dataDir: string, operationId: string, manifest: Partial<ExportManifest>) {
    const file = `${dataDir}/exports/${operationId}/manifest.json`;

    if (existsSync(file)) {
      writeJsonSync(file, {
        ...readJsonSync(file),
        ...manifest,
      });
    } else {
      ensureFileSync(file);
      writeJsonSync(file, manifest);
    }
  }

  validate(manifest?: ExportManifest) {
    if (!manifest) {
      this.error(`Export not found. Run ${ux.colorize('magenta', `${this.config.bin} export:create SEGMENTID`)} to create a segment export.`);
    }

    if (!manifest.file) {
      this.error(`Export file not found. Run ${ux.colorize('magenta', `${this.config.bin} export:download OPERATIONID`)} to save the export locally.`);
    }

    if (!manifest.file.endsWith('ndjson')) {
      throw new Error('Export file must be NDJSON. Check the export type or file extension.');
    }

    return manifest!;
  }
}
