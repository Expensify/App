import React from 'react';
import TextWithIconCell from '@components/Search/SearchList/ListItem/TextWithIconCell';
import TextWithTooltip from '@components/TextWithTooltip';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useThemeStyles from '@hooks/useThemeStyles';
import {getDecodedTagName} from '@libs/TagUtils';
import {getTagForDisplay} from '@libs/TransactionUtils';
import type TransactionDataCellProps from './TransactionDataCellProps';

function TagCell({shouldUseNarrowLayout, shouldShowTooltip, transactionItem}: TransactionDataCellProps) {
    const icons = useMemoizedLazyExpensifyIcons(['Tag']);
    const styles = useThemeStyles();
    // Decode HTML entities so tags stored with encoding (e.g. `uno &amp; dos`) display as `uno & dos`,
    // matching the report's group-by-tag dropdown which already decodes the value.
    const tagForDisplay = getDecodedTagName(getTagForDisplay(transactionItem));

    return shouldUseNarrowLayout ? (
        <TextWithIconCell
            icon={icons.Tag}
            showTooltip={shouldShowTooltip}
            text={tagForDisplay}
            textStyle={[styles.textMicro, styles.mnh0]}
        />
    ) : (
        <TextWithTooltip
            shouldShowTooltip={shouldShowTooltip}
            text={tagForDisplay}
            numberOfLines={1}
            style={[styles.lineHeightLarge, styles.justifyContentCenter]}
        />
    );
}

export default TagCell;
