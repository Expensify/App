import reportsSelector from '@selectors/Attributes';
import {privateIsArchivedSelector} from '@selectors/ReportNameValuePairs';
import React, {useCallback, useState} from 'react';
import {View} from 'react-native';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Icon from '@components/Icon';
import {ImageBehaviorContextProvider} from '@components/Image/ImageBehaviorContextProvider';
import MoneyRequestConfirmationList from '@components/MoneyRequestConfirmationList';
import MoneyRequestHeaderStatusBar from '@components/MoneyRequestHeaderStatusBar';
import ScreenWrapper from '@components/ScreenWrapper';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {setDraftSplitTransaction} from '@libs/actions/IOU';
import {completeSplitBill} from '@libs/actions/IOU/Split';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SplitDetailsNavigatorParamList} from '@libs/Navigation/types';
import {getParticipantsOption, getPolicyExpenseReportOption} from '@libs/OptionsListUtils';
import Parser from '@libs/Parser';
import {getOriginalMessage, isMoneyRequestAction} from '@libs/ReportActionsUtils';
import {getTransactionDetails, isPolicyExpenseChat} from '@libs/ReportUtils';
import type {OptionData} from '@libs/ReportUtils';
import {
    areRequiredFieldsEmpty,
    hasReceipt,
    isDistanceRequest as isDistanceRequestUtil,
    isGPSDistanceRequest as isGPSDistanceRequestUtil,
    isManualDistanceRequest as isManualDistanceRequestUtil,
    isMapDistanceRequest as isMapDistanceRequestUtil,
    isScanning,
} from '@libs/TransactionUtils';
import withReportAndReportActionOrNotFound from '@pages/home/report/withReportAndReportActionOrNotFound';
import type {WithReportAndReportActionOrNotFoundProps} from '@pages/home/report/withReportAndReportActionOrNotFound';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type {Participant} from '@src/types/onyx/IOU';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

type SplitBillDetailsPageProps = WithReportAndReportActionOrNotFoundProps & PlatformStackScreenProps<SplitDetailsNavigatorParamList, typeof SCREENS.SPLIT_DETAILS.ROOT>;

function SplitBillDetailsPage({route, report, reportAction}: SplitBillDetailsPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const theme = useTheme();
    const {isBetaEnabled} = usePermissions();
    const icons = useMemoizedLazyExpensifyIcons(['ReceiptScan']);

    const reportID = report?.reportID;
    const originalMessage = reportAction && isMoneyRequestAction(reportAction) ? getOriginalMessage(reportAction) : undefined;
    const IOUTransactionID = originalMessage?.IOUTransactionID;
    const participantAccountIDs = originalMessage?.participantAccountIDs ?? [];

    const [transaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${getNonEmptyStringOnyxID(IOUTransactionID)}`, {canBeMissing: true});
    const [draftTransaction] = useOnyx(`${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${IOUTransactionID}`, {canBeMissing: true});
    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {canBeMissing: true});
    const [transactionReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${transaction?.reportID}`, {canBeMissing: true});
    const [quickAction] = useOnyx(ONYXKEYS.NVP_QUICK_ACTION_GLOBAL_CREATE, {canBeMissing: true});
    const [session] = useOnyx(ONYXKEYS.SESSION, {canBeMissing: false});
    const [reportAttributesDerived] = useOnyx(ONYXKEYS.DERIVED.REPORT_ATTRIBUTES, {canBeMissing: true, selector: reportsSelector});
    const [privateIsArchived] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${reportID}`, {canBeMissing: true, selector: privateIsArchivedSelector});

    // In case this is workspace split expense, we manually add the workspace as the second participant of the split expense
    // because we don't save any accountID in the report action's originalMessage other than the payee's accountID
    let participants: Array<Participant | OptionData>;
    if (isPolicyExpenseChat(report)) {
        participants = [
            getParticipantsOption({accountID: participantAccountIDs.at(0), selected: true, reportID: ''}, personalDetails),
            getPolicyExpenseReportOption({...report, selected: true, reportID}, privateIsArchived, personalDetails, reportAttributesDerived),
        ];
    } else {
        participants = participantAccountIDs.map((accountID) => getParticipantsOption({accountID, selected: true, reportID: ''}, personalDetails));
    }
    const actorAccountID = reportAction?.actorAccountID ?? CONST.DEFAULT_NUMBER_ID;
    const payeePersonalDetails = personalDetails?.[actorAccountID];
    const participantsExcludingPayee = participants.filter((participant) => participant.accountID !== reportAction?.actorAccountID);

    const hasSmartScanFailed = hasReceipt(transaction) && transaction?.receipt?.state === CONST.IOU.RECEIPT_STATE.SCAN_FAILED;
    const isDistanceRequest = isDistanceRequestUtil(transaction);
    const isEditingSplitBill =
        session?.accountID === actorAccountID && (areRequiredFieldsEmpty(transaction, transactionReport) || (transaction?.amount === 0 && !hasReceipt(transaction))) && !isDistanceRequest;
    const isManualDistanceRequest = isManualDistanceRequestUtil(transaction);
    const isGPSDistanceRequest = isGPSDistanceRequestUtil(transaction);
    const isMapDistanceRequest = isMapDistanceRequestUtil(transaction);
    const [isConfirmed, setIsConfirmed] = useState(false);

    const isASAPSubmitBetaEnabled = isBetaEnabled(CONST.BETAS.ASAP_SUBMIT);
    const [transactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS, {canBeMissing: true});
    const {
        amount: splitAmount,
        currency: splitCurrency,
        comment: splitComment,
        merchant: splitMerchant,
        created: splitCreated,
        category: splitCategory,
        billable: splitBillable,
    } = getTransactionDetails(isEditingSplitBill && draftTransaction ? draftTransaction : transaction) ?? {};

    const onConfirm = useCallback(() => {
        setIsConfirmed(true);
        completeSplitBill(
            reportID,
            reportAction,
            draftTransaction,
            session?.accountID ?? CONST.DEFAULT_NUMBER_ID,
            isASAPSubmitBetaEnabled,
            quickAction,
            transactionViolations,
            session?.email,
        );
    }, [reportID, reportAction, draftTransaction, session?.accountID, session?.email, isASAPSubmitBetaEnabled, quickAction, transactionViolations]);

    return (
        <ScreenWrapper testID="SplitBillDetailsPage">
            <FullPageNotFoundView shouldShow={!reportID || isEmptyObject(reportAction) || isEmptyObject(transaction)}>
                <HeaderWithBackButton
                    title={translate('common.details')}
                    onBackButtonPress={() => Navigation.goBack(route.params.backTo)}
                />
                <View style={[styles.containerWithSpaceBetween, styles.pointerEventsBoxNone]}>
                    {isScanning(transaction) && (
                        <View style={[styles.ph5, styles.pb3, styles.borderBottom]}>
                            <MoneyRequestHeaderStatusBar
                                icon={
                                    <Icon
                                        src={icons.ReceiptScan}
                                        height={variables.iconSizeSmall}
                                        width={variables.iconSizeSmall}
                                        fill={theme.icon}
                                    />
                                }
                                description={translate('iou.receiptScanInProgressDescription')}
                                shouldStyleFlexGrow={false}
                            />
                        </View>
                    )}
                    <ImageBehaviorContextProvider shouldSetAspectRatioInStyle={!isMapDistanceRequest}>
                        {!!participants.length && (
                            <MoneyRequestConfirmationList
                                payeePersonalDetails={payeePersonalDetails}
                                selectedParticipants={participantsExcludingPayee}
                                iouAmount={splitAmount ?? 0}
                                iouCurrencyCode={splitCurrency}
                                iouComment={Parser.htmlToMarkdown(splitComment ?? '')}
                                iouCreated={splitCreated}
                                shouldDisplayReceipt
                                iouMerchant={splitMerchant}
                                iouCategory={splitCategory}
                                iouIsBillable={splitBillable}
                                iouType={CONST.IOU.TYPE.SPLIT}
                                isReadOnly={!isEditingSplitBill}
                                shouldShowSmartScanFields
                                receiptPath={transaction?.receipt?.source}
                                receiptFilename={transaction?.receipt?.filename}
                                isDistanceRequest={isDistanceRequest}
                                isManualDistanceRequest={isManualDistanceRequest}
                                isGPSDistanceRequest={isGPSDistanceRequest}
                                isEditingSplitBill={isEditingSplitBill}
                                hasSmartScanFailed={hasSmartScanFailed}
                                reportID={reportID}
                                reportActionID={reportAction?.reportActionID}
                                transaction={isEditingSplitBill && draftTransaction ? draftTransaction : transaction}
                                onConfirm={onConfirm}
                                isPolicyExpenseChat={isPolicyExpenseChat(report)}
                                policyID={isPolicyExpenseChat(report) ? report?.policyID : undefined}
                                action={isEditingSplitBill ? CONST.IOU.ACTION.EDIT : CONST.IOU.ACTION.CREATE}
                                onToggleBillable={(billable) => {
                                    setDraftSplitTransaction(transaction?.transactionID, draftTransaction, {billable});
                                }}
                                isConfirmed={isConfirmed}
                            />
                        )}
                    </ImageBehaviorContextProvider>
                </View>
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

export default withReportAndReportActionOrNotFound(SplitBillDetailsPage);
