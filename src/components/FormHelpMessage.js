import React from 'react';
import _ from 'underscore';
import PropTypes from 'prop-types';
import {View} from 'react-native';
import Icon from './Icon';
import * as Expensicons from './Icon/Expensicons';
import Text from './Text';
import colors from '../styles/colors';
import styles from '../styles/styles';
import stylePropTypes from '../styles/stylePropTypes';

const propTypes = {
    /** Error or hint text. Ignored when children is not empty */
    message: PropTypes.string,

    /** Children to render next to dot indicator */
    children: PropTypes.node,

    /** Indicates whether to show error or hint */
    isError: PropTypes.bool,

    /** Container style props */
    style: stylePropTypes,
};

const defaultProps = {
    message: '',
    children: null,
    isError: true,
    style: [],
};

const FormHelpMessage = (props) => {
    if (_.isEmpty(props.message) && _.isEmpty(props.children)) {
        return null;
    }

    return (
        <View style={[styles.flexRow, styles.alignItemsCenter, styles.mt2, styles.mb1, ...props.style]}>
            {props.isError && <Icon src={Expensicons.DotIndicator} fill={colors.red} />}
            <View style={[styles.flex1, styles.ml2]}>
                {props.children || (
                    <Text style={[props.isError ? styles.formError : styles.formHelp, styles.mb0]}>
                        {props.message}
                    </Text>
                )}
            </View>
        </View>
    );
};

FormHelpMessage.propTypes = propTypes;
FormHelpMessage.defaultProps = defaultProps;
FormHelpMessage.displayName = 'FormHelpMessage';

export default FormHelpMessage;
