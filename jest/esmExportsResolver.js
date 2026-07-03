/**
 * Jest's default resolver only matches "require"/"default" conditions in a package's "exports" map, since it
 * loads everything through its own CJS-emulating module system. Several of our GitHub Actions dependencies
 * (`@actions/*`, `@octokit/*`) are ESM-only and declare nothing but an "import" condition, so without this
 * they fail to resolve at all. Accepting "import" too (scoped to just these packages, so we don't change
 * resolution for dual CJS/ESM packages like @babel/runtime) lets Jest find them; transformIgnorePatterns in
 * jest.config.js then lets babel-jest transpile their ESM syntax to CommonJS on the fly, same as it already
 * does for react-native/expo packages.
 */
const ESM_ONLY_PACKAGE_PREFIXES = ['@actions/', '@octokit/'];

module.exports = (path, options) => {
    if (!ESM_ONLY_PACKAGE_PREFIXES.some((prefix) => path.startsWith(prefix))) {
        return options.defaultResolver(path, options);
    }

    return options.defaultResolver(path, {
        ...options,
        conditions: [...(options.conditions ?? []), 'import'],
    });
};
