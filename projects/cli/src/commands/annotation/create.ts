import { Args, Flags } from '@oclif/core';

import { Command, Prompt } from '../../core/index.js';

export default class AnnotationCreateCommand extends Command {
  static args = {
    text: Args.string({ required: false, description: 'Annotation text (max 200 characters).' }),
  };

  static description = `Create an annotation that appears on Fullstory visualizations.
Annotations mark a point or range in time, useful for tracking deployments, incidents, or feature launches.

For more information, see https://developer.fullstory.com/server/annotations/create-annotation/`;

  static enableJsonFlag = true;

  static examples = [
    { command: '<%= config.bin %> annotation:create "v2.1 deployed"', description: 'Create an annotation at the current time.' },
    { command: '<%= config.bin %> annotation:create "Feature launch" --source "CI/CD" --start 2024-08-01T12:00:00Z --end 2024-08-01T13:00:00Z', description: 'Create an annotation with a time range and source.' },
    { command: '<%= config.bin %> annotation:create', description: 'Create an annotation interactively.' },
  ];

  static flags = {
    ...Command.flags,
    source: Flags.string({ required: false, description: 'Source or creator label displayed on the annotation (max 40 characters).' }),
    start: Flags.string({ required: false, description: 'Start time in ISO 8601 format. Defaults to current server time.' }),
    end: Flags.string({ required: false, description: 'End time in ISO 8601 format. Defaults to start time.' }),
  }

  static summary = 'Create an annotation.';

  async run() {
    const { args, flags } = await this.parse(AnnotationCreateCommand);
    const { Annotation } = this.Fullstory;

    let { text } = args;

    if (!text) {
      text = await Prompt.input('Annotation text (max 200 chars):');
    }

    if (!text) {
      this.error('Annotation text is required.');
    }

    const options: Record<string, string> = {};
    if (flags.source) options.source = flags.source;
    // eslint-disable-next-line camelcase
    if (flags.start) options.start_time = flags.start;
    // eslint-disable-next-line camelcase
    if (flags.end) options.end_time = flags.end;

    const annotation = await Annotation.create(text, options);
    this.log(`Annotation created: "${annotation.text}" (${annotation.start_time})`);
    return annotation;
  }
}
