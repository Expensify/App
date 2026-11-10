import FullscreenLoadingIndicator from '@components/FullscreenLoadingIndicator';

import useCardFeeds from '@hooks/useCardFeeds';
import useCardsList from '@hooks/useCardsList';
import useLocalize from '@hooks/useLocalize';
import usePolicy from '@hooks/usePolicy';

import {getCompanyCardFeed, getCompanyFeeds, getDomainOrWorkspaceAccountID} from '@libs/CardUtils';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';

import Navigation from '@navigation/Navigation';

import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';

import {bulkUpdateCardTransactionStartDate} from '@userActions/CompanyCards';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {CompanyCardFeedWithDomainID} from '@src/types/onyx';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

import {format, parseISO} from 'date-fns';
import React from 'react';

import CompanyCardTransactionStartDateForm from './CompanyCardTransactionStartDateForm';

type WorkspaceCompanyCardsBulkEditTransactionStartDatePageProps = PlatformStackScreenProps<
    SettingsNavigatorParamList,
    typeof SCREENS.WORKSPACE.COMPANY_CARDS_BULK_EDIT_TRANSACTION_START_DATE
>;

function WorkspaceCompanyCardsBulkEditTransactionStartDatePage({route}: WorkspaceCompanyCardsBulkEditTransactionStartDatePageProps) {
    const {policyID} = route.params;
    // The linking layer can provide the path parameter with the feed separator still encoded.
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- decoding preserves the company-feed shape guaranteed by this route
    const feedName = decodeURIComponent(route.params.feed) as CompanyCardFeedWithDomainID;
    const cardIDs = (route.params.cardIDs ?? '').split(',').filter(Boolean);
    const bank = getCompanyCardFeed(feedName);

    const {translate} = useLocalize();
    const policy = usePolicy(policyID);
    const workspaceAccountID = policy?.policyAccountID ?? CONST.DEFAULT_NUMBER_ID;

    const [cardFeeds, cardFeedsMetadata] = useCardFeeds(policyID);
    const companyFeeds = getCompanyFeeds(cardFeeds);
    const domainOrWorkspaceAccountID = getDomainOrWorkspaceAccountID(workspaceAccountID, companyFeeds[feedName]);
    const [allBankCards, cardsMetadata] = useCardsList(feedName);
    const isLoading = isLoadingOnyxValue(cardFeedsMetadata, cardsMetadata);
    const hasMissingCards = cardIDs.some((cardID) => !allBankCards?.[cardID]);
    const selectedDates = cardIDs.map((cardID) => allBankCards?.[cardID]?.scrapeMinDate ?? '');
    const uniqueDates = new Set(selectedDates);
    const areAllFromBeginning = selectedDates.every((date) => !date);
    const sharedStartDate = uniqueDates.size === 1 ? selectedDates.at(0) : undefined;
    const sharedDateOption = areAllFromBeginning ? CONST.COMPANY_CARD.TRANSACTION_START_DATE_OPTIONS.FROM_BEGINNING : CONST.COMPANY_CARD.TRANSACTION_START_DATE_OPTIONS.CUSTOM;
    const initialDateOption = uniqueDates.size > 1 ? '' : sharedDateOption;
    const initialStartDate = sharedStartDate ? format(parseISO(sharedStartDate), CONST.DATE.FNS_FORMAT_STRING) : '';

    const goBackToCompanyCards = () => Navigation.goBack(ROUTES.WORKSPACE_COMPANY_CARDS.getRoute(policyID));

    const submit = (newStartDate: string) => {
        bulkUpdateCardTransactionStartDate(
            domainOrWorkspaceAccountID,
            bank,
            cardIDs.map((cardID) => ({
                cardID,
                oldStartDate: allBankCards?.[cardID]?.scrapeMinDate,
            })),
            newStartDate,
        );
        goBackToCompanyCards();
    };

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_COMPANY_CARDS_ENABLED}
            policyFeature={CONST.POLICY.POLICY_FEATURE.COMPANY_CARDS}
            policyFeatureAccess={CONST.POLICY.POLICY_FEATURE_ACCESS.WRITE}
            shouldBeBlocked={!isLoading && hasMissingCards}
        >
            {isLoading ? (
                <FullscreenLoadingIndicator onGoBack={goBackToCompanyCards} />
            ) : (
                <CompanyCardTransactionStartDateForm
                    testID="WorkspaceCompanyCardsBulkEditTransactionStartDatePage"
                    description={translate('workspace.companyCards.bulkEditStartDateDescription')}
                    initialDateOption={initialDateOption}
                    initialStartDate={initialStartDate}
                    onBackButtonPress={goBackToCompanyCards}
                    onSubmit={submit}
                    isSaveDisabled={cardIDs.length === 0 || hasMissingCards}
                    shouldResetStartDateOnCustomSelection={areAllFromBeginning}
                />
            )}
        </AccessOrNotFoundWrapper>
    );
}

export default WorkspaceCompanyCardsBulkEditTransactionStartDatePage;
