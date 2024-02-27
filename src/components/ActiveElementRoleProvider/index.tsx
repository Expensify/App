import React, {useEffect, useState} from 'react';
import type {ActiveElementRoleContextValue, ActiveElementRoleProps, AriaRole} from './types';

const ActiveElementRoleContext = React.createContext<ActiveElementRoleContextValue>({
    role: null,
});

function ActiveElementRoleProvider({children}: ActiveElementRoleProps) {
    const [activeRoleRef, setRole] = useState<AriaRole | null>((document?.activeElement?.role as AriaRole) ?? null);

    const handleFocusIn = () => {
        setRole((document?.activeElement?.role as AriaRole) ?? null);
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
export {ActiveElementRoleContext};
