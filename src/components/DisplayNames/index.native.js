import React from 'react';
import {Text} from 'react-native';
import {propTypes, defaultProps} from './DisplayNamesPropTypes';

// As we don't have to show tooltips of the Native platform so we simply render the full display names list.
const DisplayNames = ({
    fullTitle,
    numberOfLines,
    textStyle,
}) => (
    <Text style={textStyle} numberOfLines={numberOfLines}>
        {fullTitle}
    </Text>
);

DisplayNames.propTypes = propTypes;
DisplayNames.defaultProps = defaultProps;
DisplayNames.displayName = 'DisplayNames';

export default DisplayNames;
