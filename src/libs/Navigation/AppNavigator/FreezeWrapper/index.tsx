import {useNavigation, useRoute} from '@react-navigation/native';
import React, {useEffect, useLayoutEffect, useState} from 'react';
import {Freeze} from 'react-freeze';
import type ChildrenProps from '@src/types/utils/ChildrenProps';
import getIsScreenBlurred from './getIsScreenBlurred';

type FreezeWrapperProps = ChildrenProps & {
    /** When true, freeze when rendered as a tab in the background (not the active tab). Use for split navigators inside Tab.Navigator. */
    freezeWhenInTabBackground?: boolean;
};

function FreezeWrapper({children, freezeWhenInTabBackground = true}: FreezeWrapperProps) {
    const navigation = useNavigation();
    const currentRoute = useRoute();

    const [isScreenBlurred, setIsScreenBlurred] = useState(false);
    const [freezed, setFreezed] = useState(false);

    useEffect(() => {
        const unsubscribe = navigation.addListener('state', (e) => setIsScreenBlurred(getIsScreenBlurred(e.data.state, currentRoute.key, {freezeWhenInTabBackground})));
        return () => unsubscribe();
    }, [currentRoute.key, freezeWhenInTabBackground, navigation]);

    // Decouple the Suspense render task so it won't be interrupted by React's concurrent mode
    // and stuck in an infinite loop.
    // Unfreezing happens immediately so the screen has content during the transition back in.
    // Freezing is deferred to the next frame so pending pointer events (e.g. onPressOut) can flush
    // first — otherwise a row that was pressed gets frozen mid-press and reappears stuck in its
    // pressed/hovered visual state when the screen is later unfrozen.
    useLayoutEffect(() => {
        if (!isScreenBlurred) {
            setFreezed(false);
            return;
        }
        const handle = requestAnimationFrame(() => setFreezed(true));
        return () => cancelAnimationFrame(handle);
    }, [isScreenBlurred]);

    return <Freeze freeze={freezed}>{children}</Freeze>;
}

export default FreezeWrapper;
