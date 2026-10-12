import useCardFeeds from '@hooks/useCardFeeds';
import useCardsList from '@hooks/useCardsList';
import useLocalize from '@hooks/useLocalize';
import usePolicy from '@hooks/usePolicy';

import {getCompanyCardFeed, getCompanyFeeds, getDomainOrWorkspaceAccountID} from '@libs/CardUtils';
import Growl from '@libs/Growl';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';

import Navigation from '@navigation/Navigation';

import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';

import {bulkUpdateCardTransactionStartDate} from '@userActions/CompanyCards';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type {CompanyCardFeedWithDomainID} from '@src/types/onyx';

import {StackActions} from '@react-navigation/native';
import {format} from 'date-fns';
import React, {useEffect} from 'react';

import CompanyCardTransactionStartDateForm from './CompanyCardTransactionStartDateForm';

type WorkspaceCompanyCardsBulkEditTransactionStartDatePageProps = PlatformStackScreenProps<
    SettingsNavigatorParamList,
    typeof SCREENS.WORKSPACE.COMPANY_CARDS_BULK_EDIT_TRANSACTION_START_DATE
>;

function WorkspaceCompanyCardsBulkEditTransactionStartDatePage({route, navigation}: WorkspaceCompanyCardsBulkEditTransactionStartDatePageProps) {
    const {policyID} = route.params;
    // The linking layer can provide the path parameter with the feed separator still encoded.
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- decoding preserves the company-feed shape guaranteed by this route
    const feedName = decodeURIComponent(route.params.feed) as CompanyCardFeedWithDomainID;
    const cardIDs = (route.params.cardIDs ?? '').split(',').filter(Boolean);
    const singleCardID = cardIDs.length === 1 ? cardIDs.at(0) : undefined;
    const bank = getCompanyCardFeed(feedName);

    const {translate} = useLocalize();
    const policy = usePolicy(policyID);
    const workspaceAccountID = policy?.policyAccountID ?? CONST.DEFAULT_NUMBER_ID;

    const [cardFeeds] = useCardFeeds(policyID);
    const companyFeeds = getCompanyFeeds(cardFeeds);
    const domainOrWorkspaceAccountID = getDomainOrWorkspaceAccountID(workspaceAccountID, companyFeeds[feedName]);
    const [allBankCards] = useCardsList(feedName);

    useEffect(() => {
        if (!singleCardID) {
            return;
        }

        navigation.dispatch(
            StackActions.replace(SCREENS.WORKSPACE.COMPANY_CARD_EDIT_TRANSACTION_START_DATE, {
                policyID,
                cardID: singleCardID,
                feed: feedName,
            }),
        );
    }, [feedName, navigation, policyID, singleCardID]);

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
        ).then(() => {
            Growl.success(translate('workspace.companyCards.bulkStartDateUpdated'), {position: CONST.GROWL.POSITION.BOTTOM_RIGHT});
        });
        goBackToCompanyCards();
    };

    if (singleCardID) {
        return null;
    }

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_COMPANY_CARDS_ENABLED}
            policyFeature={CONST.POLICY.POLICY_FEATURE.COMPANY_CARDS}
            policyFeatureAccess={CONST.POLICY.POLICY_FEATURE_ACCESS.WRITE}
        >
            <CompanyCardTransactionStartDateForm
                testID="WorkspaceCompanyCardsBulkEditTransactionStartDatePage"
                description={translate('workspace.companyCards.bulkEditStartDateDescription')}
                initialDateOption={CONST.COMPANY_CARD.TRANSACTION_START_DATE_OPTIONS.CUSTOM}
                initialStartDate={format(new Date(), CONST.DATE.FNS_FORMAT_STRING)}
                onBackButtonPress={goBackToCompanyCards}
                onSubmit={submit}
                isSaveDisabled={cardIDs.length === 0}
            />
        </AccessOrNotFoundWrapper>
    );
}

export default WorkspaceCompanyCardsBulkEditTransactionStartDatePage;
