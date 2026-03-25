import { resolveDomain } from './utils.js';
import debug from 'debug';

/** A key-value map of query string parameters accepted by {@link FullstoryClient.toQuery}. */
export type QueryParams = { [key: string]: boolean | number | string };

interface ServerError {
  /** A short snake-cased value that is safe to handle programmatically. */
  code: string;
  /** Long form description of what went wrong. */
  message: string;
}

/**
 * Base HTTP client for the Fullstory REST API.
 *
 * Handles authentication, URL construction, and error handling for all API requests.
 * Sub-module SDKs extend this class to inherit HTTP capabilities.
 */
export default class FullstoryClient {
  private readonly domain: string;

  /**
   * @param apiKey Fullstory API key used for authentication (sent as a Basic auth header).
   * @param orgId Fullstory organization identifier.
   * @param domain Optional API hostname override for data-residency or internal use (defaults to `api.fullstory.com`).
   * @param integrationSource Optional identifier for the integration source (defaults to an empty string).
   */
  constructor(private readonly apiKey: string, readonly orgId: string, domain?: string, private readonly integrationSource = '') {
    // all API requests use the api.fullstory.com domain (except internal use orgs)
    // https://developer.fullstory.com/server/getting-started/#data-residency
    this.domain = domain || resolveDomain(apiKey);
  }

  private debugResponse(response: Response) {
    debug('fullstory:sdk')(`${response.url} ${response.status} ${response.statusText}`);
  }

  private get headers() {
    return {
      Accept: 'application/json',
      Authorization: `Basic ${this.apiKey}`,
      // replace with your integration's identifier for better observability in Fullstory logs or remove entirely
      'integration-source': this.integrationSource,
    };
  }

  /**
   * Sends an authenticated GET request and returns the parsed JSON response.
   * @param path API path (absolute or relative).
   * @param headers Optional additional headers.
   */
  protected async GET<Response>(path: string, headers?: HeadersInit): Promise<Response> {
    const url = path[0] === '/' ? `https://${this.domain}${path}` : `https://${this.domain}/${path}`;
    const init = {
      headers: {
        ...this.headers,
        ...headers,
      },
      method: 'GET',
    };

    const response = await fetch(url, init);
    this.debugResponse(response);

    if (!response.ok) {
      const json = await response.json();
      const { message } = (json as ServerError);
      throw Error(message || `Request failed with status ${response.status}`);
    }

    return await response.json();
  }

  /**
   * Sends an authenticated POST request with a JSON body and returns the parsed JSON response.
   * @param path API path (absolute or relative).
   * @param body Request payload, serialized as JSON.
   * @param headers Optional additional headers.
   */
  protected async POST<Request, Response>(path: string, body: Request, headers?: HeadersInit): Promise<Response> {
    const url = path[0] === '/' ? `https://${this.domain}${path}` : `https://${this.domain}/${path}`;
    const init = {
      headers: {
        ...this.headers,
        'Content-Type': 'application/json',
        ...headers,
      },
      method: 'POST',
      body: JSON.stringify(body),
    };

    const response = await fetch(url, init);
    this.debugResponse(response);

    if (!response.ok) {
      const json = await response.json();
      const { message } = (json as ServerError);
      throw Error(message || `Request failed with status ${response.status}`);
    }

    return await response.json();
  }

  /**
   * Sends an authenticated PUT request with a JSON body and returns the parsed JSON response.
   * @param path API path (absolute or relative).
   * @param body Request payload, serialized as JSON.
   * @param headers Optional additional headers.
   */
  protected async PUT<Request, Response>(path: string, body: Request, headers?: HeadersInit): Promise<Response> {
    const url = path[0] === '/' ? `https://${this.domain}${path}` : `https://${this.domain}/${path}`;
    const init = {
      headers: {
        ...this.headers,
        'Content-Type': 'application/json',
        ...headers,
      },
      method: 'PUT',
      body: JSON.stringify(body),
    };

    const response = await fetch(url, init);
    this.debugResponse(response);

    if (!response.ok) {
      const json = await response.json();
      const { message } = (json as ServerError);
      throw Error(message || `Request failed with status ${response.status}`);
    }

    return await response.json();
  }

  /**
   * Sends an authenticated DELETE request and returns the parsed JSON response.
   * @param path API path (absolute or relative).
   * @param headers Optional additional headers.
   */
  protected async DELETE<Response>(path: string, headers?: HeadersInit): Promise<Response> {
    const url = path[0] === '/' ? `https://${this.domain}${path}` : `https://${this.domain}/${path}`;
    const init = {
      headers: {
        ...this.headers,
        ...headers,
      },
      method: 'DELETE',
    };

    const response = await fetch(url, init);
    this.debugResponse(response);

    if (!response.ok) {
      const json = await response.json();
      const { message } = (json as ServerError);
      throw Error(message || `Request failed with status ${response.status}`);
    }

    return await response.json();
  }

  /**
   * Converts a key-value map into a URL-encoded query string, omitting `undefined` values.
   * @param params Key-value pairs to encode.
   * @returns A `&`-delimited query string.
   */
  protected toQuery(params: QueryParams) {
    return Object.keys(params).filter(param => params[param] !== undefined).map(param => `${param}=${encodeURIComponent(params[param])}`).join('&');
  }
}