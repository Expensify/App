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

    /** Conditionally hide the row */
    isHidden: PropTypes.bool,
};

const defaultProps = {
    isHidden: false,
};

const TestToolRow = props => !props.isHidden && (
    <View style={[styles.flexRow, styles.mb6, styles.justifyContentBetween, styles.alignItemsCenter]}>
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
TestToolRow.defaultProps = defaultProps;
TestToolRow.displayName = 'TestToolRow';

export default TestToolRow;
