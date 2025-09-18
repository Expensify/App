import {useMemo} from 'react';
import * as eReceiptBGs from '@components/Icon/EReceiptBGs';
import * as MCCIcons from '@components/Icon/MCCIcons';
import type {TransactionListItemType} from '@components/SelectionList/types';
import {getTransactionDetails} from '@libs/ReportUtils';
import {getTripEReceiptIcon} from '@libs/TripReservationUtils';
import CONST from '@src/CONST';
import type {Transaction} from '@src/types/onyx';
import useStyleUtils from './useStyleUtils';

const backgroundImages = {
    [CONST.ERECEIPT_COLORS.YELLOW]: eReceiptBGs.EReceiptBG_Yellow,
    [CONST.ERECEIPT_COLORS.ICE]: eReceiptBGs.EReceiptBG_Ice,
    [CONST.ERECEIPT_COLORS.BLUE]: eReceiptBGs.EReceiptBG_Blue,
    [CONST.ERECEIPT_COLORS.GREEN]: eReceiptBGs.EReceiptBG_Green,
    [CONST.ERECEIPT_COLORS.TANGERINE]: eReceiptBGs.EReceiptBG_Tangerine,
    [CONST.ERECEIPT_COLORS.PINK]: eReceiptBGs.EReceiptBG_Pink,
};

export default function useEReceipt(transactionData: Transaction | TransactionListItemType | undefined, fileExtension?: string, isReceiptThumbnail?: boolean) {
    const StyleUtils = useStyleUtils();

    const colorCode = isReceiptThumbnail ? StyleUtils.getFileExtensionColorCode(fileExtension) : StyleUtils.getEReceiptColorCode(transactionData);
    const colorStyles = StyleUtils.getEReceiptColorStyles(colorCode);
    const primaryColor = colorStyles?.backgroundColor;
    const secondaryColor = colorStyles?.color;
    const titleColor = colorStyles?.titleColor;
    const transactionDetails = getTransactionDetails(transactionData);
    const transactionMCCGroup = transactionDetails?.mccGroup;
    const MCCIcon = transactionMCCGroup ? MCCIcons[`${transactionMCCGroup}`] : undefined;
    const tripIcon = getTripEReceiptIcon(transactionData);

    const backgroundImage = useMemo(() => backgroundImages[colorCode], [colorCode]);

    return {
        primaryColor,
        secondaryColor,
        titleColor,
        MCCIcon,
        tripIcon,
        backgroundImage,
    };
}
