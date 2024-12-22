import {Str} from 'expensify-common';
import React, {useState} from 'react';
import {PixelRatio, View} from 'react-native';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import * as FileUtils from '@libs/fileDownload/FileUtils';
import {validateReceipt} from '@libs/ReceiptUtils';
import ReceiptDropUI from '@pages/iou/ReceiptDropUI';
import variables from '@styles/variables';
import * as IOU from '@userActions/IOU';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import type {FileObject} from './AttachmentModal';
import ConfirmModal from './ConfirmModal';
import FullScreenLoadingIndicator from './FullscreenLoadingIndicator';
import Icon from './Icon';
import * as Expensicons from './Icon/Expensicons';
import PDFThumbnail from './PDFThumbnail';
import PressableWithoutFeedback from './Pressable/PressableWithoutFeedback';

type ReceiptEmptyStateProps = {
    /** Whether or not there is an error */
    hasError?: boolean;

    /** Callback to be called on onPress */
    onPress?: () => void;

    disabled?: boolean;

    isThumbnail?: boolean;

    shouldAllowReceiptDrop?: boolean;

    transactionID: string;
};

// Returns an SVG icon indicating that the user should attach a receipt
function ReceiptEmptyState({hasError = false, onPress, disabled = false, isThumbnail = false, shouldAllowReceiptDrop = false, transactionID}: ReceiptEmptyStateProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const theme = useTheme();
    const [receiptImageTopPosition, setReceiptImageTopPosition] = useState(0);
    const [isAttachmentInvalid, setIsAttachmentInvalid] = useState(false);
    const [attachmentInvalidReasonTitle, setAttachmentInvalidReasonTitle] = useState<TranslationPaths>();
    const [attachmentInvalidReason, setAttachmentValidReason] = useState<TranslationPaths>();
    const [pdfFile, setPdfFile] = useState<null | FileObject>(null);
    const [isLoadingReceipt, setIsLoadingReceipt] = useState(false);

    /**
     * Sets the upload receipt error modal content when an invalid receipt is uploaded
     */
    const setUploadReceiptError = (isInvalid: boolean, title: TranslationPaths, reason: TranslationPaths) => {
        setIsAttachmentInvalid(isInvalid);
        setAttachmentInvalidReasonTitle(title);
        setAttachmentValidReason(reason);
        setPdfFile(null);
    };

    const setReceipt = (originalFile: FileObject, isPdfValidated?: boolean) => {
        validateReceipt(originalFile).then((result) => {
            if (!result.isValid) {
                if (result.title && result.reason) {
                    setUploadReceiptError(true, result.title, result.reason);
                }
                return;
            }

            // If we have a pdf file and if it is not validated then set the pdf file for validation and return
            if (Str.isPDF(originalFile.name ?? '') && !isPdfValidated) {
                setPdfFile(originalFile);
                return;
            }

            // With the image size > 24MB, we use manipulateAsync to resize the image.
            // It takes a long time so we should display a loading indicator while the resize image progresses.
            if (Str.isImage(originalFile.name ?? '') && (originalFile?.size ?? 0) > CONST.API_ATTACHMENT_VALIDATIONS.MAX_SIZE) {
                setIsLoadingReceipt(true);
            }

            FileUtils.resizeImageIfNeeded(originalFile).then((file) => {
                setIsLoadingReceipt(false);
                const source = URL.createObjectURL(file as Blob);
                if (transactionID) {
                    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                    IOU.setMoneyRequestReceipt(transactionID, source, file.name || '', true);
                }
            });
        });
    };

    const hideRecieptModal = () => {
        setIsAttachmentInvalid(false);
    };

    const PDFThumbnailView = pdfFile ? (
        <PDFThumbnail
            style={styles.invisiblePDF}
            previewSourceURL={pdfFile.uri ?? ''}
            onLoadSuccess={() => {
                setPdfFile(null);
                setReceipt(pdfFile, true);
            }}
            onPassword={() => {
                setUploadReceiptError(true, 'attachmentPicker.attachmentError', 'attachmentPicker.protectedPDFNotSupported');
            }}
            onLoadError={() => {
                setUploadReceiptError(true, 'attachmentPicker.attachmentError', 'attachmentPicker.errorWhileSelectingCorruptedAttachment');
            }}
        />
    ) : null;

    const Wrapper = onPress ? PressableWithoutFeedback : View;

    return (
        <Wrapper
            accessibilityRole="imagebutton"
            accessibilityLabel={translate('receipt.upload')}
            onPress={onPress}
            disabled={disabled}
            disabledStyle={styles.cursorDefault}
            style={[
                styles.alignItemsCenter,
                styles.justifyContentCenter,
                styles.moneyRequestImage,
                isThumbnail ? styles.moneyRequestAttachReceiptThumbnail : styles.moneyRequestAttachReceipt,
                hasError && styles.borderColorDanger,
            ]}
        >
            {isLoadingReceipt && <FullScreenLoadingIndicator />}
            {PDFThumbnailView}
            {shouldAllowReceiptDrop && !disabled && (
                <ReceiptDropUI
                    onDrop={(e) => {
                        const file = e?.dataTransfer?.files[0];
                        if (file) {
                            file.uri = URL.createObjectURL(file);
                            setReceipt(file);
                        }
                    }}
                    receiptImageTopPosition={receiptImageTopPosition}
                />
            )}
            <ConfirmModal
                title={attachmentInvalidReasonTitle ? translate(attachmentInvalidReasonTitle) : ''}
                onConfirm={hideRecieptModal}
                onCancel={hideRecieptModal}
                isVisible={isAttachmentInvalid}
                prompt={attachmentInvalidReason ? translate(attachmentInvalidReason) : ''}
                confirmText={translate('common.close')}
                shouldShowCancelButton={false}
            />
            <View onLayout={({nativeEvent}) => setReceiptImageTopPosition(PixelRatio.roundToNearestPixel((nativeEvent.layout as DOMRect).top))}>
                <Icon
                    fill={theme.border}
                    src={Expensicons.Receipt}
                    width={variables.eReceiptEmptyIconWidth}
                    height={variables.eReceiptEmptyIconWidth}
                />
                {!isThumbnail && (
                    <Icon
                        src={Expensicons.ReceiptPlaceholderPlus}
                        width={variables.avatarSizeSmall}
                        height={variables.avatarSizeSmall}
                        additionalStyles={styles.moneyRequestAttachReceiptThumbnailIcon}
                    />
                )}
            </View>
        </Wrapper>
    );
}

ReceiptEmptyState.displayName = 'ReceiptEmptyState';

export default ReceiptEmptyState;
