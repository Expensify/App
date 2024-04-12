import React from 'react';
import {withOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/RadioListItem';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as IOU from '@libs/actions/IOU';
import type {MileageRate} from '@libs/DistanceRequestUtils';
import DistanceRequestUtils from '@libs/DistanceRequestUtils';
import Navigation from '@libs/Navigation/Navigation';
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

type IOURequestStepRateOnyxProps = {
    /** The policy of the report */
    policy: OnyxEntry<OnyxTypes.Policy>;

    /** Collection of categories attached to a policy */
    policyCategories: OnyxEntry<OnyxTypes.PolicyCategories>;

    /** Collection of tags attached to a policy */
    policyTags: OnyxEntry<OnyxTypes.PolicyTagList>;

    /** Mileage rates */
    rates: Record<string, MileageRate>;
};

type IOURequestStepRateProps = IOURequestStepRateOnyxProps &
    WithWritableReportOrNotFoundProps<typeof SCREENS.MONEY_REQUEST.STEP_RATE> & {
        /** Holds data related to Money Request view state, rather than the underlying Money Request data. */
        transaction: OnyxEntry<OnyxTypes.Transaction>;
    };

function IOURequestStepRate({
    route: {
        params: {action, reportID, backTo, transactionID},
    },
    transaction,
    rates,
    policy,
    policyTags,
    policyCategories,
}: IOURequestStepRateProps) {
    const styles = useThemeStyles();
    const {translate, toLocaleDigit} = useLocalize();
    const isEditing = action === CONST.IOU.ACTION.EDIT;

    const currentRateID = TransactionUtils.getRateID(transaction) ?? '';

    const navigateBack = () => {
        Navigation.goBack(backTo);
    };

    const sections = Object.values(rates).map((rate) => {
        const rateForDisplay = DistanceRequestUtils.getRateForDisplay(true, rate.unit, rate.rate, rate.currency, translate, toLocaleDigit);

        return {
            text: rate.name ?? rateForDisplay,
            alternateText: rate.name ? rateForDisplay : '',
            keyForList: rate.customUnitRateID,
            value: rate.customUnitRateID,
            isSelected: currentRateID ? currentRateID === rate.customUnitRateID : Boolean(rate.name === CONST.CUSTOM_UNITS.DEFAULT_RATE),
        };
    });

    const unit = (Object.values(rates)[0]?.unit === CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES ? translate('common.mile') : translate('common.kilometer')) as Unit;

    const initiallyFocusedOption = rates[currentRateID]?.name ?? CONST.CUSTOM_UNITS.DEFAULT_RATE;

    function selectDistanceRate(customUnitRateID: string) {
        // Only update the rateId if it has changed
        if (customUnitRateID === currentRateID) {
            navigateBack();
            return;
        }

        // In the split flow, when editing we use SPLIT_TRANSACTION_DRAFT to save draft value
        // if (isEditingSplitBill) {
        //     // todo
        //     navigateBack();
        //     return;
        // }

        IOU.setMoneyRequestDistanceRate(transactionID, customUnitRateID, policy?.id ?? '', !isEditing);

        if (isEditing) {
            IOU.updateMoneyRequestDistanceRate(transaction?.transactionID ?? '0', reportID, customUnitRateID, policy, policyTags, policyCategories);
        }

        navigateBack();
    }

    return (
        <StepScreenWrapper
            headerTitle={translate('common.rate')}
            onBackButtonPress={navigateBack}
            shouldShowWrapper
            testID="rate"
        >
            <Text style={[styles.mh5, styles.mv4]}>{translate('iou.chooseARate', {unit})}</Text>

            <SelectionList
                sections={[{data: sections}]}
                ListItem={RadioListItem}
                onSelectRow={({value}) => selectDistanceRate(value ?? '')}
                initiallyFocusedOptionKey={initiallyFocusedOption}
            />
        </StepScreenWrapper>
    );
}

IOURequestStepRate.displayName = 'IOURequestStepRate';

const IOURequestStepRateWithOnyx = withOnyx<IOURequestStepRateProps, IOURequestStepRateOnyxProps>({
    policy: {
        key: ({report}) => `${ONYXKEYS.COLLECTION.POLICY}${report ? report.policyID : '0'}`,
    },
    policyCategories: {
        key: ({report}) => `${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${report ? report.policyID : '0'}`,
    },
    policyTags: {
        key: ({report}) => `${ONYXKEYS.COLLECTION.POLICY_TAGS}${report ? report.policyID : '0'}`,
    },
    rates: {
        key: ({report}) => `${ONYXKEYS.COLLECTION.POLICY}${report?.policyID ?? '0'}`,
        selector: DistanceRequestUtils.getMileageRates,
    },
})(IOURequestStepRate);

// eslint-disable-next-line rulesdir/no-negated-variables
const IOURequestStepRateWithWritableReportOrNotFound = withWritableReportOrNotFound(IOURequestStepRateWithOnyx);
// eslint-disable-next-line rulesdir/no-negated-variables
const IOURequestStepRateWithFullTransactionOrNotFound = withFullTransactionOrNotFound(IOURequestStepRateWithWritableReportOrNotFound);

export default IOURequestStepRateWithFullTransactionOrNotFound;
