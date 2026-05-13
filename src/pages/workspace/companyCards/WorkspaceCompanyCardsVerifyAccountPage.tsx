import React from 'react';
import {useCurrencyListState} from '@hooks/useCurrencyList';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@navigation/types';
import VerifyAccountPageBase from '@pages/settings/VerifyAccountPageBase';
import {clearAddNewCardFlow, seedCardFeedRefresh} from '@userActions/CompanyCards';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type WorkspaceCompanyCardsVerifyAccountPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.COMPANY_CARDS_VERIFY_ACCOUNT>;

function WorkspaceCompanyCardsVerifyAccountPage({route}: WorkspaceCompanyCardsVerifyAccountPageProps) {
    const {policyID, feed} = route.params;
    const policy = usePolicy(policyID);
    const [countryByIp] = useOnyx(ONYXKEYS.COUNTRY);
    const {currencyList} = useCurrencyListState();

    const companyCardsRoute = ROUTES.WORKSPACE_COMPANY_CARDS.getRoute(policyID);

    // Seeds Onyx state for the refresh flow; VerifyAccountPageBase handles navigation via navigateForwardTo
    const onRefreshValidationSuccess = () => {
        if (!feed) {
            return;
        }
        seedCardFeedRefresh(feed, policy?.outputCurrency, currencyList, countryByIp);
    };

    if (feed) {
        return (
            <VerifyAccountPageBase
                navigateBackTo={companyCardsRoute}
                navigateForwardTo={ROUTES.WORKSPACE_COMPANY_CARDS_REFRESH_CARD_FEED_CONNECTION.getRoute(policyID, feed)}
                onValidationSuccess={onRefreshValidationSuccess}
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
