export const AppDomainEu1 = 'app.eu1.fullstory.com';
export const AppDomainNa1 = 'app.fullstory.com';

export const ApiDomainEu1 = 'api.eu1.fullstory.com';
export const ApiDomainNa1 = 'api.fullstory.com';

/**
 * Resolves the appropriate Fullstory API domain based on the provided organization ID or API key.
 * The region is determined by parsing the input for known patterns (e.g. "eu1" for EU region).
 * If no recognizable region is found, defaults to the US domain.
 *
 * @param orgIdOrApiKey - The organization ID or API key to parse for region information.
 * @param api - Whether to resolve the API domain (true) or app domain (false). Defaults to true.
 * @returns The resolved Fullstory domain for API requests or app access.
 */
export function resolveDomain(orgIdOrApiKey: string, api = true): string {
  const apiKeyPrefix = /^([\da-z]+)\./;
  const orgIdSuffix = /-([\da-z]+)$/;

  const region = apiKeyPrefix.exec(orgIdOrApiKey)?.[1] || orgIdSuffix.exec(orgIdOrApiKey)?.[1];

  if (api) {
    return region === 'eu1' ? ApiDomainEu1 : ApiDomainNa1;
  } else {
    return region === 'eu1' ? AppDomainEu1 : AppDomainNa1;
  }
}