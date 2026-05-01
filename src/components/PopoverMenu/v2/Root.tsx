import React, {useState} from 'react';
import type {ReactNode} from 'react';
import useControllableState from '@hooks/useControllableState';
import {RootActionsContext, RootStateContext} from './RootContext';
import type {AnchorRef, RootActionsValue, RootStateValue} from './RootContext';

type RootProps = {
    children: ReactNode;
    anchorRef: AnchorRef;
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
};

function Root({children, anchorRef, open, defaultOpen = false, onOpenChange}: RootProps): React.ReactElement {
    const [isVisible, setIsVisible] = useControllableState({value: open, defaultValue: defaultOpen, onChange: onOpenChange});
    const [actions] = useState<RootActionsValue>(() => ({setIsVisible}));

    const stateValue = {
        state: {isVisible},
        meta: {anchorRef},
    } satisfies RootStateValue;

    return (
        <RootStateContext.Provider value={stateValue}>
            <RootActionsContext.Provider value={actions}>{children}</RootActionsContext.Provider>
        </RootStateContext.Provider>
    );
}

Root.displayName = 'PopoverMenu.Root';

export default Root;
export type {RootProps};
