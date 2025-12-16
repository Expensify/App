import {useFocusEffect} from '@react-navigation/native';
import React, {useCallback, useContext} from 'react';
import SecondaryOverlay from '@components/RHPWrapper/SecondaryOverlay';
import TertiaryOverlay from '@components/RHPWrapper/TertiaryOverlay';
import {WideRHPContext} from '@components/WideRHPContextProvider';
import {navigationRef} from '@libs/Navigation/Navigation';
import NAVIGATORS from '@src/NAVIGATORS';

type WideRHPWrapperProps = {
    children: React.ReactNode;
    shouldShow?: boolean;
};

export default function WideRHPWrapper({children, shouldShow}: WideRHPWrapperProps) {
    const {syncRHPKeys} = useContext(WideRHPContext);

    // This hook handles the case when a wider RHP is displayed above a narrower one.
    // In this situation, we need to synchronize the keys, as superWideRHPKeys and wideRHPKeys store the keys of the screens that are visible.
    useFocusEffect(
        useCallback(
            () => () => {
                if (!shouldShow) {
                    return;
                }

                // Synchronization after RHP unmount is handled in RightModalNavigator.tsx.
                const isRHPOpened = navigationRef?.getRootState()?.routes?.at(-1)?.name === NAVIGATORS.RIGHT_MODAL_NAVIGATOR;
                if (!isRHPOpened) {
                    return;
                }

                syncRHPKeys();
            },
            [shouldShow, syncRHPKeys],
        ),
    );

    if (!shouldShow) {
        return children;
    }

    return (
        <>
            {children}
            {/* These overlays are used to cover the space under the narrower RHP screen when more than one RHP width is displayed on the screen */}
            <SecondaryOverlay />
            <TertiaryOverlay />
        </>
    );
}
