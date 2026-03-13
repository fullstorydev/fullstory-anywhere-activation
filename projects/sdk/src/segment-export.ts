import { createReadStream, createWriteStream } from 'fs';
import { ensureDir, ensureFile, existsSync, remove } from 'fs-extra';
import JSON from 'json-bigint';
import { finished } from 'node:stream';
import { promisify } from 'node:util';
import zlib from 'node:zlib'
import fetch from 'node-fetch';
import readline from 'readline';

import Client from './client.js';

export enum ExportFormat {
  CSV = 'FORMAT_CSV',
  JSON = 'FORMAT_JSON',
  NDJSON = 'FORMAT_NDJSON',
}

export enum ExportScope {
  Event = 'SCOPE_EVENTS',
  Individual = 'SCOPE_INDIVIDUAL',
  Pages = 'SCOPE_PAGES',
  Sessions = 'SCOPE_SESSIONS',
}

export enum ExportType {
  Event = 'TYPE_EVENT',
  Individual = 'TYPE_INDIVIDUAL',
}

export interface ExportTimeRange {
  /**
   * UTC RFC 3339 timestamp or an empty string. If an empty string, this will be interpreted as "forever in the past".
   */
  start: string,
  /**
   * UTC RFC 3339 timestamp or an empty string. If an empty string, this will be interpreted as "up to the time of the request".
   */
  end: string,
}

export interface CreateExportOptions {
  /**
   * An Id for a segment as returned from the list segments API endpoint or found in the url path of the segment. 
   * This can include built-in segment Ids such as the "everyone" segment.
   */
  segmentId: string,
  /**
   * Which kind of data to export. TYPE_EVENT will export the event data for the corresponding segment and TYPE_INDIVIDUAL will export individuals in the segment.
   */
  type?: ExportType | string,
  /**
   * Determines the data format of the export. Options are FORMAT_JSON, FORMAT_CSV, and FORMAT_NDJSON. 
   * Note: If using CSV format, it is highly recommended that fields are also explicitly provided. 
   * Since new fields will be added as FullStory adds more features, providing explicit fields will result in deterministic headers. 
   * For a single version of the API, fields will never be removed or renamed.
   */
  format?: ExportFormat | string,
  /**
   * Restricts the exported data to the provided time range. 
   * For TYPE_EVENT exports, this is based on the EventStart time. 
   * For TYPE_INDIVIDUAL, only users that performed events within the provided time range are exported. 
   * Note: this does not have any effect on the underlying segment's time range.
   */
  timeRange?: ExportTimeRange,
  /**
   * If provided, this time range overrides the time range for the provided segment.
   */
  segmentTimeRange?: ExportTimeRange,
  /**
   * Timezone will be used for calculating relative dates (defaults to UTC). 
   * If provided, it must be a valid IANA timezone.
   */
  timezone?: string;
  /**
   * Restricts the set of fields that are included in the export. 
   * If unspecified, all fields will be exported. Custom variables (such as user and custom event properties) can also be specified. These should be specified like user_MyUserVar_str or evt_MyEventVar_int. You can also get all of these by specifying them as like: user_* or evt_*. Note: This is not a general glob pattern, just a special value. If unspecified or empty, the default set of fields and all custom variables will be exported.
   */
  fields?: SegmentExportField[];
  /**
   * If the export type is TYPE_EVENT the scope field specifies "scope" of the events to be exported relative to the events matching the segment’s event filters.
   */
  eventDetails?: {
    /**
     * Specifies "scope" of the events to be exported relative to the events matching the segment’s event filters.
     */
    scope: ExportScope,
  }
}

/**
 * Response from creating a segment export operation.
 */
export interface CreateExportResponse {
  /** The ID of the created export operation, used to poll for status. */
  operationId?: string;
  /** Error message if the export creation failed. */
  error?: string;
}

/**
 * Status of an asynchronous export operation.
 */
export interface Operation {
  /** The unique operation identifier. */
  id: string;
  /** The operation type. */
  type: 'SEARCH_EXPORT',
  /** Current state of the operation. */
  state: 'PENDING' | 'COMPLETED' | 'FAILED',
  /** Description of any error that occurred during the operation. */
  errorDetails: string,
  /** ISO 8601 timestamp when the operation was created. */
  createdAt: string,
  /** ISO 8601 timestamp when the operation finished. */
  finishedAt: string,
  /** Estimated percentage of the operation that has been completed. */
  estimatePctComplete: number,
  /** Present when the operation has completed successfully. */
  results?: {
    /** ISO 8601 timestamp when the export download URL expires. */
    expires: string,
    /** The export ID used to retrieve download results. */
    searchExportId: string,
  },
}

/**
 * Paginated response from listing export operations.
 */
export interface ListResponse {
  /** Token for fetching the next page of operations. */
  nextPaginationToken: string,
  /** The list of export operations. */
  operations: Operation[];
}

/**
 * Download location for a completed segment export.
 */
export interface ExportResult {
  /** URL to download the export archive. */
  location: string,
  /** ISO 8601 timestamp when the download URL expires. */
  expires: string,
}

/**
 * A single event row from a segment export. Required fields are always included
 * by the {@link SegmentExportSdk.create} method; all other fields are optional
 * depending on the export configuration.
 */
export type SegmentExportEvent = {
  // the following types are always added by the `create` function
  UserId: string,
  SessionId: string,
  PageId: string,
  EventType: keyof typeof EventTypes,
  EventSubType: keyof typeof EventSubTypes,
  EventStart: string,
} & Partial<{
  // ExportFields
  IndvId: number,
  // UserId: number, // union type adds this as required
  // SessionId: number, // union type adds this as required
  // PageId: number, // union type adds this as required
  UserCreated: string,
  UserAppKey: string,
  UserDisplayName: string,
  UserEmail: string,
  SessionStart: string,
  // EventFields
  // EventStart: string, // union type adds this as required
  // EventType: keyof typeof EventTypes, // union type adds this as required
  // EventSubType: keyof typeof EventSubTypes, // union type adds this as required
  EventCustomName: string,
  EventTargetText: string,
  EventTargetSelector: string,
  EventDuration: number,
  EventSecondaryDuration: number,
  EventPageOffset: number,
  EventSessionOffset: number,
  EventModFrustrated: number,
  EventModDead: number,
  EventModError: number,
  EventModSuspicious: number,
  EventCumulativeLayoutShift: number,
  EventFirstInputDelay: number,
  EventVarErrorKind: string,
  EventVarFields: string,
  EventMobileSourceFile: string,
  EventWebSourceFileUrl: string,
  // PageFields
  PageName: string,
  PageStart: string,
  PageDuration: number,
  PageActiveDuration: number,
  PageUrl: string,
  PageRefererUrl: string,
  PageIp: string,
  PageLatLong: string,
  PageUserAgent: string,
  PageBrowser: string,
  PageBrowserVersion: string,
  PageDevice: string,
  PagePlatform: string,
  PageOperatingSystem: string,
  PageScreenWidth: number,
  PageScreenHeight: number,
  PageViewportWidth: number,
  PageViewportHeight: number,
  PageNumEvents: number,
  PageNumDerivedEvents: number,
  PageNumInfos: number,
  PageNumWarnings: number,
  PageNumErrors: number,
  PageClusterId: number,
  PageMaxScrollDepthPercent: number,
  // LoadFields
  LoadDomContentTime: number,
  LoadEventTime: number,
  LoadFirstPaintTime: number,
  LoadLargestPaintTime: number,
  // RequestFields
  ReqUrl: string,
  ReqMethod: string,
  ReqStatus: number,
  // MobileFields
  AppName: string,
  AppPackageName: string,
  AppDeviceModel: string,
  AppDeviceVendor: string,
  AppVersion: string,
  AppOsVersion: string,
  AppViewName: string,
  // IndividualFields
  Created: string,
  Uid: number,
  DisplayName: string,
  Email: string,
  NumSessions: number,
  NumPages: number,
  NumEvents: number,
  TotalSec: number,
  ActiveSec: number,
  AvgSessionSec: number,
  AvgSessionActiveSec: number,
  MaxSessionSec: number,
  LastSessionNumPages: number,
  LastSessionNumEvents: number,
  LastSessionSec: number,
  LastSessionActiveSec: number,
  LastSessionStart: string,
  LastPage: string,
  LastIp: string,
  LastLatLong: string,
  LastEventStart: string,
  LastBrowser: string,
  LastDevice: string,
  LastPlatform: string,
  LastOperatingSystem: string,
}>;

export type SegmentExportField = keyof SegmentExportEvent;

/**
 * A group of export events belonging to the same session, produced by {@link SegmentExportSdk.aggregate}.
 */
export interface SegmentExportSession {
  /** The compound session identifier in `UserId:SessionId` format. */
  sessionId: string,
  /** Fullstory replay URL for this session. */
  sessionUrl: string,
  /** The events belonging to this session. */
  events: SegmentExportEvent[],
  /** ISO 8601 timestamp of the first event in this session. */
  start: string;
  /** ISO 8601 timestamp of the last event in this session. */
  end: string;
}

export default class SegmentExportSdk extends Client {

  /**
   * Groups a flat list of export events into sessions, keyed by `UserId:SessionId`.
   * @param events The flat array of events returned by `parse()`.
   * @returns An array of `SegmentExportSession` objects, each containing its events and a replay URL.
   */
  aggregate(events: SegmentExportEvent[]): SegmentExportSession[] {
    const sessions: { [key: string]: SegmentExportSession } = {};

    for (const event of events) {
      const { SessionId, UserId } = event;
      const sessionId = `${UserId}:${SessionId}`;

      if (sessions[sessionId]) {
        sessions[sessionId].events.push(event);
        sessions[sessionId].end = event.EventStart;
      } else {
        sessions[sessionId] = {
          events: [event],
          sessionId,
          sessionUrl: `https://app${this.orgId.endsWith('eu1') ? '.eu1' : ''}.fullstory.com/ui/${this.orgId}/session/${sessionId}`,
          start: event.EventStart,
          end: event.EventStart,
        }
      }
    }

    return Object.values(sessions);
  }

  /**
   * Counts the number of lines (events) in an NDJSON export file without loading them all into memory.
   * @param file Path to an `.ndjson` file.
   * @returns The number of lines in the file.
   */
  async count(file: string) {
    if (!file.endsWith('.ndjson')) {
      throw Error(`Expected NDJSON file and received "${file}".`)
    }

    let count = 0;
    const readStream = createReadStream(file);
    const lineReader = readline.createInterface({ input: readStream, crlfDelay: Infinity });

    // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
    for await (const line of lineReader) {
      count += 1;
    }

    return count;
  }

  /**
   * Creates a segment export operation. Defaults to NDJSON format with a 7-day time range.
   * Core identification fields (`UserId`, `SessionId`, `PageId`, `EventType`, `EventStart`, `EventSubType`)
   * are always included in the export.
   * See [Create Segment Export](https://developer.fullstory.com/server/segment-export/create-segment-export/).
   * @param segmentId The segment to export.
   * @param options Export configuration including format, type, time range, fields, and scope.
   * @returns A `CreateExportResponse` containing the `operationId` to poll for status.
   */
  async create(segmentId: string, options: Omit<CreateExportOptions, 'segmentId'>) {
    // NOTE some fields are necessary for common operations; include them by default for convenience
    const defaultFields: SegmentExportField[] = ['UserId', 'SessionId', 'PageId', 'EventType', 'EventStart', 'EventSubType'];

    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const time = { start: sevenDaysAgo.toISOString(), end: now.toISOString() };

    const {
      type = ExportType.Event,
      format = ExportFormat.NDJSON,
      timeRange = time,
      segmentTimeRange = time,
      timezone,
      eventDetails = { scope: ExportScope.Event },
    } = options;

    let {
      fields = defaultFields,
    } = options;

    // NOTE don't duplicate addition of fields as this will throw an error
    for (const field of defaultFields) {
      if (!fields.includes(field)) {
        fields = [field, ...fields];
      }
    }

    return this.POST<CreateExportOptions, CreateExportResponse>('/segments/v1/exports', { segmentId, type, format, timeRange, segmentTimeRange, timezone, fields, eventDetails });
  }

  /**
   * Downloads a completed segment export archive from the given URL and saves it to disk.
   * Use `results()` to obtain the download `location` after an export operation completes.
   * @param location The download URL from the export results.
   * @param dirname The local directory to save the `.gz` file into.
   * @returns The full path to the downloaded `.gz` file.
   */
  async download(location: string, dirname: string) {
    const response = await fetch(location);

    if (response.ok) {
      // use the name provided in the Content-Disposition header based on the name of the segment and the date export was created
      const disposition = response.headers.get('Content-Disposition');

      const zipFilename = disposition ? disposition.slice(disposition.indexOf('"') + 1, disposition.lastIndexOf('"')) : 'segment.unknown.gz';

      await ensureDir(dirname);
      await ensureFile(`${dirname}/${zipFilename}`);

      // write the zip file
      const downloadStream = createWriteStream(`${dirname}/${zipFilename}`);
      response.body?.pipe(downloadStream);

      const streamFinished = promisify(finished);
      await streamFinished(downloadStream);

      return `${dirname}/${zipFilename}`;
    } else {
      throw Error(`Failed to read ${location} (${response.statusText}).`);
    }
  }

  /**
   * Lists all export operations.
   * @returns A `ListResponse` containing the current export operations and a pagination token.
   */
  async list(): Promise<ListResponse> {
    return this.GET('/operations/v1?type=SEARCH_EXPORT');
  }

  /**
   * Returns the status of a segment export operation.
   * @param operationId The ID of the export operation returned by `create()`.
   * @returns The `Operation` with its current state and results (if completed).
   */
  async operation(operationId: string): Promise<Operation> {
    return this.GET<Operation>(`/operations/v1/${operationId}`);
  }

  /**
   * Parses a JSON or NDJSON export file into an array of typed events.
   * For NDJSON files, events are streamed line-by-line; an optional callback is invoked per event.
   * For JSON files, the entire file is read and parsed at once.
   * @param file Path to the `.json` or `.ndjson` export file.
   * @param callback Optional per-event callback (NDJSON only).
   * @returns An array of `SegmentExportEvent` objects.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async parse(file: string, callback = (event: SegmentExportEvent) => { }) {
    if (!file.endsWith('json')) {
      throw Error(`Segment Export must be of type JSON or NDJSON to parse.`);
    }

    if (file.endsWith('.ndjson')) {
      const readStream = createReadStream(file!);
      const lineReader = readline.createInterface({ input: readStream, crlfDelay: Infinity });

      const events: SegmentExportEvent[] = [];

      for await (const line of lineReader) {
        try {
          const json = JSON.parse(line);
          const event: Partial<SegmentExportEvent> = {};

          for (const field of Object.keys(json)) {
            if (json[field] !== undefined) {
              event[field as keyof SegmentExportEvent] = (field === 'UserId' || field === 'SessionId' || field === 'PageId') ? `${json[field]}` : json[field];
            }
          }

          callback(event as SegmentExportEvent);
          events.push(event as SegmentExportEvent);
        } catch (err) {
          // skip unparsable lines
        }
      }

      return events;
    } else {
      const { readFileSync } = await import('fs');
      const contents = readFileSync(file, 'utf-8');
      return JSON.parse(contents) as SegmentExportEvent[];
    }
  }

  /**
   * Returns the download URL for a completed segment export.
   * @param exportId The export ID from the completed operation's `results.searchExportId`.
   * @returns An `ExportResult` containing the download `location` and its expiry.
   */
  async results(exportId: string) {
    return this.GET<ExportResult>(`/search/v1/exports/${exportId}/results`);
  }

  /**
   * Decompresses a `.gz` segment export archive. Use after `download()` and before `parse()`.
   * @param file Path to the `.gz` file.
   * @param removeZip Whether to delete the `.gz` file after extraction (default: `true`).
   * @returns The path to the uncompressed file.
   */
  async unzip(file: string, removeZip = true) {
    if (!file.endsWith('.gz')) {
      throw Error(`File "${file}" does not appear to be a Segment Export file (*.gz).`);
    }

    if (!existsSync(file)) {
      throw Error(`Segment Export "${file}" does not exist.`);
    }

    const unzipFile = file.slice(0, file.lastIndexOf('.'));

    const unzipInStream = createReadStream(file);
    const unzipOutStream = createWriteStream(unzipFile);
    const unzip = zlib.createGunzip();
    unzipInStream.pipe(unzip).pipe(unzipOutStream);

    const streamFinished = promisify(finished);
    await streamFinished(unzipOutStream);

    if (removeZip) {
      await remove(file);
    }

    return unzipFile;
  }
}

export const EventTypes = {
  abandon: 'A form was abandoned.',
  backgrounded: '[mobile] The app is backgrounded on the user\'s mobile device.',
  change: 'The text in a text entry field was changed. The EventTargetText field will contain the new text value.',
  click: 'An element on the page has been clicked. The EventTargetText field will contain text of the clicked element, if applicable.',
  click_error: 'A click event rate limit was reached.',
  console_message: 'A console message was logged. The EventTargetText field will contain the text of the log. The EventSubType field will contain the level of the log message. Currently, the EventSubType field will always be "error" for console message events.',
  copy: '[web] Text on a page was copied. The EventTargetText field will contain the copied text.',
  crashed: '[android] This event is only available on Fullstory for Mobile Apps, Android. It is automatically triggered when Android apps experience a crash.',
  cumulative_layout_shift: '[web] A layout shift occurred on the page. The EventCumulativeLayoutShift field will contain the cumulative layout shift score.',
  custom: 'A custom event, created by a call to FS.event. Custom event fields in Data Export are a "flattened-out" representation of the JSON object passed into FS.event with an "evt" prefixed to the root JSON field names.',
  custom_error: 'An custom event error was encountered. The EventVarErrorKind field will contain the encountered error, which may be due to rate limiting, cardinality limits, or a malformed payload on the custom event.',
  exception: '[android] An uncaught exception occurred. The EventTargetText field will contain the text of the uncaught exception. On Web, the EventWebSourceFileURL field will contain the source of the exception. On mobile, the EventMobileSourceFile field will contain the source of the exception.',
  first_input_delay: '[web] First input delay was captured on a page. The EventFirstInputDelay field will contain the duration, in milliseconds, of the first input delay.',
  highlight: 'User highlighted text on the page. The EventTargetText field will contain the highlighted text.',
  keyboard_open: '[android] User opened the keyboard on their mobile device.',
  keyboard_close: '[android] User closed the keyboard on their mobile device.',
  load: '[web] A page was loaded from the server. The LoadDomContentTime, LoadEventTime, LoadFirstPaintTime, and LoadLargestPaintTime fields contain page load metrics.',
  low_memory: '[android] This event is only available on Fullstory for Mobile Apps, Android. It is automatically triggered when less than 10% of the memory allocated to the Android app is free. When this event is triggered, Fullstory automatically stops the current recording session.',
  navigate: 'A URL change, either to a completely new page or a new hash fragment. Changes to the window.history object (in a single page app) will also emit navigate events.',
  pageview: 'Indicates the end of the page that is currently being viewed. Triggered whenever the URL path changes, or optionally the hash fragment, but not query string variables.',
  paste: '[web] Text was pasted on the page. The EventTargetText field will contain the text of the pasted event.',
  pinch_gesture: 'Indicates a "pinch-to-zoom" event on a touch-enabled device.',
  request: 'An XHR request was initiated from the browser.',
  seen: 'A watched element was visible in the browser.',
  seen_error: 'A watched element rate limit was reached.',
  thrash: 'The user moved the mouse cursor erratically or in circles.',
}

export const EventSubTypes = {
  navigate: 'Present only for events with EventType "navigate". Indicates that the page was accessed by a link, bookmark, form submission, script, or by typing the URL in the address bar.',
  reload: 'Present only for events with EventType "navigate". Indicates that the page was loaded by clicking the Reload button or via the Location.reload() method.',
  back_forward: 'Present only for events with EventType "navigate". Indicates that the page was accessed by navigating into the history.',
  pinch_scale_in: 'Present only for events with EventType "pinch_gesture". Indicates "zoom in" behavior.',
  pinch_scale_out: 'Present only for events with EventType "pinch_gesture". Indicates "zoom out" behavior.',
  error: 'Present only for events with EventType "console_message". Indicates that the event is an error logged to the console.',
  rendered: 'Present only for events with EventType "seen". Indicates that the watched element was rendered in the DOM, but never visible in the viewport.',
  visible: 'Present only for events with EventType "seen". Indicates that the watched element was visible in the viewport (at least 25%).',
  uncaught: 'Present only for events with EventType "exception". Indicates that the exception was uncaught.',
}

export const ExportFields = {
  IndvId: 'A unique identifier for the Individual that combines all Users with the same User App Key. For example, if you’ve identified user 123 whenever they visit your site, their Individual will include all of their Sessions across devices, browsers, etc The IndvId value is not visible within the Fullstory UI, but it is part of the session URL.',
  UserId: 'A unique identifier for a user cookie on a given device/browser. This ID may be reset if the User clears their cookies, switches devices, changes browsers, etc This field is not visible within the Fullstory UI—see UserAppKey below for more information.',
  SessionId: 'The identifier for a particular session, within the context of a single user. Use SessionId and UserId together as a compound key to uniquely identify sessions across all export data.Note: To use this value in the rest of our APIs, you will need to concatenate it with UserId: UserId:SessionId.',
  PageId: 'The identifier for a particular page load/refresh, within the context of a single session. Use PageId, SessionId, and UserId together as a compound key to uniquely identify pages across all export data.',
  UserCreated: 'UTC RFC 3339 timestamp for when the cookie associated with UserId was first seen.',
  UserAppKey: 'The user identifier that was passed to Fullstory from your system using FS.identify. This field is visible in the Fullstory UI as "User ID" when looking at a user\'s profile.',
  UserDisplayName: 'The display name that was set via FS.identify or FS.setUserVars.',
  UserEmail: 'The email address that was set via FS.identify or FS.setUserVars.',
  SessionStart: 'The absolute time when the session was started, in UTC, represented as a dateTime from the XML Schema Specification (2018-01-04T20:07:11.191Z).',
}

export const EventFields = {
  EventStart: 'The absolute time when the event occurred, in UTC, represented as a dateTime from the XML Schema Specification (2018-01-04T20:07:11.191Z).',
  EventType: 'The type of event that was recorded.',
  EventSubType: 'If present, a refinement of the EventType field.',
  EventCustomName: 'The name of the event, if it is a Analytics Event. The EventType field will have "custom" as it\'s value as well for instrumented events.',
  EventTargetText: 'Where applicable, this contains the text of the event target and its child elements. For example, if the user clicked a button that says “Pay now”, the event target text would be “Pay now”. Long text may be truncated in some cases for performance reasons.',
  EventTargetSelector: 'Where applicable, this contains the CSS selector for the event target. This will be a fully qualified descendant selector, starting from the HTML element, and including all CSS selectors of elements that appear in the DOM when walking from the HTML element through its children to the event target.',
  EventDuration: 'If present, indicates that the event has some duration associated with it. When the EventType is seen, this value is the duration in milliseconds that the watched element was rendered.',
  EventSecondaryDuration: 'If present, indicates that the event has a secondary duration associated with it. When the EventType is seen, this value is the duration in milliseconds that the watched element was visible.',
  EventPageOffset: 'The time in milliseconds since the page was loaded.',
  EventSessionOffset: 'The time in milliseconds since the session was started.',
  EventModFrustrated: 'Your customer clicked one or more elements on the page many times in rapid succession, potentially because they were frustrated. For each of the click events in this series of clicks, the numeric value of this field is a running total of the number of clicks that have occurred. It will be zero for click events that were not part of a series of rage clicks.',
  EventModDead: 'Your customer clicked something, but nothing happened. Will be 1 for dead clicks, zero for non-dead clicks.',
  EventModError: 'Your customer clicked something and an error was generated, either by an uncaught exception occurring, or by logging an error to the console. The value indicates the type of error generated. Possible values: 0 the event did not generate an error 1 the event generated an error, 2 the event generated a console error, 3 the event generated an uncaught exception. Prior to 06-21-2021, this field did not distinguish between different types of errors.',
  EventModSuspicious: 'Your customer entered text or navigated to a URL that was suspicious. When set to zero, nothing was suspicious. When 1, it indicates a possible SQL injection attack. When 2, it indicates a possible cross site scripting attack.',
  EventCumulativeLayoutShift: 'The cumulative layout shift score, only present when EventType is cumulative_layout_shift.',
  EventFirstInputDelay: 'The duration, in milliseconds, of a first input delay measurement on a page. Only present when EventType is first_input_delay.',
  EventVarErrorKind: 'Error kind token indicating error (if an error is present) for this event. Typically will only be provided if EventType ends with _error.',
  EventVarFields: 'Fields relevant to the error (if an error is present). Typically used to indicate custom properties that triggered an error.',
  EventWebSourceFileUrl: 'If the EventType is exception, then this is the javascript source file associated with the error.',
  EventMobileSourceFile: '[android] If the EventType is exception, then this is the mobile source file associated with the error.',
}

export const PageFields = {
  PageName: 'The name of the page, as set by FS(\'setProperties\').',
  PageStart: 'The absolute time when the page was, in UTC, represented as a dateTime from the XML Schema Specification, (2018-01-04T20:07:11.191Z). Note: All of the Page- fields correspond to a unique "instance" of a page. A single page instance is represented by a unique combination of UserId, SessionId and PageId.',
  PageDuration: 'The total time this User spent on this page during this session (milliseconds). This is not a running total; every event for a given page will show the same total duration.',
  PageActiveDuration: 'The active time (mouse movement, text entry, clicks, etc) this User spent on this page during this session (milliseconds). This is not a running total; every event for a given page will show the same total duration.',
  PageUrl: 'The full URL of the page on which the given event occurred.',
  PageRefererUrl: 'The page from which the user reached this page. The referrer may be empty if the user manually entered the page URL, or if the referrer has been scrubbed, etc',
  PageIp: 'The IP address corresponding to a session. IP addresses are used by Fullstory to infer a user\'s general location. IP address recording can be disabled if desired. More information on disabling IP address recording here.',
  PageLatLong: 'The latitude/longitude corresponding to this session. These values are derived using IP geolocation, which is only capable of pinpointing a user\'s general area, often just at the city level, not their exact location.',
  PageUserAgent: 'The full user agent string for the system on which this session was recorded.',
  PageBrowser: 'The browser that was used for this session, as derived from the User Agent. New values may be added to this list at a later date.',
  PageBrowserVersion: 'The browser version that was used for this session, as derived from the User Agent.',
  PageDevice: 'The device type that was used for this session, as derived from the User Agent. New values may be added to this list at a later date.',
  PagePlatform: 'The platform that was used for this session.',
  PageOperatingSystem: 'The operating system type that was used for this session, as derived from the User Agent. New values may be added to this list at a later date.',
  PageScreenWidth: 'The width of the CSS Resolution of the screen in pixels.',
  PageScreenHeight: 'The height of the CSS Resolution of the screen in pixels.',
  PageViewportWidth: 'The width of the viewport size of the browser in pixels.',
  PageViewportHeight: 'The height of the viewport size of the browser in pixels.',
  PageNumEvents: 'The total number of events that occurred on the page. Note: When the PagePlatform is Web, the PageNum- fields indicate the number of events that occurred between when the HTML page was first rendered until the user navigated away or closed the tab. When the PagePlatformis Native Mobile, the PageNum- fields indicate the number of events that occurred between when an app was opened or foregrounded andbackgrounded or closed.',
  PageNumDerivedEvents: 'The total number of Fullstory-derived events that occurred on the page. This includes FS API validation events such as rate-limiting and invalid arguments.',
  PageNumInfos: 'The number of times the JavaScript function console.log() was called, plus the number of times console.info() was called on the page. This is a running total for the page, and will steadily increase until the user navigates to a new page.',
  PageNumWarnings: 'The number of times console.warn() was called on the page. This is a running total for the page, and will steadily increase until the user navigates to a new page.',
  PageNumErrors: 'The number of times console.error() was called, plus the number of JavaScript errors that occurred on the page. This is a running total for the page, and will steadily increase until the user navigates to a new page.',
  PageClusterId: 'An internal identifier used by Fullstory to group pages together for Page Insight analysis.',
  PageMaxScrollDepthPercent: 'A percentage representing the max depth that the user scrolled down the page. Present only for EventType navigate.',
}

export const LoadFields = {
  LoadDomContentTime: 'The time (in milliseconds) that DOMContentLoaded fires, when the initial HTML document has been loaded and parsed. Often this milestone occurs before stylesheets, images, and sub-frames finish loading, so the DOMContentLoaded event occurs before a page is done painting. Present only for EventType load.',
  LoadEventTime: 'The time (in milliseconds) that the onload event or "Page Load" fires, when the whole page and all of its dependent resources have finished loading. Page Load often occurs later, after the point in time when the page is rendered and interactive for a user. Present only for EventType load.',
  LoadFirstPaintTime: 'The First Contentful Paint time (in milliseconds) for the page load. First Contentful Paint is the moment when the first "above-the-fold" layout change has happened and when web fonts have loaded. Present only for EventType load.',
  LoadLargestPaintTime: 'The Largest Contentful Paint time (in milliseconds) for the page load. Largest Contentful Paint is the time that it takes for the largest "above-the-fold" element to be rendered on a page. Present only for EventType load.',
}

export const RequestFields = {
  ReqUrl: 'If the EventType is request, the URL for the corresponding XHR request.',
  ReqMethod: 'If the EventType is request, the HTTP request method for the corresponding XHR request.',
  ReqStatus: 'If the EventType is request, the HTTP response status code for the corresponding XHR request.',
}

export const MobileFields = {
  AppName: 'The display name for the mobile application. Target display name for iOS, and application label for Android.',
  AppPackageName: 'The bundle ID that uniquely identifies an application. Typically starts with com.<company_name>.<app>.',
  AppDeviceModel: 'The model of the mobile device.',
  AppDeviceVendor: 'The Vendor of the mobile device.',
  AppVersion: 'The version of the mobile application.',
  AppOsVersion: 'The OS version of the mobile device.',
  AppViewName: 'The name of the application\'s view. By default: For iOS: the name of the UIViewController class for the screen is used, customize it using set screen name for iOS. For Android: The name of the Activity is used.'
}

export const IndividualFields = {
  IndvId: 'A unique identifier for the Individual that combines all Users with the same User App Key. For example, if you’ve identified user 123 whenever they visit your site, their Individual will include all of their Sessions across devices, browsers, etc The IndvId value is not visible within the Fullstory UI, but it is part of the session URL.',
  Created: 'The time that this user had their first session recorded by Fullstory.',
  Uid: 'The user identifier that was passed to Fullstory from your system using FS.identify. This field is visible in the Fullstory UI as "User ID" when looking at a user\'s profile.',
  DisplayName: 'The display name that was set via FS.identify() or FS.setUserVars().',
  Email: 'The email address that was set via FS.identify() or FS.setUserVars().',
  NumSessions: 'The total number of sessions that have been recorded for this user.',
  NumPages: 'The total number of pages that have been visited by this user.',
  NumEvents: 'The total number of events associated with this user.',
  TotalSec: 'The total length of time in seconds of the user\'s recorded sessions.',
  ActiveSec: 'The total active time in seconds for the user\'s recorded sessions.',
  AvgSessionSec: 'The average length of time of the user\'s sessions.',
  AvgSessionActiveSec: 'The average active time of the user\'s sessions.',
  MaxSessionSec: 'The longest session time for the user.',
  LastSessionNumPages: 'The number of pages visited in the user\'s last session.',
  LastSessionNumEvents: 'The number of events in the user\'s last session.',
  LastSessionSec: 'The time in seconds of the user\'s last session.',
  LastSessionActiveSec: 'The active time in seconds of the user\'s last session.',
  LastSessionStart: 'When the most recent session for this user started.',
  LastPage: 'The last page that the user visited.',
  LastIp: 'The IP address for the user\'s most recent session.',
  LastLatLong: 'The latitude and longitude for the user\'s most recent session.',
  LastEventStart: 'The time for the last event in the user\'s most recent session.',
  LastBrowser: 'The browser for the user\'s most recent session.',
  LastDevice: 'The device for the user\'s most recent session.',
  LastPlatform: 'The platform for the user\'s most recent session.',
  LastOperatingSystem: 'The OS for the user\'s most recent session.',
  UserVars: '',
}