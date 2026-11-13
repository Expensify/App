import GovernmentRateCountrySelector from '@components/GovernmentRateCountrySelector';

import useApplyWorkspaceCurrencyChange from '@hooks/useApplyWorkspaceCurrencyChange';
import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';

import stripDynamicRouteSuffixFromPath from '@libs/Navigation/helpers/dynamicRoutesUtils/stripDynamicRouteSuffixFromPath';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import {isSharedGovernmentRateCurrency} from '@libs/PolicyDistanceRatesUtils';

import type {SettingsNavigatorParamList} from '@navigation/types';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

import React from 'react';

import AccessOrNotFoundWrapper from './AccessOrNotFoundWrapper';

type WorkspaceOverviewCurrencyGovernmentRateCountryPageProps =
    | PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.CURRENCY_GOVERNMENT_RATE_COUNTRY>
    | PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.DYNAMIC_WORKSPACE_CURRENCY_GOVERNMENT_RATE_COUNTRY>;

function WorkspaceOverviewCurrencyGovernmentRateCountryPage({route}: WorkspaceOverviewCurrencyGovernmentRateCountryPageProps) {
    const {policyID, currencyCode} = route.params;
    const isForcedToChangeCurrency = !!route.params?.isForcedToChangeCurrency;
    const shouldStartExpensifyCardEnrollment = !!route.params?.shouldStartExpensifyCardEnrollment;
    // The currency page opened on top of another page opens this one on top of itself, see WorkspaceOverviewCurrencyPage
    const isDynamicRoute = route.name === SCREENS.WORKSPACE.DYNAMIC_WORKSPACE_CURRENCY_GOVERNMENT_RATE_COUNTRY;
    const currencyPagePath = useDynamicBackPath(DYNAMIC_ROUTES.WORKSPACE_CURRENCY_GOVERNMENT_RATE_COUNTRY.path, isDynamicRoute);
    const {translate} = useLocalize();
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);

    const applyWorkspaceCurrencyChange = useApplyWorkspaceCurrencyChange(policy);

    const goBackToCurrencyPage = () => {
        if (isDynamicRoute) {
            Navigation.goBack(currencyPagePath);
            return;
        }
        Navigation.goBack(ROUTES.WORKSPACE_OVERVIEW_CURRENCY.getRoute(policyID, {isForcedToChangeCurrency, shouldStartExpensifyCardEnrollment}));
    };

    // Saving closes the currency page too, so it goes back to the page the currency page was opened from
    const pageBehindCurrencyPage = isDynamicRoute ? stripDynamicRouteSuffixFromPath(currencyPagePath, DYNAMIC_ROUTES.WORKSPACE_CURRENCY.path) : ROUTES.WORKSPACE_OVERVIEW.getRoute(policyID);

    const saveCountry = (selectedCountry: string) => {
        if (!policy) {
            goBackToCurrencyPage();
            return;
        }

        applyWorkspaceCurrencyChange(currencyCode, {
            isForcedToChangeCurrency,
            shouldStartExpensifyCardEnrollment,
            governmentRateCountry: selectedCountry,
            backTo: pageBehindCurrencyPage,
        });
    };

    // The page only makes sense when switching to a currency that shares its government rates, so a crafted deep link lands on nothing
    const isSharedCurrency = isSharedGovernmentRateCurrency(currencyCode);

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN]}
            policyID={policyID}
            shouldBeBlocked={!isSharedCurrency}
        >
            <GovernmentRateCountrySelector
                headerTitle={translate('workspace.distanceRates.governmentRateSourceCountry')}
                introText={translate('workspace.distanceRates.governmentRateCountrySelectionPrompt')}
                isBlocked={!policy}
                onBackButtonPress={goBackToCurrencyPage}
                onSave={saveCountry}
                testID="WorkspaceOverviewCurrencyGovernmentRateCountryPage"
            />
        </AccessOrNotFoundWrapper>
    );
}

export default WorkspaceOverviewCurrencyGovernmentRateCountryPage;
