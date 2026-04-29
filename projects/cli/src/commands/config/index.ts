import { Command } from '../../core/index.js';

export default class ConfigCommand extends Command {
  static description = 'Display CLI configuration and directory paths.';

  static enableJsonFlag = false;

  static examples = [
    { command: '<%= config.bin %> config', description: 'Show CLI configuration.' },
  ];

  static summary = 'Show CLI configuration.';

  async run() {
    const entries: [string, string][] = [
      ['Bin', this.config.bin],
      ['Version', this.config.version],
      ['Shell', this.config.shell],
      ['Platform', this.config.platform],
      ['Architecture', this.config.arch],
      ['Data directory', this.config.dataDir],
      ['Config directory', this.config.configDir],
      ['Cache directory', this.config.cacheDir],
      ['Error log', this.config.errlog],
      ['Root', this.config.root],
    ];

    const maxLabel = Math.max(...entries.map(([label]) => label.length));

    for (const [label, value] of entries) {
      this.log(`${label.padEnd(maxLabel)}  ${value}`);
    }
  }
}
