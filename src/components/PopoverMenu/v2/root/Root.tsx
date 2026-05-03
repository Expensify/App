import React, {useState} from 'react';
import type {ReactNode} from 'react';
import {RootActionsContext, RootStateContext} from './RootContext';
import type {ActiveAnchor, RootActionsValue, RootStateValue} from './RootContext';

type RootProps = {
    children: ReactNode;
};

function Root({children}: RootProps): React.ReactElement {
    const [isVisible, setIsVisible] = useState(false);
    const [activeAnchor, setActiveAnchor] = useState<ActiveAnchor | null>(null);

    const stateValue: RootStateValue = {
        state: {isVisible},
        meta: {activeAnchor},
    };
    const actions: RootActionsValue = {setIsVisible, setActiveAnchor};

    return (
        <RootStateContext.Provider value={stateValue}>
            <RootActionsContext.Provider value={actions}>{children}</RootActionsContext.Provider>
        </RootStateContext.Provider>
    );
}

Root.displayName = 'PopoverMenu.Root';

export default Root;
export type {RootProps};
