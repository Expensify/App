import {useFeatureTrainingState} from '@components/FeatureTraining/context';

import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';

import type {ReactNode} from 'react';
import type {LayoutChangeEvent, StyleProp, ViewStyle} from 'react-native';

import React from 'react';
import {View} from 'react-native';

type BodyTextProps = {
    children?: ReactNode;

    /** Style applied to the text container */
    style?: StyleProp<ViewStyle>;

    /** onLayout used by the carousel probe layer to measure page heights */
    onLayout?: (event: LayoutChangeEvent) => void;
};

function BodyText({children, style, onLayout}: BodyTextProps) {
    const styles = useThemeStyles();
    const {contentMinHeight} = useFeatureTrainingState();
    const {onboardingIsMediumOrLargerScreenWidth} = useResponsiveLayout();

    return (
        <View
            style={[onboardingIsMediumOrLargerScreenWidth ? [styles.gap1, styles.mb8] : [styles.mb10], style, contentMinHeight !== undefined && {minHeight: contentMinHeight}]}
            onLayout={onLayout}
        >
            {children}
        </View>
    );
}

BodyText.displayName = 'FeatureTraining.BodyText';

export default BodyText;
