/* eslint-disable react/forbid-prop-types */
import React, {memo} from 'react';
import {
    Text,
} from 'react-native';
import {propTypes, defaultProps} from './OptionRowTitleProps';


const OptionRowTitle = ({
    style,
    option,
    numberOfLines,
}) => (
    <Text style={style} numberOfLines={numberOfLines}>
        {option.text}
    </Text>
);

OptionRowTitle.propTypes = propTypes;
OptionRowTitle.defaultProps = defaultProps;
OptionRowTitle.displayName = 'OptionRowTitle';

export default memo(OptionRowTitle);
