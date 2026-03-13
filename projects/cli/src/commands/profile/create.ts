/* eslint-disable camelcase */
import { ProfileConfiguration, SliceModeType } from '@fullstory/activation-sdk/index.js';
import { Args, Flags } from '@oclif/core';
import { readJsonSync } from 'fs-extra';

import { Command, Prompt } from '../../core/index.js';

const EVENT_TYPES = [
  'navigate', 'click', 'dead-click', 'error-click', 'rage-click',
  'input-change', 'network-error', 'console-error', 'mouse-thrash',
  'highlight', 'copy', 'paste', 'element-seen',
] as const;

const CONTEXT_ELEMENTS = ['device', 'location', 'org', 'user'] as const;

export default class CreateProfileCommand extends Command {
  static args = {
    name: Args.string({ required: false, description: 'The display name of the profile.' }),
  };

  static description = `Create a summarization profile that specifies prompting instructions and session context configuration.
Provide the full configuration via --file, use flags for common settings, or run interactively to walk through each section.

Configuration sections:
  LLM      Pre/post prompts, response schema, temperature
  Slice    Which portion of the session to analyze (FIRST, LAST, TIMESTAMP)
  Context  Session metadata to include/exclude (device, location, org, user)
  Events   Event type filtering and formatting options
  Cache    Enable cached event responses

For more information, see https://developer.fullstory.com/server/sessions/create-profile/`;

  static enableJsonFlag = true;

  static examples = [
    { command: '<%= config.bin %> profile:create "My Profile" --prePrompt "Summarize this session."', description: 'Create a profile with a pre-prompt.' },
    { command: '<%= config.bin %> profile:create "My Profile" --file config.json', description: 'Create a profile from a JSON configuration file.' },
    { command: '<%= config.bin %> profile:create "My Profile" --sliceMode LAST --eventLimit 50', description: 'Create a profile analyzing the last 50 events.' },
    { command: '<%= config.bin %> profile:create "My Profile" --excludeContext device,location', description: 'Create a profile that excludes device and location context.' },
    { command: '<%= config.bin %> profile:create', description: 'Create a profile interactively.' },
  ];

  static flags = {
    ...Command.flags,
    // File input
    file: Flags.string({ char: 'f', required: false, description: 'Path to a JSON file containing the full ProfileConfiguration.' }),
    // LLM flags
    prePrompt: Flags.string({ required: false, description: 'Text included before the session context in the prompt.' }),
    postPrompt: Flags.string({ required: false, description: 'Custom instructions included after the session context.' }),
    temperature: Flags.string({ required: false, description: 'LLM temperature as a floating-point number.' }),
    responseSchema: Flags.string({ required: false, description: 'Path to a JSON file defining the LLM response schema (ResponseSchema).' }),
    // Slice flags
    sliceMode: Flags.string({ required: false, options: ['FIRST', 'LAST', 'TIMESTAMP', 'UNSPECIFIED'], description: 'Slicing strategy: FIRST (earliest events), LAST (latest events), TIMESTAMP (time range).' }),
    eventLimit: Flags.string({ required: false, description: 'Maximum number of events to include in the slice.' }),
    durationLimit: Flags.string({ required: false, description: 'Duration limit in milliseconds for the slice.' }),
    startTimestamp: Flags.string({ required: false, description: 'Start timestamp (ISO 8601) for TIMESTAMP slice mode.' }),
    endTimestamp: Flags.string({ required: false, description: 'End timestamp (ISO 8601) for TIMESTAMP slice mode.' }),
    // Context flags
    excludeContext: Flags.string({ required: false, description: 'Comma-separated context elements to exclude: device, location, org, user.' }),
    includeContext: Flags.string({ required: false, description: 'Comma-separated context elements to include: device, location, org, user.' }),
    // Events flags
    excludeEventTypes: Flags.string({ required: false, description: 'Comma-separated event types to exclude (e.g. click,navigate,dead-click).' }),
    includeEventTypes: Flags.string({ required: false, description: 'Comma-separated event types to include (e.g. click,navigate,error-click).' }),
    // Cache flag
    cache: Flags.boolean({ required: false, description: 'Enable cached event responses.' }),
  }

  static summary = 'Create a summarization profile.';

  async run() {
    const { args, flags } = await this.parse(CreateProfileCommand);
    const { SummaryProfile } = this.Fullstory;

    // Resolve profile name
    let name = args.name;
    if (!name) {
      name = await Prompt.input('Profile name:');
    }

    if (!name) {
      this.error('Profile name is required.');
    }

    // Resolve configuration
    let config: ProfileConfiguration;

    if (flags.file) {
      config = readJsonSync(flags.file);
    } else if (this.hasConfigFlags(flags)) {
      config = this.buildConfigFromFlags(flags);
    } else {
      config = await this.buildConfigInteractively();
    }

    const profile = await SummaryProfile.create(name, config);
    this.log(`Profile created: ${profile.id} ("${profile.name}")`);
    return profile;
  }

  private hasConfigFlags(flags: Record<string, unknown>): boolean {
    return !!(
      flags.prePrompt || flags.postPrompt || flags.temperature || flags.responseSchema ||
      flags.sliceMode || flags.eventLimit || flags.durationLimit || flags.startTimestamp || flags.endTimestamp ||
      flags.excludeContext || flags.includeContext ||
      flags.excludeEventTypes || flags.includeEventTypes ||
      flags.cache !== undefined
    );
  }

  private buildConfigFromFlags(flags: Record<string, any>): ProfileConfiguration {
    const config: ProfileConfiguration = {};

    // LLM
    if (flags.prePrompt || flags.postPrompt || flags.temperature || flags.responseSchema) {
      config.llm = {
        pre_prompt: flags.prePrompt || undefined,
        post_prompt: flags.postPrompt || undefined,
        temperature: flags.temperature ? Number(flags.temperature) : undefined,
        response_schema: flags.responseSchema ? readJsonSync(flags.responseSchema) : undefined,
      };
    }

    // Slice
    if (flags.sliceMode || flags.eventLimit || flags.durationLimit || flags.startTimestamp || flags.endTimestamp) {
      config.slice = {
        mode: (flags.sliceMode as SliceModeType) || undefined,
        event_limit: flags.eventLimit ? Number(flags.eventLimit) : undefined,
        duration_limit_ms: flags.durationLimit ? Number(flags.durationLimit) : undefined,
        start_timestamp: flags.startTimestamp || undefined,
        end_timestamp: flags.endTimestamp || undefined,
      };
    }

    // Context
    if (flags.excludeContext || flags.includeContext) {
      config.context = {
        exclude: flags.excludeContext ? this.parseContextList(flags.excludeContext) : undefined,
        include: flags.includeContext ? this.parseContextList(flags.includeContext) : undefined,
        exclude_org_context: false,
        exclude_user_context: false,
        exclude_location: false,
        exclude_device: false,
      };
    }

    // Events
    if (flags.excludeEventTypes || flags.includeEventTypes) {
      config.events = {
        exclude_types: flags.excludeEventTypes ? this.parseEventTypeList(flags.excludeEventTypes) : undefined,
        include_types: flags.includeEventTypes ? this.parseEventTypeList(flags.includeEventTypes) : undefined,
        trim_to_last_n_selectors: 0,
        include_descriptions: false,
      };
    }

    // Cache
    if (flags.cache !== undefined) {
      config.cache = { enable_event_cache: flags.cache };
    }

    return config;
  }

  private async buildConfigInteractively(): Promise<ProfileConfiguration> {
    const config: ProfileConfiguration = {};

    // --- LLM ---
    const configureLlm = await Prompt.confirm('Configure LLM prompts?', true);
    if (configureLlm) {
      const prePrompt = await Prompt.input('Pre-prompt (text before session context):');
      const postPrompt = await Prompt.input('Post-prompt (formatting/content instructions):');

      config.llm = {
        pre_prompt: prePrompt || undefined,
        post_prompt: postPrompt || undefined,
      };

      const setTemp = await Prompt.confirm('Set LLM temperature?', false);
      if (setTemp) {
        const temp = await Prompt.input('Temperature (floating-point number):');
        if (temp) config.llm.temperature = Number(temp);
      }

      const addSchema = await Prompt.confirm('Add a response schema from a JSON file?', false);
      if (addSchema) {
        const schemaPath = await Prompt.input('Path to response schema JSON file:');
        if (schemaPath) {
          config.llm.response_schema = readJsonSync(schemaPath);
        }
      }
    }

    // --- Slice ---
    const configureSlice = await Prompt.confirm('Configure session slicing?', false);
    if (configureSlice) {
      const mode = await Prompt.string(
        ['FIRST', 'LAST', 'TIMESTAMP', 'UNSPECIFIED'],
        'Slice mode:',
        'FIRST',
      ) as SliceModeType;

      config.slice = { mode };

      if (mode === 'FIRST' || mode === 'LAST') {
        const limitType = await Prompt.string(
          ['Event count', 'Duration (ms)', 'Neither'],
          'Limit by:',
          'Event count',
        );

        if (limitType === 'Event count') {
          const limit = await Prompt.input('Maximum number of events:');
          if (limit) config.slice.event_limit = Number(limit);
        } else if (limitType === 'Duration (ms)') {
          const duration = await Prompt.input('Duration limit in milliseconds:');
          if (duration) config.slice.duration_limit_ms = Number(duration);
        }
      }

      if (mode === 'TIMESTAMP') {
        const start = await Prompt.input('Start timestamp (ISO 8601):');
        const end = await Prompt.input('End timestamp (ISO 8601):');
        if (start) config.slice.start_timestamp = start;
        if (end) config.slice.end_timestamp = end;
      }
    }

    // --- Context ---
    const configureContext = await Prompt.confirm('Configure context exclusions?', false);
    if (configureContext) {
      const exclude = await Prompt.strings(
        [...CONTEXT_ELEMENTS],
        'Context elements to exclude:',
      ) as typeof CONTEXT_ELEMENTS[number][];

      config.context = {
        exclude: exclude.length > 0 ? exclude : undefined,
        exclude_org_context: exclude.includes('org'),
        exclude_user_context: exclude.includes('user'),
        exclude_location: exclude.includes('location'),
        exclude_device: exclude.includes('device'),
      };
    }

    // --- Events ---
    const configureEvents = await Prompt.confirm('Configure event filtering?', false);
    if (configureEvents) {
      const filterDirection = await Prompt.string(
        ['Exclude specific types', 'Include only specific types', 'No type filtering'],
        'Event type filtering:',
        'No type filtering',
      );

      config.events = {
        trim_to_last_n_selectors: 0,
        include_descriptions: false,
      };

      if (filterDirection === 'Exclude specific types') {
        config.events.exclude_types = await Prompt.strings(
          [...EVENT_TYPES],
          'Event types to exclude:',
        ) as typeof EVENT_TYPES[number][];
      } else if (filterDirection === 'Include only specific types') {
        config.events.include_types = await Prompt.strings(
          [...EVENT_TYPES],
          'Event types to include:',
        ) as typeof EVENT_TYPES[number][];
      }

      config.events.exclude_selectors = await Prompt.confirm('Exclude CSS selectors from events?', false);
      config.events.exclude_event_timestamps = await Prompt.confirm('Exclude timestamps from events?', false);
      config.events.include_descriptions = await Prompt.confirm('Include DX Data descriptions?', false);
    }

    // --- Cache ---
    const enableCache = await Prompt.confirm('Enable event cache?', false);
    if (enableCache) {
      config.cache = { enable_event_cache: true };
    }

    return config;
  }

  private parseContextList(value: string): typeof CONTEXT_ELEMENTS[number][] {
    return value.split(',').map(s => s.trim()) as typeof CONTEXT_ELEMENTS[number][];
  }

  private parseEventTypeList(value: string): typeof EVENT_TYPES[number][] {
    return value.split(',').map(s => s.trim()) as typeof EVENT_TYPES[number][];
  }
}
