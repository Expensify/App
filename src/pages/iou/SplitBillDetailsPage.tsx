import React, {useCallback, useState} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import {ImageBehaviorContextProvider} from '@components/Image/ImageBehaviorContextProvider';
import MoneyRequestConfirmationList from '@components/MoneyRequestConfirmationList';
import MoneyRequestHeaderStatusBar from '@components/MoneyRequestHeaderStatusBar';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {completeSplitBill, setDraftSplitTransaction} from '@libs/actions/IOU';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SplitDetailsNavigatorParamList} from '@libs/Navigation/types';
import {getParticipantsOption, getPolicyExpenseReportOption} from '@libs/OptionsListUtils';
import Parser from '@libs/Parser';
import {getOriginalMessage, isMoneyRequestAction} from '@libs/ReportActionsUtils';
import {getTransactionDetails, isPolicyExpenseChat} from '@libs/ReportUtils';
import type {OptionData} from '@libs/ReportUtils';
import {areRequiredFieldsEmpty, hasReceipt, isDistanceRequest as isDistanceRequestUtil, isReceiptBeingScanned} from '@libs/TransactionUtils';
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

    const reportID = report?.reportID;
    const originalMessage = reportAction && isMoneyRequestAction(reportAction) ? getOriginalMessage(reportAction) : undefined;
    const IOUTransactionID = originalMessage?.IOUTransactionID;
    const participantAccountIDs = originalMessage?.participantAccountIDs ?? [];

    const [transaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${IOUTransactionID ?? CONST.DEFAULT_NUMBER_ID}`);
    const [draftTransaction] = useOnyx(`${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${IOUTransactionID ?? CONST.DEFAULT_NUMBER_ID}`);
    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST);
    const [session] = useOnyx(ONYXKEYS.SESSION);

    // In case this is workspace split expense, we manually add the workspace as the second participant of the split expense
    // because we don't save any accountID in the report action's originalMessage other than the payee's accountID
    let participants: Array<Participant | OptionData>;
    if (isPolicyExpenseChat(report)) {
        participants = [
            getParticipantsOption({accountID: participantAccountIDs.at(0), selected: true, reportID: ''}, personalDetails),
            getPolicyExpenseReportOption({...report, selected: true, reportID}),
        ];
    } else {
        participants = participantAccountIDs.map((accountID) => getParticipantsOption({accountID, selected: true, reportID: ''}, personalDetails));
    }
    const actorAccountID = reportAction?.actorAccountID ?? CONST.DEFAULT_NUMBER_ID;
    const payeePersonalDetails = personalDetails?.[actorAccountID];
    const participantsExcludingPayee = participants.filter((participant) => participant.accountID !== reportAction?.actorAccountID);

    const isScanning = hasReceipt(transaction) && isReceiptBeingScanned(transaction);
    const hasSmartScanFailed = hasReceipt(transaction) && transaction?.receipt?.state === CONST.IOU.RECEIPT_STATE.SCANFAILED;
    const isEditingSplitBill = session?.accountID === actorAccountID && areRequiredFieldsEmpty(transaction);
    const isDistanceRequest = isDistanceRequestUtil(transaction);
    const [isConfirmed, setIsConfirmed] = useState(false);

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
        completeSplitBill(reportID, reportAction, draftTransaction, session?.accountID ?? CONST.DEFAULT_NUMBER_ID, session?.email);
    }, [reportID, reportAction, draftTransaction, session?.accountID, session?.email]);

    return (
        <ScreenWrapper testID={SplitBillDetailsPage.displayName}>
            <FullPageNotFoundView shouldShow={!reportID || isEmptyObject(reportAction) || isEmptyObject(transaction)}>
                <HeaderWithBackButton
                    title={translate('common.details')}
                    onBackButtonPress={() => Navigation.goBack(route.params.backTo)}
                />
                <View style={[styles.containerWithSpaceBetween, styles.pointerEventsBoxNone]}>
                    {isScanning && (
                        <View style={[styles.ph5, styles.pb3, styles.borderBottom]}>
                            <MoneyRequestHeaderStatusBar
                                icon={
                                    <Icon
                                        src={Expensicons.ReceiptScan}
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
                    <ImageBehaviorContextProvider shouldSetAspectRatioInStyle={!isDistanceRequest}>
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
                                receiptFilename={transaction?.filename}
                                isDistanceRequest={isDistanceRequest}
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
                                    setDraftSplitTransaction(transaction?.transactionID, {billable});
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

SplitBillDetailsPage.displayName = 'SplitBillDetailsPage';

export default withReportAndReportActionOrNotFound(SplitBillDetailsPage);
