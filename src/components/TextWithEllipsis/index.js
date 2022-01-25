import React from 'react';
import PropTypes from 'prop-types';
import {View} from 'react-native';
import Text from '../Text';
import styles from '../../styles/styles';
import stylePropTypes from '../../styles/stylePropTypes';
import * as StyleUtils from '../../styles/StyleUtils';

const propTypes = {
    /** Leading text before the ellipsis */
    leadingText: PropTypes.string.isRequired,

    /** Text after the ellipsis */
    trailingText: PropTypes.string.isRequired,

    /** Styles for leading and trailing text */
    textStyle: stylePropTypes,

    /** Styles for leading text View */
    leadingTextParentStyle: stylePropTypes,

    /** Styles for parent View */
    wrapperStyle: stylePropTypes,
};

const defaultProps = {
    textStyle: {},
    leadingTextParentStyle: {},
    wrapperStyle: {},
};

const TextWithEllipsis = props => (
    <View style={[styles.flexRow, ...StyleUtils.parseStyleAsArray(props.wrapperStyle)]}>
        <View style={[styles.flexShrink1, ...StyleUtils.parseStyleAsArray(props.leadingTextParentStyle)]}>
            <Text style={[...StyleUtils.parseStyleAsArray(props.textStyle)]} numberOfLines={1}>
                {props.leadingText}
            </Text>
        </View>
        <View style={styles.flexShrink0}>
            <Text style={props.textStyle}>
                {props.trailingText}
            </Text>
        </View>
    </View>
);

TextWithEllipsis.propTypes = propTypes;
TextWithEllipsis.defaultProps = defaultProps;
TextWithEllipsis.displayName = 'TextWithEllipsis';

export default TextWithEllipsis;
