import React from 'react';
import TextWithTooltip from '@components/TextWithTooltip';
import useThemeStyles from '@hooks/useThemeStyles';
import {convertToDisplayString} from '@libs/CurrencyUtils';

type TotalCellProps = {
    total: number;
    currency: string;
};

function TotalCell({total, currency}: TotalCellProps) {
    const styles = useThemeStyles();

    return (
        <TextWithTooltip
            testID="TotalCell"
            shouldShowTooltip
            text={convertToDisplayString(total, currency)}
            style={[styles.optionDisplayName, styles.pre, styles.justifyContentCenter, styles.textBold, styles.textAlignRight, styles.fontWeightNormal]}
        />
    );
}

export default TotalCell;
