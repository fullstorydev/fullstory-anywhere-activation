import { Args } from '@oclif/core';

import { Command, Key, Prompt } from '../../core/index.js';

const EU1_DOMAIN = 'api.eu1.fullstory.com';
const DEFAULT_DOMAIN = 'api.fullstory.com';

/** Region prefix found at the start of a Fullstory API key, e.g. "na1." or "eu1." */
const KEY_PREFIX_REGION = /^([\da-z]+)\./;

/** Map of key region prefix → API domain */
const DOMAIN_BY_REGION: Record<string, string> = {
  na1: DEFAULT_DOMAIN,
  eu1: EU1_DOMAIN,
};

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
        `Fullstory API domain for your region (e.g. ${DEFAULT_DOMAIN} or ${EU1_DOMAIN}). ` +
        'When omitted, the domain is inferred from the region prefix of the API key ' +
        '(e.g. "na1." → ' + DEFAULT_DOMAIN + ', "eu1." → ' + EU1_DOMAIN + '). ' +
        'An error is raised when the provided domain is inconsistent with the key prefix.',
      required: false,
    }),
  };

  static description =
    'Stores an API key on the local machine to be used with commands.' +
    '\n\nThe domain is the Fullstory API host for your region:' +
    `\n  - US:  ${DEFAULT_DOMAIN} (API keys starting with "na1.")` +
    `\n  - EU:  ${EU1_DOMAIN} (API keys starting with "eu1.")` +
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
      command: `<%= config.bin %> key:add o-DEMO-eu1 eu1.by11Q...vs4u/DEMO ${EU1_DOMAIN}`,
      description: 'Store the provided API key with an explicit domain.',
    },
  ];

  static summary = 'Stores an API key.';

  async run() {
    const { args: { apiKey: apiKeyArg, domain: domainArg, orgId: orgIdArg } } = await this.parse(KeyAddCommand);

    const orgId = orgIdArg ?? await Prompt.input('Enter the org ID:');
    this.print(`Open https://app${orgId.endsWith('eu1') ? '.eu1' : ''}.fullstory.com/ui/${orgId}/settings/apikeys in your browser. Create and copy your API key.`);
    const apiKey = apiKeyArg ?? await Prompt.input('Paste the API key:');

    const domain = this.resolveDomain(apiKey, domainArg);

    const keystore = this.readKeystore();

    // unselect all keys; the added key will be selected
    for (const key of Object.values(keystore)) key.selected = false;

    keystore[orgId] = this.buildKey(apiKey, orgId, domain, true);

    this.writeKeystore(keystore);

    this.log(`Added API key for org "${orgId}" with domain "${domain}". This key is now selected for use with other commands.`);
  }

  private buildKey(apiKey: string, orgId: string, domain: string, selected = true): Key {
    return { apiKey, domain, orgId, selected, suffix: apiKey.slice(apiKey.lastIndexOf('/') + 1) };
  }

  /**
   * Resolves the API domain from the key prefix and optional user-supplied domain.
   * Errors when the two are inconsistent.
   * @param apiKey The Fullstory API key, whose region prefix (e.g. "na1.", "eu1.") determines the domain.
   * @param domainArg Optional domain explicitly provided by the user.
   * @returns The resolved API domain.
   */
  private resolveDomain(apiKey: string, domainArg?: string): string {
    const match = KEY_PREFIX_REGION.exec(apiKey);
    const regionPrefix = match?.[1];
    const inferredDomain = regionPrefix ? DOMAIN_BY_REGION[regionPrefix] : undefined;

    if (!domainArg) {
      return inferredDomain ?? DEFAULT_DOMAIN;
    }

    // Validate the explicit domain against the inferred one when we can determine it.
    if (inferredDomain && domainArg !== inferredDomain) {
      this.error(
        `Domain "${domainArg}" does not match the region indicated by the API key prefix "${regionPrefix}.". ` +
        `Expected "${inferredDomain}".`,
      );
    }

    return domainArg;
  }
}
