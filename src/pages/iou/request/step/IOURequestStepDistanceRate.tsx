import lodashIsEmpty from 'lodash/isEmpty';
import React, {useMemo, useState} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import FormHelpMessage from '@components/FormHelpMessage';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/ListItem/RadioListItem';
import Text from '@components/Text';
import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import useShowNotFoundPageInIOUStep from '@hooks/useShowNotFoundPageInIOUStep';
import useThemeStyles from '@hooks/useThemeStyles';
import {getIOURequestPolicyID, setMoneyRequestDistanceRate, setMoneyRequestTaxAmount, setMoneyRequestTaxRate, updateMoneyRequestDistanceRate} from '@libs/actions/IOU';
import {setDraftSplitTransaction} from '@libs/actions/IOU/Split';
import {convertToBackendAmount} from '@libs/CurrencyUtils';
import DistanceRequestUtils from '@libs/DistanceRequestUtils';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {shouldUseTransactionDraft} from '@libs/IOUUtils';
import Navigation from '@libs/Navigation/Navigation';
import {getDistanceRateCustomUnitRate, isTaxTrackingEnabled} from '@libs/PolicyUtils';
import {isReportInGroupPolicy} from '@libs/ReportUtils';
import {
    calculateTaxAmount,
    getCurrency,
    getDefaultTaxCode,
    getDistanceInMeters,
    getRateID,
    getTaxValue,
    isDistanceRequest as isDistanceRequestTransactionUtils,
} from '@libs/TransactionUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type * as OnyxTypes from '@src/types/onyx';
import StepScreenWrapper from './StepScreenWrapper';
import withFullTransactionOrNotFound from './withFullTransactionOrNotFound';
import type {WithWritableReportOrNotFoundProps} from './withWritableReportOrNotFound';
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
    /* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
    const [policyReal] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${report?.policyID}`);
    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${report?.policyID}`);
    const [policyTags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${report?.policyID}`);
    const [parentReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(report?.parentReportID)}`);
    const [parentReportNextStep] = useOnyx(`${ONYXKEYS.COLLECTION.NEXT_STEP}${getNonEmptyStringOnyxID(report?.parentReportID)}`);

    /* eslint-enable @typescript-eslint/prefer-nullish-coalescing */

    const [splitDraftTransaction] = useOnyx(`${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${transactionID}`);

    const policy: OnyxEntry<OnyxTypes.Policy> = policyReal ?? policyDraft;

    const styles = useThemeStyles();
    const {translate, toLocaleDigit, localeCompare} = useLocalize();
    const isEditing = action === CONST.IOU.ACTION.EDIT;
    const isEditingSplit = (iouType === CONST.IOU.TYPE.SPLIT || iouType === CONST.IOU.TYPE.SPLIT_EXPENSE) && isEditing;
    const currentTransaction = isEditingSplit && !lodashIsEmpty(splitDraftTransaction) ? splitDraftTransaction : transaction;
    const isDistanceRequest = isDistanceRequestTransactionUtils(currentTransaction);
    const {getCurrencySymbol, getCurrencyDecimals} = useCurrencyListActions();
    const isPolicyExpenseChat = isReportInGroupPolicy(report);
    const shouldShowTax = isTaxTrackingEnabled(isPolicyExpenseChat, policy, isDistanceRequest);

    const currentRateID = getRateID(currentTransaction);
    const transactionCurrency = getCurrency(currentTransaction);
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const currentUserAccountIDParam = currentUserPersonalDetails.accountID;
    const currentUserEmailParam = currentUserPersonalDetails.login ?? '';
    const {isBetaEnabled} = usePermissions();
    const isASAPSubmitBetaEnabled = isBetaEnabled(CONST.BETAS.ASAP_SUBMIT);
    const [formError, setFormError] = useState('');

    // Track the rate the user last selected visually, even if it failed validation.
    // This keeps the problematic rate shown as selected so the user understands what they need to change.
    const [pendingRateID, setPendingRateID] = useState<string | undefined>();

    const rates = DistanceRequestUtils.getMileageRates(policy, false, currentRateID);
    const sortedRates = useMemo(() => Object.values(rates).sort((a, b) => localeCompare(a.name ?? '', b.name ?? '')), [rates, localeCompare]);

    const navigateBack = () => {
        Navigation.goBack(backTo);
    };

    const options = sortedRates.map((rate) => {
        const unit = currentTransaction?.comment?.customUnit?.customUnitRateID === rate.customUnitRateID ? DistanceRequestUtils.getDistanceUnit(currentTransaction, rate) : rate.unit;
        const effectiveRateID = pendingRateID ?? currentRateID;
        const isSelected = effectiveRateID ? effectiveRateID === rate.customUnitRateID : DistanceRequestUtils.getDefaultMileageRate(policy)?.customUnitRateID === rate.customUnitRateID;
        const rateForDisplay = DistanceRequestUtils.getRateForDisplay(unit, rate.rate, isSelected ? transactionCurrency : rate.currency, translate, toLocaleDigit, getCurrencySymbol);
        return {
            text: rate.name ?? rateForDisplay,
            alternateText: rate.name ? rateForDisplay : '',
            keyForList: rate.customUnitRateID ?? rateForDisplay,
            value: rate.customUnitRateID,
            isDisabled: !rate.enabled,
            isSelected,
        };
    });
    // eslint-disable-next-line rulesdir/no-negated-variables
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
        if (shouldShowTax) {
            const policyCustomUnitRate = getDistanceRateCustomUnitRate(policy, customUnitRateID);
            const defaultTaxCode = getDefaultTaxCode(policy, currentTransaction) ?? '';
            // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
            taxRateExternalID = policyCustomUnitRate?.attributes?.taxRateExternalID || defaultTaxCode;
            const taxableAmount = DistanceRequestUtils.getTaxableAmount(policy, customUnitRateID, getDistanceInMeters(currentTransaction, currentUnit));
            const taxPercentage = taxRateExternalID ? getTaxValue(policy, currentTransaction, taxRateExternalID) : undefined;
            taxAmount = convertToBackendAmount(calculateTaxAmount(taxPercentage, taxableAmount, getCurrencyDecimals(rates[customUnitRateID].currency)));
            setMoneyRequestTaxAmount(transactionID, taxAmount, shouldUseTransactionDraft(action));
            setMoneyRequestTaxRate(transactionID, taxRateExternalID ?? null, shouldUseTransactionDraft(action));
        }

        if (currentRateID !== customUnitRateID) {
            // In the split flow, when editing we use SPLIT_TRANSACTION_DRAFT to save draft value
            if (isEditingSplit && transaction) {
                setDraftSplitTransaction(transaction.transactionID, splitDraftTransaction, {customUnitRateID}, policy);
                navigateBack();
                return;
            }

            setMoneyRequestDistanceRate(transactionID, customUnitRateID, policy, shouldUseTransactionDraft(action));

            if (isEditing && transaction?.transactionID) {
                updateMoneyRequestDistanceRate({
                    transactionID: transaction.transactionID,
                    transactionThreadReport: report,
                    parentReport,
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
                });
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
                ListItem={RadioListItem}
                onSelectRow={({value}) => selectDistanceRate(value ?? '')}
                shouldSingleExecuteRowSelect
                initiallyFocusedItemKey={initiallyFocusedOption}
            />
        </StepScreenWrapper>
    );
}

// eslint-disable-next-line rulesdir/no-negated-variables
const IOURequestStepDistanceRateWithWritableReportOrNotFound = withWritableReportOrNotFound(IOURequestStepDistanceRate);
// eslint-disable-next-line rulesdir/no-negated-variables
const IOURequestStepDistanceRateWithFullTransactionOrNotFound = withFullTransactionOrNotFound(IOURequestStepDistanceRateWithWritableReportOrNotFound);

export default IOURequestStepDistanceRateWithFullTransactionOrNotFound;
