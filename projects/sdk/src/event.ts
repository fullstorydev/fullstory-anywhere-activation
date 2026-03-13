import Client from './client.js';
import { Job } from './job.js';

export interface CreateEventContext {
  /** Browser-specific context for web events. */
  browser: Partial<{
    /** The page URL where the event occurred. */
    url: string,
    /** The browser's user-agent string. */
    user_agent: string,
    /** The referring URL that led to the current page. */
    initial_referrer: string,
  }>,
  /** Mobile app context for iOS and Android events. */
  mobile: Partial<{
    /** Bundle or package identifier (e.g. "com.example.app"). */
    app_id: string,
    /** Application version string. */
    app_version: string,
    /** Human-readable application name. */
    app_name: string,
    /** Build variant or flavor (e.g. "debug", "release"). */
    build_variant: string,
  }>,
  /** Device hardware context. */
  device: Partial<{
    /** Device manufacturer (e.g. "Apple", "Samsung"). */
    manufacturer: string,
    /** Device model (e.g. "iPhone 15", "Pixel 8"). */
    model: string,
    /** Physical screen width in pixels. */
    screen_width: number,
    /** Physical screen height in pixels. */
    screen_height: number,
    /** Viewport width in pixels. */
    viewport_width: number,
    /** Viewport height in pixels. */
    viewport_height: number,
  }>,
  /** Geographic location context. */
  location: Partial<{
    /** ISO 3166-1 alpha-2 standard country code. */
    country: string,
    /** ISO 3166-2 standard region code. */
    region: string,
    /** Name of the city. */
    city: string,
    /** Geographic latitude in decimal degrees. */
    latitude: number,
    /** Geographic longitude in decimal degrees. */
    longitude: number,
    /** The client's IP address. */
    ip_address: string,
  }>,
}

export type CreateEventProperties = Record<string, undefined | boolean | number | string | (boolean | number | string)[]>;

export interface CreateEvent {
  /**
   * The session identifier.
   * If `use_most_recent` is true, the most recent session within 30 minutes will be used.
   * If no recent session is found, events will be created without a session.
   */
  session: {
    /** The Fullstory generated identifier for the session to associate the event with. */
    id?: string,
    /** Associate events with the most recent session captured from the user. Defaults to `false`. If `true`, a `user` is required. */
    use_most_recent?: boolean,
    /** The application-specific ID you've given to the session (max 256 characters). */
    uid?: string,
  },
  /**
   * The user identifier. Required when `session.use_most_recent` is `true`.
   * If `session.id` is provided, it is enough to identify a session and `user` will not be accepted.
   */
  user?: {
    /** The application-specific ID you've given to the user (max 256 characters). */
    uid?: string,
    /** The Fullstory-assigned user ID, returned from `POST /v2/users`. */
    id?: string,
  },
  /** The context in which the events are attached to. */
  context?: Partial<CreateEventContext>,
  /** The event's name. */
  name: string,
  /** The event's timestamp in ISO 8601 format. If not provided, the current Fullstory server time will be used. It is recommended to always set the timestamp. */
  timestamp?: string,
  /** The custom event's payload. */
  properties?: CreateEventProperties
  /** Optional schema declaration to override Fullstory's default type inference for the event properties. */
  schema?: {
    /** A mapping of property names to their Fullstory type identifiers. */
    properties: {
      [key: string]: 'bool' | 'bools' | 'date' | 'dates' | 'int' | 'ints' | 'str' | 'strs' | 'real' | 'reals',
    },
  }
}

/**
 * A single failed event from a batch import.
 */
export interface BatchEventImportError {
  /** A description of the failure encountered while importing the event. */
  message: string,
  /** The error code. */
  code: string,
  /** The corresponding event import request that resulted in the failure. */
  event: CreateEvent,
}

/**
 * Paginated response for batch event import errors.
 */
export interface BatchEventImportErrorsResponse {
  /** Page of event import failures for the batch import. */
  results: BatchEventImportError[],
  /** The total number of failures for the specified events import. */
  total_records: string,
  /** Token to fetch the next page of import failures. */
  next_page_token?: string,
}

/**
 * A single successfully imported event from a batch import.
 */
export interface BatchEventImportResult {
  /** The event's name. */
  name: string,
  /** The event's timestamp in ISO 8601 format. */
  timestamp?: string,
  /** The custom event's payload. */
  properties?: CreateEventProperties,
  /** The user identifier, if the event is associated with a user. */
  user?: { id?: string, uid?: string },
  /** The session identifier, if the event is attached to a session. */
  session?: { id?: string, uid?: string },
  /** The context in which the events are attached to. */
  context?: Partial<CreateEventContext>,
  /** Schema declaration. */
  schema?: { properties: { [key: string]: string } },
}

/**
 * Paginated response for successfully imported batch events.
 */
export interface BatchEventImportsResponse {
  /** Page of event import responses for the batch import. */
  results: BatchEventImportResult[],
  /** Total number of records in this batch import. */
  total_records: string,
  /** Token to fetch the next page of import results. */
  next_page_token?: string,
}

/**
 * SDK for the Fullstory Events API.
 *
 * Provides methods to create individual events, batch import events,
 * and retrieve batch import job status and results.
 */
export default class EventSdk extends Client {

  /**
   * Creates a batch events import job with the given list of event information.
   * See [Create Events Batch Import](https://developer.fullstory.com/server/events/create-batch-events-import-job/).
   * @param events  The list of event requests that should be imported.
   * @returns A `Job` on success.
   */
  async import(events: CreateEvent[]): Promise<{ job: Omit<Job, 'finished'> }> {
    // TODO (van) we can do this for the user, simply break up the events into batches and run import sequentially
    if (events.length > 50000) {
      throw Error(`Maximum count of imported events is 50,000. Reduce batch size.`);
    }

    for (const event of events) {
      if (event.session.id) {
        this.checkSessionId(event.session.id);
      }
      this.checkTimestamp(event.timestamp);
    }

    return this.POST<{ requests: CreateEvent[] }, { job: Job }>('/v2/events/batch', { requests: events });
  }

  private checkSessionId(sessionId: string) {
    if (!sessionId.includes(':')) {
      throw Error(`Session ID is incorrect; use the "UserId:SessionId" format.`);
    }
  }

  private checkTimestamp(timestamp?: string) {
    if (timestamp !== undefined && (timestamp === '' || isNaN(new Date(timestamp).valueOf()))) {
      throw Error(`Timestamp is incorrect; use an ISO 8601 string.`);
    }
  }

  /**
   * Creates one event with the specified details.
   * See [Create Event](https://developer.fullstory.com/server/events/create-event/).
   * @param sessionId The Fullstory generated identifier for the session to associate the event with.
   * @param name The event's name.
   * @param options Optional `context`, `properties`, `timestamp`.
   * @returns An empty object on success.
   */
  async create(sessionId: string, name: string, options: Pick<CreateEvent, 'context' | 'properties' | 'schema' | 'timestamp'> = {}): Promise<{}> {
    const { context, properties, schema, timestamp } = options;

    this.checkSessionId(sessionId);
    this.checkTimestamp(timestamp);

    return this.POST<CreateEvent, {}>('/v2/events', {
      name,
      session: {
        id: sessionId,
      },
      context,
      timestamp,
      properties,
      schema,
    });
  }

  /**
   * Returns the status of a batch events import job.
   * See [Get Events Batch Import Job](https://developer.fullstory.com/server/events/get-batch-events-import-job/).
   * @param jobId The ID of the batch import job.
   * @returns A `Job` on success.
   */
  async job(jobId: string): Promise<Job> {
    return this.GET<Job>(`/v2/events/batch/${jobId}`);
  }

  /**
   * Returns the error message and code for any events that failed from a batch import job.
   * See [Get Batch Events Import Errors](https://developer.fullstory.com/server/events/get-batch-events-import-errors/).
   * @param jobId The ID of the batch import job.
   * @param pageToken Optional pagination token for fetching subsequent pages.
   * @returns A paginated list of `BatchEventImportError` results.
   */
  async errors(jobId: string, pageToken?: string): Promise<BatchEventImportErrorsResponse> {
    const query = pageToken ? `?page_token=${encodeURIComponent(pageToken)}` : '';
    return this.GET<BatchEventImportErrorsResponse>(`/v2/events/batch/${jobId}/errors${query}`);
  }

  /**
   * Returns the successfully imported events from a batch import job.
   * See [Get Batch Events Imports](https://developer.fullstory.com/server/events/get-batch-events-imports/).
   * @param jobId The ID of the batch import job.
   * @param pageToken Optional pagination token for fetching subsequent pages.
   * @returns A paginated list of `BatchEventImportResult` results.
   */
  async imports(jobId: string, pageToken?: string): Promise<BatchEventImportsResponse> {
    const query = pageToken ? `?page_token=${encodeURIComponent(pageToken)}` : '';
    return this.GET<BatchEventImportsResponse>(`/v2/events/batch/${jobId}/imports${query}`);
  }
}
