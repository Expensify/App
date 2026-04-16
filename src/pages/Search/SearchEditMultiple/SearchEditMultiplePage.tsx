import React, {useEffect} from 'react';
import {View} from 'react-native';
import type {ValueOf} from 'type-fest';
import Button from '@components/Button';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import {useSearchActionsContext, useSearchStateContext} from '@components/Search/SearchContext';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {clearBulkEditDraftTransaction, updateMultipleMoneyRequests} from '@libs/actions/IOU/BulkEdit';
import {convertToDisplayStringWithoutCurrency} from '@libs/CurrencyUtils';
import Navigation from '@libs/Navigation/Navigation';
import {hasEnabledOptions} from '@libs/OptionsListUtils';
import {getCleanedTagName, getTagLists, hasDependentTags as hasDependentTagsPolicyUtils} from '@libs/PolicyUtils';
import {canEditFieldOfMoneyRequest, isInvoiceReport, isIOUReport} from '@libs/ReportUtils';
import {getSearchBulkEditPolicyID} from '@libs/SearchUIUtils';
import {hasEnabledTags, shouldShowDependentTagList} from '@libs/TagsOptionsListUtils';
import {getTagArrayFromName, getTaxName, isDistanceRequest, isManagedCardTransaction, isPerDiemRequest, isTimeRequest} from '@libs/TransactionUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Route} from '@src/ROUTES';
import type {TransactionChanges} from '@src/types/onyx/Transaction';
import {getTransactionEditContext, withSnapshotReportActions, withSnapshotReports, withSnapshotTransactions} from './SearchEditMultipleUtils';

function SearchEditMultiplePage() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {currentSearchHash, currentSearchResults} = useSearchStateContext();
    const {clearSelectedTransactions} = useSearchActionsContext();
    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID);
    const [draftTransaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${CONST.IOU.OPTIMISTIC_BULK_EDIT_TRANSACTION_ID}`);
    const [allTransactions] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION);
    const [allReports] = useOnyx(ONYXKEYS.COLLECTION.REPORT);
    const [allReportActions] = useOnyx(ONYXKEYS.COLLECTION.REPORT_ACTIONS);
    const [allPolicyTags] = useOnyx(ONYXKEYS.COLLECTION.POLICY_TAGS);
    const [allPolicyCategories] = useOnyx(ONYXKEYS.COLLECTION.POLICY_CATEGORIES);
    const [betas] = useOnyx(ONYXKEYS.BETAS);
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);

    const snapshotData = currentSearchResults?.data;
    const mergedTransactions = withSnapshotTransactions(allTransactions, snapshotData);
    const mergedReportActions = withSnapshotReportActions(allReportActions, snapshotData);
    const mergedReports = withSnapshotReports(allReports, snapshotData);

    const selectedTransactionIDs = draftTransaction?.selectedTransactionIDs ?? [];

    const selectedTransactionContexts = selectedTransactionIDs.flatMap((transactionID) => {
        const context = getTransactionEditContext(transactionID, mergedTransactions, mergedReports, mergedReportActions, policies);
        return context ? [context] : [];
    });

    const hasCustomUnitTransaction = selectedTransactionContexts.some(({transaction}) => isDistanceRequest(transaction) || isPerDiemRequest(transaction));

    const hasPerDiemOrTimeTransaction = selectedTransactionContexts.some(({transaction}) => isPerDiemRequest(transaction) || isTimeRequest(transaction));

    const isFieldDisabledForAnyTransaction = (field: ValueOf<typeof CONST.EDIT_REQUEST_FIELD>) =>
        selectedTransactionContexts.some(({transaction, report, reportAction, transactionPolicy}) => {
            // Unreported expenses have no report actions yet but are always editable
            if (!transaction.reportID || transaction.reportID === CONST.REPORT.UNREPORTED_REPORT_ID) {
                return false;
            }
            return !canEditFieldOfMoneyRequest({reportAction, fieldToEdit: field, transaction, report, policy: transactionPolicy});
        });

    const hasPartiallyEditableTransaction = isFieldDisabledForAnyTransaction(CONST.EDIT_REQUEST_FIELD.AMOUNT);

    const hasPartiallyEditableMerchantTransaction =
        isFieldDisabledForAnyTransaction(CONST.EDIT_REQUEST_FIELD.MERCHANT) || selectedTransactionContexts.some(({transaction}) => isDistanceRequest(transaction));

    const hasPartiallyEditableTaxRateTransaction =
        isFieldDisabledForAnyTransaction(CONST.EDIT_REQUEST_FIELD.TAX_RATE) || selectedTransactionContexts.some(({transaction}) => isDistanceRequest(transaction));

    const hasPartiallyEditableDateTransaction = isFieldDisabledForAnyTransaction(CONST.EDIT_REQUEST_FIELD.DATE);

    const areSelectedTransactionsBillable = selectedTransactionContexts.every(({transaction, transactionPolicy}) => {
        // Unreported expenses have no policy yet but billable is always applicable
        if (!transaction.reportID || transaction.reportID === CONST.REPORT.UNREPORTED_REPORT_ID) {
            return true;
        }
        return transactionPolicy?.disabledFields?.defaultBillable === false || !!transaction.billable;
    });

    const areSelectedTransactionsReimbursable = selectedTransactionContexts.every(({transaction, report, transactionPolicy}) => {
        // Unreported expenses have no policy yet but reimbursable is always applicable
        if (!transaction.reportID || transaction.reportID === CONST.REPORT.UNREPORTED_REPORT_ID) {
            return true;
        }
        return !isIOUReport(report) && !isInvoiceReport(report) && transactionPolicy?.disabledFields?.reimbursable === false && !isManagedCardTransaction(transaction);
    });

    const policyID = getSearchBulkEditPolicyID(selectedTransactionIDs, activePolicyID, mergedTransactions, mergedReports);

    const policy = policyID ? policies?.[`${ONYXKEYS.COLLECTION.POLICY}${policyID}`] : undefined;
    const policyCategories = allPolicyCategories?.[`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`];
    const policyTags = allPolicyTags?.[`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`];
    const policyTagLists = getTagLists(policyTags);

    const isTaxTrackingEnabled = !hasPerDiemOrTimeTransaction && selectedTransactionContexts.every(({transactionPolicy}) => !!transactionPolicy?.tax?.trackingEnabled);
    const areSelectedTransactionsExpenses = selectedTransactionContexts.every(({transaction, report}) => {
        if (!transaction.reportID || transaction.reportID === CONST.REPORT.UNREPORTED_REPORT_ID) {
            return true;
        }
        return !isIOUReport(report);
    });
    const areCategoriesEnabled = areSelectedTransactionsExpenses && !!policy?.areCategoriesEnabled && hasEnabledOptions(policyCategories ?? {});
    const areTagsEnabled = !!policy?.areTagsEnabled && hasEnabledTags(policyTagLists);

    useEffect(() => {
        return () => {
            clearBulkEditDraftTransaction();
        };
    }, []);

    const save = () => {
        if (!draftTransaction) {
            return;
        }

        const changes: TransactionChanges = {};
        if (draftTransaction.amount !== undefined) {
            changes.amount = draftTransaction.amount;
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
        if (typeof draftTransaction.billable === 'boolean') {
            changes.billable = draftTransaction.billable;
        }
        if (typeof draftTransaction.reimbursable === 'boolean') {
            changes.reimbursable = draftTransaction.reimbursable;
        }

        if (Object.keys(changes).length === 0) {
            Navigation.dismissToPreviousRHP();
            return;
        }

        updateMultipleMoneyRequests({
            transactionIDs: selectedTransactionIDs,
            changes,
            policy,
            reports: mergedReports,
            transactions: mergedTransactions,
            reportActions: mergedReportActions,
            policyCategories: allPolicyCategories,
            policyTags: allPolicyTags,
            hash: currentSearchHash,
            allPolicies: policies,
            introSelected,
            betas,
        });
        // Bulk edit can start from report (ID-based selection) or search (map-based selection),
        // so clear both stores to keep deselection behavior consistent.
        clearSelectedTransactions(true);
        clearSelectedTransactions();

        Navigation.dismissToPreviousRHP();
    };

    const currency = policy?.outputCurrency ?? CONST.CURRENCY.USD;

    // TODO: Currency editing and currency symbol should be handled in a separate PR
    const tagsArray = getTagArrayFromName(draftTransaction?.tag ?? '');
    const hasDependentTags = hasDependentTagsPolicyUtils(policy, policyTags);
    const tagFields: Array<{description: string; title: string; route: Route; disabled?: boolean}> = areTagsEnabled
        ? policyTagLists.flatMap((tagList, tagListIndex) => {
              const tagName = tagsArray.at(tagListIndex) ?? '';
              const tagTitle = tagName ? getCleanedTagName(tagName) : '';
              const description = tagList.name || translate('common.tag');
              let shouldShow = true;

              if (hasDependentTags) {
                  shouldShow = shouldShowDependentTagList(tagListIndex, draftTransaction?.tag, tagList.tags);
              }

              if (!shouldShow) {
                  return [];
              }

              return [
                  {
                      description: description || translate('common.tag'),
                      title: tagTitle,
                      route: ROUTES.SEARCH_EDIT_MULTIPLE_TAG_RHP.getRoute(tagListIndex),
                      disabled: false,
                  },
              ];
          })
        : [];

    const getBooleanTitle = (value?: boolean) => {
        if (value === undefined) {
            return '';
        }
        return value ? translate('common.yes') : translate('common.no');
    };

    const fields: Array<{description: string; title: string; route: Route; disabled?: boolean; shouldParseTitle?: boolean}> = [
        {
            description: translate('iou.amount'),
            title: draftTransaction?.amount !== undefined ? convertToDisplayStringWithoutCurrency(draftTransaction.amount, currency) : '',
            route: ROUTES.SEARCH_EDIT_MULTIPLE_AMOUNT_RHP,
            disabled: hasCustomUnitTransaction || hasPartiallyEditableTransaction,
        },
        {
            description: translate('common.description'),
            title: draftTransaction?.comment?.comment ?? '',
            route: ROUTES.SEARCH_EDIT_MULTIPLE_DESCRIPTION_RHP,
            shouldParseTitle: true,
        },
        {
            description: translate('common.merchant'),
            title: draftTransaction?.merchant ?? '',
            route: ROUTES.SEARCH_EDIT_MULTIPLE_MERCHANT_RHP,
            disabled: hasPartiallyEditableMerchantTransaction,
        },
        {
            description: translate('common.date'),
            title: draftTransaction?.created ?? '',
            route: ROUTES.SEARCH_EDIT_MULTIPLE_DATE_RHP,
            disabled: hasPartiallyEditableDateTransaction,
        },
        ...(areCategoriesEnabled
            ? [
                  {
                      description: translate('common.category'),
                      title: draftTransaction?.category ?? '',
                      route: ROUTES.SEARCH_EDIT_MULTIPLE_CATEGORY_RHP,
                  },
              ]
            : []),
        ...tagFields,
        ...(isTaxTrackingEnabled
            ? [
                  {
                      description: policy?.taxRates?.name ?? translate('common.tax'),
                      title: draftTransaction?.taxCode ? (getTaxName(policy, draftTransaction) ?? '') : '',
                      route: ROUTES.SEARCH_EDIT_MULTIPLE_TAX_RHP,
                      disabled: hasPartiallyEditableTaxRateTransaction,
                  },
              ]
            : []),
        ...(areSelectedTransactionsBillable
            ? [
                  {
                      description: translate('common.billable'),
                      title: getBooleanTitle(draftTransaction?.billable),
                      route: ROUTES.SEARCH_EDIT_MULTIPLE_BILLABLE_RHP,
                  },
              ]
            : []),
        ...(areSelectedTransactionsReimbursable
            ? [
                  {
                      description: translate('common.reimbursable'),
                      title: getBooleanTitle(draftTransaction?.reimbursable),
                      route: ROUTES.SEARCH_EDIT_MULTIPLE_REIMBURSABLE_RHP,
                  },
              ]
            : []),
    ];

    return (
        <ScreenWrapper
            testID="SearchEditMultiplePage"
            includeSafeAreaPaddingBottom
        >
            <HeaderWithBackButton
                title={translate('search.bulkActions.editMultipleTitle')}
                onBackButtonPress={Navigation.goBack}
            />
            <View style={[styles.flex1]}>
                <ScrollView contentContainerStyle={styles.flexGrow1}>
                    <Text style={[styles.ph5, styles.mb5, styles.textSupporting]}>{translate('search.bulkActions.editMultipleDescription')}</Text>
                    {fields.map((field) => (
                        <MenuItemWithTopDescription
                            key={field.route}
                            title={field.title}
                            description={field.description}
                            onPress={() => Navigation.navigate(field.route)}
                            shouldShowRightIcon={!field.disabled}
                            disabled={field.disabled}
                            interactive={!field.disabled}
                            shouldParseTitle={field.shouldParseTitle}
                        />
                    ))}
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

export default SearchEditMultiplePage;
