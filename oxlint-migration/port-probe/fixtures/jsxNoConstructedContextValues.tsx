import React from 'react';

const Ctx = React.createContext<{count: number} | undefined>(undefined);

// react/jsx-no-constructed-context-values: object literal recreated on every render
function Provider({children}: {children: React.ReactNode}) {
    // 'use no memo' is load-bearing: the production rule runs behind the React Compiler gate
    // (config/oxlint/reactCompilerGate.mjs), which drops every finding in a file both compilers
    // memoize -- and they do memoize this one. Opting out keeps this fixture answering the
    // question it exists for, "does the rule run at all". The gate itself is covered by
    // oxlint-migration/checkReactCompilerGate.py, which needs both a memoized and an opted-out file.
    'use no memo';
    return <Ctx.Provider value={{count: 1}}>{children}</Ctx.Provider>;
}

export default Provider;
