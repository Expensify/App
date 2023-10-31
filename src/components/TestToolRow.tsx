import React from 'react';
import {View, ViewStyle} from 'react-native';
import useThemeStyles from '@styles/useThemeStyles';
import Text from './Text';

type TestToolRowProps = {
    /** Title of control */
    title: string;

    /** Control component jsx */
    children: React.ReactNode;
};

function TestToolRow({title, children}: TestToolRowProps) {
    const styles = useThemeStyles();
    return (
        <View style={[styles.flexRow as ViewStyle, styles.mb6 as ViewStyle, styles.justifyContentBetween as ViewStyle, styles.alignItemsCenter as ViewStyle, styles.mnw120 as ViewStyle]}>
            <View style={styles.flex2 as ViewStyle}>
                <Text>{title}</Text>
            </View>
            <View style={[styles.flex1 as ViewStyle, styles.alignItemsEnd as ViewStyle]}>{children}</View>
        </View>
    );
}

TestToolRow.displayName = 'TestToolRow';

export default TestToolRow;
