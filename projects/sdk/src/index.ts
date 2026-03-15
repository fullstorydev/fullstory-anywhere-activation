import Annotation from './annotation.js';
import Event from './event.js';
import SegmentExport from './segment-export.js';
import Segment from './segment.js';
import Session from './session.js';
import Profile from './profile.js';
import User from './user.js';

export * from './annotation.js';
export * from './event.js';
export * from './segment.js';
export * from './segment-export.js';
export * from './session.js';
export * from './profile.js';
export * from './user.js';
export * from './utils.js';

/**
 * Main entry point for the Fullstory Activation SDK.
 *
 * Provides lazy-loaded access to each API sub-module (Annotation, Event, Session,
 * SummaryProfile, User, Segment, SegmentExport). Sub-module instances are
 * created on first access and reused for subsequent calls.
 *
 * @example
 * ```ts
 * import FullstorySdk from '@fullstory/activation-sdk';
 *
 * const fs = new FullstorySdk('your-api-key', 'your-org-id');
 * const sessions = await fs.Session.list('user@example.com');
 * ```
 */
export default class FullstorySdk {
  private _annotation?: Annotation;
  private _event?: Event;
  private _segmentExport?: SegmentExport;
  private _segment?: Segment;
  private _session?: Session;
  private _profile?: Profile;
  private _user?: User;

  /**
   * @param apiKey Fullstory API key used for authentication.
   * @param orgId Fullstory organization identifier.
   * @param domain Optional API hostname override for data-residency or internal use.
   * @param integrationSource Optional identifier for the integration source (defaults to an empty string).
   */
  constructor(private readonly apiKey: string, readonly orgId: string, readonly domain?: string, private readonly integrationSource?: string) {

  }

  /** Annotation creation for Fullstory visualizations. */
  get Annotation() {
    return this._annotation ??= new Annotation(this.apiKey, this.orgId, this.domain, this.integrationSource);
  }

  /** Custom event creation and batch import. */
  get Event() {
    return this._event ??= new Event(this.apiKey, this.orgId, this.domain, this.integrationSource);
  }

  /** Segment export operations (v1). */
  get SegmentExport() {
    return this._segmentExport ??= new SegmentExport(this.apiKey, this.orgId, this.domain, this.integrationSource);
  }

  /** Segment management (v1). */
  get Segment() {
    return this._segment ??= new Segment(this.apiKey, this.orgId, this.domain, this.integrationSource);
  }

  /** Session replay URLs, events, context generation, and AI summarization. */
  get Session() {
    return this._session ??= new Session(this.apiKey, this.orgId, this.domain, this.integrationSource);
  }

  /** AI summarization profile management. */
  get SummaryProfile() {
    return this._profile ??= new Profile(this.apiKey, this.orgId, this.domain, this.integrationSource);
  }

  /** User identity operations. */
  get User() {
    return this._user ??= new User(this.apiKey, this.orgId, this.domain, this.integrationSource);
  }
}
