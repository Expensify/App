import React, {useEffect, useState} from 'react';
import {PROGRAMMATIC_FOCUS_DATA_ATTRIBUTE} from '@libs/programmaticFocus';
import type {ActiveElementRoleContextValue, ActiveElementRoleProps} from './types';

const ActiveElementRoleContext = React.createContext<ActiveElementRoleContextValue>({
    role: null,
});

/*
 * Suppress the role on a11y-restored elements so role-based consumers
 * (`Button` enter-shortcut suppression) don't react to a programmatic focus.
 */
function getRoleForActive(el: Element | null): string | null {
    if (el?.getAttribute(PROGRAMMATIC_FOCUS_DATA_ATTRIBUTE) === 'true') {
        return null;
    }
    return el?.role ?? null;
}

function ActiveElementRoleProvider({children}: ActiveElementRoleProps) {
    const [activeRoleRef, setRole] = useState<string | null>(() => getRoleForActive(document?.activeElement ?? null));

    const handleFocusIn = () => {
        setRole(getRoleForActive(document?.activeElement ?? null));
    };

    const handleFocusOut = () => {
        setRole(null);
    };

    useEffect(() => {
        document.addEventListener('focusin', handleFocusIn);
        document.addEventListener('focusout', handleFocusOut);

        return () => {
            document.removeEventListener('focusin', handleFocusIn);
            document.removeEventListener('focusout', handleFocusOut);
        };
    }, []);

    const value = React.useMemo(
        () => ({
            role: activeRoleRef,
        }),
        [activeRoleRef],
    );

    return <ActiveElementRoleContext.Provider value={value}>{children}</ActiveElementRoleContext.Provider>;
}

export default ActiveElementRoleProvider;
export {ActiveElementRoleContext, getRoleForActive};
