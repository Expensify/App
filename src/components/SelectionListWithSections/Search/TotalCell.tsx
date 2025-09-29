import React from 'react';
import type {StyleProp, TextStyle} from 'react-native';
import TextWithTooltip from '@components/TextWithTooltip';
import useThemeStyles from '@hooks/useThemeStyles';
import {convertToDisplayString} from '@libs/CurrencyUtils';

type TotalCellProps = {
    total: number;
    currency: string;
    textStyle?: StyleProp<TextStyle>;
};

function TotalCell({total, currency, textStyle}: TotalCellProps) {
    const styles = useThemeStyles();

    return (
        <TextWithTooltip
            shouldShowTooltip
            text={convertToDisplayString(total, currency)}
            style={[styles.optionDisplayName, styles.pre, styles.justifyContentCenter, styles.textBold, styles.textAlignRight, textStyle]}
        />
    );
}

TotalCell.displayName = 'TotalCell';

export default TotalCell;
