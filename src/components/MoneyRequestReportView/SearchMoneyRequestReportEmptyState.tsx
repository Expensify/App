import React from 'react';
import {View} from 'react-native';
import EmptyStateComponent from '@components/EmptyStateComponent';
import * as Expensicons from '@components/Icon/Expensicons';
import LottieAnimations from '@components/LottieAnimations';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useReportIsArchived from '@hooks/useReportIsArchived';
import useThemeStyles from '@hooks/useThemeStyles';
import {isAddExpenseAction} from '@libs/ReportPrimaryActionUtils';
import {shouldRestrictUserBillableActions} from '@libs/SubscriptionUtils';
import Navigation from '@navigation/Navigation';
import {startMoneyRequest} from '@userActions/IOU';
import {openUnreportedExpense} from '@userActions/Report';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Policy} from '@src/types/onyx';

const MIN_MODAL_HEIGHT = 380;

function SearchMoneyRequestReportEmptyState({reportId, policy}: {reportId?: string; policy?: Policy}) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportId}`, {canBeMissing: true});
    const isChatReportArchived = useReportIsArchived(reportId);
    const canAddExpense = !!(report && isAddExpenseAction(report, [], isChatReportArchived));

    const handleCreateNewExpense = () => {
        if (!reportId) {
            return;
        }

        if (policy && shouldRestrictUserBillableActions(policy.id)) {
            Navigation.navigate(ROUTES.RESTRICTED_ACTION.getRoute(policy.id));
            return;
        }
        startMoneyRequest(CONST.IOU.TYPE.SUBMIT, reportId);
    };

    const handleAddUnreportedExpense = () => {
        if (policy && shouldRestrictUserBillableActions(policy.id)) {
            Navigation.navigate(ROUTES.RESTRICTED_ACTION.getRoute(policy.id));
            return;
        }

        openUnreportedExpense(reportId);
    };

    const addExpenseOptions = [
        {
            value: CONST.REPORT.ADD_EXPENSE_OPTIONS.CREATE_NEW_EXPENSE,
            text: translate('iou.createNewExpense'),
            icon: Expensicons.Plus,
            onSelected: handleCreateNewExpense,
        },
        {
            value: CONST.REPORT.ADD_EXPENSE_OPTIONS.ADD_UNREPORTED_EXPENSE,
            text: translate('iou.addUnreportedExpense'),
            icon: Expensicons.ReceiptPlus,
            onSelected: handleAddUnreportedExpense,
        },
    ];

    const buttonText = canAddExpense ? translate('iou.addExpense') : translate('iou.addUnreportedExpense');
    const buttonAction = canAddExpense ? handleCreateNewExpense : handleAddUnreportedExpense;
    const dropDownOptions = canAddExpense ? addExpenseOptions : undefined;

    return (
        <View style={styles.flex1}>
            <EmptyStateComponent
                cardStyles={[styles.appBG]}
                cardContentStyles={[styles.pt5, styles.pb0]}
                headerMediaType={CONST.EMPTY_STATE_MEDIA.ANIMATION}
                headerMedia={LottieAnimations.GenericEmptyState}
                title={translate('search.moneyRequestReport.emptyStateTitle')}
                subtitle={translate('search.moneyRequestReport.emptyStateSubtitle')}
                headerStyles={[styles.emptyStateMoneyRequestReport]}
                lottieWebViewStyles={styles.emptyStateFolderWebStyles}
                headerContentStyles={styles.emptyStateFolderWebStyles}
                minModalHeight={MIN_MODAL_HEIGHT}
                buttons={[
                    {
                        buttonText,
                        buttonAction,
                        success: true,
                        isDisabled: false,
                        dropDownOptions,
                    },
                ]}
            />
        </View>
    );
}

SearchMoneyRequestReportEmptyState.displayName = 'SearchMoneyRequestReportEmptyState';
export default SearchMoneyRequestReportEmptyState;
