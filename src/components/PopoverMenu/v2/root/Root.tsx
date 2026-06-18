import type {ReactNode} from 'react';

import React, {useId, useState} from 'react';

import type {ActiveAnchor, RootActions, RootMeta, RootVisibility} from './RootContext';

import {RootActionsContext, RootMetaContext, RootVisibilityContext} from './RootContext';

type RootProps = {
    children: ReactNode;
    defaultOpen?: boolean;
};

/** Uncontrolled — observe via `useIsPopoverVisible()`. */
function Root({children, defaultOpen = false}: RootProps): React.ReactElement {
    const [isVisible, setIsVisible] = useState(defaultOpen);
    const [activeAnchor, setActiveAnchor] = useState<ActiveAnchor | null>(null);
    const triggerID = useId();
    const contentID = useId();

    const visibility: RootVisibility = {isVisible};
    const meta: RootMeta = {activeAnchor, triggerID, contentID};
    const actions: RootActions = {setIsVisible, setActiveAnchor};

    return (
        <RootVisibilityContext.Provider value={visibility}>
            <RootMetaContext.Provider value={meta}>
                <RootActionsContext.Provider value={actions}>{children}</RootActionsContext.Provider>
            </RootMetaContext.Provider>
        </RootVisibilityContext.Provider>
    );
}

Root.displayName = 'PopoverMenu.Root';

export default Root;
export type {RootProps};
