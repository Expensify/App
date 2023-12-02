import React from 'react';
import Text from '@components/Text';
import DisplayNamesProps from './types';

// As we don't have to show tooltips of the Native platform so we simply render the full display names list.
function DisplayNames({accessibilityLabel, fullTitle, textStyles = [], numberOfLines = 1}: DisplayNamesProps) {
    return (
        <Text
            accessibilityLabel={accessibilityLabel}
            style={textStyles}
            numberOfLines={numberOfLines}
        >
            {fullTitle}
        </Text>
    );
}

DisplayNames.displayName = 'DisplayNames';

export default DisplayNames;
