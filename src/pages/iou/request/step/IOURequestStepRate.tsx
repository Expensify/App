import React from 'react';
import {withOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/RadioListItem';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as IOU from '@libs/actions/IOU';
import compose from '@libs/compose';
import DistanceRequestUtils from '@libs/DistanceRequestUtils';
import Navigation from '@libs/Navigation/Navigation';
import StepScreenWrapper from '@pages/iou/request/step/StepScreenWrapper';
import withWritableReportOrNotFound from '@pages/iou/request/step/withWritableReportOrNotFound';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Route} from '@src/ROUTES';
import type {Policy} from '@src/types/onyx';


type Props = {
    /** Object of last selected rates for the policies */
    lastSelectedDistanceRates: Record<string, string>;

    /** Policy details */
    policy: OnyxEntry<Policy>;

    /** The route object passed to this screen */
    route: {
        /** The params passed to this screen */
        params: {
            /** The route to go back to */
            backTo: Route;
        };
    };
};

function IOURequestStepRate({
    policy,
    route: {
        params: {backTo},
    },
    lastSelectedDistanceRates = {},
}: Props) {
    const styles = useThemeStyles();
    const {translate, toLocaleDigit} = useLocalize();
    const rates = DistanceRequestUtils.getMileageRates(policy?.id);

    const lastSelectedRate = lastSelectedDistanceRates[policy?.id ?? '0'] ?? '0';

    const data = Object.values(rates).map((rate) => ({
        text: rate.name ?? '',
        alternateText: DistanceRequestUtils.getRateForDisplay(true, rate.unit, rate.rate, rate.currency, translate, toLocaleDigit),
        keyForList: rate.name ?? '',
        value: rate.customUnitRateID,
    }));

    const initiallyFocusedOption = rates[lastSelectedRate]?.name ?? CONST.CUSTOM_UNITS.DEFAULT_RATE;

    function selectDistanceRate(customUnitRateID = '0') {
        IOU.setLastSelectedDistanceRates(policy?.id ?? '', customUnitRateID);
        IOU.updateDistanceRequestRate('1', customUnitRateID);
        Navigation.goBack(backTo);
    }

    return (
        <StepScreenWrapper
            headerTitle={translate('common.rate')}
            onBackButtonPress={() => Navigation.goBack(backTo)}
            shouldShowWrapper={Boolean(backTo)}
            testID="rate"
        >
            <Text style={[styles.mh5, styles.mv4]}>{translate('iou.chooseARate')}</Text>

            <SelectionList
                sections={[{data}]}
                ListItem={RadioListItem}
                onSelectRow={({value}) => selectDistanceRate(value)}
                initiallyFocusedOptionKey={initiallyFocusedOption}
            />
        </StepScreenWrapper>
    );
}

IOURequestStepRate.displayName = 'IOURequestStepRate';

export default compose(
    withWritableReportOrNotFound,
    withOnyx({
        // @ts-expect-error TODO: fix when withWritableReportOrNotFound will be migrated to TS
        policy: {
            // @ts-expect-error TODO: fix when withWritableReportOrNotFound will be migrated to TS
            key: ({report}) => `${ONYXKEYS.COLLECTION.POLICY}${report ? report.policyID : '0'}`,
        },
        // @ts-expect-error TODO: fix when withWritableReportOrNotFound will be migrated to TS
        lastSelectedDistanceRates: {
            key: ONYXKEYS.NVP_LAST_SELECTED_DISTANCE_RATES,
        },
    }),
)(IOURequestStepRate);
