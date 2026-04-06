import React, {useMemo} from 'react';
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
    shouldParseFullTitle = true,
}: DisplayNamesProps) {
    const {translate} = useLocalize();
    const title = useMemo(() => {
        const processedTitle = shouldParseFullTitle ? Parser.htmlToText(fullTitle) : fullTitle;
        // Only convert line breaks to spaces when numberOfLines is exactly 1 (single-line mode).
        // For multi-line (numberOfLines > 1) or unlimited (numberOfLines === 0) we preserve line breaks.
        const finalTitle = numberOfLines === 1 ? StringUtils.lineBreaksToSpaces(processedTitle) : processedTitle;
        return finalTitle || translate('common.hidden');
    }, [fullTitle, shouldParseFullTitle, numberOfLines, translate]);

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

export default DisplayNames;
