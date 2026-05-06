import React, {useState} from 'react';
import type {ReactNode} from 'react';
import {RootActionsContext, RootStateContext} from './RootContext';
import type {ActiveAnchor, RootActions, RootState} from './RootContext';

type RootProps = {
    children: ReactNode;
    /** Initial visibility — production callers open via `usePopoverTrigger()`. */
    defaultOpen?: boolean;
};

/** Uncontrolled — observe via `useIsPopoverVisible()`. */
function Root({children, defaultOpen = false}: RootProps): React.ReactElement {
    const [isVisible, setIsVisible] = useState(defaultOpen);
    const [activeAnchor, setActiveAnchor] = useState<ActiveAnchor | null>(null);

    const stateValue: RootState = {
        state: {isVisible},
        meta: {activeAnchor},
    };
    const actions: RootActions = {setIsVisible, setActiveAnchor};

    return (
        <RootStateContext.Provider value={stateValue}>
            <RootActionsContext.Provider value={actions}>{children}</RootActionsContext.Provider>
        </RootStateContext.Provider>
    );
}

Root.displayName = 'PopoverMenu.Root';

export default Root;
export type {RootProps};
