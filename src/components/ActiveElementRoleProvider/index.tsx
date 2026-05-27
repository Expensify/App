import React, {useEffect, useState} from 'react';
import {PROGRAMMATIC_FOCUS_DATA_ATTRIBUTE} from '@libs/programmaticFocus';
import type {ActiveElementRoleContextValue, ActiveElementRoleProps} from './types';

const EMPTY: ActiveElementRoleContextValue = {role: null, isProgrammatic: false};

const ActiveElementRoleContext = React.createContext<ActiveElementRoleContextValue>(EMPTY);

function getActiveElementInfo(el: Element | null): ActiveElementRoleContextValue {
    if (!el) {
        return EMPTY;
    }
    return {
        role: el.role ?? null,
        isProgrammatic: el.getAttribute(PROGRAMMATIC_FOCUS_DATA_ATTRIBUTE) === 'true',
    };
}

function ActiveElementRoleProvider({children}: ActiveElementRoleProps) {
    const [info, setInfo] = useState<ActiveElementRoleContextValue>(() => getActiveElementInfo(document?.activeElement ?? null));

    const handleFocusIn = () => {
        setInfo(getActiveElementInfo(document?.activeElement ?? null));
    };

    const handleFocusOut = () => {
        setInfo(EMPTY);
    };

    useEffect(() => {
        document.addEventListener('focusin', handleFocusIn);
        document.addEventListener('focusout', handleFocusOut);

        return () => {
            document.removeEventListener('focusin', handleFocusIn);
            document.removeEventListener('focusout', handleFocusOut);
        };
    }, []);

    return <ActiveElementRoleContext.Provider value={info}>{children}</ActiveElementRoleContext.Provider>;
}

export default ActiveElementRoleProvider;
export {ActiveElementRoleContext, getActiveElementInfo};
