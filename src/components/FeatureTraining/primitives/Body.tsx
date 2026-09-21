import useThemeStyles from '@hooks/useThemeStyles';

import type {ReactNode} from 'react';
import type {StyleProp, ViewStyle} from 'react-native';

import React from 'react';
import {View} from 'react-native';

type BodyProps = {
    children?: ReactNode;

    /** Style applied to the body container */
    style?: StyleProp<ViewStyle>;
};

function Body({children, style}: BodyProps) {
    const styles = useThemeStyles();

    return <View style={[styles.mt5, styles.mh5, style]}>{children}</View>;
}

Body.displayName = 'FeatureTraining.Body';

export default Body;
