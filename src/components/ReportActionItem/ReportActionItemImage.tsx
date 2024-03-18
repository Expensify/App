import Str from 'expensify-common/lib/str';
import React, {useMemo} from 'react';
import type {ReactElement} from 'react';
import type {ImageSourcePropType, ViewStyle} from 'react-native';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import EReceiptThumbnail from '@components/EReceiptThumbnail';
import * as Expensicons from '@components/Icon/Expensicons';
import Image from '@components/Image';
import PDFThumbnail from '@components/PDFThumbnail';
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

    /** Filename of attachment */
    filename?: string;

    /** Whether there are other images displayed in the same parent container */
    isSingleImage?: boolean;
};

/**
 * An image with an optional thumbnail that fills its parent container. If the thumbnail is passed,
 * we try to resolve both the image and thumbnail from the API. Similar to ImageRenderer, we show
 * and optional preview modal as well.
 */

function ReportActionItemImage({thumbnail, image, enablePreviewModal = false, transaction, isLocalFile = false, filename, isSingleImage = true}: ReportActionItemImageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const attachmentModalSource = tryResolveUrlFromApiRoot(image ?? '');
    const thumbnailSource = tryResolveUrlFromApiRoot(thumbnail ?? '');
    const isEReceipt = transaction && TransactionUtils.hasEReceipt(transaction);

    let receiptImageComponent: ReactElement;

    const imageSource = useMemo(() => {
        if (thumbnail) {
            return typeof thumbnail === 'string' ? {uri: thumbnail} : thumbnail;
        }

        return typeof image === 'string' ? {uri: image} : image;
    }, [image, thumbnail]);

    if (isEReceipt) {
        receiptImageComponent = (
            <View style={[styles.w100, styles.h100]}>
                <EReceiptThumbnail
                    transactionID={transaction.transactionID}
                    iconSize={isSingleImage ? 'medium' : 'small'}
                />
            </View>
        );
    } else if (thumbnail && !isLocalFile) {
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
    } else if (isLocalFile && filename && Str.isPDF(filename) && typeof attachmentModalSource === 'string') {
        receiptImageComponent = (
            <PDFThumbnail
                previewSourceURL={attachmentModalSource}
                style={[styles.w100, styles.h100]}
            />
        );
    } else {
        receiptImageComponent = (
            <Image
                source={imageSource}
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
                        onPress={() => Navigation.navigate(ROUTES.TRANSACTION_RECEIPT.getRoute(report?.reportID ?? '', transaction?.transactionID ?? ''))}
                        accessibilityLabel={translate('accessibilityHints.viewAttachment')}
                        accessibilityRole={CONST.ROLE.BUTTON}
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
