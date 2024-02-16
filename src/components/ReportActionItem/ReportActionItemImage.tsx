import Str from 'expensify-common/lib/str';
import React from 'react';
import type {ReactElement} from 'react';
import type {ImageSourcePropType, ViewStyle} from 'react-native';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import EReceiptThumbnail from '@components/EReceiptThumbnail';
import * as Expensicons from '@components/Icon/Expensicons';
import Image from '@components/Image';
import PressableWithoutFocus from '@components/Pressable/PressableWithoutFocus';
import {ShowContextMenuContext} from '@components/ShowContextMenuContext';
import ThumbnailImage from '@components/ThumbnailImage';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import * as TransactionUtils from '@libs/TransactionUtils';
import tryResolveUrlFromApiRoot from '@libs/tryResolveUrlFromApiRoot';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {Transaction} from '@src/types/onyx';

type ReportActionItemImageProps = {
    /** thumbnail URI for the image */
    thumbnail?: string | ImageSourcePropType | null;

    /** URI for the image or local numeric reference for the image  */
    image?: string | ImageSourcePropType;

    /** whether to enable the image preview modal */
    enablePreviewModal?: boolean;

    /* The transaction associated with this image, if any. Passed for handling eReceipts. */
    transaction?: OnyxEntry<Transaction>;

    /** whether thumbnail is refer the local file or not */
    isLocalFile?: boolean;

    /** Whether there are other images displayed in the same parent container */
    isSingleImage?: boolean;
};

/**
 * An image with an optional thumbnail that fills its parent container. If the thumbnail is passed,
 * we try to resolve both the image and thumbnail from the API. Similar to ImageRenderer, we show
 * and optional preview modal as well.
 */

function ReportActionItemImage({thumbnail, image, enablePreviewModal = false, transaction, isLocalFile = false, isSingleImage = true}: ReportActionItemImageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const imageSource = tryResolveUrlFromApiRoot(image ?? '');
    const thumbnailSource = tryResolveUrlFromApiRoot(thumbnail ?? '');
    const isEReceipt = transaction && TransactionUtils.hasEReceipt(transaction);

    let receiptImageComponent: ReactElement;

    if (isEReceipt) {
        receiptImageComponent = (
            <View style={[styles.w100, styles.h100]}>
                <EReceiptThumbnail
                    transactionID={transaction.transactionID}
                    iconSize={isSingleImage ? 'medium' : 'small'}
                />
            </View>
        );
    } else if (thumbnail && !isLocalFile && !Str.isPDF(imageSource as string)) {
        receiptImageComponent = (
            <ThumbnailImage
                previewSourceURL={thumbnailSource}
                style={[styles.w100, styles.h100]}
                isAuthTokenRequired
                fallbackIcon={Expensicons.Receipt}
                fallbackIconSize={isSingleImage ? variables.iconSizeSuperLarge : variables.iconSizeExtraLarge}
                shouldDynamicallyResize={false}
            />
        );
    } else {
        receiptImageComponent = (
            <Image
                source={{uri: thumbnail ?? image}}
                style={[styles.w100, styles.h100]}
            />
        );
    }

    if (enablePreviewModal) {
        return (
            <ShowContextMenuContext.Consumer>
                {({report}) => (
                    <PressableWithoutFocus
                        style={[styles.w100, styles.h100, styles.noOutline as ViewStyle]}
                        onPress={() => {
                            Navigation.navigate(ROUTES.RECEIPT.getRoute(transaction?.transactionID ?? '', report?.reportID ?? ''));
                        }}
                        accessibilityRole={CONST.ROLE.BUTTON}
                        accessibilityLabel={translate('accessibilityHints.viewAttachment')}
                    >
                        {receiptImageComponent}
                    </PressableWithoutFocus>
                )}
            </ShowContextMenuContext.Consumer>
        );
    }

    return receiptImageComponent;
}

ReportActionItemImage.displayName = 'ReportActionItemImage';

export default ReportActionItemImage;
