import {useMemo} from 'react';
import {useOnyx} from 'react-native-onyx';
import * as eReceiptBGs from '@components/Icon/EReceiptBGs';
import * as MCCIcons from '@components/Icon/MCCIcons';
import {getTransactionDetails} from '@libs/ReportUtils';
import {getTripEReceiptIcon} from '@libs/TripReservationUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import useStyleUtils from './useStyleUtils';

const backgroundImages = {
    [CONST.ERECEIPT_COLORS.YELLOW]: eReceiptBGs.EReceiptBG_Yellow,
    [CONST.ERECEIPT_COLORS.ICE]: eReceiptBGs.EReceiptBG_Ice,
    [CONST.ERECEIPT_COLORS.BLUE]: eReceiptBGs.EReceiptBG_Blue,
    [CONST.ERECEIPT_COLORS.GREEN]: eReceiptBGs.EReceiptBG_Green,
    [CONST.ERECEIPT_COLORS.TANGERINE]: eReceiptBGs.EReceiptBG_Tangerine,
    [CONST.ERECEIPT_COLORS.PINK]: eReceiptBGs.EReceiptBG_Pink,
};

export default function useEReceipt(transactionID: string | undefined, fileExtension?: string, isReceiptThumbnail?: boolean) {
    const StyleUtils = useStyleUtils();

    const [transaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`);
    const colorCode = isReceiptThumbnail ? StyleUtils.getFileExtensionColorCode(fileExtension) : StyleUtils.getEReceiptColorCode(transaction);
    const colorStyles = StyleUtils.getEReceiptColorStyles(colorCode);
    const primaryColor = colorStyles?.backgroundColor;
    const secondaryColor = colorStyles?.color;
    const transactionDetails = getTransactionDetails(transaction);
    const transactionMCCGroup = transactionDetails?.mccGroup;
    const MCCIcon = transactionMCCGroup ? MCCIcons[`${transactionMCCGroup}`] : undefined;
    const tripIcon = getTripEReceiptIcon(transaction);

    const backgroundImage = useMemo(() => backgroundImages[colorCode], [colorCode]);

    return {
        primaryColor,
        secondaryColor,
        MCCIcon,
        tripIcon,
        backgroundImage,
    };
}
