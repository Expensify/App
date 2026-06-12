import React from 'react';
import type {MouseEvent} from 'react';
import type {DimensionValue} from 'react-native';
import {View} from 'react-native';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
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
};

function CenteredModalLayout({children, width, height, onBackdropPress}: CenteredModalLayoutProps) {
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {translate} = useLocalize();

    const handleInnerClick = (e: MouseEvent) => e.stopPropagation();

    return (
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
                    {children}
                </View>
            </FocusTrapForScreen>
        </PressableWithoutFeedback>
    );
}

export default CenteredModalLayout;
