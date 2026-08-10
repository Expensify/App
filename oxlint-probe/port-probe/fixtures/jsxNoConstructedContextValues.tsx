import React from 'react';

const Ctx = React.createContext<{count: number} | undefined>(undefined);

// react/jsx-no-constructed-context-values: object literal recreated on every render
function Provider({children}: {children: React.ReactNode}) {
    return <Ctx.Provider value={{count: 1}}>{children}</Ctx.Provider>;
}

export default Provider;
