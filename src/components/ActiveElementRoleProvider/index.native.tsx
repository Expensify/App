import React from 'react';
import type {ActiveElementRoleContextValue, ActiveElementRoleProps} from './types';

const EMPTY: ActiveElementRoleContextValue = {role: null, isRoleSuppressed: false};

const ActiveElementRoleContext = React.createContext<ActiveElementRoleContextValue>(EMPTY);

function ActiveElementRoleProvider({children}: ActiveElementRoleProps) {
    return <ActiveElementRoleContext.Provider value={EMPTY}>{children}</ActiveElementRoleContext.Provider>;
}

export default ActiveElementRoleProvider;
export {ActiveElementRoleContext};
