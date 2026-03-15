import { Profile, ProfileSliceOptions } from '@fullstory/activation-sdk/index.js';
import { Args } from '@oclif/core';
import ms from 'ms';

import { Fmt, TableColumns, TableCommand } from '../../core/index.js';

export default class ProfileListCommand extends TableCommand {
  static args = {
    id: Args.string({ required: false, description: 'Returns a specific profile\'s details.' }),
  };

  static columns: TableColumns<Profile> = {
    id: { name: 'ID' },
    name: { format: (row) => row.name || '-' },
    sliceMode: { name: 'Mode', format: (row) => Fmt.text(row.configuration.slice?.mode) },
    sliceLimit: { name: 'Limit', format: (row) => ProfileListCommand.formatLimit(row.configuration.slice) },
    contextExcludes: { name: 'Context Excludes', format: (row) => Fmt.text(row.configuration.context?.exclude) },
    contextIncludes: { name: 'Context Includes', extended: true, format: (row) => Fmt.text(row.configuration.context?.include) },
    eventExcludes: { name: 'Event Excludes', format: (row) => Fmt.join(row.configuration.events?.exclude_types) },
    eventIncludes: { name: 'Event Includes', extended: true, format: (row) => Fmt.text(row.configuration.events?.include_types) },
    prePrompt: { name: 'PrePrompt', format: (row) => row.llm?.pre_prompt ? `${ProfileListCommand.toTokenSize(row.llm.pre_prompt)} tokens` : '-' },
    prePromptText: { name: 'PrePrompt', extended: true, format: (row) => Fmt.text(row.llm?.pre_prompt) },
    postPromptTokens: { name: 'PostPrompt', format: (row) => row.llm?.post_prompt ? `${ProfileListCommand.toTokenSize(row.llm.post_prompt)} tokens` : '-' },
    postPromptText: { name: 'PostPrompt', extended: true, format: (row) => Fmt.text(row.llm?.post_prompt) },
    schema: { name: 'Schema', format: (row) => Fmt.text(row.llm?.response_schema?.type) },
  };

  static description = `List all summarization profiles or retrieve a single profile by ID.
Without arguments, displays a table of all profiles with ID, name, model, and temperature columns. Use --extended to include prompt and configuration columns.
With a profile ID argument, displays a detailed vertical view of all profile fields including LLM prompts, slice configuration, context exclusions, and event filtering settings.
Both modes support --json for machine-readable output.

For more information, see https://developer.fullstory.com/server/sessions/list-profiles`;

  static enableJsonFlag = true;

  static examples = [
    { command: '<%= config.bin %> profile', description: 'List all profiles in a table.' },
    { command: '<%= config.bin %> profile --extended', description: 'List all profiles with prompt and configuration columns.' },
    { command: '<%= config.bin %> profile 5371ea1b-625c-4773-b038-0dacb0b4d08a', description: 'Show detail view for a specific profile.' },
    { command: '<%= config.bin %> profile --json', description: 'List all profiles as a JSON array.' },
    { command: '<%= config.bin %> profile 5371ea1b-625c-4773-b038-0dacb0b4d08a --json', description: 'Get a single profile as a JSON object.' },
  ];

  static flags = {
    ...TableCommand.flags,
  }

  static summary = 'List or get summarization profiles.';

  static formatLimit(slice?: ProfileSliceOptions): string {
    /* eslint-disable camelcase, unicorn/switch-case-braces, unicorn/no-useless-switch-case */
    if (!slice) return '-';

    const { mode, duration_limit_ms, event_limit, start_timestamp, end_timestamp } = slice;

    switch (mode) {
      case 'FIRST':
      case 'LAST':
        // (van) duration_limit_ms is a string type as of 3/8/26, which is unexpected
        return duration_limit_ms ? `${ms(Number(duration_limit_ms), { long: true })}` : `${event_limit} events`;
      case 'TIMESTAMP':
        return `${new Date(start_timestamp || '').toLocaleString()} - ${new Date(end_timestamp || '').toLocaleString()}`;
      case 'UNSPECIFIED':
      default:
        return '-';
    }
  }

  static toTokenSize(text: string): number {
    // Gemini models, such as 1.5 Pro and Flash, use tokens for input and output. Tokens are approximately 4 characters
    return Math.ceil(text.length / 4);
  }

  printDetails(profile: Profile): string {
    const { configuration, id, name, llm } = profile;
    return `${Fmt.h1('profile')}
${Fmt.h3('id')}\t\t${Fmt.id(id)}
${Fmt.h3('name')}\t\t${name}

${Fmt.h1('slice')}
${Fmt.h3('mode')}\t\t${Fmt.constant(configuration.slice?.mode)}
${Fmt.h3('event_limit')}\t\t${Fmt.number(configuration.slice?.event_limit)}
${Fmt.h3('duration_limit_ms')}\t${Fmt.number(configuration.slice?.duration_limit_ms)}
${Fmt.h3('start_timestamp')}\t\t${Fmt.number(configuration.slice?.start_timestamp)}
${Fmt.h3('end_timestamp')}\t\t${Fmt.number(configuration.slice?.end_timestamp)}

${Fmt.h1('context')}
${Fmt.h3('options')}\t\t${Fmt.enabled(configuration.context)}
${Fmt.h3('exclude')}\t\t${Fmt.constant(configuration.context?.exclude)}
${Fmt.h3('include')}\t\t${Fmt.constant(configuration.context?.include)}

${Fmt.h1('llm')}
${Fmt.h3('pre-prompt')}\n${llm.pre_prompt?.replaceAll('\\n', '\n').replaceAll('\\"', '"')}
${Fmt.h3('post-prompt')}\n${llm.post_prompt?.replaceAll('\\n', '\n').replaceAll('\\"', '"')}
${Fmt.h3('response schema')}\n${llm.response_schema ? JSON.stringify(llm.response_schema, null, 2) : ''}
  
${Fmt.h1('events')}
${Fmt.h3('options')}\t\t${Fmt.enabled(configuration.events)}
${Fmt.h3('exclude types')}\t${Fmt.join(configuration.events?.exclude_types, ' ')}
${Fmt.h3('include only')}\t${Fmt.join(configuration.events?.include_types, ' ')}
`;
  }

  async run() {
    const { args: { id }, flags } = await this.parse(ProfileListCommand);
    const { SummaryProfile } = this.Fullstory;

    if (id) {
      const profile = await SummaryProfile.get(id);

      if (flags.json) {
        return profile;
      }

      return this.print(this.printDetails(profile));
    }

    const profiles = await SummaryProfile.list();
    return this.table(profiles, ProfileListCommand.columns);
  }
}
