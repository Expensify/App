// Probe for config/oxlint/onyxConnectBypass.mjs. Four Onyx.connect() call sites, one per case the
// bypass rule has to tell apart. Driven by oxlint-migration/checkOnyxBypassPort.mjs; not a test
// fixture in the oxlint-rule-fixtures sense, and both linters ignore oxlint-migration/**.
declare const Onyx: {connect: (config: unknown) => number; connectWithoutView: (config: unknown) => number};

// Case 1: no comment. The ban reports it; the bypass rule must stay silent.
const plain = Onyx.connect({key: 'account'});

// Case 2: a comment naming the ban. oxlint silences the ban here, so the bypass rule must report it.
// eslint-disable-next-line rulesdir/no-onyx-connect
const disabledNextLine = Onyx.connect({key: 'session'});

/* eslint-disable rulesdir/no-onyx-connect */
// Case 3: inside a block disable naming the ban. Same expectation as case 2.
const disabledByBlock = Onyx.connect({key: 'policy'});
/* eslint-enable rulesdir/no-onyx-connect */

// Case 4: a comment naming a different rule. The ban reports it; the bypass rule must stay silent.
// eslint-disable-next-line rulesdir/no-default-id-values
const unrelatedDisable = Onyx.connect({key: 'report'});

export {plain, disabledNextLine, disabledByBlock, unrelatedDisable};
