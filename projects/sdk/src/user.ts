import Client from './client.js';
import { Job } from './job.js';

type UserProperty = boolean | number | string | (boolean | number | string)[];

export interface CreateUser {
  /** The application-specific ID you've given to the user (max 256 characters). */
  uid?: string,
  /** The nice-looking name for this user (max 256 characters). */
  displayName?: string,
  /** The email address associated with this user (max 128 characters). */
  email?: string,
  /** Properties that provide additional information about your user (max 500 properties). */
  properties?: {
    [key: string]: UserProperty | { [key: string]: UserProperty },
  },
  schema?: {
    /** Optional schema declaration, to define the structure of the data and override Fullstory's default type inference. */
    properties: {
      [key: string]: 'bool' | 'bools' | 'date' | 'dates' | 'int' | 'ints' | 'real' | 'reals' | 'str' | 'strs',
    },
  }
}

/**
 * Full user details returned by get and list endpoints.
 */
export interface GetUserResponse {
  /** The Fullstory assigned user ID. */
  id: string,
  /** The application-specific ID you've given to the user. */
  uid?: string,
  /** The nice-looking name for this user. */
  display_name?: string,
  /** The email address associated with this user. */
  email?: string,
  /** Indicates whether or not this user is in the process of being removed. */
  is_being_deleted: boolean,
  /** Properties that provide additional information about your user. */
  properties?: Record<string, unknown>,
  /** A mapping from fields to their types, whether inferred automatically or declared in the request. */
  schema?: { properties?: Record<string, string> },
  /** A link to the Fullstory app segments page, focused on this user. */
  app_url?: string,
}

/**
 * Filter and pagination options for listing users.
 */
export interface ListUsersOptions {
  /** The application-specific ID you've given to a user. */
  uid?: string,
  /** The email address associated with a user. */
  email?: string,
  /** The nice-looking name for a user. */
  display_name?: string,
  /** Whether or not a user is anonymous or identified. */
  is_identified?: boolean,
  /** Pagination token for fetching subsequent pages. */
  page_token?: string,
  /** Whether to include schemas in the response. */
  include_schema?: boolean,
}

/**
 * Paginated response from the List Users endpoint.
 */
export interface ListUsersResponse {
  /** The list of users that match the input filter criteria. */
  results: GetUserResponse[],
  /** The total number of users that matched the filter criteria. */
  total_records: string,
  /** Token to fetch the next page of users. */
  next_page_token?: string,
  /** A link to an anonymous segment in the Fullstory app containing these users. */
  app_url?: string,
}

/**
 * Request body for updating an existing user.
 */
export interface UpdateUser {
  /** The application-specific ID you've given to the user (max 256 characters). */
  uid?: string,
  /** The nice-looking name for this user (max 256 characters). */
  display_name?: string,
  /** The email address associated with this user (max 128 characters). */
  email?: string,
  /** Properties that provide additional information about your user (max 500 properties). */
  properties?: Record<string, unknown>,
  schema?: {
    /** Optional schema declaration, to define the structure of the data and override Fullstory's default type inference. */
    properties: {
      [key: string]: 'bool' | 'bools' | 'date' | 'dates' | 'int' | 'ints' | 'real' | 'reals' | 'str' | 'strs',
    },
  }
}

/**
 * A single failed user from a batch import.
 */
export interface BatchUserImportError {
  /** Description of the failure encountered while importing the user. */
  message: string,
  /** Error code. */
  code: string,
  /** Corresponding user import request that resulted in failure. */
  user: CreateUser,
}

/**
 * Paginated response for batch user import errors.
 */
export interface BatchUserImportErrorsResponse {
  /** Page of user import failures for the batch import. */
  results: BatchUserImportError[],
  /** The total number of failures for the specified user import. */
  total_records: string,
  /** Token to fetch the next page of import failures. */
  next_page_token?: string,
}

/**
 * A single successfully imported user from a batch import.
 */
export interface BatchUserImportResult {
  /** The Fullstory assigned user ID. */
  id: string,
  /** The application-specific ID you've given to the user. */
  uid?: string,
  /** The nice-looking name for this user. */
  display_name?: string,
  /** The email address associated with this user. */
  email?: string,
  /** Properties that provide additional information about your user. */
  properties?: Record<string, unknown>,
}

/**
 * Paginated response for successfully imported batch users.
 */
export interface BatchUserImportsResponse {
  /** Page of user import responses for the batch import. */
  results: BatchUserImportResult[],
  /** Total number of records in this batch import. */
  total_records: string,
  /** Token to fetch the next page of import results. */
  next_page_token?: string,
}

/**
 * SDK for the Fullstory Users API.
 *
 * Provides methods to create, get, update, delete, and list users,
 * as well as batch import operations.
 */
export default class UserSdk extends Client {

  /**
   * Creates or updates a user in Fullstory. If a user with the given `uid` already exists,
   * the user properties will be updated (upsert behavior).
   * See [Create User](https://developer.fullstory.com/server/users/create-user/).
   * @param user The user object containing uid, displayName, email, and/or properties.
   * @returns An object containing the Fullstory-assigned `id` on success.
   */
  async create(user: CreateUser): Promise<{ id: string }> {
    return this.POST<CreateUser, { id: string }>('/v2/users', user);
  }

  /**
   * Returns the details of a single user by Fullstory-assigned ID.
   * See [Get User](https://developer.fullstory.com/server/users/get-user/).
   * @param id The Fullstory-assigned user ID.
   * @param includeSchema Whether to include the user's property schema in the response.
   * @returns The full `GetUserResponse` on success.
   */
  async get(id: string, includeSchema?: boolean): Promise<GetUserResponse> {
    const query = includeSchema ? '?include_schema=true' : '';
    return this.GET<GetUserResponse>(`/v2/users/${id}${query}`);
  }

  /**
   * Updates an existing user by Fullstory-assigned ID.
   * See [Update User](https://developer.fullstory.com/server/users/update-user/).
   * @param id The Fullstory-assigned user ID.
   * @param user The user fields to update.
   * @returns An object containing the Fullstory-assigned `id` on success.
   */
  async update(id: string, user: UpdateUser): Promise<{ id: string }> {
    return this.POST<UpdateUser, { id: string }>(`/v2/users/${id}`, user);
  }

  /**
   * Deletes a user by Fullstory-assigned ID.
   * See [Delete User](https://developer.fullstory.com/server/users/delete-user/).
   * @param id The Fullstory-assigned user ID.
   * @returns An empty object on success.
   */
  async delete(id: string): Promise<Record<string, never>> {
    return this.DELETE<Record<string, never>>(`/v2/users/${id}`);
  }

  /**
   * Lists users, optionally filtered by uid, email, display_name, or identification status.
   * See [List Users](https://developer.fullstory.com/server/users/list-users/).
   * @param options Optional filter and pagination parameters.
   * @returns A paginated `ListUsersResponse`.
   */
  async list(options: ListUsersOptions = {}): Promise<ListUsersResponse> {
    const params: Record<string, string> = {};
    if (options.uid) params.uid = options.uid;
    if (options.email) params.email = options.email;
    if (options.display_name) params.display_name = options.display_name;
    if (options.is_identified !== undefined) params.is_identified = String(options.is_identified);
    if (options.page_token) params.page_token = options.page_token;
    if (options.include_schema !== undefined) params.include_schema = String(options.include_schema);

    const query = Object.keys(params).length
      ? '?' + Object.entries(params).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&')
      : '';

    return this.GET<ListUsersResponse>(`/v2/users${query}`);
  }

  /**
   * Creates a batch user import job.
   * See [Create Users Batch Import](https://developer.fullstory.com/server/users/create-batch-users-import-job/).
   * @param users The list of users to import (max 50,000).
   * @returns A `Job` on success.
   */
  async import(users: CreateUser[]): Promise<{ job: Omit<Job, 'finished'> }> {
    if (users.length > 50000) {
      throw Error('Maximum count of imported users is 50,000. Reduce batch size.');
    }

    return this.POST<{ requests: CreateUser[] }, { job: Job }>('/v2/users/batch', { requests: users });
  }

  /**
   * Returns the status of a batch user import job.
   * See [Get Users Batch Import Job](https://developer.fullstory.com/server/users/get-batch-users-import-job/).
   * @param jobId The ID of the batch import job.
   * @returns A `Job` on success.
   */
  async job(jobId: string): Promise<Job> {
    return this.GET<Job>(`/v2/users/batch/${jobId}`);
  }

  /**
   * Returns the error message and code for any users that failed from a batch import job.
   * See [Get Batch Users Import Errors](https://developer.fullstory.com/server/users/get-batch-users-import-errors/).
   * @param jobId The ID of the batch import job.
   * @param pageToken Optional pagination token for fetching subsequent pages.
   * @returns A paginated list of `BatchUserImportError` results.
   */
  async errors(jobId: string, pageToken?: string): Promise<BatchUserImportErrorsResponse> {
    const query = pageToken ? `?page_token=${encodeURIComponent(pageToken)}` : '';
    return this.GET<BatchUserImportErrorsResponse>(`/v2/users/batch/${jobId}/errors${query}`);
  }

  /**
   * Returns the successfully imported users from a batch import job.
   * See [Get Batch Users Imports](https://developer.fullstory.com/server/users/get-batch-users-imports/).
   * @param jobId The ID of the batch import job.
   * @param pageToken Optional pagination token for fetching subsequent pages.
   * @returns A paginated list of `BatchUserImportResult` results.
   */
  async imports(jobId: string, pageToken?: string): Promise<BatchUserImportsResponse> {
    const query = pageToken ? `?page_token=${encodeURIComponent(pageToken)}` : '';
    return this.GET<BatchUserImportsResponse>(`/v2/users/batch/${jobId}/imports${query}`);
  }
}
