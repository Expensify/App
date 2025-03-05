import useThemeStyles from '@hooks/useThemeStyles';
import TextWithTooltip from '@components/TextWithTooltip';
import {getTagForDisplay} from '@libs/TransactionUtils';
import TextWithIconCell from '@components/SelectionList/Search/TextWithIconCell';
import * as Expensicons from '@components/Icon/Expensicons';
import React from 'react';
import colors from '@styles/theme/colors';
import type DataCellProps from './DateCellProps';


function TagCell({isLargeScreenWidth, showTooltip, transactionItem}: DataCellProps) {
    const styles = useThemeStyles();
    return isLargeScreenWidth ? (
        <TextWithTooltip
            shouldShowTooltip={showTooltip}
            text={getTagForDisplay(transactionItem)}
            style={[styles.optionDisplayName, styles.lineHeightLarge, styles.pre, styles.justifyContentCenter,{color:colors.green800}]}
        />
    ) : (
        <TextWithIconCell
            icon={Expensicons.Tag}
            showTooltip={showTooltip}
            text={getTagForDisplay(transactionItem)}
            textStyle={[styles.textMicro, styles.mnh0]}
        />
    );
}

TagCell.displayName = 'TagCell';
export default TagCell;
