import React from 'react';
import {propTypes, defaultProps} from './displayNamesPropTypes';
import Text from '../Text';
import RenderHTML from '../RenderHTML';

// As we don't have to show tooltips of the Native platform so we simply render the full display names list.
function DisplayNames(props) {
    const fullTitle = props.fullTitleHtml ? <RenderHTML html={props.fullTitleHtml} /> : props.fullTitle;

    return (
        <Text
            accessibilityLabel={props.accessibilityLabel}
            style={props.textStyles}
            numberOfLines={props.numberOfLines || undefined}
        >
            {fullTitle}
        </Text>
    );
}

DisplayNames.propTypes = propTypes;
DisplayNames.defaultProps = defaultProps;
DisplayNames.displayName = 'DisplayNames';

export default DisplayNames;
