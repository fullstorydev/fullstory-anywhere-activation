import { resolveDomain } from '@fullstory/activation-sdk/index.js';
import { Args } from '@oclif/core';

import { Command, Fmt, Key, Prompt } from '../../core/index.js';

export default class KeyAddCommand extends Command {
  static args = {
    orgId: Args.string({
      description: 'The org ID associated with the API key, found in the Fullstory app under Settings > Integrations > API Keys.',
      required: false,
    }),
    apiKey: Args.string({
      description:
        'The Fullstory API key to store. API keys are prefixed with a region identifier (e.g. "na1." for US, ' +
        '"eu1." for EU) and can be created in the Fullstory app under Settings > Integrations > API Keys.',
      required: false,
    }),
    domain: Args.string({
      description:
        'Fullstory API domain for your region. When omitted, the domain is inferred from the region prefix of the API key. ' +
        'An error is raised when the provided domain is inconsistent with the key prefix.',
      required: false,
    }),
  };

  static description =
    'Stores an API key on the local machine to be used with commands.' +
    '\n\nThe domain is the Fullstory API host for your region. ' +
    '\n\nWhen no domain is provided it is inferred automatically from the API key prefix. ' +
    'An error is raised if the supplied domain does not match the region indicated by the key.' +
    '\n\nFor more information on creating API keys, see https://developer.fullstory.com/server/v1/authentication/getting-started/#creating-a-key.';

  static enableJsonFlag = false;

  static examples = [
    {
      command: '<%= config.bin %> key:add o-DEMO-na1 na1.by11Q...vs4u/DEMO',
      description: 'Store the provided API key, inferring the domain from the key prefix.',
    },
    {
      command: `<%= config.bin %> key:add o-DEMO-eu1 eu1.by11Q...vs4u/DEMO api.eu1.fullstory.com`,
      description: 'Store the provided API key with an explicit domain.',
    },
  ];

  static summary = 'Stores an API key.';

  async run() {
    const { args: { apiKey: apiKeyArg, domain: domainArg, orgId: orgIdArg } } = await this.parse(KeyAddCommand);

    const orgId = orgIdArg ?? await Prompt.input('Enter the org ID:');
    this.print(`Open ${Fmt.key(`https://${resolveDomain(orgId, false)}/ui/${orgId}/settings/apikeys`)} in your browser. Create and copy your API key.`);
    const apiKey = apiKeyArg ?? await Prompt.input('Paste the API key:');

    const domain = domainArg || resolveDomain(apiKey);

    const keystore = await this.readKeystore();

    // unselect all keys; the added key will be selected
    for (const key of Object.values(keystore)) key.selected = false;

    keystore[orgId] = this.buildKey(apiKey, orgId, domain, true);

    await this.writeKeystore(keystore);

    this.log(`Added API key for org ${Fmt.key(orgId)}. This key is now active.`);
  }

  private buildKey(apiKey: string, orgId: string, domain: string, selected = true): Key {
    return { apiKey, domain, orgId, selected, suffix: apiKey.slice(apiKey.lastIndexOf('/') + 1) };
  }
}
