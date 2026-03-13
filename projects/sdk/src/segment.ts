import Client, { QueryParams } from './client.js';

/**
 * A Fullstory segment returned by the List Segments endpoint.
 */
export interface Segment {
  /** ISO 8601 timestamp when the segment was created. */
  created: string,
  /** Email address of the user who created this segment. */
  creator: string,
  /** The unique segment identifier. */
  id: string,
  /** The display name of the segment. */
  name: string,
  /** URL to view the segment in the Fullstory app. */
  url: string,
}

export interface SegmentOptions {
  /**
   * If set, filters the returned segments by the provided creator. This should be an email associated with a FullStory account.
   */
  creator?: string,
  /**
   * Optionally limit the number of segments returned. Defaults to 20. The max limit for a single page is 100.
   */
  limit?: number,
  /**
   * Optional pagination token for retrieving more results. List params should not change between consecutive paginated requests (limit is an exception). 
   */
  paginationToken?: string,
}

/**
 * SDK for the Fullstory Segments API (v1).
 *
 * Provides a method to list segments with automatic pagination.
 */
export default class SegmentSdk extends Client {

  /**
   * Lists segments.
   * This function will automatically retrieve all pages and set the page limit to the maximum size (100).
   * @param options `SegmentOptions` to limit or filter segments.
   * @returns `Segment` list.
   */
  async list(options: SegmentOptions = { limit: 100 }): Promise<Segment[]> {
    let segments: Segment[] = [];
    let paginationToken = undefined;

    do {
      if (paginationToken) {
        options.paginationToken = paginationToken;
      }

      const response = await this.GET<{ segments: Segment[], nextPaginationToken: string }>(`/segments/v1?${this.toQuery(options as QueryParams)}`);

      segments = segments.concat(response.segments);
      paginationToken = response.nextPaginationToken;
    } while (paginationToken);

    return segments;
  }
}