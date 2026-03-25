import { Profile, ProfileConfiguration, Summary } from '@fullstory/activation-sdk/index.js';
import { Args, Flags } from '@oclif/core';
import { readFileSync } from 'fs-extra';

import { Command, Fmt, Prompt } from '../../core/index.js';

export default class SessionSummaryCommand extends Command {
  static args = {
    sessionId: Args.string({ required: true, description: 'The session ID (UserId:SessionId format, or a Fullstory session URL).' }),
    profileId: Args.string({ required: false, description: 'The summarization profile ID. If omitted, you will be prompted to select one.' }),
  };

  static description = `Generate an AI summary of a session using a summarization profile.

A summary profile contains prompting instructions and session context configuration. Profiles can be provided by:
- Interatively choosing a previously created profile.
- Providing the previously created profile ID.
- Providing a local file containing a profile's JSON.
- Providing both the profile ID and a local file.

When both a profile ID and a local file are used, the local file's profile properties will override the same properties in the profile referenced by the ID.

For more information, see https://developer.fullstory.com/server/sessions/summarize/.`;

  static enableJsonFlag = true;

  static examples = [
    { command: '<%= config.bin %> session:summary 1841382665432129521:4929353557192241189', description: 'Interactively select a profile and summarize the session.' },
    { command: '<%= config.bin %> session:summary 1841382665432129521:4929353557192241189 1c07280f-df08-494f-873e-6214cb6c46b', description: 'Summarize the session using a saved profile.' },
    { command: '<%= config.bin %> session:summary 1841382665432129521:4929353557192241189 1c07280f-df08-494f-873e-6214cb6c46b --endTimestamp 2024-08-01T13:00:00Z', description: 'Summarize from session start time until the end timestamp' },
    { command: '<%= config.bin %> session:summary 1841382665432129521:4929353557192241189 --file profile.json', description: 'Summarize the session using a local profile.' },
    { command: '<%= config.bin %> session:summary 1841382665432129521:4929353557192241189 1c07280f-df08-494f-873e-6214cb6c46b --file profile.json', description: 'Summarize the session using a saved profile with local overrides.' },
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

  /**
   * Prints the summary response. If a response schema is present, the raw JSON response is printed. Otherwise, the summary text is printed as plaintext.
   * @param summary The summary object containing the response and summary text.
   * @param json Whether to print the summary as JSON.
   * @returns The JSON itself or void if the summary text is printed.
   */
  async printSummary(summary: Summary, json = false) {
    if (summary.response_schema) {
      return this.logJson(summary.response);
    }

    // print the raw JSON or the summary text itself as plaintext
    return json ? summary : this.log(summary.summary);
  }


  async run() {
    const { args: { sessionId, profileId }, flags: { endTimestamp, json, file } } = await this.parse(SessionSummaryCommand);

    const { SummaryProfile, Session } = this.Fullstory;

    let localProfile: ProfileConfiguration | undefined;

    if (file) {
      localProfile = JSON.parse(readFileSync(file, 'utf8'));

      if (!localProfile) {
        this.error('Failed to load local profile.');
      }

      // below there's some intelligent parsing and reformatting based on file structure

      // the local profile has an id because it's likely from a list profiles response
      if ((localProfile as Profile).id) {
        localProfile = {
          ...(localProfile as Profile).configuration,
          llm: localProfile.llm,
        }
      }

      // the local profile has a name - often because this is used with create profile
      if ((localProfile as { name?: string }).name) {
        delete (localProfile as { name?: string }).name;
      }
    }

    // use only the local profile and summarize
    if (localProfile && !profileId) {
      if (endTimestamp) {
        localProfile.slice = { ...localProfile.slice, 'end_timestamp': endTimestamp };
      }

      const summary = await Session.summaryWithOverrides(sessionId, localProfile, profileId);
      return this.printSummary(summary, json);
    }

    // override a specific profile with the local profile and summarize
    if (localProfile && profileId) {
      // NOTE that the profile ID can be supplied directly; there is no need to retrieve the profile
      const summary = await Session.summaryWithOverrides(sessionId, localProfile, profileId);
      return this.printSummary(summary, json);
    }

    // no local profile, use a remote profile and summarize
    if (profileId) {
      const summary = await Session.summary(sessionId, profileId, endTimestamp);
      return this.printSummary(summary, json);
    }

    // interactively choose a profile and summarize
    const profiles = await SummaryProfile.list();

    if (profiles.length === 0) {
      this.error(`No summary profiles found. Create one with ${Fmt.cmd(this.config.bin, 'profile:create')}.`);
    }

    // ask the user to select one
    const remoteProfile = await this.chooseProfile(profiles);

    const summary = await Session.summary(sessionId, remoteProfile.id, endTimestamp);
    return this.printSummary(summary, json);
  }
}
