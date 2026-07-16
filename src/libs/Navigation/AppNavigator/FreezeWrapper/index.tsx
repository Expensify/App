import useOnyx from '@hooks/useOnyx';

import isSideModalNavigator from '@libs/Navigation/helpers/isSideModalNavigator';

import ONYXKEYS from '@src/ONYXKEYS';
import type ChildrenProps from '@src/types/utils/ChildrenProps';

import {useNavigation, useRoute} from '@react-navigation/native';
import React, {useEffect, useLayoutEffect, useState} from 'react';
import {Freeze} from 'react-freeze';

import getIsScreenBlurred from './getIsScreenBlurred';

type FreezeWrapperProps = ChildrenProps & {
    /** When true, freeze when rendered as a tab in the background (not the active tab). Use for split navigators inside Tab.Navigator. */
    freezeWhenInTabBackground?: boolean;
};

function FreezeWrapper({children, freezeWhenInTabBackground = true}: FreezeWrapperProps) {
    const navigation = useNavigation();
    const currentRoute = useRoute();
    const [isAnyModalOpen] = useOnyx(ONYXKEYS.MODAL, {
        selector: (modal) => !!modal?.isVisible || !!modal?.willAlertModalBecomeVisible,
    });

    const [isScreenBlurred, setIsScreenBlurred] = useState(false);
    // Whether the route currently blurring us is a full-screen side modal (RHP). Derived synchronously from the same
    // navigation state that drives isScreenBlurred, so a report kept alive under an RHP isn't frozen while it's still
    // hydrating (which wedges React 19 concurrent rendering on WebKit). The Onyx MODAL flag below lags the actual
    // navigation, so it can't close that window on its own.
    const [isBlurredByModal, setIsBlurredByModal] = useState(false);
    const [freezed, setFreezed] = useState(false);

    useEffect(() => {
        const unsubscribe = navigation.addListener('state', (e) => {
            const state = e.data.state;
            setIsScreenBlurred(getIsScreenBlurred(state, currentRoute.key, {freezeWhenInTabBackground}));
            const focusedRoute = state.routes.at(typeof state.index === 'number' ? state.index : -1);
            setIsBlurredByModal(isSideModalNavigator(focusedRoute?.name));
        });
        return () => unsubscribe();
    }, [currentRoute.key, freezeWhenInTabBackground, navigation]);

    // Decouple the Suspense render task so it won't be interrupted by React's concurrent mode
    // and stuck in an infinite loop. Also hold off while a modal or full-screen RHP is open over us: freezing a
    // still-hydrating report under a full-screen RHP wedges concurrent rendering on WebKit.
    useLayoutEffect(() => {
        if (isScreenBlurred && (isAnyModalOpen || isBlurredByModal)) {
            return;
        }
        setFreezed(isScreenBlurred);
    }, [isAnyModalOpen, isBlurredByModal, isScreenBlurred]);

    return <Freeze freeze={freezed}>{children}</Freeze>;
}

export default FreezeWrapper;
