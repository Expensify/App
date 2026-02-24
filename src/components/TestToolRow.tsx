import React from 'react';
import {View} from 'react-native';
import useThemeStyles from '@hooks/useThemeStyles';
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
        <View style={styles.testRowContainer}>
            <View style={[styles.flexGrow1, styles.flexShrink1]}>
                <Text>{title}</Text>
            </View>
            <View style={[styles.flexGrow0, styles.flexShrink0, styles.alignItemsEnd]}>{children}</View>
        </View>
    );
}

export default TestToolRow;
