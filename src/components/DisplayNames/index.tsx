import React from 'react';
import DisplayNamesWithoutTooltip from './DisplayNamesWithoutTooltip';
import DisplayNamesWithToolTip from './DisplayNamesWithTooltip';
import DisplayNamesProps from './types';

function DisplayNames({fullTitle, tooltipEnabled, textStyles, numberOfLines, shouldUseFullTitle, displayNamesWithTooltips}: DisplayNamesProps) {
    if (!tooltipEnabled) {
        return (
            <DisplayNamesWithoutTooltip
                textStyles={textStyles}
                numberOfLines={numberOfLines}
                fullTitle={fullTitle}
            />
        );
    }

    return (
        <DisplayNamesWithToolTip
            shouldUseFullTitle={shouldUseFullTitle}
            fullTitle={fullTitle}
            displayNamesWithTooltips={displayNamesWithTooltips}
            textStyles={textStyles}
            numberOfLines={numberOfLines}
        />
    );
}

DisplayNames.displayName = 'DisplayNames';

export default DisplayNames;
