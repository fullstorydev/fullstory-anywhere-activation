import { ProfileConfiguration } from '@fullstory/activation-sdk/index.js';
import { Args, Flags } from '@oclif/core';
import { readJsonSync } from 'fs-extra';

import { Command } from '../../core/index.js';

export default class SessionContextCommand extends Command {
  static args = {
    sessionId: Args.string({ required: true, description: 'The session ID (UserId:SessionId format, or a Fullstory session URL).' }),
  };

  static description = `Generate AI-ready context for a session.
The format and contents of the response are controlled by the profile configuration to optimize the information included for the intended use case.

For more information, see https://developer.fullstory.com/server/sessions/generate-context/`;

  static enableJsonFlag = true;

  static examples = [
    { command: '<%= config.bin %> session:context 1841382665432129521:4929353557192241189', description: 'Generate context using defaults.' },
    { command: '<%= config.bin %> session:context 1841382665432129521:4929353557192241189 --profile 1c07280f-df08-494f-873e-6214cb6c46b4', description: 'Generate context using a saved summary profile.' },
    { command: '<%= config.bin %> session:context 1841382665432129521:4929353557192241189 --file ./summmary-profile.json', description: 'Generate context using a summary profile from a JSON file.' },
  ];

  static flags = {
    ...Command.flags,
    file: Flags.string({ char: 'f', description: 'Path to a JSON file containing the ProfileConfiguration.', required: false }),
    profileId: Flags.string({ char: 'p', description: 'ID of a saved summarization profile to use as the ProfileConfiguration.', required: false }),
  };

  static summary = 'Generate AI-ready session context.';

  async run() {
    const { args: { sessionId }, flags: { file, profileId } } = await this.parse(SessionContextCommand);

    const { Session, SummaryProfile } = this.Fullstory;

    let configuration: Omit<ProfileConfiguration, 'llm'>;

    if (file) {
      configuration = readJsonSync(file) as Omit<ProfileConfiguration, 'llm'>;
    } else if (profileId) {
      const { configuration: profileConfiguration } = await SummaryProfile.get(profileId);
      configuration = profileConfiguration;
    } else {
      // use an empty configuration with system defaults
      configuration = {};
    }

    const response = await Session.context(sessionId, configuration);

    this.logJson(response);

    return response;
  }
}