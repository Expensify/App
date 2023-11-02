import React from 'react';
import {View} from 'react-native';
import styles from '../styles/styles';
import Text from './Text';

type TestToolRowProps = {
    /** Title of control */
    title: string;

    /** Control component jsx */
    children: React.ReactNode;
};

function TestToolRow({title, children}: TestToolRowProps) {
    return (
        <View style={[styles.flexRow, styles.mb6, styles.justifyContentBetween, styles.alignItemsCenter, styles.mnw120]}>
            <View style={styles.flex2}>
                <Text>{title}</Text>
            </View>
            <View style={[styles.flex1, styles.alignItemsEnd]}>{children}</View>
        </View>
    );
}

TestToolRow.displayName = 'TestToolRow';

export default TestToolRow;
