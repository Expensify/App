import React from 'react';
import type {ActiveElementRoleContextValue, ActiveElementRoleProps} from './types';

const ActiveElementRoleContext = React.createContext<ActiveElementRoleContextValue>({
    role: null,
});

function ActiveElementRoleProvider({children}: ActiveElementRoleProps) {
    const value = React.useMemo(
        () => ({
            role: null,
        }),
        [],
    );

    return <ActiveElementRoleContext.Provider value={value}>{children}</ActiveElementRoleContext.Provider>;
}

export default ActiveElementRoleProvider;
export {ActiveElementRoleContext};
