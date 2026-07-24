import useBottomSafeSafeAreaPaddingStyle from '@hooks/useBottomSafeSafeAreaPaddingStyle';
import useKeyboardShortcut from '@hooks/useKeyboardShortcut';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';

import isInLandscapeModeUtil from '@libs/isInLandscapeMode';

import CONST from '@src/CONST';

import type {DimensionValue, StyleProp, ViewStyle} from 'react-native';

import React from 'react';
import {View} from 'react-native';

import CenteredModalLayoutOverlay from './CenteredModalLayoutOverlay';
import FocusTrapForScreen from './FocusTrap/FocusTrapForScreen';

type CenteredModalLayoutProps = {
    children: React.ReactNode;

    /** Width of the inner card on wide layouts (defaults to featureTrainingModalWidth) */
    width?: number;

    /** Height of the inner card on wide layout */
    height?: DimensionValue;

    /** Called when the backdrop is pressed, before navigating back */
    onBackdropPress: () => void;

    /** Extra styles merged into the safe-area content wrapper */
    contentStyle?: StyleProp<ViewStyle>;

    /**
     * Whether the content wrapper should apply the bottom safe-area inset. Disable it when the children
     * already handle the inset themselves (e.g. FeatureTrainingContent with `shouldUseScrollView`, whose
     * ScrollView content padding includes it), otherwise the inset is applied twice and renders as an
     * empty band under the content on devices with a bottom inset.
     */
    addBottomSafeAreaPadding?: boolean;
};

function CenteredModalLayout({children, width, height, onBackdropPress, contentStyle, addBottomSafeAreaPadding = true}: CenteredModalLayoutProps) {
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {windowWidth, windowHeight} = useWindowDimensions();

    const isInLandscapeMode = isInLandscapeModeUtil(windowWidth, windowHeight);
    const safeAreaStyle = useBottomSafeSafeAreaPaddingStyle({
        addBottomSafeAreaPadding: addBottomSafeAreaPadding && !isInLandscapeMode,
        style: [shouldUseNarrowLayout && styles.pt2, !isInLandscapeMode && styles.pb5, contentStyle],
    });

    useKeyboardShortcut(CONST.KEYBOARD_SHORTCUTS.ESCAPE, onBackdropPress, {shouldBubble: false});

    return (
        <>
            <CenteredModalLayoutOverlay onBackdropPress={onBackdropPress} />
            <View
                pointerEvents="box-none"
                style={[styles.flex1, styles.alignItemsCenter, styles.getCenteredModalOuterView(shouldUseNarrowLayout)]}
            >
                <FocusTrapForScreen>
                    <View style={styles.getCenteredModalInnerView(shouldUseNarrowLayout, width, height)}>
                        <View style={safeAreaStyle}>{children}</View>
                    </View>
                </FocusTrapForScreen>
            </View>
        </>
    );
}

export default CenteredModalLayout;
