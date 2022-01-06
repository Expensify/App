import React from 'react';
import PropTypes from 'prop-types';
import {View} from 'react-native';
import _ from 'underscore';
import Text from '../Text';
import styles from '../../styles/styles';
import stylePropTypes from '../../styles/stylePropTypes';

const propTypes = {
    /** leading text, first text of the group */
    leadingText: PropTypes.string.isRequired,

    /** trailing text, second text of the group */
    trailingText: PropTypes.string.isRequired,

    /** styling for leading and trailing text */
    textStyle: stylePropTypes,

    /** styling for leading text View */
    leadingTextParentStyle: stylePropTypes,

    /** styling for trailing text View */
    trailingTextParentStyle: stylePropTypes,

    /** styling for parent View */
    wrapperStyle: stylePropTypes,
};

const defaultProps = {
    textStyle: {},
    leadingTextParentStyle: {},
    trailingTextParentStyle: {},
    wrapperStyle: {},
};

const TextWithEllipses = (props) => {
    const wrapperStyles = _.isArray(props.wrapperStyle) ? props.wrapperStyle : [props.wrapperStyle];
    const leadingTextParentStyles = _.isArray(props.leadingTextParentStyle) ? props.leadingTextParentStyle : [props.leadingTextParentStyle];
    const trailingTextParentStyles = _.isArray(props.trailingTextParentStyle) ? props.trailingTextParentStyle : [props.trailingTextParentStyle];
    return (
        <View style={[styles.flexRow, ...wrapperStyles]}>
            <View style={[styles.flexShrink1, ...leadingTextParentStyles]}>
                <Text
                    style={props.textStyle}
                    numberOfLines={1}
                >
                    {props.leadingText}
                </Text>
            </View>
            <View style={[styles.flexShrink0, ...trailingTextParentStyles]}>
                <Text style={props.textStyle}>
                    {props.trailingText}
                </Text>
            </View>
        </View>
    );
};

TextWithEllipses.propTypes = propTypes;
TextWithEllipses.defaultProps = defaultProps;
TextWithEllipses.displayName = 'TextWithEllipses';

export default TextWithEllipses;
