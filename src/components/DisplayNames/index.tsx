import React from 'react';
import useLocalize from '@hooks/useLocalize';
import DisplayNamesWithoutTooltip from './DisplayNamesWithoutTooltip';
import DisplayNamesWithToolTip from './DisplayNamesWithTooltip';
import type DisplayNamesProps from './types';

function DisplayNames({fullTitle, tooltipEnabled, textStyles, numberOfLines, shouldUseFullTitle, displayNamesWithTooltips, AdditionalComponent}: DisplayNamesProps) {
    const {translate} = useLocalize();
    const title = fullTitle || translate('common.hidden');

    if (!tooltipEnabled) {
        return (
            <DisplayNamesWithoutTooltip
                textStyles={textStyles}
                numberOfLines={numberOfLines}
                fullTitle={title}
                AdditionalComponent={AdditionalComponent}
            />
        );
    }

    return (
        <DisplayNamesWithToolTip
            shouldUseFullTitle={shouldUseFullTitle}
            fullTitle={title}
            displayNamesWithTooltips={displayNamesWithTooltips}
            textStyles={textStyles}
            numberOfLines={numberOfLines}
            AdditionalComponent={AdditionalComponent}
        />
    );
}

DisplayNames.displayName = 'DisplayNames';

export default DisplayNames;
