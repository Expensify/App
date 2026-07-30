import {useFeatureTrainingState} from '@components/FeatureTraining/context';

import useThemeStyles from '@hooks/useThemeStyles';

import type {ReactNode} from 'react';
import type {LayoutChangeEvent, StyleProp, ViewStyle} from 'react-native';

import React from 'react';
import {View} from 'react-native';

type BodyProps = {
    children?: ReactNode;

    /** Style applied to the outer body container */
    outerStyle?: StyleProp<ViewStyle>;

    /** Style applied to the inner text container */
    innerStyle?: StyleProp<ViewStyle>;

    /** onLayout used by the carousel probe layer to measure page heights */
    onLayout?: (event: LayoutChangeEvent) => void;
};

function Body({children, outerStyle, innerStyle, onLayout}: BodyProps) {
    const styles = useThemeStyles();
    const {contentMinHeight} = useFeatureTrainingState();

    return (
        <View style={[styles.mt5, styles.mh5, outerStyle]}>
            <View
                style={[innerStyle, contentMinHeight !== undefined && {minHeight: contentMinHeight}]}
                onLayout={onLayout}
            >
                {children}
            </View>
        </View>
    );
}

Body.displayName = 'FeatureTraining.Body';

export default Body;
export type {BodyProps};
