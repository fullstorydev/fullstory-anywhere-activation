import Client from './client.js';

/**
 * Request body for creating an annotation.
 * See [Create Annotation](https://developer.fullstory.com/server/annotations/create-annotation/).
 */
export interface CreateAnnotation {
  /** The annotation's text (max 200 characters). */
  text: string,
  /** The annotation's start time in ISO 8601 format. Defaults to the current Fullstory server time. */
  start_time?: string,
  /** The annotation's end time in ISO 8601 format. Defaults to `start_time`. Must be after `start_time` if provided. */
  end_time?: string,
  /** A string representing the source or creator of this annotation, displayed on the annotation's visualization (max 40 characters). */
  source?: string,
}

/**
 * Server response for a created annotation.
 */
export interface Annotation {
  /** The annotation's text. */
  text: string,
  /** The annotation's start time in ISO 8601 format. */
  start_time: string,
  /** The annotation's end time in ISO 8601 format. */
  end_time: string,
  /** The annotation's provided source field. */
  source: string,
}

/**
 * SDK for the Fullstory Annotations API.
 *
 * Provides a method to create annotations that appear on Fullstory visualizations.
 */
export default class AnnotationSdk extends Client {

  /**
   * Creates an annotation with the specified details.
   * See [Create Annotation](https://developer.fullstory.com/server/annotations/create-annotation/).
   * @param text The annotation's text (max 200 characters).
   * @param options Optional start_time, end_time, and source fields.
   * @returns The created `Annotation` on success.
   */
  async create(text: string, options: Omit<CreateAnnotation, 'text'> = {}): Promise<Annotation> {
    if (text.length > 200) {
      throw Error('Annotation text must be 200 characters or fewer.');
    }
    if (options.source && options.source.length > 40) {
      throw Error('Annotation source must be 40 characters or fewer.');
    }

    return this.POST<CreateAnnotation, Annotation>('/v2/annotations', {
      text,
      ...options,
    });
  }
}
