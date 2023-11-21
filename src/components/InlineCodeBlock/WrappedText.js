import PropTypes from 'prop-types';
import React, {Fragment} from 'react';
import {View} from 'react-native';
import _ from 'underscore';
import Text from '@components/Text';
import CONST from '@src/CONST';
import { StyleSheet } from 'react-native';

const propTypes = {
    /** Required text */
    children: PropTypes.string.isRequired,

    /** Style to be applied to Text */
    // eslint-disable-next-line react/forbid-prop-types
    textStyles: PropTypes.arrayOf(PropTypes.object),

    /** Style to be applied to View */
    // eslint-disable-next-line react/forbid-prop-types
    viewStyles: PropTypes.arrayOf(PropTypes.object),
};

const defaultProps = {
    textStyles: [],
    viewStyles: []
};

function WrappedText(props) {
    if (!_.isString(props.children)) {
        return null;
    }
    const regex =
        /[\p{Extended_Pictographic}](\u200D[\p{Extended_Pictographic}]|[\u{1F3FB}-\u{1F3FF}]|[\u{E0020}-\u{E007F}]|\uFE0F|\u20E3)*|[\u{1F1E6}-\u{1F1FF}]{2}|[#*0-9]\uFE0F?\u20E3|./gu;
    const textParts = props.children.match(regex);

    const textStyles = StyleSheet.flatten(props.textStyles);
    const viewStyles = StyleSheet.flatten(props.viewStyles);

    const sharedStyleKeys = ['borderTopColor', 'borderTopWidth', 'borderBottomColor', 'borderBottomWidth', 'backgroundColor'];
    const sharedViewStyle = _.pick(viewStyles, sharedStyleKeys);
    const elementStyles = {
        first: _.pick(viewStyles, ['borderLeftColor', 'borderLeftWidth', 'borderTopLeftRadius', 'borderBottomLeftRadius', 'paddingLeft']),
        last: _.pick(viewStyles, ['borderRightColor', 'borderRightWidth', 'borderTopRightRadius', 'borderBottomRightRadius', 'paddingRight']),
    };

    const getViewStyleAtIndex = (idx) => {
        let positionalStyle = sharedViewStyle;
        if (idx === 0) {
            positionalStyle = {...positionalStyle, ...elementStyles.first};
        }
        if (idx === textParts.length - 1) {
            positionalStyle = {...positionalStyle, ...elementStyles.last};
        }
        return positionalStyle;
    };

    return (
        <>
            {_.map(textParts, (value, idx) => (
                <View
                    key={idx}
                    style={[getViewStyleAtIndex(idx), {justifyContent: 'center'}]}
                >
                    <Text style={[textStyles]}>{value}</Text>
                </View>
            ))}
        </>
    );
}

WrappedText.propTypes = propTypes;
WrappedText.defaultProps = defaultProps;
WrappedText.displayName = 'WrappedText';

export default WrappedText;
