import React from 'react';
import TextWithTooltip from '@components/TextWithTooltip';
import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

type TotalCellProps = {
    total: number;
    currency: string;
    isScanning?: boolean;
};

function TotalCell({total, currency, isScanning = false}: TotalCellProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {convertToDisplayString} = useCurrencyListActions();
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
