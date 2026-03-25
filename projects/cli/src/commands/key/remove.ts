import { Args } from '@oclif/core';

import { Command, Fmt } from '../../core/index.js';
import * as Keychain from '../../core/keychain.js';
import { list } from '../../core/prompt.js';

export default class KeyRemoveCommand extends Command {
  static args = {
    orgId: Args.string({
      description: 'The org ID associated with the API key to remove',
      required: false,
    }),
  };

  static description = 'Removes an API key from local storage. If no org ID is provided, you will be prompted to select from stored keys. Removing an API key does not delete the ';

  static enableJsonFlag = false;

  static examples = [
    { command: 'key:remove', description: 'Interactively select which API key to remove.' },
    { command: 'key:remove o-DEMO-na1', description: 'Remove the API key for the given org ID.' },
  ];

  static summary = 'Removes an API key.';

  async run() {
    let { args: { orgId } } = await this.parse(KeyRemoveCommand);

    const keystore = await this.readKeystore();

    if (!orgId) {
      const orgIds = Object.keys(keystore);
      if (orgIds.length === 0) {
        this.log(`No API keys were found.`);
        return;
      }

      orgId = await list(
        orgIds.map(id => ({ name: `${id} (${keystore[id].suffix})`, value: id })),
        'Select an API key to remove',
        orgIds.find(id => keystore[id].selected),
      );
    }

    if (!keystore[orgId]) {
      this.error(`API key not found for org ${Fmt.key(orgId)}.`);
    }

    const { suffix } = keystore[orgId];
    delete keystore[orgId];

    await Keychain.deleteApiKey(orgId);
    await this.writeKeystore(keystore);

    this.log(`API key ${Fmt.key(suffix)} for org ${Fmt.key(orgId)} has been removed.`);
  }
}
