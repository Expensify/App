import React, {useEffect} from 'react';
import {useOnyx} from 'react-native-onyx';
import AttachmentModal from '@components/AttachmentModal';
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
import {hasEReceipt, hasReceiptSource} from '@libs/TransactionUtils';
import tryResolveUrlFromApiRoot from '@libs/tryResolveUrlFromApiRoot';
import navigationRef from '@navigation/navigationRef';
import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';

type TransactionReceiptProps = PlatformStackScreenProps<AuthScreensParamList, typeof SCREENS.TRANSACTION_RECEIPT>;

function TransactionReceipt({route}: TransactionReceiptProps) {
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${route.params.reportID ?? CONST.DEFAULT_NUMBER_ID}`);
    const [transaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${route.params.transactionID ?? CONST.DEFAULT_NUMBER_ID}`);
    const [reportMetadata = {isLoadingInitialReportActions: true}] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_METADATA}${route.params.reportID ?? CONST.DEFAULT_NUMBER_ID}`);
    const receiptURIs = getThumbnailAndImageURIs(transaction);

    const imageSource = tryResolveUrlFromApiRoot(receiptURIs.image ?? '');

    const isLocalFile = receiptURIs.isLocalFile;
    const readonly = route.params.readonly === 'true';
    const isFromReviewDuplicates = route.params.isFromReviewDuplicates === 'true';

    const parentReportAction = getReportAction(report?.parentReportID, report?.parentReportActionID);
    const canEditReceipt = canEditFieldOfMoneyRequest(parentReportAction, CONST.EDIT_REQUEST_FIELD.RECEIPT);
    const canDeleteReceipt = canEditFieldOfMoneyRequest(parentReportAction, CONST.EDIT_REQUEST_FIELD.RECEIPT, true);
    const isEReceipt = transaction && !hasReceiptSource(transaction) && hasEReceipt(transaction);
    const isTrackExpenseAction = isTrackExpenseReportReportActionsUtils(parentReportAction);

    useEffect(() => {
        if (report && transaction) {
            return;
        }
        openReport(route.params.reportID);
        // I'm disabling the warning, as it expects to use exhaustive deps, even though we want this useEffect to run only on the first render.
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, []);

    const onModalClose = () => {
        // Receipt Page can be opened either from Reports or from Search RHP view
        // We have to handle going back to correct screens, if it was opened from RHP just close the modal, otherwise go to Report Page
        const rootState = navigationRef.getRootState() as State<RootNavigatorParamList>;
        const secondToLastRoute = rootState.routes.at(-2);
        if (secondToLastRoute?.name === NAVIGATORS.RIGHT_MODAL_NAVIGATOR) {
            Navigation.dismissModal();
        } else {
            const isOneTransactionThread = isOneTransactionThreadReportUtils(report?.reportID, report?.parentReportID, parentReportAction);
            const reportID = isOneTransactionThread ? report?.parentReportID : report?.reportID;
            if (!reportID) {
                Navigation.dismissModal();
                return;
            }
            Navigation.dismissModalWithReport({reportID});
        }
    };

    const moneyRequestReportID = isMoneyRequestReport(report) ? report?.reportID : report?.parentReportID;
    const isTrackExpenseReport = isTrackExpenseReportReportUtils(report);

    // eslint-disable-next-line rulesdir/no-negated-variables
    const shouldShowNotFoundPage =
        isTrackExpenseReport || transaction?.reportID === CONST.REPORT.SPLIT_REPORTID || isFromReviewDuplicates ? !transaction : moneyRequestReportID !== transaction?.reportID;

    return (
        <AttachmentModal
            source={imageSource}
            isAuthTokenRequired={!isLocalFile}
            report={report}
            isReceiptAttachment
            canEditReceipt={canEditReceipt && !readonly}
            canDeleteReceipt={canDeleteReceipt && !readonly}
            allowDownload={!isEReceipt}
            isTrackExpenseAction={isTrackExpenseAction}
            originalFileName={receiptURIs?.filename}
            defaultOpen
            onModalClose={onModalClose}
            isLoading={!transaction && reportMetadata?.isLoadingInitialReportActions}
            shouldShowNotFoundPage={shouldShowNotFoundPage}
        />
    );
}

TransactionReceipt.displayName = 'TransactionReceipt';

export default TransactionReceipt;
