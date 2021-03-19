// As we don't have to show tooltips of the Native platform so we simply render the option title which wraps.
import React from 'react';
import {Text} from 'react-native';
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

export default OptionRowTitle;
