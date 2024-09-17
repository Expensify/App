import {useIsFocused, useNavigation, useRoute} from '@react-navigation/native';
import React, {useEffect, useLayoutEffect, useRef, useState} from 'react';
import {Freeze} from 'react-freeze';
import shouldSetScreenBlurred from '@libs/Navigation/shouldSetScreenBlurred';
import type ChildrenProps from '@src/types/utils/ChildrenProps';

type FreezeWrapperProps = ChildrenProps & {
    /** Prop to disable freeze */
    keepVisible?: boolean;
};

function FreezeWrapper({keepVisible = false, children}: FreezeWrapperProps) {
    const [isScreenBlurred, setIsScreenBlurred] = useState(false);
    const [freezed, setFreezed] = useState(false);
    // we need to know the screen index to determine if the screen can be frozen
    const screenIndexRef = useRef<number | null>(null);
    const isFocused = useIsFocused();
    const navigation = useNavigation();
    const currentRoute = useRoute();

    useEffect(() => {
        const index = navigation.getState()?.routes.findIndex((route) => route.key === currentRoute.key) ?? 0;
        screenIndexRef.current = index;
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        const unsubscribe = navigation.addListener('state', () => {
            const navigationIndex = (navigation.getState()?.index ?? 0) - (screenIndexRef.current ?? 0);
            setIsScreenBlurred(shouldSetScreenBlurred(navigationIndex));
        });
        return () => unsubscribe();
    }, [isFocused, isScreenBlurred, navigation]);

    // Decouple the Suspense render task so it won't be interuptted by React's concurrent mode
    // and stuck in an infinite loop
    useLayoutEffect(() => {
        setFreezed(!isFocused && isScreenBlurred && !keepVisible);
    }, [isFocused, isScreenBlurred, keepVisible]);

    return <Freeze freeze={freezed}>{children}</Freeze>;
}

FreezeWrapper.displayName = 'FreezeWrapper';

export default FreezeWrapper;
