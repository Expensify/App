import React, {useEffect} from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import {useSearchContext} from '@components/Search/SearchContext';
import Switch from '@components/Switch';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {clearBulkEditDraftTransaction, initBulkEditDraftTransaction, updateBulkEditDraftTransaction, updateMultipleMoneyRequests} from '@libs/actions/IOU';
import {convertToDisplayString} from '@libs/CurrencyUtils';
import Navigation from '@libs/Navigation/Navigation';
import {getIOUActionForTransactionID} from '@libs/ReportActionsUtils';
import {canEditFieldOfMoneyRequest} from '@libs/ReportUtils';
import {getSearchBulkEditPolicyID} from '@libs/SearchUIUtils';
import {getTaxName, isDistanceRequest, isManagedCardTransaction, isPerDiemRequest} from '@libs/TransactionUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {TransactionChanges} from '@src/types/onyx/Transaction';

function SearchEditMultiplePage() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {selectedTransactions, selectedTransactionIDs} = useSearchContext();
    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {canBeMissing: true});
    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID, {canBeMissing: true});
    const [draftTransaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${CONST.IOU.OPTIMISTIC_BULK_EDIT_TRANSACTION_ID}`, {canBeMissing: true});
    const [allTransactions] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION, {canBeMissing: true});
    const [allReports] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {canBeMissing: true});
    const [allReportActions] = useOnyx(ONYXKEYS.COLLECTION.REPORT_ACTIONS, {canBeMissing: true});

    const hasCustomUnitTransaction = selectedTransactionIDs.some((transactionID) => {
        const transaction = allTransactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`];
        return isDistanceRequest(transaction) || isPerDiemRequest(transaction);
    });

    const hasPartiallyEditableTransaction = selectedTransactionIDs.some((transactionID) => {
        const transaction = allTransactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`];
        if (!transaction) {
            return false;
        }

        const report = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${transaction.reportID}`];
        const reportActions = allReportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transaction.reportID}`] ?? {};
        const reportAction = getIOUActionForTransactionID(Object.values(reportActions), transactionID);
        const transactionPolicy = policies?.[`${ONYXKEYS.COLLECTION.POLICY}${report?.policyID}`];

        return !canEditFieldOfMoneyRequest(reportAction, CONST.EDIT_REQUEST_FIELD.AMOUNT, undefined, false, undefined, transaction, report, transactionPolicy);
    });

    const areSelectedTransactionsBillable = selectedTransactionIDs.every((transactionID) => {
        const transaction = allTransactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`];
        if (!transaction) {
            return false;
        }

        const report = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${transaction.reportID}`];
        const transactionPolicy = policies?.[`${ONYXKEYS.COLLECTION.POLICY}${report?.policyID}`];
        return transactionPolicy?.disabledFields?.defaultBillable === false || !!transaction.billable;
    });

    const areSelectedTransactionsReimbursable = selectedTransactionIDs.every((transactionID) => {
        const transaction = allTransactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`];
        if (!transaction) {
            return false;
        }

        const report = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${transaction.reportID}`];
        const transactionPolicy = policies?.[`${ONYXKEYS.COLLECTION.POLICY}${report?.policyID}`];
        return transactionPolicy?.disabledFields?.reimbursable === false && !isManagedCardTransaction(transaction);
    });

    // Determine policyID based on context:
    // - If all selected transactions belong to the same policy, use that policy
    // - Otherwise, fall back to the user's active workspace policy
    const policyID = getSearchBulkEditPolicyID(selectedTransactions, activePolicyID);

    const policy = policyID ? policies?.[`${ONYXKEYS.COLLECTION.POLICY}${policyID}`] : undefined;

    const isTaxTrackingEnabled = !!policy?.tax?.trackingEnabled;

    const currency = policy?.outputCurrency ?? CONST.CURRENCY.USD;

    useEffect(() => {
        if (!draftTransaction) {
            initBulkEditDraftTransaction(currency);
        }

        return () => {
            clearBulkEditDraftTransaction();
        };
    }, [currency, draftTransaction]);

    const save = () => {
        if (!draftTransaction) {
            return;
        }

        const changes: TransactionChanges = {};
        if (draftTransaction.amount !== undefined && draftTransaction.amount !== 0) {
            changes.amount = draftTransaction.amount;
        }
        if (draftTransaction.currency) {
            changes.currency = draftTransaction.currency;
        }
        if (draftTransaction.merchant) {
            changes.merchant = draftTransaction.merchant;
        }
        if (draftTransaction.comment?.comment) {
            changes.comment = draftTransaction.comment.comment;
        }
        if (draftTransaction.created) {
            changes.created = draftTransaction.created;
        }
        if (draftTransaction.category) {
            changes.category = draftTransaction.category;
        }
        if (draftTransaction.tag) {
            changes.tag = draftTransaction.tag;
        }
        if (draftTransaction.taxCode) {
            changes.taxCode = draftTransaction.taxCode;
        }
        if (draftTransaction.billable !== undefined) {
            changes.billable = draftTransaction.billable;
        }
        if (draftTransaction.reimbursable !== undefined) {
            changes.reimbursable = draftTransaction.reimbursable;
        }

        if (Object.keys(changes).length === 0) {
            Navigation.dismissModal();
            return;
        }

        updateMultipleMoneyRequests(selectedTransactionIDs, changes, policy, allReports, allTransactions, allReportActions);

        Navigation.dismissModal();
    };

    const displayCurrency = draftTransaction?.currency ?? currency;

    const updateBillable = (billable: boolean) => {
        updateBulkEditDraftTransaction({billable});
    };

    const updateReimbursable = (reimbursable: boolean) => {
        updateBulkEditDraftTransaction({reimbursable});
    };

    const fields = [
        {
            description: translate('iou.amount'),
            title: draftTransaction?.amount ? convertToDisplayString(Math.abs(draftTransaction.amount), displayCurrency) : '',
            route: ROUTES.SEARCH_EDIT_MULTIPLE_AMOUNT_RHP,
            disabled: hasCustomUnitTransaction || hasPartiallyEditableTransaction,
        },
        {
            description: translate('common.description'),
            title: draftTransaction?.comment?.comment ?? '',
            route: ROUTES.SEARCH_EDIT_MULTIPLE_DESCRIPTION_RHP,
        },
        {
            description: translate('common.merchant'),
            title: draftTransaction?.merchant ?? '',
            route: ROUTES.SEARCH_EDIT_MULTIPLE_MERCHANT_RHP,
            disabled: hasCustomUnitTransaction,
        },
        {
            description: translate('common.date'),
            title: draftTransaction?.created ?? '',
            route: ROUTES.SEARCH_EDIT_MULTIPLE_DATE_RHP,
            disabled: hasPartiallyEditableTransaction,
        },
        {
            description: translate('common.category'),
            title: draftTransaction?.category ?? '',
            route: ROUTES.SEARCH_EDIT_MULTIPLE_CATEGORY_RHP,
        },
        {
            description: translate('common.tag'),
            title: draftTransaction?.tag ?? '',
            route: ROUTES.SEARCH_EDIT_MULTIPLE_TAG_RHP,
        },
        ...(isTaxTrackingEnabled
            ? [
                  {
                      description: translate('iou.taxRate'),
                      title: draftTransaction?.taxCode ? (getTaxName(policy, draftTransaction) ?? '') : '',
                      route: ROUTES.SEARCH_EDIT_MULTIPLE_TAX_RHP,
                      disabled: hasCustomUnitTransaction,
                  },
              ]
            : []),
    ];

    return (
        <ScreenWrapper testID={SearchEditMultiplePage.displayName}>
            <HeaderWithBackButton
                title={translate('search.bulkActions.editMultipleTitle')}
                onBackButtonPress={Navigation.goBack}
            />
            <View style={[styles.flex1]}>
                <ScrollView contentContainerStyle={styles.flexGrow1}>
                    <Text style={[styles.ph5, styles.mb5, styles.textSupporting]}>{translate('search.bulkActions.editMultipleDescription')}</Text>
                    {fields.map((field) => (
                        <MenuItemWithTopDescription
                            key={field.description}
                            title={field.title}
                            description={field.description}
                            onPress={() => Navigation.navigate(field.route)}
                            shouldShowRightIcon={!field.disabled}
                            disabled={field.disabled}
                            interactive={!field.disabled}
                        />
                    ))}
                    {areSelectedTransactionsBillable && (
                        <View style={[styles.flexRow, styles.alignItemsCenter, styles.justifyContentBetween, styles.ph5, styles.pv3]}>
                            <Text>{translate('common.billable')}</Text>
                            <Switch
                                isOn={!!draftTransaction?.billable}
                                onToggle={updateBillable}
                                accessibilityLabel={translate('common.billable')}
                            />
                        </View>
                    )}
                    {areSelectedTransactionsReimbursable && (
                        <View style={[styles.flexRow, styles.alignItemsCenter, styles.justifyContentBetween, styles.ph5, styles.pv3]}>
                            <Text>{translate('iou.reimbursable')}</Text>
                            <Switch
                                isOn={!!draftTransaction?.reimbursable}
                                onToggle={updateReimbursable}
                                accessibilityLabel={translate('iou.reimbursable')}
                            />
                        </View>
                    )}
                </ScrollView>
                <Button
                    success
                    large
                    text={translate('common.save')}
                    onPress={save}
                    style={[styles.m5]}
                />
            </View>
        </ScreenWrapper>
    );
}

SearchEditMultiplePage.displayName = 'SearchEditMultiplePage';

export default SearchEditMultiplePage;
