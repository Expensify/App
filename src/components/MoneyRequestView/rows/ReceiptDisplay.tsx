import React from 'react';
import {View} from 'react-native';
import type {StyleProp, ViewStyle} from 'react-native';
import {ReceiptAuditMessages} from '@components/ReceiptAudit';
import ReportActionItemImage from '@components/ReportActionItem/ReportActionItemImage';
import useThemeStyles from '@hooks/useThemeStyles';
import type {ThumbnailAndImageURI} from '@libs/ReceiptUtils';
import type {Report, Transaction} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

type ReceiptURIs = ThumbnailAndImageURI;

type ReceiptDisplayProps = {
    transaction: Transaction | undefined;
    report?: Report;
    receiptURIs: ReceiptURIs | undefined;
    receiptStyle: StyleProp<ViewStyle>;
    fillSpace: boolean;
    showBorderlessLoading: boolean;
    isReceiptOfflinePending: boolean;
    readonly: boolean;
    canEditReceipt: boolean;
    mergeTransactionID?: string;
    onLoad: () => void;
    onLoadFailure: () => void;
    auditMessages: string[];
    shouldShowAuditMessages: boolean;
    auditMessagesStyle?: StyleProp<ViewStyle>;
    children?: React.ReactNode;
};

function ReceiptDisplay({
    transaction,
    report,
    receiptURIs,
    receiptStyle,
    fillSpace,
    showBorderlessLoading,
    isReceiptOfflinePending,
    readonly,
    canEditReceipt,
    mergeTransactionID,
    onLoad,
    onLoadFailure,
    auditMessages,
    shouldShowAuditMessages,
    auditMessagesStyle,
    children,
}: ReceiptDisplayProps) {
    const styles = useThemeStyles();

    return (
        <>
            <View style={[styles.getMoneyRequestViewImage(showBorderlessLoading), receiptStyle, showBorderlessLoading && styles.flex1]}>
                <View style={[styles.flex1, isReceiptOfflinePending && styles.offlineFeedbackPending]}>
                    <ReportActionItemImage
                        shouldUseThumbnailImage={!fillSpace}
                        shouldUseFullHeight={fillSpace}
                        thumbnail={receiptURIs?.thumbnail}
                        fileExtension={receiptURIs?.fileExtension}
                        isThumbnail={receiptURIs?.isThumbnail}
                        image={receiptURIs?.image}
                        isLocalFile={receiptURIs?.isLocalFile}
                        filename={receiptURIs?.filename}
                        transaction={transaction}
                        enablePreviewModal
                        readonly={readonly || !canEditReceipt}
                        mergeTransactionID={mergeTransactionID}
                        report={report}
                        onLoad={onLoad}
                        onLoadFailure={onLoadFailure}
                    />
                </View>
                {children}
            </View>
            {shouldShowAuditMessages && (
                <View style={[styles.mt3, isEmptyObject(auditMessages) && styles.mb3, auditMessagesStyle]}>
                    <ReceiptAuditMessages notes={auditMessages} />
                </View>
            )}
        </>
    );
}

export default ReceiptDisplay;
export type {ReceiptURIs, ReceiptDisplayProps};
