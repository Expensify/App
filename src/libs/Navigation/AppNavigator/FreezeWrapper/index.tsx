import {ThemeStylesActionsContext, ThemeStylesStateContext, useThemeStylesActions, useThemeStylesState} from '@components/ThemeStylesContextProvider';

import useOnyx from '@hooks/useOnyx';
import useTheme from '@hooks/useTheme';
import useThemeIllustrations from '@hooks/useThemeIllustrations';

import ThemeContext from '@styles/theme/context/ThemeContext';
import ThemeIllustrationsContext from '@styles/theme/context/ThemeIllustrationsContext';

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

    const theme = useTheme();
    const themeStylesState = useThemeStylesState();
    const themeStylesActions = useThemeStylesActions();
    const themeIllustrations = useThemeIllustrations();

    const [isScreenBlurred, setIsScreenBlurred] = useState(false);
    const [freezed, setFreezed] = useState(false);

    useEffect(() => {
        const unsubscribe = navigation.addListener('state', (e) => setIsScreenBlurred(getIsScreenBlurred(e.data.state, currentRoute.key, {freezeWhenInTabBackground})));
        return () => unsubscribe();
    }, [currentRoute.key, freezeWhenInTabBackground, navigation]);

    // Decouple the Suspense render task so it won't be interrupted by React's concurrent mode
    // and stuck in an infinite loop
    useLayoutEffect(() => {
        if (isScreenBlurred && isAnyModalOpen) {
            return;
        }
        setFreezed(isScreenBlurred);
    }, [isAnyModalOpen, isScreenBlurred]);

    // A theme change made while the screen is frozen can fail to reach deep theme consumers, which keep stale colors after unfreezing.
    // Providing the theme again inside Freeze makes React propagate the new value to every consumer below once the tree unfreezes.
    return (
        <Freeze freeze={freezed}>
            <ThemeContext.Provider value={theme}>
                <ThemeStylesStateContext.Provider value={themeStylesState}>
                    <ThemeStylesActionsContext.Provider value={themeStylesActions}>
                        <ThemeIllustrationsContext.Provider value={themeIllustrations}>{children}</ThemeIllustrationsContext.Provider>
                    </ThemeStylesActionsContext.Provider>
                </ThemeStylesStateContext.Provider>
            </ThemeContext.Provider>
        </Freeze>
    );
}

export default FreezeWrapper;
