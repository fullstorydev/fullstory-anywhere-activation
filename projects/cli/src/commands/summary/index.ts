/* eslint-disable camelcase */
import { Profile, ProfileConfiguration, Summary } from '@fullstory/activation-sdk/index.js';
import { Args, Flags } from '@oclif/core';
import { readFileSync, readdirSync } from 'fs-extra';
import { join, resolve } from 'node:path';

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

Template variables can be used in pre_prompt and post_prompt fields:
- \`{{tag:name}}\` — inlines all session JSONs from the named tag directory (downloaded via session:context --download --tag).
- \`{{file:./path/to/file.txt}}\` — inlines the contents of the referenced file.
- \`{{VARIABLE_NAME}}\` — prompts you interactively for a value at runtime.

For more information, see https://developer.fullstory.com/server/sessions/summarize/.`;

  static enableJsonFlag = true;

  static examples = [
    { command: '<%= config.bin %> session:summary 1841382665432129521:4929353557192241189', description: 'Interactively select a profile and summarize the session.' },
    { command: '<%= config.bin %> session:summary 1841382665432129521:4929353557192241189 1c07280f-df08-494f-873e-6214cb6c46b', description: 'Summarize the session using a saved profile.' },
    { command: '<%= config.bin %> session:summary 1841382665432129521:4929353557192241189 1c07280f-df08-494f-873e-6214cb6c46b --endTimestamp 2024-08-01T13:00:00Z', description: 'Summarize from session start time until the end timestamp' },
    { command: '<%= config.bin %> session:summary 1841382665432129521:4929353557192241189 --file profile.json', description: 'Summarize the session using a local profile.' },
    { command: '<%= config.bin %> session:summary 1841382665432129521:4929353557192241189 1c07280f-df08-494f-873e-6214cb6c46b --file profile.json', description: 'Summarize the session using a saved profile with local overrides.' },
    { command: '<%= config.bin %> session:summary 1841382665432129521:4929353557192241189 --file profile-with-vars.json', description: 'Summarize using a profile with template variables ({{VAR}} and {{file:path}}).' },
    { command: '<%= config.bin %> session:summary 1841382665432129521:4929353557192241189 --file profile-with-tag.json', description: 'Summarize using a profile with {{tag:experiment-1}} to include downloaded session contexts.' },
  ];

  static flags = {
    ...Command.flags,
    endTimestamp: Flags.string({ required: false, description: 'Only include events before this ISO 8601 timestamp.' }),
    file: Flags.string({ char: 'f', required: false, description: 'Path to a JSON file containing summary profile configuration.' }),
    model: Flags.integer({ char: 'm', hidden: true, required: false, description: 'The model to use for summarization.' }),
  }

  static summary = 'Generate a session summary.';

  /**
   * Prompt the user to choose a summary profile from a list of profiles.
   * @param profiles - The list of profiles to choose from.
   * @returns The selected profile.
   */
  async chooseProfile(profiles: Profile[]) {
    const options = profiles.sort((a, b) => (a.name || '').localeCompare(b.name || ''))
      .map((profile: Profile) => ({ name: `${profile.id}\t${profile.name || ''}`, value: profile }));
    const selectedProfile = await Prompt.list<Profile>(options, 'Choose summary profile:');
    return selectedProfile;
  }

  /**
   * Parse and normalize the profile from flags and args.
   * @returns An object containing the profile ID and optional configuration.
   */
  async parseProfile(): Promise<{ configuration?: ProfileConfiguration; profileId?: string }> {
    const { args: { profileId }, flags: { file } } = await this.parse(SessionSummaryCommand);

    let configuration: ProfileConfiguration | undefined;

    if (file) {
      configuration = JSON.parse(readFileSync(file, 'utf8'));

      if (!configuration) {
        this.error('Failed to load local profile.');
      }

      // the local profile has an id because it's likely from a list profiles response
      if ((configuration as Profile).id) {
        configuration = {
          ...(configuration as Profile).configuration,
          llm: configuration!.llm,
        }
      }

      // the local profile has a name - often because this is used with create profile
      if ((configuration as { name?: string }).name) {
        delete (configuration as { name?: string }).name;
      }
    }

    // if no profileId and no file, interactively choose
    if (!profileId && !file) {
      const { SummaryProfile } = this.Fullstory;
      const profiles = await SummaryProfile.list();

      if (profiles.length === 0) {
        this.error(`No summary profiles found. Create one with ${Fmt.cmd(this.config.bin, 'profile:create')}.`);
      }

      const remoteProfile = await this.chooseProfile(profiles);
      return { profileId: remoteProfile.id };
    }

    return { profileId, configuration };
  }

  /**
   * Prints the summary response.
   * @param summary - The summary object to print.
   * @param json - Whether to output as JSON or plain text.
   * @returns The summary output or void.
   */
  async printSummary(summary: Summary, json = false) {
    if (summary.response_schema) {
      return this.logJson(summary.response);
    }

    return json ? summary : this.log(summary.summary);
  }

  /**
   * Resolve template variables in profile configuration.
   * - Replace {{tag:name}} with concatenated session files from the tag directory.
   * - Replace {{file:path}} with file contents.
   * - Prompt interactively for remaining {{VARIABLE}} placeholders.
   * @param config - The profile configuration containing template variables.
   * @returns The resolved profile configuration with all template variables replaced.
   */
  async resolveVariables(config: ProfileConfiguration): Promise<ProfileConfiguration> {
    const tagRegex = /{{tag:(.+?)}}/g;
    const fileRegex = /{{file:(.+?)}}/g;
    const varRegex = /{{(.+?)}}/g;

    const resolveString = async (str: string): Promise<string> => {
      // Pass 1: tag references
      let result = str.replaceAll(tagRegex, (_match, tagName: string) => {
        const tagDir = join(this.config.dataDir, 'contexts', tagName.trim());
        const files = readdirSync(tagDir).filter((f: string) => f.endsWith('.json')).sort();
        return files.map((f: string) => `--- SESSION: ${f} ---\n${readFileSync(join(tagDir, f), 'utf8')}`).join('\n');
      });

      // Pass 2: file references
      result = result.replaceAll(fileRegex, (_match, filePath: string) => readFileSync(resolve(filePath.trim()), 'utf8'));

      // Pass 3: interactive variables
      const variables = new Map<string, string>();
      const matches = [...result.matchAll(varRegex)];
      for (const match of matches) {
        const varName = match[1];
        if (!variables.has(varName)) {
          const value = await Prompt.input(`Enter value for ${varName}:`);
          variables.set(varName, value);
        }
      }

      for (const [varName, value] of variables) {
        result = result.replaceAll(`{{${varName}}}`, value);
      }

      return result;
    };

    const resolved = { ...config };

    if (resolved.llm?.pre_prompt) {
      resolved.llm = { ...resolved.llm, pre_prompt: await resolveString(resolved.llm.pre_prompt) };
    }

    if (resolved.llm?.post_prompt) {
      resolved.llm = { ...resolved.llm, post_prompt: await resolveString(resolved.llm.post_prompt) };
    }

    return resolved;
  }

  async run() {
    const { args: { sessionId }, flags: { endTimestamp, json } } = await this.parse(SessionSummaryCommand);

    const { Session } = this.Fullstory;

    let { profileId, configuration } = await this.parseProfile();

    if (configuration) {
      configuration = await this.resolveVariables(configuration);

      if (endTimestamp) {
        configuration.slice = { ...configuration.slice, 'end_timestamp': endTimestamp };
      }

      const summary = await Session.summaryWithOverrides(sessionId, configuration, profileId);
      return this.printSummary(summary, json);
    }

    // remote profile only (either explicitly provided or interactively chosen)
    const summary = await Session.summary(sessionId, profileId!, endTimestamp);
    return this.printSummary(summary, json);
  }
}
