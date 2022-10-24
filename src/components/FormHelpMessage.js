import React from 'react';
import _ from 'underscore';
import PropTypes from 'prop-types';
import {View} from 'react-native';
import styles from '../styles/styles';
import Icon from './Icon';
import * as Expensicons from './Icon/Expensicons';
import colors from '../styles/colors';
import Text from './Text';

const propTypes = {
    message: PropTypes.node,

    children: PropTypes.node,

    isError: PropTypes.bool,

    // eslint-disable-next-line react/forbid-prop-types
    style: PropTypes.arrayOf(PropTypes.object),
};

const defaultProps = {
    message: null,
    children: null,
    isError: true,
    style: [],
};

const FormHelpMessage = (props) => {
    if (_.isEmpty(props.message) && _.isEmpty(props.children)) {
        return null;
    }

    return (
        <View style={[styles.formHelpMessage, styles.mt1, styles.mb1, ...props.style]}>
            {props.isError && <Icon src={Expensicons.DotIndicator} fill={colors.red} />}
            {!_.isEmpty(props.message) ? (
                <Text style={[props.isError ? styles.formError : styles.formHelp, styles.flex1, styles.mb0, styles.ml2]}>
                    {props.message}
                </Text>
            ) : <View style={[styles.flex1, styles.ml2]}>{props.children}</View>}
        </View>
    );
};

FormHelpMessage.propTypes = propTypes;
FormHelpMessage.defaultProps = defaultProps;
FormHelpMessage.displayName = 'FormHelpMessage';

export default FormHelpMessage;
