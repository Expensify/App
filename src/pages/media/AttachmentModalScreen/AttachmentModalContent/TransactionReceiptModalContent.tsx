import {useCallback, useEffect, useMemo} from 'react';
import {useOnyx} from 'react-native-onyx';
import {openReport} from '@libs/actions/Report';
import Navigation, {navigationRef} from '@libs/Navigation/Navigation';
import type {RootStackParamList, State} from '@libs/Navigation/types';
import {getThumbnailAndImageURIs} from '@libs/ReceiptUtils';
import {getReportAction, isTrackExpenseAction} from '@libs/ReportActionsUtils';
import {canEditFieldOfMoneyRequest, isMoneyRequestReport, isOneTransactionThread, isTrackExpenseReport} from '@libs/ReportUtils';
import {hasEReceipt, hasReceiptSource} from '@libs/TransactionUtils';
import tryResolveUrlFromApiRoot from '@libs/tryResolveUrlFromApiRoot';
import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import ONYXKEYS from '@src/ONYXKEYS';
import type {AttachmentModalBaseContentProps} from './BaseContent';
import type {AttachmentModalContent} from './types';

const TransactionReceiptModalContent: AttachmentModalContent = ({params, children}) => {
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${params.reportID ?? '-1'}`);
    const [transaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${params.transactionID ?? '-1'}`);
    const [reportMetadata = {isLoadingInitialReportActions: true}] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_METADATA}${params.reportID ?? '-1'}`);
    const receiptURIs = getThumbnailAndImageURIs(transaction);

    const imageSource = tryResolveUrlFromApiRoot(receiptURIs.image ?? '');

    const isLocalFile = receiptURIs.isLocalFile;
    const readonly = !!params.readonly;
    const isFromReviewDuplicates = !!params.isFromReviewDuplicates;

    const parentReportAction = getReportAction(report?.parentReportID ?? '-1', report?.parentReportActionID ?? '-1');
    const canEditReceipt = canEditFieldOfMoneyRequest(parentReportAction, CONST.EDIT_REQUEST_FIELD.RECEIPT);
    const isEReceipt = transaction && !hasReceiptSource(transaction) && hasEReceipt(transaction);
    const isTrackExpenseActionValue = isTrackExpenseAction(parentReportAction);

    useEffect(() => {
        if (report && transaction) {
            return;
        }
        openReport(params.reportID);
        // I'm disabling the warning, as it expects to use exhaustive deps, even though we want this useEffect to run only on the first render.
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, []);

    const onModalClose = useCallback(() => {
        // Receipt Page can be opened either from Reports or from Search RHP view
        // We have to handle going back to correct screens, if it was opened from RHP just close the modal, otherwise go to Report Page
        const rootState = navigationRef.getRootState() as State<RootStackParamList>;
        const secondToLastRoute = rootState.routes.at(-2);
        if (secondToLastRoute?.name === NAVIGATORS.RIGHT_MODAL_NAVIGATOR) {
            Navigation.dismissModal();
        } else {
            const isOneTransactionThreadValue = isOneTransactionThread(report?.reportID ?? '-1', report?.parentReportID ?? '-1', parentReportAction);
            Navigation.dismissModal(isOneTransactionThreadValue ? report?.parentReportID : report?.reportID);
        }
    }, [parentReportAction, report?.parentReportID, report?.reportID]);

    const moneyRequestReportID = isMoneyRequestReport(report) ? report?.reportID : report?.parentReportID;
    const isTrackExpenseReportValue = isTrackExpenseReport(report);

    // eslint-disable-next-line rulesdir/no-negated-variables
    const shouldShowNotFoundPage =
        isTrackExpenseReportValue || transaction?.reportID === CONST.REPORT.SPLIT_REPORTID || isFromReviewDuplicates
            ? !transaction
            : (moneyRequestReportID ?? '-1') !== transaction?.reportID;

    const contentProps = useMemo(
        () =>
            ({
                source: imageSource,
                isAuthTokenRequired: !isLocalFile,
                report,
                isReceiptAttachment: true,
                canEditReceipt: canEditReceipt && !readonly,
                allowDownload: !isEReceipt,
                isTrackExpenseAction: isTrackExpenseActionValue,
                originalFileName: receiptURIs?.filename,
                isLoading: !transaction && reportMetadata?.isLoadingInitialReportActions,
                shouldShowNotFoundPage,
            } satisfies Partial<AttachmentModalBaseContentProps>),
        [
            canEditReceipt,
            imageSource,
            isEReceipt,
            isLocalFile,
            isTrackExpenseActionValue,
            readonly,
            receiptURIs?.filename,
            report,
            reportMetadata?.isLoadingInitialReportActions,
            shouldShowNotFoundPage,
            transaction,
        ],
    );

    const wrapperProps = useMemo(
        () => ({
            onModalClose,
        }),
        [onModalClose],
    );

    // eslint-disable-next-line react-compiler/react-compiler
    return children({contentProps, wrapperProps});
};

export default TransactionReceiptModalContent;
