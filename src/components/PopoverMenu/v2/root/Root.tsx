import {useNavigation} from '@react-navigation/native';
import React, {useEffect, useState} from 'react';
import type {ReactNode} from 'react';
import useOnyx from '@hooks/useOnyx';
import ONYXKEYS from '@src/ONYXKEYS';
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

    // Close when a non-popover alert modal is about to cover us. Render-phase auto-correction
    // (https://react.dev/learn/you-might-not-need-an-effect) — no set-state-in-effect.
    // Stable even if useOnyx returns fresh object refs: setState bails when isVisible is already false.
    const [modal] = useOnyx(ONYXKEYS.MODAL);
    if (isVisible && modal?.willAlertModalBecomeVisible && !modal?.isPopover) {
        setIsVisible(false);
    }

    // Subscribe to `blur` rather than `useFocusEffect` cleanup (per react-navigation docs).
    const navigation = useNavigation();
    useEffect(() => navigation.addListener('blur', () => setIsVisible(false)), [navigation]);

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
