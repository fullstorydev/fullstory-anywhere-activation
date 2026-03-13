/**
 * Represents an asynchronous job returned by batch import endpoints.
 * Poll the job status endpoint until `status` is `COMPLETED` or `FAILED`.
 * See [Asynchronous Workflows](https://developer.fullstory.com/server/asynchronous-workflows/).
 */
export interface Job {
  /**
   * ID of the job.
   */
  id: string,
  /**
   * One of these 3 statuses:
   * - `PROCESSING` - work is in progress
   * - `FAILED` - work has completed, with errors (possible partial success)
   * - `COMPLETED` - work is done, no errors
   */
  status: 'PROCESSING' | 'FAILED' | 'COMPLETED',
  /**
   * Time the job was started, in ISO-8601 UTC format.
   */
  created: string,
  /**
   * Time the job was completed, in ISO-8601 UTC format. This field will have a value if the job status is `FAILED` or `COMPLETED`, otherwise it is `null`.
   */
  finished?: string,
}