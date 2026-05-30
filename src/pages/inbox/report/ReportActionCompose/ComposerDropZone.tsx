import React from 'react';
import DragAndDropConsumer from '@components/DragAndDrop/Consumer';
import DropZoneUI from '@components/DropZone/DropZoneUI';
import DualDropZone from '@components/DropZone/DualDropZone';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePreferredPolicy from '@hooks/usePreferredPolicy';
import useReportIsArchived from '@hooks/useReportIsArchived';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {getParentReport, isChatRoom, isGroupChat, isInvoiceReport, isReportApproved, isSettled, temporary_getMoneyRequestOptions} from '@libs/ReportUtils';
import {hasReceipt as hasReceiptTransactionUtils} from '@libs/TransactionUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import useAttachmentPicker from './useAttachmentPicker';
import useReceiptDrop from './useReceiptDrop';
import useShouldAddOrReplaceReceipt from './useShouldAddOrReplaceReceipt';

type ComposerDropZoneProps = {
    reportID: string;
    children: React.ReactNode;
};

type RichDropZoneProps = {
    reportID: string;
    shouldAddOrReplaceReceipt: boolean;
    transactionID: string | undefined;
    onAttachmentDrop: (dragEvent: DragEvent) => void;
    onReceiptDrop: (dragEvent: DragEvent) => void;
    children: React.ReactNode;
};

function SimpleDropZone({onAttachmentDrop, children}: {onAttachmentDrop: (dragEvent: DragEvent) => void; children: React.ReactNode}) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['MessageInABottle']);

    return (
        <>
            {children}
            <DragAndDropConsumer onDrop={onAttachmentDrop}>
                <DropZoneUI
                    icon={icons.MessageInABottle}
                    dropTitle={translate('dropzone.addAttachments')}
                    dropStyles={styles.attachmentDropOverlay(true)}
                    dropTextStyles={styles.attachmentDropText}
                    dashedBorderStyles={[styles.dropzoneArea, styles.easeInOpacityTransition, styles.activeDropzoneDashedBorder(theme.attachmentDropBorderColorActive, true)]}
                />
            </DragAndDropConsumer>
        </>
    );
}

function RichDropZone({reportID, shouldAddOrReplaceReceipt, transactionID, onAttachmentDrop, onReceiptDrop, children}: RichDropZoneProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['MessageInABottle']);
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();

    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${report?.policyID}`);
    const [betas] = useOnyx(ONYXKEYS.BETAS);
    const [transaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${getNonEmptyStringOnyxID(transactionID)}`);
    const isReportArchived = useReportIsArchived(report?.reportID);
    const {isRestrictedToPreferredPolicy} = usePreferredPolicy();

    const reportParticipantIDs = Object.keys(report?.participants ?? {})
        .map(Number)
        .filter((accountID) => accountID !== currentUserPersonalDetails.accountID);

    const hasReceipt = hasReceiptTransactionUtils(transaction);

    const parentReport = getParentReport(report);
    const isSettledOrApproved = isSettled(report) || isSettled(parentReport) || isReportApproved({report}) || isReportApproved({report: parentReport});
    const hasMoneyRequestOptions = !!temporary_getMoneyRequestOptions(report, policy, reportParticipantIDs, betas, isReportArchived, isRestrictedToPreferredPolicy).length;
    const canModifyReceipt = shouldAddOrReplaceReceipt && !isSettledOrApproved;
    const shouldDisplayDualDropZone = canModifyReceipt || hasMoneyRequestOptions;

    if (shouldDisplayDualDropZone) {
        return (
            <>
                {children}
                <DualDropZone
                    isEditing={shouldAddOrReplaceReceipt && hasReceipt}
                    onAttachmentDrop={onAttachmentDrop}
                    onReceiptDrop={onReceiptDrop}
                    shouldAcceptSingleReceipt={shouldAddOrReplaceReceipt}
                />
            </>
        );
    }

    return (
        <>
            {children}
            <DragAndDropConsumer onDrop={onAttachmentDrop}>
                <DropZoneUI
                    icon={icons.MessageInABottle}
                    dropTitle={translate('dropzone.addAttachments')}
                    dropStyles={styles.attachmentDropOverlay(true)}
                    dropTextStyles={styles.attachmentDropText}
                    dashedBorderStyles={[styles.dropzoneArea, styles.easeInOpacityTransition, styles.activeDropzoneDashedBorder(theme.attachmentDropBorderColorActive, true)]}
                />
            </DragAndDropConsumer>
        </>
    );
}

function ComposerDropZone({reportID, children}: ComposerDropZoneProps) {
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const {shouldAddOrReplaceReceipt, transactionID} = useShouldAddOrReplaceReceipt(reportID);
    const {pickAttachments, PDFValidationComponent: AttachmentPDFValidation, ErrorModal: AttachmentErrorModal} = useAttachmentPicker(reportID);
    const {
        onReceiptDropped,
        PDFValidationComponent: ReceiptPDFValidation,
        ErrorModal: ReceiptErrorModal,
    } = useReceiptDrop({
        reportID,
        report,
        shouldAddOrReplaceReceipt,
        transactionID,
    });

    const onAttachmentDrop = (dragEvent: DragEvent) => pickAttachments({dragEvent});

    if (isChatRoom(report) || isGroupChat(report) || isInvoiceReport(report)) {
        return (
            <>
                <SimpleDropZone onAttachmentDrop={onAttachmentDrop}>{children}</SimpleDropZone>
                {AttachmentPDFValidation}
                {AttachmentErrorModal}
            </>
        );
    }

    return (
        <>
            <RichDropZone
                reportID={reportID}
                shouldAddOrReplaceReceipt={shouldAddOrReplaceReceipt}
                transactionID={transactionID}
                onAttachmentDrop={onAttachmentDrop}
                onReceiptDrop={onReceiptDropped}
            >
                {children}
            </RichDropZone>
            {AttachmentPDFValidation}
            {AttachmentErrorModal}
            {ReceiptPDFValidation}
            {ReceiptErrorModal}
        </>
    );
}

export default ComposerDropZone;
