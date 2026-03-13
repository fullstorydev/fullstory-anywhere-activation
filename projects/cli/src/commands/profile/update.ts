/* eslint-disable camelcase */
import { ProfileConfiguration } from '@fullstory/activation-sdk/index.js';
import { Args, Flags } from '@oclif/core';
import { readJsonSync } from 'fs-extra';

import { Command, Prompt } from '../../core/index.js';

export default class ProfileUpdateCommand extends Command {
  static args = {
    id: Args.string({ required: true, description: 'The profile ID to update.' }),
  };

  static description = `Update an existing summarization profile.
Provide updated configuration via flags or a JSON file matching the ProfileConfiguration schema.
Only the fields you provide will be updated; other fields remain unchanged.

For more information, see https://developer.fullstory.com/server/sessions/update/`;

  static enableJsonFlag = true;

  static examples = [
    { command: '<%= config.bin %> profile:update abc-123 --prePrompt "Summarize this session."', description: 'Update a profile\'s pre-prompt.' },
    { command: '<%= config.bin %> profile:update abc-123 --file profile-config.json', description: 'Update a profile from a JSON configuration file.' },
  ];

  static flags = {
    ...Command.flags,
    file: Flags.string({ char: 'f', required: false, description: 'Path to a JSON file containing profile configuration (ProfileConfiguration schema).' }),
    prePrompt: Flags.string({ required: false, description: 'Text included before the session context in the prompt.' }),
    postPrompt: Flags.string({ required: false, description: 'Custom instructions included after the session context.' }),
    temperature: Flags.string({ required: false, description: 'LLM temperature (floating-point number).' }),
  }

  static summary = 'Update a summarization profile.';

  async run() {
    const { args: { id }, flags } = await this.parse(ProfileUpdateCommand);
    const { SummaryProfile } = this.Fullstory;

    let config: Partial<ProfileConfiguration>;

    if (flags.file) {
      config = readJsonSync(flags.file);
    } else if (flags.prePrompt || flags.postPrompt || flags.temperature) {
      config = {
        llm: {
          pre_prompt: flags.prePrompt || undefined,
          post_prompt: flags.postPrompt || undefined,
          temperature: flags.temperature ? Number(flags.temperature) : undefined,
        },
      };
    } else {
      let prePrompt: string | undefined = await Prompt.input('Pre-prompt (leave blank to skip):');
      let postPrompt: string | undefined = await Prompt.input('Post-prompt (leave blank to skip):');

      prePrompt = prePrompt || undefined;
      postPrompt = postPrompt || undefined;

      config = {
        llm: {
          pre_prompt: prePrompt,
          post_prompt: postPrompt,
        },
      };
    }

    const profile = await SummaryProfile.update(id, config);
    this.log(`Profile ${profile.id} ("${profile.name}") updated.`);
    return profile;
  }
}
