/**
 * Returns a plain-object copy of an Octokit REST namespace (e.g. `octokit.rest.issues`) so its endpoint methods
 * can be replaced by `jest.spyOn`.
 *
 * `@octokit/plugin-rest-endpoint-methods` exposes each namespace as a Proxy that creates endpoint methods on
 * first access. Bun's `jest.spyOn` silently fails to install on a Proxy-backed property — it returns a mock, but
 * the property keeps its original value — so the spy never intercepts and the real HTTP request goes out.
 * Assigning the copy back over the namespace first gives `spyOn` an ordinary own property to replace.
 */
function materializeOctokitNamespace<T extends Record<string, unknown>>(namespace: T): T {
    return {...namespace};
}

export default materializeOctokitNamespace;
