import React from 'react';
import AttachmentModal from '@components/AttachmentModal';
import PressableWithoutFocus from '@components/Pressable/PressableWithoutFocus';
import ReceiptImage from '@components/ReceiptImage';
import {ShowContextMenuContext} from '@components/ShowContextMenuContext';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import tryResolveUrlFromApiRoot from '@libs/tryResolveUrlFromApiRoot';
import CONST from '@src/CONST';
import type {Transaction} from '@src/types/onyx';

type ReportActionItemImageProps = {
    /** thumbnail URI for the image */
    thumbnail?: string | number;

    /** URI for the image or local numeric reference for the image  */
    image: string | number;

    /** whether or not to enable the image preview modal */
    enablePreviewModal?: boolean;

    /* The transaction associated with this image, if any. Passed for handling eReceipts. */
    transaction?: Transaction;

    /** whether thumbnail is refer the local file or not */
    isLocalFile?: boolean;

    /** whether the receipt can be replaced */
    canEditReceipt?: boolean;
};

/**
 * An image with an optional thumbnail that fills its parent container. If the thumbnail is passed,
 * we try to resolve both the image and thumbnail from the API. Similar to ImageRenderer, we show
 * and optional preview modal as well.
 */

function ReportActionItemImage({thumbnail, image, enablePreviewModal = false, transaction, canEditReceipt = false, isLocalFile = false}: ReportActionItemImageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const imageSource = tryResolveUrlFromApiRoot(image ?? '');

    if (enablePreviewModal) {
        return (
            <ShowContextMenuContext.Consumer>
                {({report}) => (
                    // @ts-expect-error TODO: Remove this once AttachmentModal (https://github.com/Expensify/App/issues/25130) is migrated to TypeScript.
                    <AttachmentModal
                        source={imageSource}
                        isAuthTokenRequired={!isLocalFile}
                        report={report}
                        isReceiptAttachment
                        canEditReceipt={canEditReceipt}
                        allowToDownload
                        originalFileName={transaction?.filename}
                    >
                        {
                            // @ts-expect-error TODO: Remove this once AttachmentModal (https://github.com/Expensify/App/issues/25130) is migrated to TypeScript.
                            ({show}) => (
                                <PressableWithoutFocus
                                    // @ts-expect-error TODO: Remove this once AttachmentModal (https://github.com/Expensify/App/issues/25130) is migrated to TypeScript.
                                    style={[styles.noOutline, styles.w100, styles.h100]}
                                    onPress={show}
                                    accessibilityRole={CONST.ACCESSIBILITY_ROLE.IMAGEBUTTON}
                                    accessibilityLabel={translate('accessibilityHints.viewAttachment')}
                                >
                                    <ReceiptImage
                                        transaction={transaction}
                                        receiptFileName={thumbnail as string}
                                        receiptPath={image as string}
                                    />
                                </PressableWithoutFocus>
                            )
                        }
                    </AttachmentModal>
                )}
            </ShowContextMenuContext.Consumer>
        );
    }

    return (
        <ReceiptImage
            transaction={transaction}
            receiptFileName={thumbnail as string}
            receiptPath={image as string}
        />
    );
}

ReportActionItemImage.displayName = 'ReportActionItemImage';

export default ReportActionItemImage;
