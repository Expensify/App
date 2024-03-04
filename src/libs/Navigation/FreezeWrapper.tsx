import {useIsFocused, useNavigation, useRoute} from '@react-navigation/native';
import React, {useEffect, useRef, useState} from 'react';
import {Freeze} from 'react-freeze';
import {InteractionManager} from 'react-native';
import type ChildrenProps from '@src/types/utils/ChildrenProps';

type FreezeWrapperProps = ChildrenProps & {
    /** Prop to disable freeze */
    keepVisible?: boolean;
};

function FreezeWrapper({keepVisible = false, children}: FreezeWrapperProps) {
    const [isScreenBlurred, setIsScreenBlurred] = useState(false);
    // we need to know the screen index to determine if the screen can be frozen
    const screenIndexRef = useRef<number | null>(null);
    const isFocused = useIsFocused();
    const navigation = useNavigation();
    const currentRoute = useRoute();

    useEffect(() => {
        const index = navigation.getState()?.routes.findIndex((route) => route.key === currentRoute.key) ?? 0;
        screenIndexRef.current = index;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        const unsubscribe = navigation.addListener('state', () => {
            // if the screen is more than 1 screen away from the current screen, freeze it,
            // we don't want to freeze the screen if it's the previous screen because the freeze placeholder
            // would be visible at the beginning of the back animation then
            if ((navigation.getState()?.index ?? 0) - (screenIndexRef.current ?? 0) > 1) {
                InteractionManager.runAfterInteractions(() => setIsScreenBlurred(true));
            } else {
                setIsScreenBlurred(false);
            }
        });
        return () => unsubscribe();
    }, [isFocused, isScreenBlurred, navigation]);

    return <Freeze freeze={!isFocused && isScreenBlurred && !keepVisible}>{children}</Freeze>;
}

FreezeWrapper.displayName = 'FreezeWrapper';

export default FreezeWrapper;
