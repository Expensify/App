import React from 'react';
import {defaultProps, propTypes} from './displayNamesPropTypes';
import DisplayNamesWithoutTooltip from './DisplayNamesWithoutTooltip';
import DisplayNamesWithToolTip from './DisplayNamesWithTooltip';

function DisplayNames(props) {
    if (!props.tooltipEnabled) {
        return (
            <DisplayNamesWithoutTooltip
                textStyles={props.textStyles}
                numberOfLines={props.numberOfLines}
                fullTitle={props.fullTitle}
            />
        );
    }

    // eslint-disable-next-line react/jsx-props-no-spreading
    return <DisplayNamesWithToolTip {...props} />;
}

DisplayNames.propTypes = propTypes;
DisplayNames.defaultProps = defaultProps;
DisplayNames.displayName = 'DisplayNames';

export default DisplayNames;
