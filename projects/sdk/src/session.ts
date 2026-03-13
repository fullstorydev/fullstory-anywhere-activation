import Client from './client.js';
import type { ProfileConfiguration } from './profile.js';

/**
 * A session replay record.
 */
export interface Session {
  /** ISO 8601 timestamp when the session was created. */
  createdTime: string,
  /** Fullstory replay URL for this session. */
  fsUrl: string,
  /** The unique session identifier. */
  sessionId: string,
  /** The user identifier associated with this session. */
  userId: string,
}

/**
 * The result of an AI summarization request for a session.
 */
export interface SessionSummary {
  /** The AI-generated analysis text. */
  analysis: string;
}

/**
 * A dimension pair representing pixel measurements.
 */
export interface ContextSize {
  /** Height in pixels. */
  height_pixels: number;
  /** Width in pixels. */
  width_pixels: number;
}

/**
 * Device and browser information captured during a session.
 */
export interface ContextDeviceContext {
  /** Browser name and version (e.g. "Chrome 120"). */
  browser?: string;
  /** Operating system name and version (e.g. "macOS 14.2"). */
  operating_system?: string;
  /** Physical screen dimensions. */
  screen_size?: ContextSize;
  /** Browser viewport dimensions. */
  viewport_size?: ContextSize;
}

/**
 * Geographic location of the session visitor.
 */
export interface ContextLocationContext {
  /** ISO 3166-1 alpha-2 country code. */
  country?: string;
  /** ISO 3166-2 region or state code. */
  region?: string;
  /** City name. */
  city?: string;
}

/**
 * Organization metadata associated with the session.
 */
export interface ContextOrgContext {
  /** Fullstory organization identifier. */
  org_id?: string;
  /** Organization display name. */
  name?: string;
  /** Industry classification. */
  industry?: string;
  /** Organization domain. */
  domain?: string;
  /** ISO 3166-1 alpha-2 country code. */
  country?: string;
}

/**
 * User identity and profile information associated with the session.
 */
export interface ContextUserContext {
  /** Application-level user identifier set via `FS.identify`. */
  user_uid?: string;
  /** User display name. */
  display_name?: string;
  /** User email address. */
  email?: string;
  /** Custom user properties set via `FS.setUserVars`. */
  properties?: Record<string, string>;
}

/**
 * Static session metadata that does not change over the lifetime of a session.
 */
export interface ContextStaticSessionContext {
  /** The unique session identifier. */
  session_id?: string;
  /** Fullstory replay URL. */
  session_url?: string;
  /** Organization metadata. */
  org_context?: ContextOrgContext;
  /** User identity metadata. */
  user_context?: ContextUserContext;
  /** Geographic location metadata. */
  location_context?: ContextLocationContext;
  /** Device and browser metadata. */
  device_context?: ContextDeviceContext;
  /** ISO 8601 timestamp when the session was created. */
  session_created_at?: string;
}

/**
 * A single event within the session context, as returned by the Generate Context endpoint.
 */
export interface ContextEvent {
  /** Event type identifier (e.g. "navigate", "click", "custom"). */
  type?: string;
  /** Human-readable description of the event. */
  description?: string;
  /** ISO 8601 timestamp of when the event occurred. */
  timestamp?: string;
  /** URL to a screenshot captured at the time of the event. */
  screenshot_url?: string;
  /** Text content associated with the event (e.g. clicked element text). */
  content?: string;
  /** Additional event metadata. */
  properties?: Record<string, unknown>;
}

/**
 * A captured session event returned by the Get Session Events endpoint.
 * Contains typed common fields with loosely-typed detail bags for
 * source-specific and event-type-specific data.
 */
export interface SessionEvent {
  /** Unique identifier for the capture device. */
  device_id: string;
  /** Session identifier. */
  session_id: string;
  /** Page, screen, or tab identifier. */
  view_id: string;
  /** ISO 8601 timestamp of the event. */
  event_time: string;
  /** Event type (e.g. "navigate", "click", "custom"). */
  event_type: string;
  /** Source platform: "web", "ios", "android", or "server". */
  source_type?: string;
  /** Source-specific details such as URL, user agent, or mobile app info. */
  source_properties?: Record<string, unknown>;
  /** Type-specific event details; structure varies by event_type. */
  event_properties?: Record<string, unknown>;
}

/**
 * A page (or mobile screen) visited during a session, including its events.
 */
export interface ContextPage {
  /** The URL of the web page or mobile webview. */
  url?: string;
  /** The title of the web page or mobile webview. */
  title?: string;
  events?: ContextEvent[];
  /** 1-based index of browser tabs in a web session, omitted for non-web sessions. */
  tab?: number;
}

/**
 * Full session context combining static metadata with page-level event data.
 */
export interface ContextSessionContext {
  /** Static session metadata (device, location, org, user). */
  context?: ContextStaticSessionContext;
  /** Ordered list of pages visited during the session, each containing its events. */
  pages?: ContextPage[];
}

/**
 * Top-level response from the Generate Context endpoint.
 */
export interface Context {
  /** The session context data including metadata and events. */
  context_data?: ContextSessionContext;
}

/**
 * SDK for the Fullstory Activation Sessions API.
 *
 * Provides methods to list session replay URLs, retrieve raw session events,
 * generate AI-ready context, and produce AI summarizations of sessions.
 */
export default class SessionSdk extends Client {

  /**
   * Return the set of events for the specified session formatted for input into a Generative AI. The format and contents of the response are controlled by the Context specified to optimize the information included for the intended use case.
   * See [Generate Context](https://developer.fullstory.com/server/sessions/generate-context/).
   * @param sessionId The UTF-8 encoded ID of the session for which to generate context data. To retrieve the Session ID you may use the appropriate Get Session Details API for Web, iOS, or Android. As Session IDs include : separators the ID must be URL encoded using the %3A substitution.
   * @param configuration Configuration controlling which session data is included in the context response.
   * @returns Context response containing the session information and events as JSON.
   */
  async context(sessionId: string, configuration: Omit<ProfileConfiguration, 'llm'>): Promise<Context> {
    const id = this.parseId(sessionId);
    return this.POST<Omit<ProfileConfiguration, 'llm'>, Context>(`/v2/sessions/${encodeURIComponent(id)}/context`, configuration);
  }

  /**
   * Return the full set of captured events for a specified Session.
   * See [Get Session Events](https://developer.fullstory.com/server/sessions/get-session-events/).
   * @param sessionId The UTF-8 encoded ID of the session for which to generate context data. To retrieve the Session ID you may use the appropriate Get Session Details API for Web, iOS, or Android. As Session IDs include : separators the ID must be URL encoded using the %3A substitution.
   * @returns A list of session events based on the [Events](https://developer.fullstory.com/destinations/events/) model.
   */
  async events(sessionId: string): Promise<SessionEvent[]> {
    const id = this.parseId(sessionId);

    const { events } = await this.GET<{ events: SessionEvent[] }>(`/v2/sessions/${encodeURIComponent(id)}/events`);

    return events;
  }

  /**
   * Return a list of session replay URLs for a user, queried by email address and/or uid.
   * @param userId The uid is your app's user id for the current user set via `FS.identify` or email address that you have associated with the user via `FS.identify` or `FS.setUserVars`.
   * @returns `Session` list.
   */
  async list(userId: string) {
    // The Fullstory v1 sessions endpoint accepts either `email` or `uid` query params.
    // We use the presence of `@` to distinguish email addresses from application user IDs.
    const idParam = userId.includes('@') ? `email=${encodeURIComponent(userId)}` : `uid=${userId}`;

    let sessions: Session[] = [];
    let paginationToken: string | undefined = undefined;

    do {
      const query: string = paginationToken
        ? `limit=100&${idParam}&pagination_token=${encodeURIComponent(paginationToken)}`
        : `limit=100&${idParam}`;

      const response: { sessions: Session[], pagination_token?: string } = await this.GET<{ sessions: Session[], pagination_token?: string }>(`/sessions/v2?${query}`);

      sessions = sessions.concat(response.sessions);
      paginationToken = response.pagination_token;
    } while (paginationToken);

    return sessions;
  }

  /**
   * Parses a session ID from a session URL or ID.
   * @param urlOrId Session URL or ID from Fullstory.
   * @returns The session ID or throws an Error if the URL could not be parsed.
   */
  private parseId(urlOrId: string): string {
    urlOrId = urlOrId.trim();

    try {
      if (urlOrId.startsWith('https://')) {
        const pos = urlOrId.indexOf('(');

        if (pos !== -1) {
          return urlOrId.slice(pos + 1, urlOrId.indexOf('(', pos + 1)).replace('!', ':');
        } else {
          // https://app.fullstory.com/ui/org/session/5423563266297856:8658262255227649805!5580733057163270273
          return urlOrId.slice(urlOrId.lastIndexOf(':') + 1).replace('!', ':');
        }
      } else if (urlOrId.indexOf('!') > 0) {
        // a convenience to convert the "8291063592464834358!7771051600838814191" value to the desired format
        return urlOrId.replace('!', ':');
      } else {
        return urlOrId;
      }
    } catch (err) {
      throw Error(`Unable to parse session ID from ${urlOrId}`);
    }
  }

  /**
   * Return a Generative AI summarization of the specified session using the supplied Profile that specifies both prompting instructions and session context configuration.
   * @param sessionId The UTF-8 encoded ID of the session for which to generate context data. To retrieve the Session ID you may use the appropriate Get Session Details API for Web, iOS, or Android. As Session IDs include : separators the ID must be URL encoded using the %3A substitution.
   * @param profileId The ID of the summarization profile that specifies prompting instructions and context configuration.
   * @param endTimestamp If specified, only events before this timestamp will be included in the context (ISO 8601 date-time, e.g. `2024-01-15T13:30:00Z`).
   * @returns An object containing the `summary` string generated by the AI model.
   */
  async summarize(sessionId: string, profileId: string, endTimestamp?: string): Promise<{ summary: string }> {
    const id = this.parseId(sessionId);
    const params = new URLSearchParams({ config_profile: profileId });
    if (endTimestamp) params.set('end_timestamp', endTimestamp);
    return this.GET<{ summary: string }>(`/v2/sessions/${encodeURIComponent(id)}/summary?${params}`);
  }
}
