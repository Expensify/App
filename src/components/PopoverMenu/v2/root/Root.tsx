import {useNavigation} from '@react-navigation/native';
import React, {useEffect, useState} from 'react';
import type {ReactNode} from 'react';
import {RootActionsContext, RootStateContext} from './RootContext';
import type {ActiveAnchor, RootActions, RootState} from './RootContext';
import useCloseOnModalCover from './useCloseOnModalCover';

type RootProps = {
    children: ReactNode;
    /** Initial visibility — production callers open via `usePopoverTrigger()`. */
    defaultOpen?: boolean;
};

/** Uncontrolled — observe via `useIsPopoverVisible()`. */
function Root({children, defaultOpen = false}: RootProps): React.ReactElement {
    const [isVisible, setIsVisible] = useState(defaultOpen);
    const [activeAnchor, setActiveAnchor] = useState<ActiveAnchor | null>(null);

    useCloseOnModalCover(isVisible, setIsVisible);

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
