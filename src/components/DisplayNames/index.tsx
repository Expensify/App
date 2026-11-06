import useLocalize from '@hooks/useLocalize';

import Parser from '@libs/Parser';
import StringUtils from '@libs/StringUtils';

import React from 'react';

import type DisplayNamesProps from './types';

import DisplayNamesWithoutTooltip from './DisplayNamesWithoutTooltip';
import DisplayNamesWithToolTip from './DisplayNamesWithTooltip';

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
    shouldParseFullTitle = true,
    accessibilityLabel,
    isSelectable = false,
}: DisplayNamesProps) {
    const {translate} = useLocalize();
    const processedTitle = shouldParseFullTitle ? Parser.htmlToText(fullTitle) : fullTitle;
    const title = StringUtils.lineBreaksToSpaces(processedTitle) || translate('common.hidden');

    if (!tooltipEnabled) {
        return (
            <DisplayNamesWithoutTooltip
                textStyles={textStyles}
                numberOfLines={numberOfLines}
                fullTitle={title}
                renderAdditionalText={renderAdditionalText}
                forwardedFSClass={forwardedFSClass}
                accessibilityLabel={accessibilityLabel}
                isSelectable={isSelectable}
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
                accessibilityLabel={accessibilityLabel}
                isSelectable={isSelectable}
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
            accessibilityLabel={accessibilityLabel}
            isSelectable={isSelectable}
        />
    );
}

export default DisplayNames;
