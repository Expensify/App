/*
 * Headless no-op replacement for @libs/Log (see rnStubPlugin). Bundled App and Onyx code still
 * call Log during CLI startup; intentional production logging for this binary lives in
 * server/libs/log.ts (via each tool's `new Log({...})` instance) instead.
 */
const Log = {
    info: () => {},
    alert: () => {},
    warn: () => {},
    hmmm: () => {},
};

export default Log;
