import {useIsFocused, useNavigation, useRoute} from '@react-navigation/native';
import React, {useEffect, useRef} from 'react';
import {Freeze} from 'react-freeze';
import type ChildrenProps from '@src/types/utils/ChildrenProps';
import shouldSetScreenBlurred from './shouldSetScreenBlurred';

type FreezeWrapperProps = ChildrenProps & {
    /** Prop to disable freeze */
    keepVisible?: boolean;
};

function FreezeWrapper({keepVisible = false, children}: FreezeWrapperProps) {
    // we need to know the screen index to determine if the screen can be frozen
    const screenIndexRef = useRef<number | null>(null);
    const isFocused = useIsFocused();
    const navigation = useNavigation();
    const currentRoute = useRoute();
    const isBlurred = shouldSetScreenBlurred((navigation.getState()?.index ?? 0) - (screenIndexRef.current ?? 0));
    useEffect(() => {
        const index = navigation.getState()?.routes.findIndex((route) => route.key === currentRoute.key) ?? 0;
        screenIndexRef.current = index;
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, []);

    return <Freeze freeze={!isFocused && isBlurred && !keepVisible}>{children}</Freeze>;
}

FreezeWrapper.displayName = 'FreezeWrapper';

export default FreezeWrapper;
