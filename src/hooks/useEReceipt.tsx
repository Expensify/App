import * as eReceiptBGs from '@components/Icon/EReceiptBGs';
import * as MCCIcons from '@components/Icon/MCCIcons';
import type {TransactionListItemType} from '@components/Search/SearchList/ListItem/types';

import {getTransactionDetails} from '@libs/ReportUtils';
import {getTripEReceiptIcon} from '@libs/TripReservationUtils';

import CONST from '@src/CONST';
import type {Transaction} from '@src/types/onyx';

import {useMemoizedLazyExpensifyIcons} from './useLazyAsset';
import useStyleUtils from './useStyleUtils';

const backgroundImages = {
    [CONST.ERECEIPT_COLORS.YELLOW]: eReceiptBGs.EReceiptBGYellow,
    [CONST.ERECEIPT_COLORS.ICE]: eReceiptBGs.EReceiptBGIce,
    [CONST.ERECEIPT_COLORS.BLUE]: eReceiptBGs.EReceiptBGBlue,
    [CONST.ERECEIPT_COLORS.GREEN]: eReceiptBGs.EReceiptBGGreen,
    [CONST.ERECEIPT_COLORS.TANGERINE]: eReceiptBGs.EReceiptBGTangerine,
    [CONST.ERECEIPT_COLORS.PINK]: eReceiptBGs.EReceiptBGPink,
};

export default function useEReceipt(transactionData: Transaction | TransactionListItemType | undefined, fileExtension?: string, isReceiptThumbnail?: boolean) {
    const StyleUtils = useStyleUtils();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Plane', 'Bed']);

    const colorCode = isReceiptThumbnail ? StyleUtils.getFileExtensionColorCode(fileExtension) : StyleUtils.getEReceiptColorCode(transactionData);
    const colorStyles = StyleUtils.getEReceiptColorStyles(colorCode);
    const primaryColor = colorStyles?.backgroundColor;
    const secondaryColor = colorStyles?.color;
    const titleColor = colorStyles?.titleColor;
    const transactionDetails = getTransactionDetails(transactionData);
    const transactionMCCGroup = transactionDetails?.mccGroup;
    const MCCIcon = transactionMCCGroup ? MCCIcons[`${transactionMCCGroup}`] : undefined;
    const tripIcon = getTripEReceiptIcon(expensifyIcons, transactionData);

    const backgroundImage = backgroundImages[colorCode];

    return {
        primaryColor,
        secondaryColor,
        titleColor,
        MCCIcon,
        tripIcon,
        backgroundImage,
    };
}
