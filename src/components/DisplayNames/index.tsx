import React from 'react';
import useLocalize from '@hooks/useLocalize';
import DisplayNamesWithoutTooltip from './DisplayNamesWithoutTooltip';
import DisplayNamesWithToolTip from './DisplayNamesWithTooltip';
import type DisplayNamesProps from './types';

function DisplayNames({fullTitle, tooltipEnabled, textStyles, numberOfLines, shouldUseFullTitle, displayNamesWithTooltips}: DisplayNamesProps) {
    const {translate} = useLocalize();
    const title = fullTitle || translate('common.hidden');

    if (!tooltipEnabled) {
        return (
            <DisplayNamesWithoutTooltip
                textStyles={textStyles}
                numberOfLines={numberOfLines}
                fullTitle={title}
            />
        );
    }

    if (shouldUseFullTitle) {
        return (
            <DisplayNamesWithToolTip
                shouldUseFullTitle
                fullTitle={title}
                textStyles={textStyles}
                numberOfLines={numberOfLines}
            />
        );
    }

    return (
        <DisplayNamesWithToolTip
            fullTitle={title}
            displayNamesWithTooltips={displayNamesWithTooltips}
            textStyles={textStyles}
            numberOfLines={numberOfLines}
        />
    );
}

DisplayNames.displayName = 'DisplayNames';

export default DisplayNames;
