import React, {useState} from 'react';
import type {ReactNode} from 'react';
import {RootActionsContext, RootStateContext} from './RootContext';
import type {ActiveAnchor, RootActions, RootState} from './RootContext';

type RootProps = {
    children: ReactNode;
};

/** Provider that owns popover open state and the currently-active `<Trigger>` anchor. */
function Root({children}: RootProps): React.ReactElement {
    const [isVisible, setIsVisible] = useState(false);
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
