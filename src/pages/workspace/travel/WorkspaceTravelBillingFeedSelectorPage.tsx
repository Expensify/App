import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import SingleSelectListItem from '@components/SelectionList/ListItem/SingleSelectListItem';
import type {ListItem} from '@components/SelectionList/types';

import useExpensifyCardFeedsForFeedSelector from '@hooks/useExpensifyCardFeedsForFeedSelector';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';

import {getMicroSecondOnyxErrorWithTranslationKey} from '@libs/ErrorUtils';
import type {ExpensifyCardFeedEntry} from '@libs/ExpensifyCardFeedSelectorUtils';
import {getExpensifyCardFeedDescription} from '@libs/ExpensifyCardFeedSelectorUtils';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';

import Navigation from '@navigation/Navigation';

import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';

import {linkCardFeedToPolicy} from '@userActions/CompanyCards';

import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {Errors} from '@src/types/onyx/OnyxCommon';

import React, {useState} from 'react';

type TravelBillingFeedListItem = ListItem & {
    value: number;
};

type WorkspaceTravelBillingFeedSelectorPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.DYNAMIC_WORKSPACE_TRAVEL_BILLING_SELECT_FEED>;

function WorkspaceTravelBillingFeedSelectorPage({route}: WorkspaceTravelBillingFeedSelectorPageProps) {
    const {policyID} = route.params;
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const {allFeeds} = useExpensifyCardFeedsForFeedSelector(policyID, [CONST.TRAVEL.PROGRAM_TRAVEL_US]);
    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const [domains] = useOnyx(ONYXKEYS.COLLECTION.DOMAIN);
    const [cardList] = useOnyx(ONYXKEYS.CARD_LIST);
    const [feedWithError, setFeedWithError] = useState<{fundID?: number; error?: Errors} | undefined>(undefined);
    const [linkingFundID, setLinkingFundID] = useState<number>();

    const goBack = () => Navigation.goBack(ROUTES.WORKSPACE_TRAVEL.getRoute(policyID));

    const onDismissError = () => setFeedWithError(undefined);

    const toListItem = (entry: ExpensifyCardFeedEntry): TravelBillingFeedListItem => ({
        value: entry.fundID,
        text: getExpensifyCardFeedDescription(entry.settings, policies, domains, entry.fundID, cardList),
        keyForList: entry.fundID.toString(),
        isDisabled: isOffline || linkingFundID !== undefined,
        errors: feedWithError?.fundID === entry.fundID ? feedWithError.error : undefined,
    });

    const selectFeed = (feed: TravelBillingFeedListItem) => {
        // A second tap while the link resolves would fire the command again and navigate back twice.
        if (linkingFundID !== undefined) {
            return;
        }
        setLinkingFundID(feed.value);
        linkCardFeedToPolicy(feed.value, policyID, CONST.COMPANY_CARD.LINK_FEED_TYPE.EXPENSIFY_CARD, CONST.TRAVEL.PROGRAM_TRAVEL_US)
            .then(() => goBack())
            .catch((error: TranslationPaths) => {
                setLinkingFundID(undefined);
                setFeedWithError({fundID: feed.value, error: getMicroSecondOnyxErrorWithTranslationKey(error)});
            });
    };

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.IS_TRAVEL_ENABLED}
            policyFeature={CONST.POLICY.POLICY_FEATURE.MORE_FEATURES}
            policyFeatureAccess={CONST.POLICY.POLICY_FEATURE_ACCESS.WRITE}
        >
            <ScreenWrapper
                testID="WorkspaceTravelBillingFeedSelectorPage"
                shouldEnableMaxHeight
                enableEdgeToEdgeBottomSafeAreaPadding
            >
                <HeaderWithBackButton
                    title={translate('workspace.moreFeatures.travel.travelInvoicing.travelInvoicingSection.title')}
                    onBackButtonPress={goBack}
                />
                <SelectionList
                    ListItem={SingleSelectListItem}
                    onSelectRow={selectFeed}
                    data={allFeeds.map(toListItem)}
                    onDismissError={onDismissError}
                    addBottomSafeAreaPadding
                />
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default WorkspaceTravelBillingFeedSelectorPage;
