import React, {useEffect} from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import {useSearchContext} from '@components/Search/SearchContext';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {clearBulkEditDraftTransaction, updateMultipleMoneyRequests} from '@libs/actions/IOU';
import {convertToDisplayStringWithoutCurrency} from '@libs/CurrencyUtils';
import Navigation from '@libs/Navigation/Navigation';
import {hasEnabledOptions} from '@libs/OptionsListUtils';
import {getCleanedTagName, getTagLists, hasDependentTags as hasDependentTagsPolicyUtils} from '@libs/PolicyUtils';
import {getIOUActionForTransactionID} from '@libs/ReportActionsUtils';
import {canEditFieldOfMoneyRequest} from '@libs/ReportUtils';
import {getSearchBulkEditPolicyID} from '@libs/SearchUIUtils';
import {hasEnabledTags, shouldShowDependentTagList} from '@libs/TagsOptionsListUtils';
import {getTagArrayFromName, getTaxName, isDistanceRequest, isManagedCardTransaction, isPerDiemRequest} from '@libs/TransactionUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Route} from '@src/ROUTES';
import type {TransactionChanges} from '@src/types/onyx/Transaction';
import getCommonDependentTag from './SearchEditMultipleUtils';

function SearchEditMultiplePage() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {clearSelectedTransactions} = useSearchContext();
    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {canBeMissing: true});
    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID, {canBeMissing: true});
    const [draftTransaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${CONST.IOU.OPTIMISTIC_BULK_EDIT_TRANSACTION_ID}`, {canBeMissing: true});
    const [allTransactions] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION, {canBeMissing: true});
    const [allReports] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {canBeMissing: true});
    const [allReportActions] = useOnyx(ONYXKEYS.COLLECTION.REPORT_ACTIONS, {canBeMissing: true});

    const selectedTransactionIDs = draftTransaction?.selectedTransactionIDs ?? [];

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

    const policyID = getSearchBulkEditPolicyID(selectedTransactionIDs, activePolicyID, allTransactions, allReports);

    const policy = policyID ? policies?.[`${ONYXKEYS.COLLECTION.POLICY}${policyID}`] : undefined;
    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`, {canBeMissing: true});
    const [policyTags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`, {canBeMissing: true});
    const policyTagLists = getTagLists(policyTags);

    const isTaxTrackingEnabled = !!policy?.tax?.trackingEnabled;
    const areCategoriesEnabled = !!policy?.areCategoriesEnabled && hasEnabledOptions(policyCategories ?? {});
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
        if (draftTransaction.billable !== undefined) {
            changes.billable = draftTransaction.billable;
        }
        if (draftTransaction.reimbursable !== undefined) {
            changes.reimbursable = draftTransaction.reimbursable;
        }

        if (Object.keys(changes).length === 0) {
            Navigation.dismissToPreviousRHP();
            return;
        }

        updateMultipleMoneyRequests(selectedTransactionIDs, changes, policy, allReports, allTransactions, allReportActions);
        clearSelectedTransactions(true);

        Navigation.dismissToPreviousRHP();
    };

    const currency = policy?.outputCurrency ?? CONST.CURRENCY.USD;

    // TODO: Currency editing and currency symbol should be handled in a separate PR
    const selectedTransactionsList = selectedTransactionIDs.map((transactionID) => allTransactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`]);
    const commonDependentTag = getCommonDependentTag(selectedTransactionsList);
    const dependentTagSource = draftTransaction?.tag === undefined ? commonDependentTag : draftTransaction?.tag;
    const tagsArray = getTagArrayFromName(draftTransaction?.tag ?? '');
    const hasDependentTags = hasDependentTagsPolicyUtils(policy, policyTags);
    const tagFields: Array<{description: string; title: string; route: Route; disabled?: boolean}> = areTagsEnabled
        ? policyTagLists.flatMap((tagList, tagListIndex) => {
              const tagName = tagsArray.at(tagListIndex) ?? '';
              const tagTitle = tagName ? getCleanedTagName(tagName) : '';
              const description = policyTagLists.length > 1 ? tagList.name : translate('common.tag');
              let shouldShow = true;

              if (hasDependentTags) {
                  shouldShow = shouldShowDependentTagList(tagListIndex, dependentTagSource, tagList.tags);
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

    const fields: Array<{description: string; title: string; route: Route; disabled?: boolean}> = [
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
                      description: translate('iou.taxRate'),
                      title: draftTransaction?.taxCode ? (getTaxName(policy, draftTransaction) ?? '') : '',
                      route: ROUTES.SEARCH_EDIT_MULTIPLE_TAX_RHP,
                      disabled: hasCustomUnitTransaction,
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
        <ScreenWrapper testID="SearchEditMultiplePage">
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
