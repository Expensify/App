import useOnyx from '@hooks/useOnyx';

import ONYXKEYS from '@src/ONYXKEYS';
import type ChildrenProps from '@src/types/utils/ChildrenProps';

import {useNavigationState, useRoute} from '@react-navigation/native';
import React, {useCallback, useLayoutEffect, useState} from 'react';
import {Freeze} from 'react-freeze';

import getIsScreenBlurred from './getIsScreenBlurred';

type FreezeWrapperProps = ChildrenProps & {
    /** When true, freeze when rendered as a tab in the background (not the active tab). Use for split navigators inside Tab.Navigator. */
    freezeWhenInTabBackground?: boolean;
};

function FreezeWrapper({children, freezeWhenInTabBackground = true}: FreezeWrapperProps) {
    const currentRoute = useRoute();
    const [isAnyModalOpen] = useOnyx(ONYXKEYS.MODAL, {
        selector: (modal) => !!modal?.isVisible || !!modal?.willAlertModalBecomeVisible,
    });

    const isScreenBlurred = useNavigationState(
        useCallback((state) => getIsScreenBlurred(state, currentRoute.key, {freezeWhenInTabBackground}), [currentRoute.key, freezeWhenInTabBackground]),
    );
    const [freezed, setFreezed] = useState(false);

    // Decouple the Suspense render task so it won't be interrupted by React's concurrent mode
    // and stuck in an infinite loop
    useLayoutEffect(() => {
        if (!isScreenBlurred) {
            setFreezed(false);
            return;
        }
        if (isAnyModalOpen) {
            return;
        }
        setFreezed(true);
    }, [isAnyModalOpen, isScreenBlurred]);

    return <Freeze freeze={freezed}>{children}</Freeze>;
}

export default FreezeWrapper;
