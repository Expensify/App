import React from 'react';
import {withOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/RadioListItem';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as IOU from '@libs/actions/IOU';
import * as CurrencyUtils from '@libs/CurrencyUtils';
import type {MileageRate} from '@libs/DistanceRequestUtils';
import DistanceRequestUtils from '@libs/DistanceRequestUtils';
import Navigation from '@libs/Navigation/Navigation';
import {getCustomUnitRate, isTaxTrackingEnabled} from '@libs/PolicyUtils';
import * as ReportUtils from '@libs/ReportUtils';
import * as TransactionUtils from '@libs/TransactionUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type {Policy, Transaction} from '@src/types/onyx';
import type {Unit} from '@src/types/onyx/Policy';
import StepScreenWrapper from './StepScreenWrapper';
import withFullTransactionOrNotFound from './withFullTransactionOrNotFound';
import type {WithWritableReportOrNotFoundProps} from './withWritableReportOrNotFound';
import withWritableReportOrNotFound from './withWritableReportOrNotFound';

type IOURequestStepDistanceRateOnyxProps = {
    /** Policy details */
    policy: OnyxEntry<Policy>;

    /** Mileage rates */
    rates: Record<string, MileageRate>;
};

type IOURequestStepDistanceRateProps = IOURequestStepDistanceRateOnyxProps &
    WithWritableReportOrNotFoundProps<typeof SCREENS.MONEY_REQUEST.STEP_DISTANCE_RATE> & {
        /** Holds data related to Money Request view state, rather than the underlying Money Request data. */
        transaction: OnyxEntry<Transaction>;
    };

function IOURequestStepDistanceRate({
    policy,
    report,
    route: {
        params: {backTo, transactionID},
    },
    transaction,
    rates,
}: IOURequestStepDistanceRateProps) {
    const styles = useThemeStyles();
    const {translate, toLocaleDigit} = useLocalize();
    const isDistanceRequest = TransactionUtils.isDistanceRequest(transaction);
    const isPolicyExpenseChat = ReportUtils.isReportInGroupPolicy(report);
    const shouldShowTax = isTaxTrackingEnabled(isPolicyExpenseChat, policy, isDistanceRequest);

    const lastSelectedRateID = TransactionUtils.getRateID(transaction) ?? '-1';

    const navigateBack = () => {
        Navigation.goBack(backTo);
    };

    const sections = Object.values(rates).map((rate) => {
        const rateForDisplay = DistanceRequestUtils.getRateForDisplay(rate.unit, rate.rate, rate.currency, translate, toLocaleDigit);

        return {
            text: rate.name ?? rateForDisplay,
            alternateText: rate.name ? rateForDisplay : '',
            keyForList: rate.customUnitRateID,
            value: rate.customUnitRateID,
            isSelected: lastSelectedRateID ? lastSelectedRateID === rate.customUnitRateID : !!(rate.name === CONST.CUSTOM_UNITS.DEFAULT_RATE),
        };
    });

    const unit = (Object.values(rates)[0]?.unit === CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES ? translate('common.mile') : translate('common.kilometer')) as Unit;

    const initiallyFocusedOption = sections.find((item) => item.isSelected)?.keyForList;

    function selectDistanceRate(customUnitRateID: string) {
        if (shouldShowTax) {
            const policyCustomUnitRate = getCustomUnitRate(policy, customUnitRateID);
            const taxRateExternalID = policyCustomUnitRate?.attributes?.taxRateExternalID ?? '-1';
            const taxableAmount = DistanceRequestUtils.getTaxableAmount(policy, customUnitRateID, TransactionUtils.getDistance(transaction));
            const taxPercentage = TransactionUtils.getTaxValue(policy, transaction, taxRateExternalID) ?? '';
            const taxAmount = CurrencyUtils.convertToBackendAmount(TransactionUtils.calculateTaxAmount(taxPercentage, taxableAmount, rates[customUnitRateID].currency ?? CONST.CURRENCY.USD));
            IOU.setMoneyRequestTaxAmount(transactionID, taxAmount);
            IOU.setMoneyRequestTaxRate(transactionID, taxRateExternalID);
        }
        IOU.updateDistanceRequestRate(transactionID, customUnitRateID, policy?.id ?? '-1');
        navigateBack();
    }

    return (
        <StepScreenWrapper
            headerTitle={translate('common.rate')}
            onBackButtonPress={navigateBack}
            shouldShowWrapper={!!backTo}
            testID="rate"
        >
            <Text style={[styles.mh5, styles.mv4]}>{translate('iou.chooseARate', {unit})}</Text>

            <SelectionList
                sections={[{data: sections}]}
                ListItem={RadioListItem}
                onSelectRow={({value}) => selectDistanceRate(value ?? '')}
                shouldDebounceRowSelect
                initiallyFocusedOptionKey={initiallyFocusedOption}
            />
        </StepScreenWrapper>
    );
}

IOURequestStepDistanceRate.displayName = 'IOURequestStepDistanceRate';

const IOURequestStepDistanceRateWithOnyx = withOnyx<IOURequestStepDistanceRateProps, IOURequestStepDistanceRateOnyxProps>({
    policy: {
        key: ({report}) => `${ONYXKEYS.COLLECTION.POLICY}${report ? report.policyID : '-1'}`,
    },
    rates: {
        key: ({report}) => `${ONYXKEYS.COLLECTION.POLICY}${report?.policyID ?? '-1'}`,
        selector: (policy: OnyxEntry<Policy>) => DistanceRequestUtils.getMileageRates(policy),
    },
})(IOURequestStepDistanceRate);

// eslint-disable-next-line rulesdir/no-negated-variables
const IOURequestStepDistanceRateWithWritableReportOrNotFound = withWritableReportOrNotFound(IOURequestStepDistanceRateWithOnyx);
// eslint-disable-next-line rulesdir/no-negated-variables
const IOURequestStepDistanceRateWithFullTransactionOrNotFound = withFullTransactionOrNotFound(IOURequestStepDistanceRateWithWritableReportOrNotFound);

export default IOURequestStepDistanceRateWithFullTransactionOrNotFound;
