import { Flags } from '@oclif/core';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

import { Command } from '../../core/index.js';

export default class FormatPromptCommand extends Command {
  static description = `Format multi-line prompt text into a single-line JSON string value for use with pre_prompt and post_prompt properties.

Reads text from a directory (--dir), a file (--file), or stdin. Outputs a JSON-encoded single-line string that can be pasted directly as a JSON string value.`;

  static examples = [
    { command: 'pbpaste | <%= config.bin %> profile:format', description: 'Format text from the clipboard (macOS).' },
    { command: 'cat prompt.txt | <%= config.bin %> profile:format', description: 'Format text piped from a file.' },
    { command: '<%= config.bin %> profile:format --file prompt.txt', description: 'Format text from a file path.' },
    { command: '<%= config.bin %> profile:format --dir ./sessions', description: 'Format all files in a directory with default --- DATA --- delimiters.' },
    { command: '<%= config.bin %> profile:format --dir ./sessions --delim MYVALUE', description: 'Format all files in a directory with custom --- MYVALUE --- delimiters.' },
  ];

  static flags = {
    ...Command.flags,
    dir: Flags.string({ required: false, description: 'Path to a directory. All files in the directory will be read, delimited, and formatted.' }),
    delim: Flags.string({ required: false, default: 'DATA', description: "Delimiter label used to wrap each file's contents. Used with --dir." }),
    file: Flags.string({ char: 'f', required: false, description: 'Path to a text file containing the prompt.' }),
  };

  static summary = 'Format a multi-line prompt into a single-line JSON string value.';

  async run() {
    const { flags: { dir, delim, file } } = await this.parse(FormatPromptCommand);

    let raw = '';

    if (dir) {
      const files = readdirSync(dir)
        .filter(f => statSync(join(dir, f)).isFile())
        .sort();
      const blocks = files.map(f => {
        const content = readFileSync(join(dir, f), 'utf8');
        return `--- ${delim} START ---\n${content}\n--- ${delim} END ---`;
      });
      raw = blocks.join('\n\n');
    } else if (file) {
      raw = readFileSync(file, 'utf8');
    } else if (process.stdin.isTTY) {
      this.error('Provide text via --dir, --file, or pipe it to stdin.');
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
