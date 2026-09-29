import GovernmentRateCountrySelector from '@components/GovernmentRateCountrySelector';

import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';

import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import {getDistanceRateCustomUnit} from '@libs/PolicyUtils';

import type {SettingsNavigatorParamList} from '@navigation/types';

import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';

import {setWorkspaceDistanceAutoUpdate} from '@userActions/Policy/DistanceRate';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

import React from 'react';

type PolicyDistanceRateGovernmentRateCountryPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.DISTANCE_RATES_GOVERNMENT_RATE_COUNTRY>;

function PolicyDistanceRateGovernmentRateCountryPage({route}: PolicyDistanceRateGovernmentRateCountryPageProps) {
    const policyID = route.params.policyID;
    const {translate} = useLocalize();
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
    const [governmentMileageRates] = useOnyx(ONYXKEYS.GOVERNMENT_MILEAGE_RATES);

    const customUnit = getDistanceRateCustomUnit(policy);
    const currentCountry = policy?.autoUpdateGovernmentRateCountry;

    const goBackToSettings = () => Navigation.goBack(ROUTES.WORKSPACE_DISTANCE_RATES_SETTINGS.getRoute(policyID));

    const saveCountry = (selectedCountry: string) => {
        if (!customUnit || selectedCountry === currentCountry) {
            goBackToSettings();
            return;
        }

        // Saving a country turns the auto-update on with that country, or moves an enabled workspace to the new country
        setWorkspaceDistanceAutoUpdate(policyID, customUnit, true, governmentMileageRates ?? [], policy?.outputCurrency, selectedCountry, currentCountry);
        goBackToSettings();
    };

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_DISTANCE_RATES_ENABLED}
        >
            <GovernmentRateCountrySelector
                headerTitle={translate('common.country')}
                initialSelectedCountry={currentCountry}
                isBlocked={!customUnit}
                onBackButtonPress={goBackToSettings}
                onSave={saveCountry}
                testID="PolicyDistanceRateGovernmentRateCountryPage"
            />
        </AccessOrNotFoundWrapper>
    );
}

export default PolicyDistanceRateGovernmentRateCountryPage;
