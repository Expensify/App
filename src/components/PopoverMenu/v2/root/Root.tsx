import {useFocusEffect} from '@react-navigation/native';
import React, {useState} from 'react';
import type {ReactNode} from 'react';
import useControllableState from '@hooks/useControllableState';
import useOnyx from '@hooks/useOnyx';
import ONYXKEYS from '@src/ONYXKEYS';
import {RootActionsContext, RootStateContext} from './RootContext';
import type {ActiveAnchor, AnchorRef, RootActions, RootState} from './RootContext';

type RootProps = {
    children: ReactNode;
    /** Escape hatch for callers that open without a `<Trigger>` (e.g. KYC flow, Onyx-derived state). */
    anchorRef?: AnchorRef;
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
};

/** Supports both controlled (`open`/`onOpenChange`) and uncontrolled (`defaultOpen`) modes — Radix `DropdownMenu.Root` pattern. */
function Root({children, anchorRef, open, defaultOpen = false, onOpenChange}: RootProps): React.ReactElement {
    const [isVisible, setIsVisible] = useControllableState({value: open, defaultValue: defaultOpen, onChange: onOpenChange});
    const [activeAnchor, setActiveAnchor] = useState<ActiveAnchor | null>(null);

    // Close when a non-popover alert modal is about to cover us. Render-phase auto-correction
    // (https://react.dev/learn/you-might-not-need-an-effect) — no set-state-in-effect.
    const [modal] = useOnyx(ONYXKEYS.MODAL);
    if (isVisible && modal?.willAlertModalBecomeVisible && !modal?.isPopover) {
        setIsVisible(false);
    }

    // Close on screen blur — popover state is screen-scoped.
    useFocusEffect(() => () => setIsVisible(false));

    const stateValue: RootState = {
        state: {isVisible},
        meta: {anchorRef: anchorRef ?? null, activeAnchor},
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
