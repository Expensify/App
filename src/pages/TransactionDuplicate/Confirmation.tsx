import {useRoute} from '@react-navigation/native';
import React, {useCallback, useMemo} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import Button from '@components/Button';
import FixedFooter from '@components/FixedFooter';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MoneyRequestView from '@components/ReportActionItem/MoneyRequestView';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import {ShowContextMenuContext} from '@components/ShowContextMenuContext';
import Text from '@components/Text';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useReviewDuplicatesNavigation from '@hooks/useReviewDuplicatesNavigation';
import useThemeStyles from '@hooks/useThemeStyles';
import useTransactionsByID from '@hooks/useTransactionsByID';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import type {TransactionDuplicateNavigatorParamList} from '@libs/Navigation/types';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import * as IOU from '@src/libs/actions/IOU';
import * as ReportActionsUtils from '@src/libs/ReportActionsUtils';
import * as ReportUtils from '@src/libs/ReportUtils';
import {generateReportID} from '@src/libs/ReportUtils';
import * as TransactionUtils from '@src/libs/TransactionUtils';
import {getTransactionID} from '@src/libs/TransactionUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type {Transaction} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

function Confirmation() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const route = useRoute<PlatformStackRouteProp<TransactionDuplicateNavigatorParamList, typeof SCREENS.TRANSACTION_DUPLICATE.REVIEW>>();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const [reviewDuplicates, reviewDuplicatesResult] = useOnyx(ONYXKEYS.REVIEW_DUPLICATES, {canBeMissing: true});
    const [duplicatedTransaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${getNonEmptyStringOnyxID(reviewDuplicates?.transactionID)}`, {canBeMissing: true});
    const newTransaction = useMemo(() => TransactionUtils.buildNewTransactionAfterReviewingDuplicates(reviewDuplicates, duplicatedTransaction), [duplicatedTransaction, reviewDuplicates]);
    const transactionID = TransactionUtils.getTransactionID(route.params.threadReportID);
    const [allReports] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {canBeMissing: false});
    const [transaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${getNonEmptyStringOnyxID(transactionID)}`, {canBeMissing: true});
    const [transactionViolations] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${getNonEmptyStringOnyxID(transactionID)}`, {
        canBeMissing: false,
    });
    const allDuplicateIDs = useMemo(
        () => transactionViolations?.find((violation) => violation.name === CONST.VIOLATIONS.DUPLICATED_TRANSACTION)?.data?.duplicates ?? [],
        [transactionViolations],
    );
    const [allDuplicates] = useTransactionsByID(allDuplicateIDs);
    const reviewDuplicatesReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${reviewDuplicates?.reportID}`];
    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${getNonEmptyStringOnyxID(reviewDuplicatesReport?.policyID)}`, {canBeMissing: true});
    const compareResult = TransactionUtils.compareDuplicateTransactionFields(transaction, allDuplicates, reviewDuplicates?.reportID, undefined, policyCategories);
    const {goBack} = useReviewDuplicatesNavigation(Object.keys(compareResult.change ?? {}), 'confirmation', route.params.threadReportID, route.params.backTo);
    const [report, reportResult] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${route.params.threadReportID}`, {canBeMissing: true});
    const [iouReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${newTransaction?.reportID}`, {canBeMissing: true});
    const [reportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${newTransaction?.reportID}`, {canBeMissing: true});
    const reportAction = Object.values(reportActions ?? {}).find(
        (action) => ReportActionsUtils.isMoneyRequestAction(action) && ReportActionsUtils.getOriginalMessage(action)?.IOUTransactionID === reviewDuplicates?.transactionID,
    );

    const [duplicates] = useTransactionsByID(reviewDuplicates?.duplicates);
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${report?.policyID}`, {canBeMissing: true});
    const transactionsMergeParams = useMemo(
        () => TransactionUtils.buildMergeDuplicatesParams(reviewDuplicates, duplicates ?? [], newTransaction),
        [duplicates, reviewDuplicates, newTransaction],
    );
    const isReportOwner = iouReport?.ownerAccountID === currentUserPersonalDetails?.accountID;

    const mergeDuplicates = useCallback(() => {
        const transactionThreadReportID = reportAction?.childReportID ?? generateReportID();
        if (!reportAction?.childReportID) {
            transactionsMergeParams.transactionThreadReportID = transactionThreadReportID;
        }
        IOU.mergeDuplicates(transactionsMergeParams);
        Navigation.dismissModal();
    }, [reportAction?.childReportID, transactionsMergeParams]);

    const resolveDuplicates = useCallback(() => {
        IOU.resolveDuplicates(transactionsMergeParams);
        Navigation.dismissModal();
    }, [transactionsMergeParams]);

    const contextValue = useMemo(
        () => ({
            transactionThreadReport: report,
            action: reportAction,
            report,
            checkIfContextMenuActive: () => {},
            onShowContextMenu: () => {},
            isReportArchived: false,
            anchor: null,
            isDisabled: false,
        }),
        [report, reportAction],
    );

    const reportTransactionID = report?.reportID ? getTransactionID(report.reportID) : undefined;
    const doesTransactionBelongToReport = reviewDuplicates?.transactionID === reportTransactionID || (reportTransactionID && reviewDuplicates?.duplicates.includes(reportTransactionID));

    // eslint-disable-next-line rulesdir/no-negated-variables
    const shouldShowNotFoundPage =
        isEmptyObject(report) ||
        !ReportUtils.isValidReport(report) ||
        ReportUtils.isReportNotFound(report) ||
        (reviewDuplicatesResult.status === 'loaded' && (!newTransaction?.transactionID || !doesTransactionBelongToReport));

    if (isLoadingOnyxValue(reviewDuplicatesResult, reportResult) || !newTransaction?.transactionID) {
        return <FullScreenLoadingIndicator />;
    }

    return (
        <ScreenWrapper
            testID={Confirmation.displayName}
            shouldShowOfflineIndicator
        >
            <FullPageNotFoundView shouldShow={shouldShowNotFoundPage}>
                <View style={[styles.flex1]}>
                    <HeaderWithBackButton
                        title={translate('iou.reviewDuplicates')}
                        onBackButtonPress={goBack}
                    />
                    <ScrollView>
                        <View style={[styles.ph5, styles.pb8]}>
                            <Text
                                family="EXP_NEW_KANSAS_MEDIUM"
                                fontSize={variables.fontSizeLarge}
                                style={styles.pb5}
                            >
                                {translate('violations.confirmDetails')}
                            </Text>
                            <Text>{translate('violations.confirmDuplicatesInfo')}</Text>
                        </View>
                        {/* We need that provider here because MoneyRequestView component requires that */}
                        <ShowContextMenuContext.Provider value={contextValue}>
                            <MoneyRequestView
                                allReports={allReports}
                                report={report}
                                expensePolicy={policy}
                                shouldShowAnimatedBackground={false}
                                readonly
                                isFromReviewDuplicates
                                updatedTransaction={newTransaction as OnyxEntry<Transaction>}
                            />
                        </ShowContextMenuContext.Provider>
                    </ScrollView>
                    <FixedFooter style={styles.mtAuto}>
                        <Button
                            text={translate('common.confirm')}
                            success
                            onPress={() => {
                                if (!isReportOwner) {
                                    resolveDuplicates();
                                    return;
                                }
                                mergeDuplicates();
                            }}
                            large
                        />
                    </FixedFooter>
                </View>
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

Confirmation.displayName = 'Confirmation';

export default Confirmation;
