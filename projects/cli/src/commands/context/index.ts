/* eslint-disable camelcase */
import { Context, ProfileConfiguration } from '@fullstory/activation-sdk/index.js';
import { Args, Flags } from '@oclif/core';
import { ensureDirSync, readJsonSync, writeJsonSync } from 'fs-extra';
import { join } from 'node:path';

import { Fmt, TableCommand } from '../../core/index.js';

export default class SessionContextCommand extends TableCommand {
  static args = {
    sessionId: Args.string({ required: true, description: 'The session ID (UserId:SessionId format, or a Fullstory session URL).' }),
  };

  static description = `Generate AI-ready context for one or more sessions.
The format and contents of the response are controlled by the profile configuration to optimize the information included for the intended use case.
Multiple session IDs can be provided as space-separated arguments.

For more information, see https://developer.fullstory.com/server/sessions/generate-context/`;

  static enableJsonFlag = true;

  static examples = [
    { command: '<%= config.bin %> session:context 1841382665432129521:4929353557192241189', description: 'Generate context using defaults.' },
    { command: '<%= config.bin %> session:context 1841382665432129521:4929353557192241189 --profile 1c07280f-df08-494f-873e-6214cb6c46b4', description: 'Generate context using a saved summary profile.' },
    { command: '<%= config.bin %> session:context 1841382665432129521:4929353557192241189 --file ./summmary-profile.json', description: 'Generate context using a summary profile from a JSON file.' },
    { command: '<%= config.bin %> session:context 1841382665432129521:4929353557192241189 1841382665432129521:5039353557192241190', description: 'Generate context for multiple sessions.' },
    { command: '<%= config.bin %> session:context 1841382665432129521:4929353557192241189 1841382665432129521:5039353557192241190 --download --tag experiment-1', description: 'Download context for multiple sessions into a named subfolder.' },
  ];

  static flags = {
    ...TableCommand.flags,
    file: Flags.string({ char: 'f', description: 'Path to a JSON file containing the ProfileConfiguration.', required: false }),
    profileId: Flags.string({ char: 'p', description: 'ID of a saved summarization profile to use as the ProfileConfiguration.', required: false }),
    download: Flags.boolean({ char: 'd', default: false, description: 'Download session context as JSON files to the local data directory.' }),
    tag: Flags.string({ required: false, description: 'Folder name for storing downloaded context. Used with --download.' }),
    compact: Flags.boolean({ default: false, description: 'Write compact JSON with no indentation. Used with --download.' }),
  };

  static strict = false;

  static summary = 'Generate AI-ready session context.';

  protected async parseConfiguration(): Promise<Omit<ProfileConfiguration, 'llm'>> {
    const { flags } = await this.parse(this.constructor as typeof SessionContextCommand);
    const { file, profileId } = flags;

    if (file) {
      return readJsonSync(file) as Omit<ProfileConfiguration, 'llm'>;
    }

    if (profileId) {
      const { SummaryProfile } = this.Fullstory;
      const { configuration } = await SummaryProfile.get(profileId);
      return configuration;
    }

    return {};
  }

  async run(): Promise<unknown> {
    const { argv, flags: { json, download, tag, compact } } = await this.parse(SessionContextCommand);
    const configuration = await this.parseConfiguration();

    const sessionIds = argv as string[];
    const { Session } = this.Fullstory;

    const allResponses: Context[] = [];
    const responsesBySession = new Map<string, Context>();

    if (sessionIds.length > 1) {
      this.showProgress('sessions fetched', sessionIds.length);
    }

    for (const id of sessionIds) {
      const response = await Session.context(id, configuration);
      responsesBySession.set(id, response);
      allResponses.push(response);
      this.progress?.increment();
    }

    this.progress?.stop();

    if (download) {
      const dir = tag ? join(this.config.dataDir, 'contexts', tag) : join(this.config.dataDir, 'contexts');
      ensureDirSync(dir);

      for (const [id, response] of responsesBySession) {
        const filename = id.replaceAll(':', '-') + '.json';
        writeJsonSync(join(dir, filename), response, { spaces: compact ? 0 : 2 });
      }

      this.print(`Session context saved to ${Fmt.constant(dir)}`);
      return allResponses;
    }

    const result = allResponses.length === 1 ? allResponses[0] : allResponses;

    // if the JSON flag is not set, print the JSON specifically
    // when the JSON flag is set, we can simply use the function return to print the JSON
    if (!json) {
      this.logJson(result);
    }

    return result;
  }
}
