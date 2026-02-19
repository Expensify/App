import React from 'react';
import TextWithTooltip from '@components/TextWithTooltip';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {convertToDisplayString} from '@libs/CurrencyUtils';

type TotalCellProps = {
    total: number;
    currency: string;
    isScanning?: boolean;
};

function TotalCell({total, currency, isScanning = false}: TotalCellProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const displayText = isScanning ? translate('iou.receiptStatusTitle') : convertToDisplayString(total, currency);
    return (
        <TextWithTooltip
            testID="TotalCell"
            shouldShowTooltip
            text={displayText}
            style={[styles.optionDisplayName, styles.pre, styles.justifyContentCenter, styles.textBold, styles.textAlignRight, styles.fontWeightNormal]}
        />
    );
}

export default TotalCell;
