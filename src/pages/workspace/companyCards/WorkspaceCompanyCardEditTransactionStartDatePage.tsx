import useCardFeeds from '@hooks/useCardFeeds';
import useCardsList from '@hooks/useCardsList';
import useLocalize from '@hooks/useLocalize';
import usePolicy from '@hooks/usePolicy';

import {getCompanyCardFeed, getCompanyFeeds, getDomainOrWorkspaceAccountID} from '@libs/CardUtils';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';

import Navigation from '@navigation/Navigation';

import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';

import {updateCardTransactionStartDate} from '@userActions/CompanyCards';

import CONST from '@src/CONST';
import type SCREENS from '@src/SCREENS';
import type {CompanyCardFeedWithDomainID} from '@src/types/onyx';

import {format, parseISO} from 'date-fns';
import React from 'react';

import CompanyCardTransactionStartDateForm from './CompanyCardTransactionStartDateForm';
import {getCompanyCardDetailsBackPath} from './utils';

type WorkspaceCompanyCardEditTransactionStartDatePageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.COMPANY_CARD_EDIT_TRANSACTION_START_DATE>;

function WorkspaceCompanyCardEditTransactionStartDatePage({route, navigation}: WorkspaceCompanyCardEditTransactionStartDatePageProps) {
    const {policyID, cardID} = route.params;
    // The linking layer can provide the path parameter with the feed separator still encoded.
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- decoding preserves the company-feed shape guaranteed by this route
    const feedName = decodeURIComponent(route.params.feed) as CompanyCardFeedWithDomainID;
    const bank = getCompanyCardFeed(feedName);

    const {translate} = useLocalize();
    const policy = usePolicy(policyID);
    const workspaceAccountID = policy?.policyAccountID ?? CONST.DEFAULT_NUMBER_ID;

    const [cardFeeds] = useCardFeeds(policyID);
    const companyFeeds = getCompanyFeeds(cardFeeds);
    const domainOrWorkspaceAccountID = getDomainOrWorkspaceAccountID(workspaceAccountID, companyFeeds[feedName]);
    const goBackToCardDetails = () => Navigation.goBack(getCompanyCardDetailsBackPath(policyID, feedName, cardID, navigation.getState()));

    const [allBankCards] = useCardsList(feedName);
    const card = allBankCards?.[cardID];
    const currentStartDate = card?.scrapeMinDate;
    const savedDateOption = currentStartDate ? CONST.COMPANY_CARD.TRANSACTION_START_DATE_OPTIONS.CUSTOM : CONST.COMPANY_CARD.TRANSACTION_START_DATE_OPTIONS.FROM_BEGINNING;
    const initialStartDate = currentStartDate ? format(parseISO(currentStartDate), CONST.DATE.FNS_FORMAT_STRING) : format(new Date(), CONST.DATE.FNS_FORMAT_STRING);
    const submit = (newStartDate: string) => {
        updateCardTransactionStartDate(domainOrWorkspaceAccountID, cardID, newStartDate, bank, currentStartDate);
        goBackToCardDetails();
    };

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_COMPANY_CARDS_ENABLED}
            policyFeature={CONST.POLICY.POLICY_FEATURE.COMPANY_CARDS}
            policyFeatureAccess={CONST.POLICY.POLICY_FEATURE_ACCESS.WRITE}
        >
            <CompanyCardTransactionStartDateForm
                testID="WorkspaceCompanyCardEditTransactionStartDatePage"
                description={translate('workspace.companyCards.editStartDateDescription')}
                initialDateOption={savedDateOption}
                initialStartDate={initialStartDate}
                onBackButtonPress={goBackToCardDetails}
                onSubmit={submit}
                shouldResetStartDateOnCustomSelection={!currentStartDate}
            />
        </AccessOrNotFoundWrapper>
    );
}

export default WorkspaceCompanyCardEditTransactionStartDatePage;
