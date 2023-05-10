import React from 'react';
import PropTypes from 'prop-types';
import {View} from 'react-native';
import styles from '../styles/styles';
import Text from './Text';

const propTypes = {
    /** Title of control */
    title: PropTypes.string.isRequired,

    /** Control component jsx */
    children: PropTypes.node.isRequired,
};

const TestToolRow = props => (
    <View style={[styles.flexRow, styles.mb6, styles.justifyContentBetween, styles.alignItemsCenter, styles.mnw120]}>
        <View style={styles.flex2}>
            <Text>
                {props.title}
            </Text>
        </View>
        <View style={[styles.flex1, styles.alignItemsEnd]}>
            {props.children}
        </View>
    </View>
);

TestToolRow.propTypes = propTypes;
TestToolRow.displayName = 'TestToolRow';

export default TestToolRow;
