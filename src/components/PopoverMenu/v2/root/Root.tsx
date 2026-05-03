import React, {useState} from 'react';
import type {ReactNode} from 'react';
import {RootActionsContext, RootStateContext} from './RootContext';
import type {ActiveAnchor, RootActionsValue, RootStateValue} from './RootContext';

type RootProps = {
    children: ReactNode;
};

/**
 * Owns popover open state and tracks which descendant `<Trigger>` is the
 * current anchor. State is intentionally uncontrolled — there is no `open` /
 * `onOpenChange` escape hatch. Each `<Trigger>` measures itself on press and
 * publishes the resulting `{ref, rect}` as the active anchor, so a single
 * `<Root>` may host multiple triggers (the popover appears next to whichever
 * was pressed last). Callers that need to open programmatically without a
 * `<Trigger>` (e.g. KYC flow, video long-press) stay on v1 PopoverMenu.
 */
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
