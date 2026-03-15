import { Flags } from '@oclif/core';
import { readFileSync } from 'node:fs';

import { Command } from '../../core/index.js';

export default class FormatPromptCommand extends Command {
  static description = `Format multi-line prompt text into a single-line JSON string value for use with pre_prompt and post_prompt properties.

Reads text from a file (--file) or stdin. Outputs a JSON-encoded single-line string that can be pasted directly as a JSON string value.`;

  static examples = [
    { command: 'pbpaste | <%= config.bin %> profile:format', description: 'Format text from the clipboard (macOS).' },
    { command: 'cat prompt.txt | <%= config.bin %> profile:format', description: 'Format text piped from a file.' },
    { command: '<%= config.bin %> profile:format --file prompt.txt', description: 'Format text from a file path.' },
  ];

  static flags = {
    ...Command.flags,
    file: Flags.string({ char: 'f', required: false, description: 'Path to a text file containing the prompt.' }),
  };

  static summary = 'Format a multi-line prompt into a single-line JSON string value.';

  async run() {
    const { flags: { file } } = await this.parse(FormatPromptCommand);

    let raw = '';

    if (file) {
      raw = readFileSync(file, 'utf8');
    } else if (process.stdin.isTTY) {
      this.error('Provide text via --file or pipe it to stdin.');
    } else {
      raw = await new Promise<string>((resolve, reject) => {
        const chunks: Buffer[] = [];
        process.stdin.on('data', chunk => chunks.push(Buffer.from(chunk)));
        process.stdin.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
        process.stdin.on('error', reject);
      });
    }

    // Trim a single trailing newline that is typically added when pasting
    const text = raw.replace(/\n$/, '');
    const formatted = JSON.stringify(text);

    this.log(formatted);
  }

}
