import Text from '@components/Text';

import useThemeStyles from '@hooks/useThemeStyles';

import type {ReactNode} from 'react';
import type {StyleProp, TextStyle} from 'react-native';

import React, {isValidElement} from 'react';

type TitleProps = {
    /** Title content — rendered as a headline when a string, as-is when a ReactNode */
    children?: ReactNode;

    /** Additional style applied to the title text (string titles only) */
    style?: StyleProp<TextStyle>;
};

function Title({children, style}: TitleProps) {
    const styles = useThemeStyles();

    if (children == null || children === '') {
        return null;
    }

    if (typeof children === 'string') {
        return <Text style={[styles.textHeadlineH1, style]}>{children}</Text>;
    }

    if (isValidElement(children)) {
        return children;
    }

    return null;
}

Title.displayName = 'FeatureTraining.Title';

export default Title;
