import PropTypes from 'prop-types';
import React from 'react';
import {View} from 'react-native';
import _ from 'underscore';
import * as Localize from '@libs/Localize';
import stylePropTypes from '@styles/stylePropTypes';
import * as StyleUtils from '@styles/StyleUtils';
import useTheme from '@styles/themes/useTheme';
import useThemeStyles from '@styles/useThemeStyles';
import Icon from './Icon';
import * as Expensicons from './Icon/Expensicons';
import Text from './Text';

const propTypes = {
    /** Error or hint text. Ignored when children is not empty */
    message: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.object]))]),

    /** Children to render next to dot indicator */
    children: PropTypes.node,

    /** Indicates whether to show error or hint */
    isError: PropTypes.bool,

    /** Container style props */
    style: stylePropTypes,

    /** Whether to show dot indicator */
    shouldShowRedDotIndicator: PropTypes.bool,
};

const defaultProps = {
    message: '',
    children: null,
    isError: true,
    shouldShowRedDotIndicator: true,
    style: [],
};

function FormHelpMessage(props) {
    const theme = useTheme();
    const styles = useThemeStyles();
    if (_.isEmpty(props.message) && _.isEmpty(props.children)) {
        return null;
    }

    const translatedMessage = Localize.translateIfPhraseKey(props.message);
    return (
        <View style={[styles.flexRow, styles.alignItemsCenter, styles.mt2, styles.mb1, StyleUtils.parseStyleAsArray(props.style), styles.justifyContentCenter]}>
            {props.isError && props.shouldShowRedDotIndicator && (
                <Icon
                    src={Expensicons.DotIndicator}
                    fill={theme.danger}
                />
            )}
            <View style={[styles.flex1, props.isError && props.shouldShowRedDotIndicator ? styles.ml2 : {}]}>
                {props.children || <Text style={[props.isError ? styles.formError : styles.formHelp, styles.mb0]}>{translatedMessage}</Text>}
            </View>
        </View>
    );
}

FormHelpMessage.propTypes = propTypes;
FormHelpMessage.defaultProps = defaultProps;
FormHelpMessage.displayName = 'FormHelpMessage';

export default FormHelpMessage;
