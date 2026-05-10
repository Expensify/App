import {Str} from 'expensify-common';
import React from 'react';
import {View} from 'react-native';
import type {LayoutChangeEvent, StyleProp, ViewStyle} from 'react-native';
import ActivityIndicator from '@components/ActivityIndicator';
import PDFThumbnail from '@components/PDFThumbnail';
import PressableWithoutFocus from '@components/Pressable/PressableWithoutFocus';
import ReceiptImage from '@components/ReceiptImage';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';
import type {IOUAction, IOUType} from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {ReceiptSource} from '@src/types/onyx/Transaction';

type ConfirmationReceiptThumbnailProps = {
    /** ID of the transaction whose receipt is being previewed */
    transactionID: string | undefined;

    /** ID of the report the transaction belongs to */
    reportID: string;

    /** Action being performed on the transaction (drives navigation target) */
    action: IOUAction;

    /** Type of IOU being confirmed (drives navigation target) */
    iouType: Exclude<IOUType, typeof CONST.IOU.TYPE.REQUEST | typeof CONST.IOU.TYPE.SEND>;

    /** Whether the receipt is editable; switches navigation between preview and view-only routes */
    isReceiptEditable: boolean;

    /** Whether the receipt should be displayable (false suppresses navigation on press) */
    shouldDisplayReceipt: boolean;

    /** Whether the receipt is currently being stitched / loaded */
    isLoadingReceipt: boolean;

    /** Whether compact mode is active (drives container styling and onLayout wiring) */
    isCompactMode: boolean;

    /** Whether the receipt source is a local file (vs. a remote URI) */
    isLocalFile: boolean | undefined;

    /** Whether the resolved source is a thumbnail (suppresses press for non-PDF case) */
    isThumbnail: boolean | undefined;

    /** Extension of the receipt file (drives image rendering hints) */
    fileExtension: string | undefined;

    /** Filename of the receipt (used to detect PDF) */
    receiptFilename: string;

    /** Resolved thumbnail URL/path (used as the auth-required hint when present) */
    receiptThumbnail: string | undefined;

    /** Resolved receipt image URL (used as the PDF preview source) */
    resolvedReceiptImage: string | undefined;

    /** Stable image source captured for non-flashing display (from useReceiptThumbnailSource) */
    effectiveReceiptSource: ReceiptSource;

    /** Whether the active transaction is an odometer-driven distance request */
    isOdometerDistanceRequest: boolean;

    /** Whether the active transaction is a distance request (drives object-position behaviour) */
    isDistanceRequest: boolean;

    /** Compact-mode container style (undefined when not in compact mode) */
    compactReceiptContainerStyle: StyleProp<ViewStyle> | undefined;

    /** Callback for PDF load errors */
    onPDFLoadError?: () => void;

    /** Callback when the PDF requests a password */
    onPDFPassword?: () => void;

    /** Layout callback used in compact mode to capture container width */
    onCompactReceiptContainerLayout: (event: LayoutChangeEvent) => void;

    /** Image-load callback that captures aspect ratio and ends the receipt-load span */
    onReceiptLoad: (event?: {nativeEvent: {width: number; height: number}}) => void;
};

function ConfirmationReceiptThumbnail({
    transactionID,
    reportID,
    action,
    iouType,
    isReceiptEditable,
    shouldDisplayReceipt,
    isLoadingReceipt,
    isCompactMode,
    isLocalFile,
    isThumbnail,
    fileExtension,
    receiptFilename,
    receiptThumbnail,
    resolvedReceiptImage,
    effectiveReceiptSource,
    isOdometerDistanceRequest,
    isDistanceRequest,
    compactReceiptContainerStyle,
    onPDFLoadError,
    onPDFPassword,
    onCompactReceiptContainerLayout,
    onReceiptLoad,
}: ConfirmationReceiptThumbnailProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const receiptContainerStyle = isCompactMode && compactReceiptContainerStyle ? compactReceiptContainerStyle : styles.expenseViewImageSmall;
    const receiptThumbnailStyle = [styles.h100, styles.flex1];
    const isPDF = isLocalFile && Str.isPDF(receiptFilename);

    const navigateToReceipt = () => {
        if (!transactionID) {
            return;
        }
        Navigation.navigate(
            isReceiptEditable ? ROUTES.MONEY_REQUEST_RECEIPT_PREVIEW.getRoute(reportID, transactionID, action, iouType) : ROUTES.TRANSACTION_RECEIPT.getRoute(reportID, transactionID),
        );
    };

    return (
        <View
            style={[styles.moneyRequestImage, receiptContainerStyle, isLoadingReceipt && [styles.justifyContentCenter, styles.alignItemsCenter]]}
            onLayout={isCompactMode ? onCompactReceiptContainerLayout : undefined}
        >
            {isLoadingReceipt && <ActivityIndicator reasonAttributes={{context: 'MoneyRequestConfirmationListFooter.receiptThumbnail'}} />}
            {!isLoadingReceipt &&
                (isPDF ? (
                    <PressableWithoutFocus
                        onPress={navigateToReceipt}
                        accessibilityRole={CONST.ROLE.BUTTON}
                        accessibilityLabel={translate('accessibilityHints.viewAttachment')}
                        sentryLabel={CONST.SENTRY_LABEL.REQUEST_CONFIRMATION_LIST.PDF_RECEIPT_THUMBNAIL}
                        disabled={!shouldDisplayReceipt}
                        disabledStyle={styles.cursorDefault}
                        style={styles.h100}
                    >
                        <PDFThumbnail
                            // eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style -- resolvedReceiptImage is guaranteed string when isLocalFile + PDF
                            previewSourceURL={resolvedReceiptImage as string}
                            style={styles.h100}
                            onLoadError={onPDFLoadError}
                            onPassword={onPDFPassword}
                        />
                    </PressableWithoutFocus>
                ) : (
                    <PressableWithoutFocus
                        onPress={navigateToReceipt}
                        disabled={!shouldDisplayReceipt || isThumbnail}
                        accessibilityRole={CONST.ROLE.BUTTON}
                        accessibilityLabel={translate('accessibilityHints.viewAttachment')}
                        sentryLabel={CONST.SENTRY_LABEL.REQUEST_CONFIRMATION_LIST.RECEIPT_THUMBNAIL}
                        disabledStyle={styles.cursorDefault}
                        style={receiptThumbnailStyle}
                    >
                        <ReceiptImage
                            isThumbnail={isThumbnail}
                            source={effectiveReceiptSource}
                            isAuthTokenRequired={!!receiptThumbnail && !isLocalFile}
                            fileExtension={fileExtension}
                            shouldUseThumbnailImage
                            shouldUseInitialObjectPosition={isDistanceRequest}
                            shouldUseFullHeight={isCompactMode}
                            onLoad={onReceiptLoad}
                            resizeMode={isOdometerDistanceRequest ? 'contain' : undefined}
                        />
                    </PressableWithoutFocus>
                ))}
        </View>
    );
}

export default ConfirmationReceiptThumbnail;
