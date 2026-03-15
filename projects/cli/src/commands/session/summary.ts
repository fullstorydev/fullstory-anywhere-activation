import { Profile } from '@fullstory/activation-sdk/index.js';
import { Args, Flags } from '@oclif/core';

import { Command, Fmt, Prompt } from '../../core/index.js';

export default class SessionSummaryCommand extends Command {
  static args = {
    sessionId: Args.string({ required: true, description: 'The session ID (UserId:SessionId format, or a Fullstory session URL).' }),
    profileId: Args.string({ required: false, description: 'The summarization profile ID. If omitted, you will be prompted to select one.' }),
  };

  static description = `Generate an AI summary of a session using a summarization profile.
The profile specifies prompting instructions and session context configuration.

For more information, see https://developer.fullstory.com/server/sessions/summarize/.`;

  static enableJsonFlag = true;

  static examples = [
    { command: '<%= config.bin %> session:summary 1841382665432129521:4929353557192241189', description: 'Interactively select a profile and summarize the session.' },
    { command: '<%= config.bin %> session:summary 1841382665432129521:4929353557192241189 1c07280f-df08-494f-873e-6214cb6c46b', description: 'Summarize the session using a specific summary profile.' },
    { command: '<%= config.bin %> session:summary 1841382665432129521:4929353557192241189 1c07280f-df08-494f-873e-6214cb6c46b --endTimestamp 2024-08-01T13:00:00Z', description: 'Summarize from session start time until the end timestamp' },
  ];

  static flags = {
    ...Command.flags,
    endTimestamp: Flags.string({ required: false, description: 'Only include events before this ISO 8601 timestamp.' }),
  }

  static summary = 'Generate a session summary.';

  /**
   * Prompt the user to choose a summary profile from a list of profiles.
   * @param profiles Array of available summary profiles.
   * @returns The selected `Profile` object.
   */
  async chooseProfile(profiles: Profile[]) {
    const options = profiles.sort((a, b) => (a.name || '').localeCompare(b.name || ''))
      .map((profile: Profile) => ({ name: `${profile.id}\t${profile.name || ''}`, value: profile }));
    const selectedProfile = await Prompt.list<Profile>(options, 'Choose summary profile:');
    return selectedProfile;
  }

  async run() {
    const { args: { sessionId, profileId }, flags: { endTimestamp, json } } = await this.parse(SessionSummaryCommand);

    const { SummaryProfile, Session } = this.Fullstory;

    let profile: Profile;

    if (profileId) {
      profile = await SummaryProfile.get(profileId);
    } else {
      const profiles = await SummaryProfile.list();

      if (profiles.length === 0) {
        this.error(`No summary profiles found. Create one with ${Fmt.cmd(this.config.bin, 'profile:create')}.`);
      }

      profile = await this.chooseProfile(profiles);
    }

    const summary = await Session.summary(sessionId, profile.id, endTimestamp);

    if (profile.llm.response_schema) {
      this.logJson(summary.response);
    } else {
      return json ? summary : this.log(summary.summary);
    }
  }
}
