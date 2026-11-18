// Importing the real package root calls TurboModuleRegistry.getEnforcing('RNEntrustIDV'), which throws in Jest
// because the native module doesn't exist. The step and type subpaths are plain JS, so they aren't mocked.
class EntrustIdv {
    start = jest.fn();
}

const resolveLocalFont = jest.fn();

export {EntrustIdv, resolveLocalFont};
