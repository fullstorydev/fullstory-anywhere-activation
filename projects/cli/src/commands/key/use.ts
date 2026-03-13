import { Args, ux } from '@oclif/core';

import { Command } from '../../core/index.js';
import { list } from '../../core/prompt.js';

export default class KeyUseCommand extends Command {
  static args = {
    orgId: Args.string({
      description: 'The org ID associated with the previously added API key',
      required: false,
    }),
  };

  static description = 'Select an API key to be used with commands. If no org ID is provided, you will be prompted to select from stored keys.';

  static enableJsonFlag = false;

  static examples = [
    { command: 'key:use', description: 'Interactively select which API key to use with commands.' },
    { command: 'key:use DEMO', description: 'Use the API key for the given org ID with commands.' },
  ];

  static summary = 'Select an API key for use.';

  async run() {
    let { args: { orgId } } = await this.parse(KeyUseCommand);

    const keystore = this.readKeystore();

    if (!orgId) {
      const orgIds = Object.keys(keystore);
      if (orgIds.length === 0) {
        this.log(`No API keys stored. Run ${ux.colorize('magenta', `${this.config.bin} key:add ORGID APIKEY`)} to add an API key.`);
        return;
      }

      orgId = await list(
        orgIds.map(id => ({ name: `${id} (${keystore[id].suffix})`, value: id })),
        'Select an org to use',
        orgIds.find(id => keystore[id].selected),
      );
    }

    if (!keystore[orgId]) {
      this.log(`API key not found. Run ${ux.colorize('magenta', `${this.config.bin} key:add ORGID APIKEY`)} to add an API key.`);
      return;
    }

    // unselect all keys and select the desired key
    for (const key of Object.values(keystore)) key.selected = false;
    keystore[orgId].selected = true;

    this.writeKeystore(keystore);

    this.log(`API key "${keystore[orgId].suffix}" for org "${orgId}" will be used with commands.`);
  }
}
