import GovernmentRateCountrySelector from '@components/GovernmentRateCountrySelector';

import useApplyWorkspaceCurrencyChange from '@hooks/useApplyWorkspaceCurrencyChange';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';

import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';

import type {SettingsNavigatorParamList} from '@navigation/types';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

import React from 'react';

import AccessOrNotFoundWrapper from './AccessOrNotFoundWrapper';

type WorkspaceOverviewCurrencyGovernmentRateCountryPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.CURRENCY_GOVERNMENT_RATE_COUNTRY>;

function WorkspaceOverviewCurrencyGovernmentRateCountryPage({route}: WorkspaceOverviewCurrencyGovernmentRateCountryPageProps) {
    const {policyID, currencyCode} = route.params;
    const isForcedToChangeCurrency = !!route.params?.isForcedToChangeCurrency;
    const {translate} = useLocalize();
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);

    const applyWorkspaceCurrencyChange = useApplyWorkspaceCurrencyChange(policy);

    const goBackToCurrencyPage = () => Navigation.goBack(ROUTES.WORKSPACE_OVERVIEW_CURRENCY.getRoute(policyID));

    const saveCountry = (selectedCountry: string) => {
        if (!policy) {
            goBackToCurrencyPage();
            return;
        }

        // The currency write and the auto-update re-enable both go out from here, then the flow lands back on the overview
        applyWorkspaceCurrencyChange(currencyCode, {
            isForcedToChangeCurrency,
            governmentRateCountry: selectedCountry,
            backTo: ROUTES.WORKSPACE_OVERVIEW.getRoute(policyID),
        });
    };

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN]}
            policyID={policyID}
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
