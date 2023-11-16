import PropTypes from 'prop-types';
import React, {Fragment} from 'react';
import {View} from 'react-native';
import _ from 'underscore';
import Text from '@components/Text';
import styles from '@styles/styles';
import CONST from '@src/CONST';

const propTypes = {
    /** Required text */
    children: PropTypes.string.isRequired,

    /** Style to be applied to Text */
    // eslint-disable-next-line react/forbid-prop-types
    textStyles: PropTypes.arrayOf(PropTypes.object),
};

const defaultProps = {
    textStyles: [],
};

function WrappedText(props) {
    if (!_.isString(props.children)) {
        return null;
    }
    return (
        <Text style={styles.codeWordWrapper}>
            <Text style={props.textStyles}>{props.children}</Text>
        </Text>
    );
}

WrappedText.propTypes = propTypes;
WrappedText.defaultProps = defaultProps;
WrappedText.displayName = 'WrappedText';

export default WrappedText;
