import { ProfileConfiguration } from '@fullstory/activation-sdk/index.js';
import { Args, Flags } from '@oclif/core';
import { readJsonSync } from 'fs-extra';

import { Command, Prompt } from '../../core/index.js';

export default class SessionContextCommand extends Command {
  static args = {
    sessionId: Args.string({ required: true, description: 'The session ID (UserId:SessionId format, or a Fullstory session URL).' }),
  };

  static description = `Generate AI-ready context for a session.
The format and contents of the response are controlled by the profile configuration to optimize the information included for the intended use case.

For more information, see https://developer.fullstory.com/server/sessions/generate-context/`;

  static enableJsonFlag = true;

  static examples = [
    { command: '<%= config.bin %> session:context 1841382665432129521:4929353557192241189 --profile my-profile-id', description: 'Generate context using a saved summarization profile.' },
    { command: '<%= config.bin %> session:context 1841382665432129521:4929353557192241189 --file ./config.json', description: 'Generate context using a ProfileConfiguration JSON file.' },
    { command: '<%= config.bin %> session:context 1841382665432129521:4929353557192241189', description: 'Generate context and select a profile interactively.' },
    { command: '<%= config.bin %> session:context 1841382665432129521:4929353557192241189 --profile my-profile-id --output context.json', description: 'Save context to a file.' },
  ];

  static flags = {
    ...Command.flags,
    file: Flags.string({ char: 'f', description: 'Path to a JSON file containing the ProfileConfiguration.', required: false }),
    profile: Flags.string({ char: 'p', description: 'ID of a saved summarization profile to use as the ProfileConfiguration.', required: false }),
    output: Flags.string({ char: 'o', required: false, description: 'Save JSON output to file.' }),
  };

  static summary = 'Generate AI-ready session context.';

  async run() {
    const { args: { sessionId }, flags } = await this.parse(SessionContextCommand);

    const { Session, SummaryProfile } = this.Fullstory;

    let configuration: Omit<ProfileConfiguration, 'llm'>;

    if (flags.file) {
      configuration = readJsonSync(flags.file) as Omit<ProfileConfiguration, 'llm'>;
    } else if (flags.profile) {
      const { configuration: profileConfiguration } = await SummaryProfile.get(flags.profile);
      configuration = profileConfiguration;
    } else {
      const profiles = await SummaryProfile.list();

      if (profiles.length === 0) {
        this.error('No summarization profiles found. Create one with `profile:create` or supply a --file.');
      }

      const selected = await Prompt.list(
        profiles.map(p => ({ name: `${p.name} (${p.id})`, value: p })),
        'Select a summarization profile',
      );

      configuration = selected.configuration;
    }

    const response = await Session.context(sessionId, configuration);

    if (flags.output) {
      const { writeJsonSync } = await import('fs-extra');
      writeJsonSync(flags.output, response, { spaces: 2 });
      this.print(`Context saved to ${flags.output}`, 'success');
      return response;
    }

    this.log(JSON.stringify(response, null, 2));

    return response;
  }
}
