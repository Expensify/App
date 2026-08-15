import type {InternalOctokit} from '@github/libs/GithubUtils';

/**
 * Replaces each of octokit's REST scopes (`issues`, `pulls`, `actions`, ...) with a plain object holding the same
 * endpoint methods, so that tests can mock individual endpoints.
 *
 * `@octokit/plugin-rest-endpoint-methods` implements every scope as a `Proxy` that builds each endpoint method on
 * first access. `jest.spyOn` has no effect through a `Proxy` under `bun:test` - the spy is installed, but reading
 * the property still yields the real method, so a mocked test would silently call the real GitHub API. Spreading a
 * scope materializes all of its endpoint methods into an ordinary object, which `jest.spyOn` and
 * `jest.restoreAllMocks` then handle normally.
 *
 * Call this immediately after initializing octokit, before spying on any endpoint.
 */
function materializeOctokitScopes(rest: InternalOctokit['rest']): void {
    for (const scope of Object.keys(rest)) {
        Reflect.set(rest, scope, {...Reflect.get(rest, scope)});
    }
}

export default materializeOctokitScopes;
