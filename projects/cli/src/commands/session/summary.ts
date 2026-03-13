import { Profile } from '@fullstory/activation-sdk/index.js';
import { Args, Flags } from '@oclif/core';

import { Command, Prompt } from '../../core/index.js';

export default class SessionSummaryCommand extends Command {
  static args = {
    sessionId: Args.string({ required: true, description: 'The session ID (UserId:SessionId format, or a Fullstory session URL).' }),
    profileId: Args.string({ required: false, description: 'The summarization profile ID. If omitted, you will be prompted to select one.' }),
  };

  static description = `Generate an AI summary of a session using a summarization profile.
The profile specifies prompting instructions and session context configuration.

For more information, see https://developer.fullstory.com/server/sessions/summarize/`;

  static enableJsonFlag = true;

  static examples = [
    { command: '<%= config.bin %> session:summary 1841382665432129521:4929353557192241189 abc-profile-id', description: 'Generate a summary for a session.' },
    { command: '<%= config.bin %> session:summary 1841382665432129521:4929353557192241189', description: 'Interactively select a profile and generate a summary.' },
    { command: '<%= config.bin %> session:summary 1841382665432129521:4929353557192241189 abc-profile-id --endTimestamp 2024-08-01T13:00:00Z', description: 'Summarize events up to a specific time.' },
    { command: '<%= config.bin %> session:summary 1841382665432129521:4929353557192241189 abc-profile-id --output summary.json', description: 'Save the summary to a file.' },
  ];

  static flags = {
    ...Command.flags,
    endTimestamp: Flags.string({ required: false, description: 'Only include events before this ISO 8601 timestamp.' }),
    output: Flags.string({ char: 'o', required: false, description: 'Save JSON output to file.' }),
  }

  static summary = 'Generate a session summary.';

  async run() {
    const { args: { sessionId, profileId: profileIdArg }, flags } = await this.parse(SessionSummaryCommand);

    const { SummaryProfile, Session } = this.Fullstory;

    let profileId = profileIdArg;

    if (!profileId) {
      const profiles = await SummaryProfile.list();

      if (profiles.length === 0) {
        this.error('No summarization profiles found. Create one with `profile:create`.');
      }

      const options = profiles.map((profile: Profile) => ({ name: `${profile.id}\t${profile.name || ''}`, value: profile }));
      const selectedProfile = await Prompt.list<Profile>(options, 'Select summary profile:');
      profileId = selectedProfile.id;
    }

    const { summary } = await Session.summarize(sessionId, profileId, flags.endTimestamp);

    if (flags.output) {
      const { writeJsonSync } = await import('fs-extra');
      writeJsonSync(flags.output, { summary }, { spaces: 2 });
      this.print(`Summary saved to ${flags.output}`, 'success');
      return { summary };
    }

    if (flags.json) {
      return { summary };
    }

    this.log(summary);
  }
}
