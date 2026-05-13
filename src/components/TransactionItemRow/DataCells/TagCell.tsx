import React from 'react';
import TextWithIconCell from '@components/Search/SearchList/ListItem/TextWithIconCell';
import TextWithTooltip from '@components/TextWithTooltip';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useThemeStyles from '@hooks/useThemeStyles';
import {getTagForDisplay} from '@libs/TransactionUtils';
import type TransactionDataCellProps from './TransactionDataCellProps';

function TagCell({shouldUseNarrowLayout, shouldShowTooltip, transactionItem}: TransactionDataCellProps) {
    const icons = useMemoizedLazyExpensifyIcons(['Tag']);
    const styles = useThemeStyles();
    return shouldUseNarrowLayout ? (
        <TextWithIconCell
            icon={icons.Tag}
            showTooltip={shouldShowTooltip}
            text={getTagForDisplay(transactionItem)}
            textStyle={[styles.textMicro, styles.mnh0]}
        />
    ) : (
        <TextWithTooltip
            shouldShowTooltip={shouldShowTooltip}
            text={getTagForDisplay(transactionItem)}
            numberOfLines={1}
            style={[styles.lineHeightLarge, styles.justifyContentCenter]}
        />
    );
}

export default TagCell;
