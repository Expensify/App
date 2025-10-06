import React from 'react';
import {View} from 'react-native';
import EmptyStateComponent from '@components/EmptyStateComponent';
import * as Expensicons from '@components/Icon/Expensicons';
import LottieAnimations from '@components/LottieAnimations';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {canAddTransaction, isArchivedReport} from '@libs/ReportUtils';
import {shouldRestrictUserBillableActions} from '@libs/SubscriptionUtils';
import Navigation from '@navigation/Navigation';
import {startMoneyRequest} from '@userActions/IOU';
import {openUnreportedExpense} from '@userActions/Report';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type * as OnyxTypes from '@src/types/onyx';

const minModalHeight = 380;

function SearchMoneyRequestReportEmptyState({report, policy}: {report: OnyxTypes.Report; policy?: OnyxTypes.Policy}) {
    const [reportNameValuePairs] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${report.reportID}`, {canBeMissing: true});
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const reportId = report.reportID;
    const isReportArchived = isArchivedReport(reportNameValuePairs);
    const canAddTransactionToReport = canAddTransaction(report, isReportArchived);
    const addExpenseDropdownOptions = [
        {
            value: CONST.REPORT.ADD_EXPENSE_OPTIONS.CREATE_NEW_EXPENSE,
            text: translate('iou.createExpense'),
            icon: Expensicons.Plus,
            onSelected: () => {
                if (!reportId) {
                    return;
                }
                if (policy && shouldRestrictUserBillableActions(policy.id)) {
                    Navigation.navigate(ROUTES.RESTRICTED_ACTION.getRoute(policy.id));
                    return;
                }
                startMoneyRequest(CONST.IOU.TYPE.SUBMIT, reportId);
            },
        },
        {
            value: CONST.REPORT.ADD_EXPENSE_OPTIONS.ADD_UNREPORTED_EXPENSE,
            text: translate('iou.addUnreportedExpense'),
            icon: Expensicons.ReceiptPlus,
            onSelected: () => {
                if (policy && shouldRestrictUserBillableActions(policy.id)) {
                    Navigation.navigate(ROUTES.RESTRICTED_ACTION.getRoute(policy.id));
                    return;
                }
                openUnreportedExpense(reportId);
            },
        },
    ];

    return (
        <View style={styles.flex1}>
            <EmptyStateComponent
                cardStyles={[styles.appBG]}
                cardContentStyles={[styles.pt5, styles.pb0]}
                headerMediaType={CONST.EMPTY_STATE_MEDIA.ANIMATION}
                headerMedia={LottieAnimations.GenericEmptyState}
                title={translate('search.moneyRequestReport.emptyStateTitle')}
                subtitle={canAddTransactionToReport ? translate('search.moneyRequestReport.emptyStateSubtitle') : ''}
                headerStyles={[styles.emptyStateMoneyRequestReport]}
                lottieWebViewStyles={styles.emptyStateFolderWebStyles}
                headerContentStyles={styles.emptyStateFolderWebStyles}
                minModalHeight={minModalHeight}
                buttons={
                    canAddTransactionToReport
                        ? [{buttonText: translate('iou.addExpense'), buttonAction: () => {}, success: true, isDisabled: false, dropDownOptions: addExpenseDropdownOptions}]
                        : []
                }
            />
        </View>
    );
}

SearchMoneyRequestReportEmptyState.displayName = 'SearchMoneyRequestReportEmptyState';

export default SearchMoneyRequestReportEmptyState;
