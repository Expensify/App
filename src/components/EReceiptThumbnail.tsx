import React, {useMemo, useState} from 'react';
import type {LayoutChangeEvent} from 'react-native';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import * as ReportUtils from '@libs/ReportUtils';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Transaction} from '@src/types/onyx';
import Icon from './Icon';
import * as eReceiptBGs from './Icon/EReceiptBGs';
import * as Expensicons from './Icon/Expensicons';
import * as MCCIcons from './Icon/MCCIcons';
import Image from './Image';

type EReceiptThumbnailOnyxProps = {
    transaction: OnyxEntry<Transaction>;
};

type EReceiptThumbnailProps = EReceiptThumbnailOnyxProps & {
    /** TransactionID of the transaction this EReceipt corresponds to. It's used by withOnyx HOC */
    // eslint-disable-next-line react/no-unused-prop-types
    transactionID: string;
};

const backgroundImages = {
    [CONST.ERECEIPT_COLORS.YELLOW]: eReceiptBGs.EReceiptBG_Yellow,
    [CONST.ERECEIPT_COLORS.ICE]: eReceiptBGs.EReceiptBG_Ice,
    [CONST.ERECEIPT_COLORS.BLUE]: eReceiptBGs.EReceiptBG_Blue,
    [CONST.ERECEIPT_COLORS.GREEN]: eReceiptBGs.EReceiptBG_Green,
    [CONST.ERECEIPT_COLORS.TANGERINE]: eReceiptBGs.EReceiptBG_Tangerine,
    [CONST.ERECEIPT_COLORS.PINK]: eReceiptBGs.EReceiptBG_Pink,
};

function EReceiptThumbnail({transaction}: EReceiptThumbnailProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();

    const [containerWidth, setContainerWidth] = useState(0);
    const [containerHeight, setContainerHeight] = useState(0);

    const backgroundImage = useMemo(() => backgroundImages[StyleUtils.getEReceiptColorCode(transaction)], [StyleUtils, transaction]);

    const colorStyles = StyleUtils.getEReceiptColorStyles(StyleUtils.getEReceiptColorCode(transaction));
    const primaryColor = colorStyles?.backgroundColor;
    const secondaryColor = colorStyles?.color;

    const onContainerLayout = (event: LayoutChangeEvent) => {
        const {width, height} = event.nativeEvent.layout;
        setContainerWidth(width);
        setContainerHeight(height);
    };

    const transactionDetails = ReportUtils.getTransactionDetails(transaction);
    const transactionMCCGroup = transactionDetails?.mccGroup;
    const MCCIcon = transactionMCCGroup ? MCCIcons[`${transactionMCCGroup}`] : undefined;

    const isSmall = containerWidth && containerWidth < variables.eReceiptThumbnailSmallBreakpoint;
    const isMedium = containerWidth && containerWidth < variables.eReceiptThumbnailMediumBreakpoint;

    let receiptIconWidth: number = variables.eReceiptIconWidth;
    let receiptIconHeight: number = variables.eReceiptIconHeight;
    let receiptMCCSize: number = variables.eReceiptMCCHeightWidth;

    if (isSmall) {
        receiptIconWidth = variables.eReceiptIconWidthSmall;
        receiptIconHeight = variables.eReceiptIconHeightSmall;
        receiptMCCSize = variables.eReceiptMCCHeightWidthSmall;
    } else if (isMedium) {
        receiptIconWidth = variables.eReceiptIconWidthMedium;
        receiptIconHeight = variables.eReceiptIconHeightMedium;
        receiptMCCSize = variables.eReceiptMCCHeightWidthMedium;
    }

    return (
        <View
            style={[
                styles.flex1,
                primaryColor ? StyleUtils.getBackgroundColorStyle(primaryColor) : {},
                styles.overflowHidden,
                styles.alignItemsCenter,
                containerHeight && containerHeight < variables.eReceiptThumnailCenterReceiptBreakpoint ? styles.justifyContentCenter : {},
            ]}
            onLayout={onContainerLayout}
        >
            <Image
                source={backgroundImage}
                style={styles.eReceiptBackgroundThumbnail}
                resizeMode="cover"
            />
            <View style={[styles.alignItemsCenter, styles.ph8, styles.pt8, styles.pb8]}>
                <View style={[StyleUtils.getWidthAndHeightStyle(receiptIconWidth, receiptIconHeight), styles.alignItemsCenter, styles.justifyContentCenter]}>
                    <Icon
                        src={Expensicons.EReceiptIcon}
                        height={receiptIconHeight}
                        width={receiptIconWidth}
                        fill={secondaryColor}
                        additionalStyles={[styles.fullScreen]}
                    />
                    {MCCIcon ? (
                        <Icon
                            src={MCCIcon}
                            height={receiptMCCSize}
                            width={receiptMCCSize}
                            fill={primaryColor}
                        />
                    ) : null}
                </View>
            </View>
        </View>
    );
}

EReceiptThumbnail.displayName = 'EReceiptThumbnail';

export default withOnyx<EReceiptThumbnailProps, EReceiptThumbnailOnyxProps>({
    transaction: {
        key: ({transactionID}) => `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`,
    },
})(EReceiptThumbnail);
