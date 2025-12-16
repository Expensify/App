import {useFocusEffect} from '@react-navigation/native';
import React, {useCallback, useContext} from 'react';
import {WideRHPContext} from '@components/WideRHPContextProvider';
import {navigationRef} from '@libs/Navigation/Navigation';
import NAVIGATORS from '@src/NAVIGATORS';
import SecondaryOverlay from './SecondaryOverlay';
import TertiaryOverlay from './TertiaryOverlay';

type WideRHPOverlayWrapperProps = {
    children: React.ReactNode;
    shouldWrap?: boolean;
};

// This overlay is used to cover the space under the narrower RHP screen when more than one RHP width is displayed on the screen.
export default function WideRHPOverlayWrapper({children, shouldWrap = true}: WideRHPOverlayWrapperProps) {
    const {syncRHPKeys} = useContext(WideRHPContext);

    // This hook handles the case when a wider RHP is displayed above a narrower one.
    // In this situation, we need to synchronize the keys, as superWideRHPKeys and wideRHPKeys store the keys of the screens that are visible.
    useFocusEffect(
        useCallback(
            () => () => {
                if (!shouldWrap) {
                    return;
                }

                // Synchronization after RHP unmount is handled in RightModalNavigator.tsx.
                const isRHPOpened = navigationRef?.getRootState()?.routes?.at(-1)?.name === NAVIGATORS.RIGHT_MODAL_NAVIGATOR;
                if (!isRHPOpened) {
                    return;
                }

                syncRHPKeys();
            },
            [shouldWrap, syncRHPKeys],
        ),
    );

    if (!shouldWrap) {
        return children;
    }

    return (
        <>
            {children}
            <SecondaryOverlay />
            <TertiaryOverlay />
        </>
    );
}
