import React from 'react';
import Text from '@components/Text';
import {defaultProps, propTypes} from './displayNamesPropTypes';

// As we don't have to show tooltips of the Native platform so we simply render the full display names list.
function DisplayNames(props) {
    return (
        <Text
            accessibilityLabel={props.accessibilityLabel}
            style={props.textStyles}
            numberOfLines={props.numberOfLines || undefined}
        >
            {props.fullTitle}
        </Text>
    );
}

DisplayNames.propTypes = propTypes;
DisplayNames.defaultProps = defaultProps;
DisplayNames.displayName = 'DisplayNames';

export default DisplayNames;
