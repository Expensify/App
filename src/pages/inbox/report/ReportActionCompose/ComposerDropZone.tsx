import React from 'react';
import DragAndDropConsumer from '@components/DragAndDrop/Consumer';
import DropZoneUI from '@components/DropZone/DropZoneUI';
import DualDropZone from '@components/DropZone/DualDropZone';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePreferredPolicy from '@hooks/usePreferredPolicy';
import useReportIsArchived from '@hooks/useReportIsArchived';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {getParentReport, isChatRoom, isGroupChat, isInvoiceReport, isReportApproved, isSettled, temporary_getMoneyRequestOptions} from '@libs/ReportUtils';
import {hasReceipt as hasReceiptTransactionUtils} from '@libs/TransactionUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import {useComposerDataActions} from './ComposerContext';
import useShouldAddOrReplaceReceipt from './useShouldAddOrReplaceReceipt';

type ComposerDropZoneProps = {
    /** The ID of the report */
    reportID: string;

    /** Content to wrap with the drop zone */
    children: React.ReactNode;
};

type RichDropZoneProps = {
    /** The ID of the report */
    reportID: string;

    /** Whether the current view allows adding or replacing a receipt */
    shouldAddOrReplaceReceipt: boolean;

    /** The transaction ID relevant to this report, if any */
    transactionID: string | undefined;

    /** Callback when an attachment file is dropped */
    onAttachmentDrop: (dragEvent: DragEvent) => void;

    /** Callback when a receipt file is dropped */
    onReceiptDrop: (dragEvent: DragEvent) => void;

    /** Content to wrap with the drop zone */
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

    const shouldDisplayDualDropZone = (() => {
        const parentReport = getParentReport(report);
        const isSettledOrApproved = isSettled(report) || isSettled(parentReport) || isReportApproved({report}) || isReportApproved({report: parentReport});
        const hasMoneyRequestOptions = !!temporary_getMoneyRequestOptions(report, policy, reportParticipantIDs, betas, isReportArchived, isRestrictedToPreferredPolicy).length;
        const canModifyReceipt = shouldAddOrReplaceReceipt && !isSettledOrApproved;
        return canModifyReceipt || hasMoneyRequestOptions;
    })();

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
    const {isOffline} = useNetwork();
    const {shouldAddOrReplaceReceipt, transactionID} = useShouldAddOrReplaceReceipt(reportID, isOffline);
    const {validateAttachments, onReceiptDropped} = useComposerDataActions();

    const onAttachmentDrop = (dragEvent: DragEvent) => validateAttachments({dragEvent});

    // Cheap gate: rooms, groups, and invoices never show the dual drop zone.
    // ~60% of chats hit this path with zero extra subscriptions.
    if (isChatRoom(report) || isGroupChat(report) || isInvoiceReport(report)) {
        return <SimpleDropZone onAttachmentDrop={onAttachmentDrop}>{children}</SimpleDropZone>;
    }

    return (
        <RichDropZone
            reportID={reportID}
            shouldAddOrReplaceReceipt={shouldAddOrReplaceReceipt}
            transactionID={transactionID}
            onAttachmentDrop={onAttachmentDrop}
            onReceiptDrop={onReceiptDropped}
        >
            {children}
        </RichDropZone>
    );
}

export default ComposerDropZone;
