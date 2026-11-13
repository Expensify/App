import AmountFormField from '@components/AmountFormField';
import Button from '@components/Button';
import DatePicker from '@components/DatePicker';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import ExpenseFieldDropdown from '@components/MoneyRequestConfirmationList/sections/ExpenseFieldDropdown';
import ExpenseFieldRow from '@components/MoneyRequestConfirmationList/sections/ExpenseFieldRow';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import {useSearchQueryContext, useSearchResultsContext, useSearchSelectionActions} from '@components/Search/SearchContext';
import {SELECTION_LIST_POPOVER_HEADER_HEIGHT} from '@components/SelectionListPopoverHeader';
import Text from '@components/Text';
import TextInput from '@components/TextInput';

import useConfirmModal from '@hooks/useConfirmModal';
import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDelegateAccountID from '@hooks/useDelegateAccountID';
import useLoadPolicyCategories from '@hooks/useLoadPolicyCategories';
import useLoadPolicyTags from '@hooks/useLoadPolicyTags';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import {usePersonalDetailsByIDs} from '@hooks/usePersonalDetails';
import usePersonalPolicy from '@hooks/usePersonalPolicy';
import type {StartWithLoading} from '@hooks/usePressLoading';
import useThemeStyles from '@hooks/useThemeStyles';

import {clearBulkEditDraftTransaction, updateBulkEditDraftTransaction, updateMultipleMoneyRequests} from '@libs/actions/IOU/BulkEdit';
import {convertToFrontendAmountAsString, getLocalizedCurrencySymbol} from '@libs/CurrencyUtils';
import {getBackendAmountFromInput} from '@libs/MoneyRequestUtils';
import Navigation from '@libs/Navigation/Navigation';
import {hasEnabledOptions} from '@libs/OptionsListUtils';
import {getCleanedTagName, getTagLists, hasDependentTags as hasDependentTagsPolicyUtils} from '@libs/PolicyUtils';
import {canEditFieldOfMoneyRequest, isInvoiceReport, isIOUReport, isReportApproved, isSettled} from '@libs/ReportUtils';
import {getSearchBulkEditPolicyID} from '@libs/SearchUIUtils';
import {getDependentTagVisibility, hasEnabledTags} from '@libs/TagsOptionsListUtils';
import startOpenCategoryPickerSpan from '@libs/telemetry/startOpenCategoryPickerSpan';
import {
    getAttendeesListDisplayString,
    getTagArrayFromName,
    getTaxName,
    hasSplitExpenseInSelection,
    isCardTransactionReimbursableEditable,
    isDistanceRequest,
    isManagedCardTransaction,
    isPerDiemRequest,
    isTimeRequest,
} from '@libs/TransactionUtils';
import {isInvalidMerchantValue, isValidDate, isValidInputLength} from '@libs/ValidationUtils';

import IOURequestStepCurrencyModal from '@pages/iou/request/step/IOURequestStepCurrencyModal';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {TransactionChanges} from '@src/types/onyx/Transaction';

import type {GestureResponderEvent} from 'react-native';
import type {ValueOf} from 'type-fest';

import noop from 'lodash/noop';
import React, {useEffect, useRef, useState} from 'react';
import {View} from 'react-native';

import SearchEditMultipleAttendeePills from './SearchEditMultipleAttendeePills';
import SearchEditMultipleAttendeesDropdown from './SearchEditMultipleAttendeesDropdown';
import SearchEditMultipleBooleanDropdown from './SearchEditMultipleBooleanDropdown';
import SearchEditMultipleCategoryDropdown from './SearchEditMultipleCategoryDropdown';
import SearchEditMultipleTagDropdown from './SearchEditMultipleTagDropdown';
import SearchEditMultipleTaxDropdown from './SearchEditMultipleTaxDropdown';
import {
    areAllTransactionsExpenseCompatible,
    getTransactionEditContext,
    hasCustomUnitMerchantInSelection,
    isBulkEditAttendeeTrackingEnabled,
    isBulkEditNegativeAmountAllowed,
    isBulkEditTaxTrackingEnabled,
    withSnapshotReportActions,
    withSnapshotReports,
    withSnapshotTransactions,
} from './SearchEditMultipleUtils';

/** The date input has no form around it, so this only names the input to the picker */
const DATE_INPUT_ID = 'created';

function SearchEditMultiplePage() {
    const {translate, localeCompare, formatPhoneNumber, preferredLocale} = useLocalize();
    const {isBetaEnabledOrUnknown} = usePermissions();
    const isVendorMatchingBetaEnabled = isBetaEnabledOrUnknown(CONST.BETAS.VENDOR_MATCHING);
    const {convertToDisplayStringWithoutCurrency, getCurrencyDecimals, getCurrencySymbol} = useCurrencyListActions();
    const styles = useThemeStyles();
    const {currentSearchHash} = useSearchQueryContext();
    const {currentSearchResults} = useSearchResultsContext();
    const {clearSelectedTransactions} = useSearchSelectionActions();
    const {showConfirmModal} = useConfirmModal();
    const {accountID: currentUserAccountID} = useCurrentUserPersonalDetails();
    const personalPolicy = usePersonalPolicy();
    const delegateAccountID = useDelegateAccountID();
    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID);
    const [draftTransaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${CONST.IOU.OPTIMISTIC_BULK_EDIT_TRANSACTION_ID}`);
    const selectedTransactionIDs = draftTransaction?.selectedTransactionIDs ?? [];
    const [allTransactions] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION);
    const [allReports] = useOnyx(ONYXKEYS.COLLECTION.REPORT);
    const [allReportActions] = useOnyx(ONYXKEYS.COLLECTION.REPORT_ACTIONS);
    const [allPolicyTags] = useOnyx(ONYXKEYS.COLLECTION.POLICY_TAGS);
    const [allPolicyTagsLoadingStates] = useOnyx(ONYXKEYS.COLLECTION.RAM_ONLY_POLICY_TAGS_LOADING_STATE);
    const [allPolicyCategories] = useOnyx(ONYXKEYS.COLLECTION.POLICY_CATEGORIES);
    const [allTransactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS);
    const [personalDetailsList] = usePersonalDetailsByIDs(
        selectedTransactionIDs.map((transactionID) => {
            const iouReportID = allTransactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`]?.reportID;
            return allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${iouReportID}`]?.ownerAccountID;
        }),
    );

    const [reportNameValuePairs] = useOnyx(ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS);
    const [rules] = useOnyx(ONYXKEYS.COLLECTION.RULE);

    const snapshotData = currentSearchResults?.data;
    const mergedTransactions = withSnapshotTransactions(allTransactions, snapshotData);
    const mergedReportActions = withSnapshotReportActions(allReportActions, snapshotData);
    const mergedReports = withSnapshotReports(allReports, snapshotData);

    const selectedTransactionContexts = selectedTransactionIDs.flatMap((transactionID) => {
        const context = getTransactionEditContext(transactionID, mergedTransactions, mergedReports, mergedReportActions, policies);
        return context ? [context] : [];
    });

    const hasCustomUnitTransaction = selectedTransactionContexts.some(({transaction}) => isDistanceRequest(transaction) || isPerDiemRequest(transaction));

    const hasPerDiemOrTimeTransaction = selectedTransactionContexts.some(({transaction}) => isPerDiemRequest(transaction) || isTimeRequest(transaction));

    const hasSplitTransaction = hasSplitExpenseInSelection(selectedTransactionContexts.map(({transaction}) => transaction));

    // Expenses on approved or paid reports are finalized records. Editing them in bulk is allowed for admins, but it
    // needs an explicit confirmation first so a large selection can't quietly rewrite them.
    const finalizedTransactionCount = selectedTransactionContexts.filter(({report}) => isReportApproved({report}) || isSettled(report)).length;

    const isFieldDisabledForAnyTransaction = (field: ValueOf<typeof CONST.EDIT_REQUEST_FIELD>) =>
        selectedTransactionContexts.some(({transaction, report, reportAction, reportActions, transactionPolicy}) => {
            // Unreported expenses have no report actions yet but are always editable
            if (!transaction.reportID || transaction.reportID === CONST.REPORT.UNREPORTED_REPORT_ID) {
                return false;
            }
            return !canEditFieldOfMoneyRequest({
                reportAction,
                fieldToEdit: field,
                transaction,
                report,
                policy: transactionPolicy,
                reportNameValuePairs,
                reportActions,
                rules,
            });
        });

    const hasPartiallyEditableTransaction = isFieldDisabledForAnyTransaction(CONST.EDIT_REQUEST_FIELD.AMOUNT);

    const hasPartiallyEditableMerchantTransaction = isFieldDisabledForAnyTransaction(CONST.EDIT_REQUEST_FIELD.MERCHANT) || hasCustomUnitMerchantInSelection(selectedTransactionContexts);

    const hasPartiallyEditableTaxRateTransaction =
        isFieldDisabledForAnyTransaction(CONST.EDIT_REQUEST_FIELD.TAX_RATE) || selectedTransactionContexts.some(({transaction}) => isDistanceRequest(transaction));

    const hasPartiallyEditableDateTransaction = isFieldDisabledForAnyTransaction(CONST.EDIT_REQUEST_FIELD.DATE);

    const hasPartiallyEditableReimbursableTransaction = isFieldDisabledForAnyTransaction(CONST.EDIT_REQUEST_FIELD.REIMBURSABLE);

    const areSelectedTransactionsBillable = selectedTransactionContexts.every(({transaction, transactionPolicy}) => {
        // Unreported expenses have no policy yet but billable is always applicable
        if (!transaction.reportID || transaction.reportID === CONST.REPORT.UNREPORTED_REPORT_ID) {
            return true;
        }
        return transactionPolicy?.disabledFields?.defaultBillable === false || !!transaction.billable;
    });

    const areSelectedTransactionsReimbursable = selectedTransactionContexts.every(({transaction, report, transactionPolicy}) => {
        if (!isCardTransactionReimbursableEditable(transaction)) {
            return false;
        }

        // Unreported expenses have no policy yet but reimbursable is always applicable
        if (!transaction.reportID || transaction.reportID === CONST.REPORT.UNREPORTED_REPORT_ID) {
            return true;
        }

        // The workspace cash expense rules don't apply to card expenses, which follow their card feed's reimbursable setting instead
        return !isIOUReport(report) && !isInvoiceReport(report) && (isManagedCardTransaction(transaction) || transactionPolicy?.disabledFields?.reimbursable === false);
    });

    const policyID = getSearchBulkEditPolicyID(selectedTransactionIDs, activePolicyID, mergedTransactions, mergedReports);

    const policy = policyID ? policies?.[`${ONYXKEYS.COLLECTION.POLICY}${policyID}`] : undefined;
    const policyCategories = allPolicyCategories?.[`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`];
    const policyTags = allPolicyTags?.[`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`];
    const policyTagLists = getTagLists(policyTags);

    const isTaxTrackingEnabled = isBulkEditTaxTrackingEnabled(selectedTransactionContexts, policy, hasPerDiemOrTimeTransaction);
    const areSelectedTransactionsExpenses = areAllTransactionsExpenseCompatible(selectedTransactionContexts);
    const isAttendeeTrackingEnabledForSelection = isBulkEditAttendeeTrackingEnabled(selectedTransactionContexts, policy);
    const areCategoriesEnabled = areSelectedTransactionsExpenses && !!policy?.areCategoriesEnabled && hasEnabledOptions(policyCategories ?? {});
    const areTagsEnabled = areSelectedTransactionsExpenses && !!policy?.areTagsEnabled && hasEnabledTags(policyTagLists);
    const areAttendeesEnabled = areSelectedTransactionsExpenses && isAttendeeTrackingEnabledForSelection;

    useLoadPolicyCategories(policy?.areCategoriesEnabled ? policyID : undefined);
    useLoadPolicyTags(policy?.areTagsEnabled ? policyID : undefined);

    useEffect(() => {
        return () => {
            clearBulkEditDraftTransaction();
        };
    }, []);

    const [isSaving, setIsSaving] = useState(false);
    const [isCurrencyPickerVisible, setIsCurrencyPickerVisible] = useState(false);
    const currencyButtonRef = useRef<View>(null);

    // The draft only holds a currency once one is picked; until then the amount is read in the workspace's currency.
    const currency = draftTransaction?.currency ?? policy?.outputCurrency ?? CONST.CURRENCY.USD;
    const decimals = getCurrencyDecimals(currency);
    const draftAmount = draftTransaction?.amount;
    const draftMerchant = draftTransaction?.merchant ?? '';
    const description = draftTransaction?.comment?.comment ?? '';
    const draftDate = draftTransaction?.created ?? '';
    const draftAttendees = draftTransaction?.comment?.attendees ?? [];
    const hasDraftAttendees = draftAttendees.length > 0;

    // Mirror the draft merchant in local state so the input updates synchronously as the user types; feeding the async
    // Onyx value straight to `value` snaps the caret to the end on every keystroke. The draft only changes from this
    // input, so it is synced back only while the input is not being edited.
    const [isMerchantInputFocused, setIsMerchantInputFocused] = useState(false);
    const [merchantInput, setMerchantInput] = useState(draftMerchant);
    const [prevDraftMerchant, setPrevDraftMerchant] = useState(draftMerchant);
    if (draftMerchant !== prevDraftMerchant) {
        setPrevDraftMerchant(draftMerchant);
        if (!isMerchantInputFocused) {
            setMerchantInput(draftMerchant);
        }
    }

    // A P2P expense can't be set to zero, as its own amount page rules.
    const hasP2PTransaction = selectedTransactionContexts.some(({report}) => isIOUReport(report));
    const allowNegative = isBulkEditNegativeAmountAllowed(selectedTransactionContexts, mergedReports, policies);
    const amountErrorText = hasP2PTransaction && draftAmount === 0 ? translate('common.error.invalidAmount') : '';

    const merchantErrorText = (() => {
        const trimmedMerchant = merchantInput.trim();
        if (trimmedMerchant && isInvalidMerchantValue(trimmedMerchant)) {
            return translate('iou.error.invalidMerchant');
        }
        const {isValid, byteLength} = isValidInputLength(merchantInput, CONST.MERCHANT_NAME_MAX_BYTES);
        return isValid ? '' : translate('common.error.characterLimitExceedCounter', byteLength, CONST.MERCHANT_NAME_MAX_BYTES);
    })();

    const descriptionErrorText = description.length > CONST.DESCRIPTION_LIMIT ? translate('common.error.characterLimitExceedCounter', description.length, CONST.DESCRIPTION_LIMIT) : '';

    const dateErrorText = draftDate && !isValidDate(draftDate) ? translate('common.error.dateInvalid') : '';

    const hasFieldError = !!amountErrorText || !!merchantErrorText || !!descriptionErrorText || !!dateErrorText;

    // An emptied field drops the pending change rather than recording an empty value.
    const saveDraftAmount = (newAmount: string) => {
        updateBulkEditDraftTransaction({amount: getBackendAmountFromInput(newAmount)});
    };

    const showCurrencyPicker = () => {
        setIsCurrencyPickerVisible(true);
    };

    const hideCurrencyPicker = () => {
        setIsCurrencyPickerVisible(false);
    };

    const saveDraftCurrency = (newCurrency: string) => {
        hideCurrencyPicker();
        updateBulkEditDraftTransaction({currency: newCurrency});
    };

    // `null` means the picked value was tapped again, which drops the pending change so each expense keeps its own value.
    const saveDraftReimbursable = (value: boolean | null) => {
        updateBulkEditDraftTransaction({reimbursable: value});
    };

    const saveDraftBillable = (value: boolean | null) => {
        updateBulkEditDraftTransaction({billable: value});
    };

    // An empty row means nothing is pending, as on the other fields. Once a value is picked the row shows it.
    const getPendingBooleanTitle = (value: boolean | null | undefined) => {
        if (value === true) {
            return translate('common.yes');
        }
        if (value === false) {
            return translate('common.no');
        }
        return '';
    };

    const saveDraftMerchant = (newMerchant: string) => {
        setMerchantInput(newMerchant);
        updateBulkEditDraftTransaction({merchant: newMerchant});
    };

    const saveDraftDescription = (newDescription: string) => {
        updateBulkEditDraftTransaction({comment: {comment: newDescription}});
    };

    const saveDraftDate = (newDate: string) => {
        updateBulkEditDraftTransaction({created: newDate || null});
    };

    const commit = (changes: TransactionChanges, startWithLoading?: StartWithLoading) => {
        setIsSaving(true);

        const applyChanges = () => {
            updateMultipleMoneyRequests({
                isVendorMatchingBetaEnabled,
                transactionIDs: selectedTransactionIDs,
                changes,
                bulkEditTagChanges: draftTransaction?.bulkEditTagChanges,
                policy,
                reports: mergedReports,
                transactions: mergedTransactions,
                reportActions: mergedReportActions,
                policyCategories: allPolicyCategories,
                policyTags: allPolicyTags,
                policyTagsLoadingStates: allPolicyTagsLoadingStates,
                violations: allTransactionViolations,
                reportNameValuePairs,
                hash: currentSearchHash,
                allPolicies: policies,
                currentUserAccountID,
                delegateAccountID,
                personalPolicyOutputCurrency: personalPolicy?.outputCurrency,
                personalDetailsList,
                getCurrencyDecimals,
                getCurrencySymbol,
                rules,
            });
            // Bulk edit can start from report (ID-based selection) or search (map-based selection),
            // so clear both stores to keep deselection behavior consistent.
            clearSelectedTransactions(true);
            clearSelectedTransactions();

            Navigation.dismissToPreviousRHP();
        };

        if (!startWithLoading) {
            applyChanges();
            return;
        }
        return startWithLoading(applyChanges);
    };

    const save = (event?: GestureResponderEvent | KeyboardEvent, startWithLoading?: StartWithLoading) => {
        if (!draftTransaction || isSaving || hasFieldError) {
            return;
        }

        const changes: TransactionChanges = {};
        const trimmedMerchant = draftTransaction.merchant?.trim();
        const trimmedDescription = draftTransaction.comment?.comment?.trim();
        if (draftTransaction.amount !== undefined) {
            changes.amount = draftTransaction.amount;
        }
        // Each expense keeps its own currency unless one is sent, so an amount goes with the currency the row shows.
        if (draftTransaction.amount !== undefined || draftTransaction.currency) {
            changes.currency = currency;
        }
        if (trimmedMerchant) {
            changes.merchant = trimmedMerchant;
        }
        if (trimmedDescription) {
            changes.comment = trimmedDescription;
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
        if (draftTransaction.comment?.attendees) {
            changes.attendees = draftTransaction.comment.attendees;
        }

        if (Object.keys(changes).length === 0) {
            Navigation.dismissToPreviousRHP();
            return;
        }

        if (finalizedTransactionCount > 0) {
            showConfirmModal({
                title: translate('search.bulkActions.editFinalizedExpensesTitle'),
                prompt: translate('search.bulkActions.editFinalizedExpensesConfirmation', {count: finalizedTransactionCount, total: selectedTransactionContexts.length}),
                confirmText: translate('common.yesContinue'),
                cancelText: translate('common.cancel'),
            }).then(({action}) => {
                if (action !== ModalActions.CONFIRM) {
                    return;
                }
                commit(changes, startWithLoading);
            });
            return;
        }

        commit(changes, startWithLoading);
    };

    const tagsArray = getTagArrayFromName(draftTransaction?.tag ?? '');
    const hasDependentTags = hasDependentTagsPolicyUtils(policy, policyTags);
    const shouldShowTagList = hasDependentTags ? getDependentTagVisibility(policyTagLists, draftTransaction?.tag) : [];
    const isAmountDisabled = hasCustomUnitTransaction || hasPartiallyEditableTransaction || hasSplitTransaction;
    const isTaxDisabled = hasPartiallyEditableTaxRateTransaction || hasSplitTransaction;
    const isBillableDisabled = isFieldDisabledForAnyTransaction(CONST.EDIT_REQUEST_FIELD.BILLABLE);
    const isAttendeesDisabled = isFieldDisabledForAnyTransaction(CONST.EDIT_REQUEST_FIELD.ATTENDEES);

    // The selectable rows open their list in a container anchored to the row. A dependent tag level needs the levels
    // above it, which only the full page walks through, and a selection without a workspace has no lists to show.
    const canOpenListInDropdown = !!policyID;
    const selectedTaxRate = draftTransaction?.taxCode ? (getTaxName(translate, policy, draftTransaction) ?? '') : '';
    const taxRateName = policy?.taxRates?.name ?? translate('common.tax');
    const lockedAmountTitle = draftAmount !== undefined ? convertToDisplayStringWithoutCurrency(draftAmount, currency) : '';

    return (
        <ScreenWrapper
            testID="SearchEditMultiplePage"
            includeSafeAreaPaddingBottom
        >
            <HeaderWithBackButton
                title={translate('search.bulkActions.editMultipleTitle')}
                onBackButtonPress={Navigation.goBack}
            />
            <IOURequestStepCurrencyModal
                isPickerVisible={isCurrencyPickerVisible}
                hidePickerModal={hideCurrencyPicker}
                headerText={translate('common.selectCurrency')}
                value={currency}
                onInputChange={saveDraftCurrency}
                launcherRef={currencyButtonRef}
            />
            <View style={[styles.flex1]}>
                <ScrollView contentContainerStyle={styles.flexGrow1}>
                    <Text style={[styles.ph5, styles.mb3, styles.textSupporting]}>{translate('search.bulkActions.editMultipleDescription')}</Text>
                    {isAmountDisabled ? (
                        <ExpenseFieldRow
                            name={translate('iou.amount')}
                            value={lockedAmountTitle}
                            isInteractive={false}
                            sentryLabel={CONST.SENTRY_LABEL.SEARCH_EDIT_MULTIPLE.AMOUNT_FIELD}
                        />
                    ) : (
                        <View style={[styles.mh4, styles.mv2]}>
                            <AmountFormField
                                value={draftAmount === undefined ? '' : convertToFrontendAmountAsString(draftAmount, decimals)}
                                decimals={decimals}
                                errorText={amountErrorText}
                                onInputChange={saveDraftAmount}
                                allowNegative={allowNegative}
                            >
                                <AmountFormField.Input
                                    label={translate('iou.amount')}
                                    prefixCharacter={getLocalizedCurrencySymbol(preferredLocale, currency) ?? ''}
                                >
                                    <AmountFormField.SignFlipButton shouldUseBorderlessStyle />
                                    <AmountFormField.CurrencyPickerButton
                                        ref={currencyButtonRef}
                                        currency={currency}
                                        onPress={showCurrencyPicker}
                                        shouldUseBorderlessStyle
                                    />
                                </AmountFormField.Input>
                            </AmountFormField>
                        </View>
                    )}
                    <View style={[styles.mh4, styles.mv2]}>
                        <TextInput
                            value={description}
                            onChangeText={saveDraftDescription}
                            label={translate('common.description')}
                            accessibilityLabel={translate('common.description')}
                            errorText={descriptionErrorText}
                            autoGrowHeight
                            maxAutoGrowHeight={variables.textInputAutoGrowMaxHeight}
                            type="markdown"
                            sentryLabel={CONST.SENTRY_LABEL.SEARCH_EDIT_MULTIPLE.DESCRIPTION_FIELD}
                        />
                    </View>
                    {hasPartiallyEditableMerchantTransaction ? (
                        <ExpenseFieldRow
                            name={translate('common.merchant')}
                            value={draftMerchant}
                            numberOfLinesValue={2}
                            isInteractive={false}
                            sentryLabel={CONST.SENTRY_LABEL.SEARCH_EDIT_MULTIPLE.MERCHANT_FIELD}
                        />
                    ) : (
                        <View style={[styles.mh4, styles.mv2]}>
                            <TextInput
                                value={merchantInput}
                                onChangeText={saveDraftMerchant}
                                onFocus={() => setIsMerchantInputFocused(true)}
                                onBlur={() => setIsMerchantInputFocused(false)}
                                label={translate('common.merchant')}
                                accessibilityLabel={translate('common.merchant')}
                                errorText={merchantErrorText}
                                sentryLabel={CONST.SENTRY_LABEL.SEARCH_EDIT_MULTIPLE.MERCHANT_FIELD}
                            />
                        </View>
                    )}
                    {hasPartiallyEditableDateTransaction ? (
                        <ExpenseFieldRow
                            name={translate('common.date')}
                            value={draftDate}
                            isInteractive={false}
                            sentryLabel={CONST.SENTRY_LABEL.SEARCH_EDIT_MULTIPLE.DATE_FIELD}
                        />
                    ) : (
                        <View style={styles.mh4}>
                            <DatePicker
                                inputID={DATE_INPUT_ID}
                                value={draftDate}
                                label={translate('common.date')}
                                maxDate={CONST.CALENDAR_PICKER.MAX_DATE}
                                onInputChange={saveDraftDate}
                                errorText={dateErrorText}
                                shouldDeferShowUntilPositioned
                            />
                        </View>
                    )}
                    {areCategoriesEnabled && (
                        <ExpenseFieldDropdown
                            name={translate('common.category')}
                            value={draftTransaction?.category ?? ''}
                            numberOfLinesValue={2}
                            onPress={() => {
                                startOpenCategoryPickerSpan();
                                Navigation.navigate(ROUTES.SEARCH_EDIT_MULTIPLE_CATEGORY_RHP);
                            }}
                            shouldOpenInDropdown={canOpenListInDropdown}
                            renderDropdown={(dropdownProps) => (
                                <SearchEditMultipleCategoryDropdown
                                    {...dropdownProps}
                                    policyID={policyID}
                                    selectedCategory={draftTransaction?.category ?? ''}
                                />
                            )}
                            sentryLabel={CONST.SENTRY_LABEL.SEARCH_EDIT_MULTIPLE.CATEGORY_FIELD}
                        />
                    )}
                    {areTagsEnabled &&
                        policyTagLists.map((tagList, tagListIndex) => {
                            if (hasDependentTags && !shouldShowTagList.at(tagListIndex)) {
                                return null;
                            }
                            const tagName = tagsArray.at(tagListIndex) ?? '';
                            return (
                                <ExpenseFieldDropdown
                                    key={tagList.name}
                                    name={tagList.name || translate('common.tag')}
                                    value={tagName ? getCleanedTagName(tagName) : ''}
                                    numberOfLinesValue={2}
                                    onPress={() => Navigation.navigate(ROUTES.SEARCH_EDIT_MULTIPLE_TAG_RHP.getRoute(tagListIndex))}
                                    shouldOpenInDropdown={canOpenListInDropdown && !hasDependentTags}
                                    listHeaderHeight={SELECTION_LIST_POPOVER_HEADER_HEIGHT}
                                    renderDropdown={(dropdownProps) => (
                                        <SearchEditMultipleTagDropdown
                                            {...dropdownProps}
                                            policyID={policyID}
                                            tagListIndex={tagListIndex}
                                            transactionTag={draftTransaction?.tag ?? ''}
                                            recordedTagChanges={draftTransaction?.bulkEditTagChanges ?? {}}
                                            policyTags={policyTags}
                                            hasMultipleTagLists={policy?.hasMultipleTagLists ?? false}
                                        />
                                    )}
                                    sentryLabel={CONST.SENTRY_LABEL.SEARCH_EDIT_MULTIPLE.TAG_FIELD}
                                />
                            );
                        })}
                    {isTaxTrackingEnabled && (
                        <ExpenseFieldDropdown
                            name={taxRateName}
                            value={selectedTaxRate}
                            onPress={() => Navigation.navigate(ROUTES.SEARCH_EDIT_MULTIPLE_TAX_RHP)}
                            shouldOpenInDropdown={canOpenListInDropdown && !isTaxDisabled}
                            listHeaderHeight={SELECTION_LIST_POPOVER_HEADER_HEIGHT}
                            renderDropdown={(dropdownProps) => (
                                <SearchEditMultipleTaxDropdown
                                    {...dropdownProps}
                                    policyID={policyID}
                                    currentTaxCode={draftTransaction?.taxCode ?? ''}
                                    selectedTaxRate={selectedTaxRate}
                                />
                            )}
                            isInteractive={!isTaxDisabled}
                            sentryLabel={CONST.SENTRY_LABEL.SEARCH_EDIT_MULTIPLE.TAX_FIELD}
                        />
                    )}
                    {areSelectedTransactionsReimbursable && (
                        <ExpenseFieldDropdown
                            name={translate('common.reimbursable')}
                            value={getPendingBooleanTitle(draftTransaction?.reimbursable)}
                            // The list needs no workspace, so it always opens in place and there is no page to fall back to
                            onPress={noop}
                            shouldOpenInDropdown={!hasPartiallyEditableReimbursableTransaction}
                            renderDropdown={(dropdownProps) => (
                                <SearchEditMultipleBooleanDropdown
                                    {...dropdownProps}
                                    title={translate('common.reimbursable')}
                                    selectedValue={draftTransaction?.reimbursable}
                                    onSelected={saveDraftReimbursable}
                                />
                            )}
                            isInteractive={!hasPartiallyEditableReimbursableTransaction}
                            sentryLabel={CONST.SENTRY_LABEL.SEARCH_EDIT_MULTIPLE.REIMBURSABLE_FIELD}
                        />
                    )}
                    {areSelectedTransactionsBillable && (
                        <ExpenseFieldDropdown
                            name={translate('common.billable')}
                            value={getPendingBooleanTitle(draftTransaction?.billable)}
                            // The list needs no workspace, so it always opens in place and there is no page to fall back to
                            onPress={noop}
                            shouldOpenInDropdown={!isBillableDisabled}
                            renderDropdown={(dropdownProps) => (
                                <SearchEditMultipleBooleanDropdown
                                    {...dropdownProps}
                                    title={translate('common.billable')}
                                    selectedValue={draftTransaction?.billable}
                                    onSelected={saveDraftBillable}
                                />
                            )}
                            isInteractive={!isBillableDisabled}
                            sentryLabel={CONST.SENTRY_LABEL.SEARCH_EDIT_MULTIPLE.BILLABLE_FIELD}
                        />
                    )}
                    {areAttendeesEnabled && (
                        <ExpenseFieldDropdown
                            name={translate('iou.attendees')}
                            valueComponent={hasDraftAttendees ? <SearchEditMultipleAttendeePills attendees={draftAttendees} /> : undefined}
                            hasValueComponent={hasDraftAttendees}
                            accessibilityLabel={
                                hasDraftAttendees ? `${translate('iou.attendees')}, ${getAttendeesListDisplayString(draftAttendees, formatPhoneNumber, localeCompare)}` : undefined
                            }
                            onPress={() => Navigation.navigate(ROUTES.SEARCH_EDIT_MULTIPLE_ATTENDEES_RHP)}
                            shouldOpenInDropdown={canOpenListInDropdown && !isAttendeesDisabled}
                            listHeaderHeight={SELECTION_LIST_POPOVER_HEADER_HEIGHT}
                            renderDropdown={(dropdownProps) => (
                                <SearchEditMultipleAttendeesDropdown
                                    {...dropdownProps}
                                    draftAttendees={draftAttendees}
                                />
                            )}
                            isInteractive={!isAttendeesDisabled}
                            sentryLabel={CONST.SENTRY_LABEL.SEARCH_EDIT_MULTIPLE.ATTENDEES_FIELD}
                        />
                    )}
                </ScrollView>
                <Button
                    sentryLabel={CONST.SENTRY_LABEL.SEARCH_EDIT_MULTIPLE.SAVE_BUTTON}
                    variant={CONST.BUTTON_VARIANT.SUCCESS}
                    size={CONST.BUTTON_SIZE.LARGE}
                    onPress={save}
                    isLoading={isSaving}
                    isDisabled={isSaving}
                    style={[styles.m5]}
                >
                    <Button.Text>{translate('common.save')}</Button.Text>
                </Button>
            </View>
        </ScreenWrapper>
    );
}

export default SearchEditMultiplePage;
