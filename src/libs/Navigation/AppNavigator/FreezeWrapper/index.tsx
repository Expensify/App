import useOnyx from '@hooks/useOnyx';

import ONYXKEYS from '@src/ONYXKEYS';
import type ChildrenProps from '@src/types/utils/ChildrenProps';

import {useNavigation, useRoute} from '@react-navigation/native';
import React, {useEffect, useLayoutEffect, useState} from 'react';
import {Freeze} from 'react-freeze';

import getIsScreenBlurred from './getIsScreenBlurred';

type FreezeWrapperProps = ChildrenProps & {
    /** When true, freeze when rendered as a tab in the background (not the active tab). Use for split navigators inside Tab.Navigator. */
    freezeWhenInTabBackground?: boolean;

    /** When true, keep rendering even while blurred, e.g. a tab preloaded at idle whose first content is not on screen yet, so its build finishes before the reveal. */
    shouldStayUnfrozen?: boolean;
};

function FreezeWrapper({children, freezeWhenInTabBackground = true, shouldStayUnfrozen = false}: FreezeWrapperProps) {
    const navigation = useNavigation();
    const currentRoute = useRoute();
    const [isAnyModalOpen] = useOnyx(ONYXKEYS.MODAL, {
        selector: (modal) => !!modal?.isVisible || !!modal?.willAlertModalBecomeVisible,
    });

    const [isScreenBlurred, setIsScreenBlurred] = useState(false);
    const [freezed, setFreezed] = useState(false);

    useEffect(() => {
        const unsubscribe = navigation.addListener('state', (e) => setIsScreenBlurred(getIsScreenBlurred(e.data.state, currentRoute.key, {freezeWhenInTabBackground})));
        return () => unsubscribe();
    }, [currentRoute.key, freezeWhenInTabBackground, navigation]);

    // No navigation event has to follow the moment a screen stops staying unfrozen, e.g. a preloaded tab that finished
    // building while the user stays put, so re-read whether it is in the background right then.
    const [prevShouldStayUnfrozen, setPrevShouldStayUnfrozen] = useState(shouldStayUnfrozen);
    if (prevShouldStayUnfrozen !== shouldStayUnfrozen) {
        setPrevShouldStayUnfrozen(shouldStayUnfrozen);
        const state = navigation.getState();
        if (!shouldStayUnfrozen && state) {
            setIsScreenBlurred(getIsScreenBlurred(state, currentRoute.key, {freezeWhenInTabBackground}));
        }
    }

    // Decouple the Suspense render task so it won't be interrupted by React's concurrent mode
    // and stuck in an infinite loop
    useLayoutEffect(() => {
        if (isScreenBlurred && isAnyModalOpen) {
            return;
        }
        setFreezed(isScreenBlurred && !shouldStayUnfrozen);
    }, [isAnyModalOpen, isScreenBlurred, shouldStayUnfrozen]);

    return <Freeze freeze={freezed}>{children}</Freeze>;
}

export default FreezeWrapper;
