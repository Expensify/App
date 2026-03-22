import React, {useCallback} from 'react';
import {useCurrencyListState} from '@hooks/useCurrencyList';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import {getPlaidCountry, getPlaidInstitutionId} from '@libs/CardUtils';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@navigation/types';
import VerifyAccountPageBase from '@pages/settings/VerifyAccountPageBase';
import {clearAddNewCardFlow, setAddNewCompanyCardStepAndData, setAssignCardStepAndData} from '@userActions/CompanyCards';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type WorkspaceCompanyCardsVerifyAccountPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.COMPANY_CARDS_VERIFY_ACCOUNT>;

function WorkspaceCompanyCardsVerifyAccountPage({route}: WorkspaceCompanyCardsVerifyAccountPageProps) {
    const {policyID, feed} = route.params;
    const policy = usePolicy(policyID);
    const [cardFeeds] = useCardFeeds(policyID);
    const [countryByIp] = useOnyx(ONYXKEYS.COUNTRY);
    const {currencyList} = useCurrencyListState();

    const companyCardsRoute = ROUTES.WORKSPACE_COMPANY_CARDS.getRoute(policyID);

    // Seed Onyx state for the refresh flow once the account is validated
    const onValidationSuccess = useCallback(() => {
        if (!feed) {
            return;
        }

        const isPlaid = !!getPlaidInstitutionId(feed);
        const currentStep = isPlaid ? CONST.COMPANY_CARD.STEP.PLAID_CONNECTION : CONST.COMPANY_CARD.STEP.BANK_CONNECTION;

        if (isPlaid) {
            const country = getPlaidCountry(policy?.outputCurrency, currencyList, countryByIp);
            setAddNewCompanyCardStepAndData({data: {selectedCountry: country}});
        }

        setAssignCardStepAndData({currentStep, isRefreshing: true});
    }, [feed, policy?.outputCurrency, currencyList, countryByIp]);

    if (feed) {
        return (
            <VerifyAccountPageBase
                navigateBackTo={companyCardsRoute}
                navigateForwardTo={ROUTES.WORKSPACE_COMPANY_CARDS_REFRESH_CARD_FEED_CONNECTION.getRoute(policyID, feed)}
                onValidationSuccess={onValidationSuccess}
            />
        );
    }

    return (
        <VerifyAccountPageBase
            navigateBackTo={companyCardsRoute}
            navigateForwardTo={ROUTES.WORKSPACE_COMPANY_CARDS_ADD_NEW.getRoute(policyID)}
            onValidationSuccess={clearAddNewCardFlow}
        />
    );
}

export default WorkspaceCompanyCardsVerifyAccountPage;
