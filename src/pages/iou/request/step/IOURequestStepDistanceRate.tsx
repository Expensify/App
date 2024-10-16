import React from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {useOnyx} from 'react-native-onyx';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/RadioListItem';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as IOU from '@libs/actions/IOU';
import * as CurrencyUtils from '@libs/CurrencyUtils';
import DistanceRequestUtils from '@libs/DistanceRequestUtils';
import Navigation from '@libs/Navigation/Navigation';
import {getCustomUnitRate, isTaxTrackingEnabled} from '@libs/PolicyUtils';
import * as ReportUtils from '@libs/ReportUtils';
import * as TransactionUtils from '@libs/TransactionUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type * as OnyxTypes from '@src/types/onyx';
import type {Unit} from '@src/types/onyx/Policy';
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
        params: {action, reportID, backTo, transactionID},
    },
    transaction,
}: IOURequestStepDistanceRateProps) {
    const [policyDraft] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_DRAFTS}${IOU.getIOURequestPolicyID(transaction, reportDraft) ?? '-1'}`);
    const [policyReal] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${report ? report.policyID : '-1'}`);
    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${report ? report.policyID : '0'}`);
    const [policyTags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${report ? report.policyID : '0'}`);

    const policy = policyReal ?? policyDraft;

    const styles = useThemeStyles();
    const {translate, toLocaleDigit} = useLocalize();
    const isDistanceRequest = TransactionUtils.isDistanceRequest(transaction);
    const isPolicyExpenseChat = ReportUtils.isReportInGroupPolicy(report);
    const shouldShowTax = isTaxTrackingEnabled(isPolicyExpenseChat, policy, isDistanceRequest);
    const isEditing = action === CONST.IOU.ACTION.EDIT;

    const currentRateID = TransactionUtils.getRateID(transaction) ?? '-1';

    const rates = DistanceRequestUtils.getMileageRates(policy, false, currentRateID);

    const navigateBack = () => {
        Navigation.goBack(backTo);
    };

    const sections = Object.values(rates)
        .sort((rateA, rateB) => (rateA?.rate ?? 0) - (rateB?.rate ?? 0))
        .map((rate) => {
            const rateForDisplay = DistanceRequestUtils.getRateForDisplay(rate.unit, rate.rate, rate.currency, translate, toLocaleDigit);

            return {
                text: rate.name ?? rateForDisplay,
                alternateText: rate.name ? rateForDisplay : '',
                keyForList: rate.customUnitRateID,
                value: rate.customUnitRateID,
                isDisabled: !rate.enabled,
                isSelected: currentRateID ? currentRateID === rate.customUnitRateID : rate.name === CONST.CUSTOM_UNITS.DEFAULT_RATE,
            };
        });

    const unit = Object.values(rates).at(0)?.unit;
    const unitToDisplay = unit === CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES ? translate('common.mile') : translate('common.kilometer');

    const initiallyFocusedOption = sections.find((item) => item.isSelected)?.keyForList;

    function selectDistanceRate(customUnitRateID: string) {
        let taxAmount;
        let taxRateExternalID;
        if (shouldShowTax) {
            const policyCustomUnitRate = getCustomUnitRate(policy, customUnitRateID);
            taxRateExternalID = policyCustomUnitRate?.attributes?.taxRateExternalID ?? '-1';
            const taxableAmount = DistanceRequestUtils.getTaxableAmount(policy, customUnitRateID, TransactionUtils.getDistanceInMeters(transaction, unit));
            const taxPercentage = TransactionUtils.getTaxValue(policy, transaction, taxRateExternalID) ?? '';
            taxAmount = CurrencyUtils.convertToBackendAmount(TransactionUtils.calculateTaxAmount(taxPercentage, taxableAmount, rates[customUnitRateID].currency ?? CONST.CURRENCY.USD));
            IOU.setMoneyRequestTaxAmount(transactionID, taxAmount);
            IOU.setMoneyRequestTaxRate(transactionID, taxRateExternalID);
        }

        if (currentRateID !== customUnitRateID) {
            IOU.setMoneyRequestDistanceRate(transactionID, customUnitRateID, policy?.id ?? '-1', !isEditing);

            if (isEditing) {
                IOU.updateMoneyRequestDistanceRate(transaction?.transactionID ?? '-1', reportID, customUnitRateID, policy, policyTags, policyCategories, taxAmount, taxRateExternalID);
            }
        }

        navigateBack();
    }

    return (
        <StepScreenWrapper
            headerTitle={translate('common.rate')}
            onBackButtonPress={navigateBack}
            shouldShowWrapper
            testID={IOURequestStepDistanceRate.displayName}
        >
            <Text style={[styles.mh5, styles.mv4]}>{translate('iou.chooseARate', {unit: unitToDisplay})}</Text>

            <SelectionList
                sections={[{data: sections}]}
                ListItem={RadioListItem}
                onSelectRow={({value}) => selectDistanceRate(value ?? '')}
                shouldSingleExecuteRowSelect
                initiallyFocusedOptionKey={initiallyFocusedOption}
            />
        </StepScreenWrapper>
    );
}

IOURequestStepDistanceRate.displayName = 'IOURequestStepDistanceRate';

// eslint-disable-next-line rulesdir/no-negated-variables
const IOURequestStepDistanceRateWithWritableReportOrNotFound = withWritableReportOrNotFound(IOURequestStepDistanceRate);
// eslint-disable-next-line rulesdir/no-negated-variables
const IOURequestStepDistanceRateWithFullTransactionOrNotFound = withFullTransactionOrNotFound(IOURequestStepDistanceRateWithWritableReportOrNotFound);

export default IOURequestStepDistanceRateWithFullTransactionOrNotFound;
