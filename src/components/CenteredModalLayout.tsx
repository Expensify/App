import React from 'react';
import type {MouseEvent} from 'react';
import type {DimensionValue, StyleProp, ViewStyle} from 'react-native';
import {View} from 'react-native';
import useBottomSafeSafeAreaPaddingStyle from '@hooks/useBottomSafeSafeAreaPaddingStyle';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import isInLandscapeModeUtil from '@libs/isInLandscapeMode';
import Overlay from '@libs/Navigation/AppNavigator/Navigators/Overlay';
import CONST from '@src/CONST';
import FocusTrapForScreen from './FocusTrap/FocusTrapForScreen';
import PressableWithoutFeedback from './Pressable/PressableWithoutFeedback';

type CenteredModalLayoutProps = {
    children: React.ReactNode;

    /** Width of the inner card on wide layouts (defaults to featureTrainingModalWidth) */
    width?: number;

    /** Width of the inner card on wide layout */
    height?: DimensionValue;

    /** Called when the backdrop is pressed, before navigating back */
    onBackdropPress?: () => void;

    /** Extra styles merged into the safe-area content wrapper */
    contentStyle?: StyleProp<ViewStyle>;
};

function CenteredModalLayout({children, width, height, onBackdropPress, contentStyle}: CenteredModalLayoutProps) {
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {translate} = useLocalize();
    const {windowWidth, windowHeight} = useWindowDimensions();

    const isContentScrollable = isInLandscapeModeUtil(windowWidth, windowHeight);
    const safeAreaStyle = useBottomSafeSafeAreaPaddingStyle({
        addBottomSafeAreaPadding: !isContentScrollable,
        style: [shouldUseNarrowLayout && styles.pt2, !isContentScrollable && styles.pb5, contentStyle],
    });

    const handleInnerClick = (e: MouseEvent) => e.stopPropagation();

    return (
        <>
            <Overlay onPress={onBackdropPress} />
            <PressableWithoutFeedback
                onPress={onBackdropPress}
                style={[styles.flex1, styles.alignItemsCenter, styles.getCenteredModalOuterView(shouldUseNarrowLayout)]}
                accessibilityLabel={translate('common.close')}
                role={CONST.ROLE.BUTTON}
                sentryLabel="CenteredModalLayout-backdrop"
            >
                <FocusTrapForScreen>
                    <View
                        onStartShouldSetResponder={() => true}
                        onClick={handleInnerClick}
                        style={styles.getCenteredModalInnerView(shouldUseNarrowLayout, width, height)}
                    >
                        <View style={safeAreaStyle}>{children}</View>
                    </View>
                </FocusTrapForScreen>
            </PressableWithoutFeedback>
        </>
    );
}

export default CenteredModalLayout;
