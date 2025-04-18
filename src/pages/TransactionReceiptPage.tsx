import React, {useEffect} from 'react';
import {useOnyx} from 'react-native-onyx';
import AttachmentModal from '@components/AttachmentModal';
import {navigateToStartStepIfScanFileCannotBeRead} from '@libs/actions/IOU';
import {openReport} from '@libs/actions/Report';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {AuthScreensParamList, RootNavigatorParamList, State} from '@libs/Navigation/types';
import {getThumbnailAndImageURIs} from '@libs/ReceiptUtils';
import {getReportAction, isTrackExpenseAction as isTrackExpenseReportReportActionsUtils} from '@libs/ReportActionsUtils';
import {
    canEditFieldOfMoneyRequest,
    isMoneyRequestReport,
    isOneTransactionThread as isOneTransactionThreadReportUtils,
    isTrackExpenseReport as isTrackExpenseReportReportUtils,
} from '@libs/ReportUtils';
import {getRequestType, hasEReceipt, hasReceiptSource} from '@libs/TransactionUtils';
import tryResolveUrlFromApiRoot from '@libs/tryResolveUrlFromApiRoot';
import navigationRef from '@navigation/navigationRef';
import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type TransactionReceiptProps = PlatformStackScreenProps<AuthScreensParamList, typeof SCREENS.TRANSACTION_RECEIPT>;

function TransactionReceipt({route}: TransactionReceiptProps) {
    const reportID = route.params.reportID;
    const transactionID = route.params.transactionID;
    const action = route.params.action;
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID ?? CONST.DEFAULT_NUMBER_ID}`);
    const [transactionMain] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID ?? CONST.DEFAULT_NUMBER_ID}`);
    const [transactionDraft] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionID ?? CONST.DEFAULT_NUMBER_ID}`);
    const [reportMetadata = {isLoadingInitialReportActions: true}] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_METADATA}${reportID ?? CONST.DEFAULT_NUMBER_ID}`);

    const isDraftTransaction = !!action;
    const transaction = isDraftTransaction ? transactionDraft : transactionMain;
    const receiptURIs = getThumbnailAndImageURIs(transaction);
    const isLocalFile = receiptURIs.isLocalFile;
    const readonly = route.params.readonly === 'true';
    const isFromReviewDuplicates = route.params.isFromReviewDuplicates === 'true';
    const imageSource = isDraftTransaction ? transactionDraft?.receipt?.source : tryResolveUrlFromApiRoot(receiptURIs.image ?? '');

    const parentReportAction = getReportAction(report?.parentReportID, report?.parentReportActionID);
    const canEditReceipt = canEditFieldOfMoneyRequest(parentReportAction, CONST.EDIT_REQUEST_FIELD.RECEIPT);
    const canDeleteReceipt = canEditFieldOfMoneyRequest(parentReportAction, CONST.EDIT_REQUEST_FIELD.RECEIPT, true);
    const isEReceipt = transaction && !hasReceiptSource(transaction) && hasEReceipt(transaction);
    const isTrackExpenseAction = isTrackExpenseReportReportActionsUtils(parentReportAction);
    const iouType = route.params.iouType;

    useEffect(() => {
        if ((!!report && !!transaction) || isDraftTransaction) {
            return;
        }
        openReport(reportID);
        // I'm disabling the warning, as it expects to use exhaustive deps, even though we want this useEffect to run only on the first render.
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, []);

    const receiptPath = transaction?.receipt?.source;

    useEffect(() => {
        if (!isDraftTransaction || !iouType || !transaction) {
            return;
        }

        const requestType = getRequestType(transaction);
        const receiptFilename = transaction?.filename;
        const receiptType = transaction?.receipt?.type;
        navigateToStartStepIfScanFileCannotBeRead(
            receiptFilename,
            receiptPath,
            () => {},
            requestType,
            iouType,
            transactionID,
            reportID,
            receiptType,
            () =>
                Navigation.goBack(
                    ROUTES.MONEY_REQUEST_STEP_SCAN.getRoute(
                        CONST.IOU.ACTION.CREATE,
                        iouType,
                        transactionID,
                        reportID,
                        ROUTES.MONEY_REQUEST_STEP_CONFIRMATION.getRoute(action, iouType, transactionID, reportID),
                    ),
                ),
        );

        // eslint-disable-next-line react-compiler/react-compiler
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [receiptPath]);

    const onModalClose = () => {
        // Receipt Page can be opened either from Reports or from Search RHP view
        // We have to handle going back to correct screens, if it was opened from RHP just close the modal, otherwise go to Report Page
        const rootState = navigationRef.getRootState() as State<RootNavigatorParamList>;
        const secondToLastRoute = rootState.routes.at(-2);
        if (secondToLastRoute?.name === NAVIGATORS.RIGHT_MODAL_NAVIGATOR || isDraftTransaction) {
            Navigation.dismissModal();
        } else {
            const isOneTransactionThread = isOneTransactionThreadReportUtils(report?.reportID, report?.parentReportID, parentReportAction);
            const dismissModalReportID = isOneTransactionThread ? report?.parentReportID : report?.reportID;
            if (!dismissModalReportID) {
                Navigation.dismissModal();
                return;
            }
            Navigation.dismissModalWithReport({reportID: dismissModalReportID});
        }
    };

    const moneyRequestReportID = isMoneyRequestReport(report) ? report?.reportID : report?.parentReportID;
    const isTrackExpenseReport = isTrackExpenseReportReportUtils(report);

    // eslint-disable-next-line rulesdir/no-negated-variables
    const shouldShowNotFoundPage =
        isTrackExpenseReport || isDraftTransaction || transaction?.reportID === CONST.REPORT.SPLIT_REPORTID || isFromReviewDuplicates
            ? !transaction
            : moneyRequestReportID !== transaction?.reportID;

    return (
        <AttachmentModal
            source={imageSource}
            isAuthTokenRequired={!isLocalFile && !isDraftTransaction}
            report={report}
            isReceiptAttachment
            canEditReceipt={(canEditReceipt && !readonly) || isDraftTransaction}
            canDeleteReceipt={canDeleteReceipt && !readonly && !isDraftTransaction}
            allowDownload={!isEReceipt}
            isTrackExpenseAction={isTrackExpenseAction}
            originalFileName={isDraftTransaction ? transaction?.filename : receiptURIs?.filename}
            defaultOpen
            iouAction={action}
            iouType={iouType}
            draftTransactionID={isDraftTransaction ? transactionID : undefined}
            onModalClose={onModalClose}
            isLoading={!transaction && reportMetadata?.isLoadingInitialReportActions}
            shouldShowNotFoundPage={shouldShowNotFoundPage}
        />
    );
}

TransactionReceipt.displayName = 'TransactionReceipt';

export default TransactionReceipt;
