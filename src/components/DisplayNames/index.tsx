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
        return StringUtils.lineBreaksToSpaces(processedTitle) || translate('common.hidden');
    }, [fullTitle, shouldParseFullTitle, translate]);

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
