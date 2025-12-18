import React, {useEffect} from 'react';
import {View} from 'react-native';
import type {ValueOf} from 'type-fest';
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
import {getTaxName} from '@libs/TransactionUtils';
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
    const [allTransactions] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION);
    const [allReports] = useOnyx(ONYXKEYS.COLLECTION.REPORT);
    const [allReportActions] = useOnyx(ONYXKEYS.COLLECTION.REPORT_ACTIONS);

    // Determine policyID based on context:
    // - If all selected transactions belong to the same policy, use that policy
    // - Otherwise, fall back to the user's active workspace policy
    const transactionValues = Object.values(selectedTransactions);
    let policyID = activePolicyID;
    if (transactionValues.length > 0) {
        const firstPolicyID = transactionValues.at(0)?.policyID;
        const allSamePolicy = transactionValues.every((t) => t.policyID === firstPolicyID);

        if (allSamePolicy && firstPolicyID) {
            policyID = firstPolicyID;
        }
    }

    const policy = policyID ? policies?.[`${ONYXKEYS.COLLECTION.POLICY}${policyID}`] : undefined;

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

        const transactionChanges: TransactionChanges = {};

        selectedTransactionIDs.forEach((transactionID) => {
            const transaction = allTransactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`];
            if (!transaction) {
                return;
            }

            const transactionThreadReportID = transaction.reportID;
            const transactionThread = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${transactionThreadReportID}`] ?? null;
            const iouReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${transactionThread?.parentReportID}`] ?? null;

            const reportActions = allReportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transactionThreadReportID}`] ?? {};
            const reportAction = getIOUActionForTransactionID(Object.values(reportActions), transactionID);

            const canEditField = (field: ValueOf<typeof CONST.EDIT_REQUEST_FIELD>) => {
                return canEditFieldOfMoneyRequest(reportAction, field, undefined, false, undefined, transaction, iouReport, policy);
            };

            if (changes.merchant && canEditField(CONST.EDIT_REQUEST_FIELD.MERCHANT)) {
                transactionChanges.merchant = changes.merchant;
            }
            if (changes.created && canEditField(CONST.EDIT_REQUEST_FIELD.DATE)) {
                transactionChanges.created = changes.created;
            }
            if (changes.amount && canEditField(CONST.EDIT_REQUEST_FIELD.AMOUNT)) {
                transactionChanges.amount = changes.amount;
            }
            if (changes.currency && canEditField(CONST.EDIT_REQUEST_FIELD.CURRENCY)) {
                transactionChanges.currency = changes.currency;
            }
            if (changes.category && canEditField(CONST.EDIT_REQUEST_FIELD.CATEGORY)) {
                transactionChanges.category = changes.category;
            }
            if (changes.tag && canEditField(CONST.EDIT_REQUEST_FIELD.TAG)) {
                transactionChanges.tag = changes.tag;
            }
            if (changes.comment && canEditField(CONST.EDIT_REQUEST_FIELD.DESCRIPTION)) {
                transactionChanges.comment = changes.comment;
            }
            if (changes.taxCode && canEditField(CONST.EDIT_REQUEST_FIELD.TAX_RATE)) {
                transactionChanges.taxCode = changes.taxCode;
            }
            if (changes.billable !== undefined && canEditField(CONST.EDIT_REQUEST_FIELD.REIMBURSABLE)) {
                transactionChanges.billable = changes.billable;
            }
            if (changes.reimbursable !== undefined && canEditField(CONST.EDIT_REQUEST_FIELD.REIMBURSABLE)) {
                transactionChanges.reimbursable = changes.reimbursable;
            }
        });

        updateMultipleMoneyRequests(selectedTransactionIDs, transactionChanges, policy, allReports, allTransactions);

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
        },
        {
            description: translate('common.date'),
            title: draftTransaction?.created ?? '',
            route: ROUTES.SEARCH_EDIT_MULTIPLE_DATE_RHP,
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
        {
            description: translate('iou.taxRate'),
            title: draftTransaction?.taxCode ? getTaxName(policy, draftTransaction) : '',
            route: ROUTES.SEARCH_EDIT_MULTIPLE_TAX_RHP,
        },
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
                            shouldShowRightIcon
                        />
                    ))}
                    <View style={[styles.flexRow, styles.alignItemsCenter, styles.justifyContentBetween, styles.ph5, styles.pv3]}>
                        <Text>{translate('common.billable')}</Text>
                        <Switch
                            isOn={!!draftTransaction?.billable}
                            onToggle={updateBillable}
                            accessibilityLabel={translate('common.billable')}
                        />
                    </View>
                    <View style={[styles.flexRow, styles.alignItemsCenter, styles.justifyContentBetween, styles.ph5, styles.pv3]}>
                        <Text>{translate('iou.reimbursable')}</Text>
                        <Switch
                            isOn={!!draftTransaction?.reimbursable}
                            onToggle={updateReimbursable}
                            accessibilityLabel={translate('iou.reimbursable')}
                        />
                    </View>
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
