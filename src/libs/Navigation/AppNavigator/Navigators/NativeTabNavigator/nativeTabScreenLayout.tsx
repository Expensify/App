import {bottomTabScreenLayoutWrapper} from '@libs/Navigation/PlatformStackNavigation/ScreenLayout';

import type ChildrenProps from '@src/types/utils/ChildrenProps';

import {useIsFocused} from '@react-navigation/native';
import React, {useLayoutEffect, useState} from 'react';
import {Freeze} from 'react-freeze';

/**
 * Native tabs have no `freezeOnBlur`, so a tab in the background would keep re-rendering on every Onyx update.
 * A blurred tab freezes one frame after it loses focus, so a tab mounted in the background still renders once.
 */
function NativeTabScreenFreeze({children}: ChildrenProps) {
    const isFocused = useIsFocused();
    const [isFrozen, setIsFrozen] = useState(false);

    // Decouple the Suspense render task so it won't be interrupted by React's concurrent mode and stuck in an infinite loop
    useLayoutEffect(() => {
        if (isFocused) {
            // isFocused is the only dependency and does not change as a result of this setState.
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setIsFrozen(false);
            return;
        }
        const frameID = requestAnimationFrame(() => setIsFrozen(true));
        return () => cancelAnimationFrame(frameID);
    }, [isFocused]);

    return <Freeze freeze={isFrozen && !isFocused}>{children}</Freeze>;
}

function nativeTabScreenLayout({children, ...rest}: Parameters<typeof bottomTabScreenLayoutWrapper>[0]) {
    return bottomTabScreenLayoutWrapper({...rest, children: <NativeTabScreenFreeze>{children}</NativeTabScreenFreeze>});
}

export default nativeTabScreenLayout;
