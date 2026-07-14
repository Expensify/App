import FormHelpMessage from '@components/FormHelpMessage';
import SelectionList from '@components/SelectionList';
import SingleSelectListItem from '@components/SelectionList/ListItem/SingleSelectListItem';
import Text from '@components/Text';

import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDelegateAccountID from '@hooks/useDelegateAccountID';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import usePersonalPolicy from '@hooks/usePersonalPolicy';
import usePolicyForTransaction from '@hooks/usePolicyForTransaction';
import useShowNotFoundPageInIOUStep from '@hooks/useShowNotFoundPageInIOUStep';
import useThemeStyles from '@hooks/useThemeStyles';

import {
    getIOURequestPolicyID,
    setLastSelectedDistanceRate,
    setMoneyRequestDistanceRate,
    setMoneyRequestTaxAmount,
    setMoneyRequestTaxRate,
    setMoneyRequestTaxValue,
} from '@libs/actions/IOU/MoneyRequest';
import {setDraftSplitTransaction} from '@libs/actions/IOU/Split';
import {updateMoneyRequestDistanceRate} from '@libs/actions/IOU/UpdateMoneyRequest';
import DistanceRequestUtils from '@libs/DistanceRequestUtils';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {isMovingTransactionFromTrackExpense as isMovingTransactionFromTrackExpenseUtil, shouldUseTransactionDraft} from '@libs/IOUUtils';
import Navigation from '@libs/Navigation/Navigation';
import {getGroupPaidPolicies, isGroupPolicyByType, isTaxTrackingEnabled} from '@libs/PolicyUtils';
import {getCurrency, getDistanceInMeters, getDistanceRateTaxUpdates, getRateID, isDistanceRequest as isDistanceRequestTransactionUtils, isExpenseUnreported} from '@libs/TransactionUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import {personalDetailsLoginSelector} from '@src/selectors/PersonalDetails';
import type * as OnyxTypes from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import {policyTypeSelector} from '@selectors/Policy';
import lodashIsEmpty from 'lodash/isEmpty';
import React, {useState} from 'react';

import type {WithWritableReportOrNotFoundProps} from './withWritableReportOrNotFound';

import StepScreenWrapper from './StepScreenWrapper';
import withFullTransactionOrNotFound from './withFullTransactionOrNotFound';
import withWritableReportOrNotFound from './withWritableReportOrNotFound';

type IOURequestStepDistanceRateProps = WithWritableReportOrNotFoundProps<typeof SCREENS.MONEY_REQUEST.STEP_DISTANCE_RATE> & {
    /** Holds data related to Money Request view state, rather than the underlying Money Request data. */
    transaction: OnyxEntry<OnyxTypes.Transaction>;
};

function IOURequestStepDistanceRate({
    report,
    reportDraft,
    route: {
        params: {action, backTo, transactionID, iouType, reportActionID},
    },
    transaction,
}: IOURequestStepDistanceRateProps) {
    const [policyDraft] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_DRAFTS}${getIOURequestPolicyID(transaction, reportDraft)}`);
    const [reportPolicyType] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${report?.policyID}`, {
        selector: policyTypeSelector,
    });
    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${report?.policyID}`);
    const [policyTags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${report?.policyID}`);
    const [parentReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(report?.parentReportID)}`);
    const [parentReportNextStep] = useOnyx(`${ONYXKEYS.COLLECTION.NEXT_STEP}${getNonEmptyStringOnyxID(report?.parentReportID)}`);
    const [iouReportOwnerLogin] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {selector: personalDetailsLoginSelector(parentReport?.ownerAccountID)});

    const [splitDraftTransaction] = useOnyx(`${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${transactionID}`);
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const personalPolicy = usePersonalPolicy();
    const [currentTransactionViolations] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${getNonEmptyStringOnyxID(transaction?.transactionID)}`);

    const {policy: policyForTransaction} = usePolicyForTransaction({transaction, reportPolicyID: report?.policyID, action, iouType, policyDraft});

    const styles = useThemeStyles();
    const {translate, toLocaleDigit, localeCompare} = useLocalize();
    const {isOffline} = useNetwork();
    const isEditing = action === CONST.IOU.ACTION.EDIT;
    const isEditingSplit = (iouType === CONST.IOU.TYPE.SPLIT || iouType === CONST.IOU.TYPE.SPLIT_EXPENSE) && isEditing;
    const currentTransaction = isEditingSplit && !lodashIsEmpty(splitDraftTransaction) ? splitDraftTransaction : transaction;

    // When editing a distance split from self-DM, policyForTransaction may be undefined because the self-DM
    // report has no policyID. In that case, find the correct policy by searching for the one that contains
    // the transaction's customUnitID. If customUnitID is not available (e.g. optimistic transaction before
    // server response), fall back to searching by customUnitRateID.
    // Skip both lookups when the rate is P2P — the expense has no workspace policy to resolve.
    const distanceCustomUnitID = currentTransaction?.comment?.customUnit?.customUnitID;
    const distanceCustomUnitRateID = currentTransaction?.comment?.customUnit?.customUnitRateID;
    const isP2PRate = distanceCustomUnitRateID === CONST.CUSTOM_UNITS.FAKE_P2P_ID;
    const policyByCustomUnitID =
        isEditingSplit && !isP2PRate && distanceCustomUnitID ? (Object.values(allPolicies ?? {}).find((p) => p?.customUnits?.[distanceCustomUnitID]) ?? undefined) : undefined;
    const policyByCustomUnitRateID =
        isEditingSplit && !policyByCustomUnitID && distanceCustomUnitRateID && distanceCustomUnitRateID !== CONST.CUSTOM_UNITS.FAKE_P2P_ID
            ? (Object.values(allPolicies ?? {}).find((p) => Object.values(p?.customUnits ?? {}).some((unit) => !!unit.rates?.[distanceCustomUnitRateID])) ?? undefined)
            : undefined;
    const availablePaidPolicies = isEditingSplit ? getGroupPaidPolicies(allPolicies ?? {}) : [];
    const fallbackAvailablePolicy = isEditingSplit && !isP2PRate && !policyForTransaction && !policyByCustomUnitID && !policyByCustomUnitRateID ? availablePaidPolicies.at(0) : undefined;
    const policy = policyForTransaction ?? policyByCustomUnitID ?? policyByCustomUnitRateID ?? fallbackAvailablePolicy;
    const isDistanceRequest = isDistanceRequestTransactionUtils(currentTransaction);
    const {getCurrencySymbol} = useCurrencyListActions();
    const isPolicyExpenseChat = isGroupPolicyByType(reportPolicyType);
    const isTrackExpense = iouType === CONST.IOU.TYPE.TRACK;
    const shouldShowTax = isTaxTrackingEnabled(isPolicyExpenseChat || isTrackExpense || isExpenseUnreported(currentTransaction), policy, isDistanceRequest);

    const currentRateID = getRateID(currentTransaction);
    const transactionCurrency = getCurrency(currentTransaction);
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const delegateAccountID = useDelegateAccountID();
    const currentUserAccountIDParam = currentUserPersonalDetails.accountID;
    const currentUserEmailParam = currentUserPersonalDetails.login ?? '';
    const {isBetaEnabled} = usePermissions();
    const isASAPSubmitBetaEnabled = isBetaEnabled(CONST.BETAS.ASAP_SUBMIT);
    const [formError, setFormError] = useState('');

    // Track the rate the user last selected visually, even if it failed validation.
    // This keeps the problematic rate shown as selected so the user understands what they need to change.
    const [pendingRateID, setPendingRateID] = useState<string | undefined>();

    const rates = DistanceRequestUtils.getMileageRates(policy, false, currentRateID);
    const isMovingTransactionFromTrackExpense = isMovingTransactionFromTrackExpenseUtil(action);
    const transactionUnit = transaction?.comment?.customUnit?.distanceUnit;
    const sortedRates = [...Object.values(rates)].sort((a, b) => localeCompare(a.name ?? '', b.name ?? ''));

    const navigateBack = () => {
        Navigation.goBack(backTo);
    };

    const options = sortedRates.map((rate) => {
        const hasUnitMismatchForMovingTrackExpense = isMovingTransactionFromTrackExpense && transactionUnit !== rate.unit;
        const unit =
            currentTransaction?.comment?.customUnit?.customUnitRateID === rate.customUnitRateID && !hasUnitMismatchForMovingTrackExpense
                ? DistanceRequestUtils.getDistanceUnit(currentTransaction, rate)
                : rate.unit;
        const effectiveRateID = pendingRateID ?? currentRateID;
        const isSelected = effectiveRateID
            ? effectiveRateID === rate.customUnitRateID && !hasUnitMismatchForMovingTrackExpense
            : DistanceRequestUtils.getDefaultMileageRate(policy)?.customUnitRateID === rate.customUnitRateID;
        const rateForDisplay = DistanceRequestUtils.getFormattedRateValue(unit, rate.rate, isSelected ? transactionCurrency : rate.currency, translate, toLocaleDigit, getCurrencySymbol);
        const dateLabel = DistanceRequestUtils.getRateDateLabel(rate, translate);
        const alternateText = [rate.name ? rateForDisplay : '', dateLabel].filter(Boolean).join(' • ');
        return {
            text: rate.name ?? rateForDisplay,
            alternateText,
            keyForList: rate.customUnitRateID ?? rateForDisplay,
            value: rate.customUnitRateID,
            isDisabled: !rate.enabled,
            isSelected,
        };
    });

    const shouldShowNotFoundPage = useShowNotFoundPageInIOUStep(action, iouType, reportActionID, report, currentTransaction);

    const initiallyFocusedOption = options.find((item) => item.isSelected)?.keyForList;

    function selectDistanceRate(customUnitRateID: string) {
        // Validate that the new rate combined with the existing distance doesn't exceed the backend limit.
        // This check runs before any state updates so that an invalid rate doesn't modify tax or rate state.
        const newRate = rates[customUnitRateID]?.rate ?? 0;

        // Use the newly selected rate's unit directly rather than getDistanceUnit(), which
        // prefers the transaction's stored unit.  When a user switches from a miles-based
        // rate to a km-based rate, validation must use the *new* rate's unit so the
        // distance-to-amount calculation is correct.
        const selectedRateUnit = rates[customUnitRateID]?.unit ?? CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES;

        // Read distance in meters using the *transaction's current* unit (so the raw
        // quantity stored on the transaction is interpreted correctly), then convert to
        // the selected rate's unit for the limit check.
        const currentUnit = DistanceRequestUtils.getDistanceUnit(currentTransaction, rates[customUnitRateID]);
        const distanceInMeters = getDistanceInMeters(currentTransaction, currentUnit);
        const distanceInUnits = DistanceRequestUtils.convertDistanceUnit(distanceInMeters, selectedRateUnit);
        if (!DistanceRequestUtils.isDistanceAmountWithinLimit(distanceInUnits, newRate)) {
            setPendingRateID(customUnitRateID);
            setFormError(translate('iou.error.distanceAmountTooLargeReduceRate'));
            return;
        }

        let taxAmount;
        let taxRateExternalID;
        let taxValue;
        if (shouldShowTax) {
            const distanceRateTaxUpdates = getDistanceRateTaxUpdates(policy, currentTransaction, customUnitRateID, currentUnit);
            taxAmount = distanceRateTaxUpdates.taxAmount;
            taxRateExternalID = distanceRateTaxUpdates.taxCode;
            taxValue = distanceRateTaxUpdates.taxValue;
            if (!isEditing || !taxRateExternalID) {
                setMoneyRequestTaxAmount(transactionID, taxAmount, shouldUseTransactionDraft(action));
                setMoneyRequestTaxRate(transactionID, taxRateExternalID ?? null, shouldUseTransactionDraft(action));
                setMoneyRequestTaxValue(transactionID, taxValue ?? null, shouldUseTransactionDraft(action));
            }
        }

        if (currentRateID !== customUnitRateID || (isMovingTransactionFromTrackExpense && transactionUnit !== selectedRateUnit)) {
            // In the split flow, when editing we use SPLIT_TRANSACTION_DRAFT to save draft value
            if (isEditingSplit && transaction) {
                setDraftSplitTransaction(transaction.transactionID, splitDraftTransaction, {customUnitRateID}, policy, personalPolicy?.outputCurrency);
                navigateBack();
                return;
            }

            if (isEditing && transaction?.transactionID) {
                // Persist preference so the default stays in sync across the workspace (the same way as in the setMoneyRequestDistanceRate)
                setLastSelectedDistanceRate(policy, customUnitRateID);
                updateMoneyRequestDistanceRate({
                    transaction,
                    transactionThreadReport: report,
                    parentReport,
                    iouReportOwnerLogin,
                    parentReportNextStep,
                    rateID: customUnitRateID,
                    policy,
                    policyTagList: policyTags,
                    policyCategories,
                    currentUserAccountIDParam,
                    currentUserEmailParam,
                    isASAPSubmitBetaEnabled,
                    updatedTaxAmount: taxAmount,
                    updatedTaxCode: taxRateExternalID,
                    updatedTaxValue: taxValue,
                    delegateAccountID,
                    isOffline,
                    currentTransactionViolations,
                    personalPolicyOutputCurrency: personalPolicy?.outputCurrency,
                });
            } else {
                setMoneyRequestDistanceRate(transaction, customUnitRateID, policy, shouldUseTransactionDraft(action));
            }
        }

        setPendingRateID(undefined);
        setFormError('');
        navigateBack();
    }

    return (
        <StepScreenWrapper
            headerTitle={translate('common.rate')}
            onBackButtonPress={navigateBack}
            shouldShowWrapper
            testID="IOURequestStepDistanceRate"
            shouldShowNotFoundPage={shouldShowNotFoundPage}
        >
            <Text style={[styles.mh5, styles.mv4]}>{translate('iou.chooseARate')}</Text>
            {!!formError && (
                <FormHelpMessage
                    style={[styles.mh5, styles.mb4]}
                    message={formError}
                />
            )}

            <SelectionList
                data={options}
                ListItem={SingleSelectListItem}
                onSelectRow={({value}) => selectDistanceRate(value ?? '')}
                shouldSingleExecuteRowSelect
                initiallyFocusedItemKey={initiallyFocusedOption}
            />
        </StepScreenWrapper>
    );
}

const IOURequestStepDistanceRateWithWritableReportOrNotFound = withWritableReportOrNotFound(IOURequestStepDistanceRate);

const IOURequestStepDistanceRateWithFullTransactionOrNotFound = withFullTransactionOrNotFound(IOURequestStepDistanceRateWithWritableReportOrNotFound);

export default IOURequestStepDistanceRateWithFullTransactionOrNotFound;
