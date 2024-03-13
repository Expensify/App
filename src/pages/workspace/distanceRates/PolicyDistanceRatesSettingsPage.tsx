import type {StackScreenProps} from '@react-navigation/stack';
import React from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import type {SettingsNavigatorParamList} from '@navigation/types';
import * as Policy from '@userActions/Policy';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type * as OnyxTypes from '@src/types/onyx';
import CategorySelector from './CategorySelector';
import type CategoryItemType from './CategorySelector/types';
import UnitSelector from './UnitSelector';
import type {UnitItemType} from './UnitSelector/types';

type PolicyDistanceRatesSettingsPageOnyxProps = {
    /** Policy details */
    policy: OnyxEntry<OnyxTypes.Policy>;

    /** Collection of categories attached to a policy */
    policyCategories: OnyxEntry<OnyxTypes.PolicyCategories>;
};

type PolicyDistanceRatesSettingsPageProps = PolicyDistanceRatesSettingsPageOnyxProps & StackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.DISTANCE_RATES_SETTINGS>;

function PolicyDistanceRatesSettingsPage({policy, policyCategories, route}: PolicyDistanceRatesSettingsPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const policyID = route.params.policyID;
    const customUnits = policy?.customUnits ?? {};
    const customUnit = customUnits[Object.keys(customUnits)[0]];
    const customUnitID = customUnit?.customUnitID ?? '';

    const defaultCategory = customUnits[customUnitID].defaultCategory;
    const defaultUnit = customUnits[customUnitID].attributes.unit.toUpperCase();

    const setNewUnit = (unit: UnitItemType) => {
        Policy.setPolicyDistanceRatesUnit(policyID, customUnit, {...customUnit, attributes: {unit: unit.value}});
    };

    const setNewCategory = (category: CategoryItemType) => {
        Policy.setPolicyDistanceRatesDefaultCategory(policyID, customUnit, {...customUnit, defaultCategory: category.value});
    };

    return (
        <ScreenWrapper testID={PolicyDistanceRatesSettingsPage.displayName}>
            <HeaderWithBackButton title={translate('workspace.common.settings')} />
            <UnitSelector
                label={translate('workspace.distanceRates.unit')}
                defaultValue={defaultUnit}
                wrapperStyle={[styles.ph5, styles.mt3]}
                setNewUnit={setNewUnit}
            />
            {policy?.areCategoriesEnabled && (
                <CategorySelector
                    policyCategories={policyCategories}
                    label={translate('workspace.distanceRates.defaultCategory')}
                    defaultValue={defaultCategory}
                    wrapperStyle={[styles.ph5, styles.mt3]}
                    setNewCategory={setNewCategory}
                />
            )}
        </ScreenWrapper>
    );
}

PolicyDistanceRatesSettingsPage.displayName = 'PolicyDistanceRatesSettingsPage';

export default withOnyx<PolicyDistanceRatesSettingsPageProps, PolicyDistanceRatesSettingsPageOnyxProps>({
    policy: {
        key: ({route}) => `${ONYXKEYS.COLLECTION.POLICY}${route.params.policyID}`,
    },
    policyCategories: {
        key: ({route}) => `${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${route.params.policyID}`,
    },
})(PolicyDistanceRatesSettingsPage);
