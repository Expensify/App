import type {StackScreenProps} from '@react-navigation/stack';
import React from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import type {ListItem} from '@components/SelectionList/types';
import type {UnitItemType} from '@components/UnitPicker';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import type {SettingsNavigatorParamList} from '@navigation/types';
import AdminPolicyAccessOrNotFoundWrapper from '@pages/workspace/AdminPolicyAccessOrNotFoundWrapper';
import PaidPolicyAccessOrNotFoundWrapper from '@pages/workspace/PaidPolicyAccessOrNotFoundWrapper';
import * as Policy from '@userActions/Policy';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type * as OnyxTypes from '@src/types/onyx';
import CategorySelector from './CategorySelector';
import UnitSelector from './UnitSelector';

type PolicyDistanceRatesSettingsPageOnyxProps = {
    /** Policy details */
    policy: OnyxEntry<OnyxTypes.Policy>;
};

type PolicyDistanceRatesSettingsPageProps = PolicyDistanceRatesSettingsPageOnyxProps & StackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.DISTANCE_RATES_SETTINGS>;

function PolicyDistanceRatesSettingsPage({policy, route}: PolicyDistanceRatesSettingsPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const policyID = route.params.policyID;
    const customUnits = policy?.customUnits ?? {};
    const customUnit = customUnits[Object.keys(customUnits)[0]];
    const customUnitID = customUnit?.customUnitID ?? '';

    const defaultCategory = customUnits[customUnitID].defaultCategory;
    const defaultUnit = customUnits[customUnitID].attributes.unit;

    const setNewUnit = (unit: UnitItemType) => {
        Policy.setPolicyDistanceRatesUnit(policyID, customUnit, {...customUnit, attributes: {unit: unit.value}});
    };

    const setNewCategory = (category: ListItem) => {
        Policy.setPolicyDistanceRatesDefaultCategory(policyID, customUnit, {...customUnit, defaultCategory: category.text});
    };

    return (
        <AdminPolicyAccessOrNotFoundWrapper policyID={route.params.policyID}>
            <PaidPolicyAccessOrNotFoundWrapper policyID={route.params.policyID}>
                <ScreenWrapper
                    includeSafeAreaPaddingBottom={false}
                    style={[styles.defaultModalContainer]}
                    testID={PolicyDistanceRatesSettingsPage.displayName}
                >
                    <HeaderWithBackButton title={translate('workspace.common.settings')} />
                    <UnitSelector
                        label={translate('workspace.distanceRates.unit')}
                        defaultValue={defaultUnit}
                        wrapperStyle={[styles.ph5, styles.mt3]}
                        setNewUnit={setNewUnit}
                    />
                    {policy?.areCategoriesEnabled && (
                        <CategorySelector
                            policyID={policyID}
                            label={translate('workspace.distanceRates.defaultCategory')}
                            defaultValue={defaultCategory}
                            wrapperStyle={[styles.ph5, styles.mt3]}
                            setNewCategory={setNewCategory}
                        />
                    )}
                </ScreenWrapper>
            </PaidPolicyAccessOrNotFoundWrapper>
        </AdminPolicyAccessOrNotFoundWrapper>
    );
}

PolicyDistanceRatesSettingsPage.displayName = 'PolicyDistanceRatesSettingsPage';

export default withOnyx<PolicyDistanceRatesSettingsPageProps, PolicyDistanceRatesSettingsPageOnyxProps>({
    policy: {
        key: ({route}) => `${ONYXKEYS.COLLECTION.POLICY}${route.params.policyID}`,
    },
})(PolicyDistanceRatesSettingsPage);
