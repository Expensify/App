import React from 'react';
import useLocalize from '@hooks/useLocalize';
import Parser from '@libs/Parser';
import StringUtils from '@libs/StringUtils';
import DisplayNamesWithoutTooltip from './DisplayNamesWithoutTooltip';
import DisplayNamesWithToolTip from './DisplayNamesWithTooltip';
import type DisplayNamesProps from './types';

function DisplayNames({
    fullTitle,
    tooltipEnabled,
    textStyles,
    numberOfLines,
    shouldAddEllipsis,
    shouldUseFullTitle,
    displayNamesWithTooltips,
    renderAdditionalText,
    forwardedFSClass,
}: DisplayNamesProps) {
    const {translate} = useLocalize();
    const title = StringUtils.lineBreaksToSpaces(Parser.htmlToText(fullTitle)) || translate('common.hidden');

    if (!tooltipEnabled) {
        return (
            <DisplayNamesWithoutTooltip
                textStyles={textStyles}
                numberOfLines={numberOfLines}
                fullTitle={title}
                renderAdditionalText={renderAdditionalText}
                forwardedFSClass={forwardedFSClass}
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
                renderAdditionalText={renderAdditionalText}
                forwardedFSClass={forwardedFSClass}
            />
        );
    }

    return (
        <DisplayNamesWithToolTip
            fullTitle={title}
            displayNamesWithTooltips={displayNamesWithTooltips}
            textStyles={textStyles}
            shouldAddEllipsis={shouldAddEllipsis}
            numberOfLines={numberOfLines}
            renderAdditionalText={renderAdditionalText}
            forwardedFSClass={forwardedFSClass}
        />
    );
}

DisplayNames.displayName = 'DisplayNames';

export default DisplayNames;
