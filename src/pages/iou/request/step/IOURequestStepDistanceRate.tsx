import React, {useMemo} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/ListItem/RadioListItem';
import Text from '@components/Text';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import useShowNotFoundPageInIOUStep from '@hooks/useShowNotFoundPageInIOUStep';
import useThemeStyles from '@hooks/useThemeStyles';
import {getIOURequestPolicyID, setMoneyRequestDistanceRate, setMoneyRequestTaxAmount, setMoneyRequestTaxRate, updateMoneyRequestDistanceRate} from '@libs/actions/IOU';
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
    const [policyDraft] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_DRAFTS}${getIOURequestPolicyID(transaction, reportDraft)}`, {canBeMissing: true});
    /* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
    const [policyReal] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${report?.policyID}`, {canBeMissing: true});
    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${report?.policyID}`, {canBeMissing: true});
    const [policyTags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${report?.policyID}`, {canBeMissing: true});
    const [parentReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(report?.parentReportID)}`, {canBeMissing: true});
    const [parentReportNextStep] = useOnyx(`${ONYXKEYS.COLLECTION.NEXT_STEP}${getNonEmptyStringOnyxID(report?.parentReportID)}`, {canBeMissing: true});

    /* eslint-enable @typescript-eslint/prefer-nullish-coalescing */

    const policy: OnyxEntry<OnyxTypes.Policy> = policyReal ?? policyDraft;

    const styles = useThemeStyles();
    const {translate, toLocaleDigit, localeCompare} = useLocalize();
    const isDistanceRequest = isDistanceRequestTransactionUtils(transaction);
    const isPolicyExpenseChat = isReportInGroupPolicy(report);
    const shouldShowTax = isTaxTrackingEnabled(isPolicyExpenseChat, policy, isDistanceRequest);
    const isEditing = action === CONST.IOU.ACTION.EDIT;

    const currentRateID = getRateID(transaction);
    const transactionCurrency = getCurrency(transaction);
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const currentUserAccountIDParam = currentUserPersonalDetails.accountID;
    const currentUserEmailParam = currentUserPersonalDetails.login ?? '';
    const {isBetaEnabled} = usePermissions();
    const isASAPSubmitBetaEnabled = isBetaEnabled(CONST.BETAS.ASAP_SUBMIT);

    const rates = DistanceRequestUtils.getMileageRates(policy, false, currentRateID);
    const sortedRates = useMemo(() => Object.values(rates).sort((a, b) => localeCompare(a.name ?? '', b.name ?? '')), [rates, localeCompare]);

    const navigateBack = () => {
        Navigation.goBack(backTo);
    };

    const options = sortedRates.map((rate) => {
        const unit = transaction?.comment?.customUnit?.customUnitRateID === rate.customUnitRateID ? DistanceRequestUtils.getDistanceUnit(transaction, rate) : rate.unit;
        const isSelected = currentRateID ? currentRateID === rate.customUnitRateID : DistanceRequestUtils.getDefaultMileageRate(policy)?.customUnitRateID === rate.customUnitRateID;
        const rateForDisplay = DistanceRequestUtils.getRateForDisplay(unit, rate.rate, isSelected ? transactionCurrency : rate.currency, translate, toLocaleDigit);
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
    const shouldShowNotFoundPage = useShowNotFoundPageInIOUStep(action, iouType, reportActionID, report, transaction);

    const initiallyFocusedOption = options.find((item) => item.isSelected)?.keyForList;

    function selectDistanceRate(customUnitRateID: string) {
        let taxAmount;
        let taxRateExternalID;
        if (shouldShowTax) {
            const policyCustomUnitRate = getDistanceRateCustomUnitRate(policy, customUnitRateID);
            const defaultTaxCode = getDefaultTaxCode(policy, transaction) ?? '';
            // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
            taxRateExternalID = policyCustomUnitRate?.attributes?.taxRateExternalID || defaultTaxCode;
            const unit = DistanceRequestUtils.getDistanceUnit(transaction, rates[customUnitRateID]);
            const taxableAmount = DistanceRequestUtils.getTaxableAmount(policy, customUnitRateID, getDistanceInMeters(transaction, unit));
            const taxPercentage = taxRateExternalID ? getTaxValue(policy, transaction, taxRateExternalID) : undefined;
            taxAmount = convertToBackendAmount(calculateTaxAmount(taxPercentage, taxableAmount, rates[customUnitRateID].currency ?? CONST.CURRENCY.USD));
            setMoneyRequestTaxAmount(transactionID, taxAmount);
            setMoneyRequestTaxRate(transactionID, taxRateExternalID ?? null);
        }

        if (currentRateID !== customUnitRateID) {
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
