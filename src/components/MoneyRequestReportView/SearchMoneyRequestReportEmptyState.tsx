import React from 'react';
import {View} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';
import EmptyStateComponent from '@components/EmptyStateComponent';
import * as Expensicons from '@components/Icon/Expensicons';
import LottieAnimations from '@components/LottieAnimations';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {shouldRestrictUserBillableActions} from '@libs/SubscriptionUtils';
import Navigation from '@navigation/Navigation';
import {startMoneyRequest} from '@userActions/IOU';
import {openUnreportedExpense} from '@userActions/Report';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {Policy} from '@src/types/onyx';

const minModalHeight = 380;

function SearchMoneyRequestReportEmptyState({reportId, policy}: {reportId?: string; policy?: Policy}) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const addExpenseDropdownOptions = [
        {
            value: CONST.REPORT.ADD_EXPENSE_OPTIONS.CREATE_NEW_EXPENSE,
            text: translate('iou.createNewExpense'),
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
            <ScrollView>
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
                    minModalHeight={minModalHeight}
                    buttons={[{buttonText: translate('iou.addExpense'), buttonAction: () => {}, success: true, isDisabled: false, dropDownOptions: addExpenseDropdownOptions}]}
                />
            </ScrollView>
        </View>
    );
}

SearchMoneyRequestReportEmptyState.displayName = 'SearchMoneyRequestReportEmptyState';

export default SearchMoneyRequestReportEmptyState;
