import {Str} from 'expensify-common';
import React from 'react';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Icon from '@components/Icon';
import MenuItem from '@components/MenuItem';
import PlaidCardFeedIcon from '@components/PlaidCardFeedIcon';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/ListItem/RadioListItem';
import type {ListItem} from '@components/SelectionList/types';
import useCardFeedErrors from '@hooks/useCardFeedErrors';
import type {CombinedCardFeed, CompanyCardFeedWithDomainID} from '@hooks/useCardFeeds';
import {useCompanyCardFeedIcons} from '@hooks/useCompanyCardIcons';
import useCompanyCards from '@hooks/useCompanyCards';
import useIsBlockedToAddFeed from '@hooks/useIsBlockedToAddFeed';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import useThemeIllustrations from '@hooks/useThemeIllustrations';
import useThemeStyles from '@hooks/useThemeStyles';
import {getCardFeedIcon, getCustomOrFormattedFeedName, getPlaidInstitutionIconUrl} from '@libs/CardUtils';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import Navigation from '@navigation/Navigation';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import variables from '@styles/variables';
import {updateSelectedFeed} from '@userActions/Card';
import {clearAddNewCardFlow} from '@userActions/CompanyCards';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {CompanyCardFeed} from '@src/types/onyx';

type CardFeedListItem = ListItem & {
    /** Combined feed key */
    value: CompanyCardFeedWithDomainID;

    /** Card feed value */
    feed: CompanyCardFeed;
};

type WorkspaceCompanyCardFeedSelectorPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.COMPANY_CARDS_SELECT_FEED>;

function WorkspaceCompanyCardFeedSelectorPage({route}: WorkspaceCompanyCardFeedSelectorPageProps) {
    const {policyID} = route.params;
    const policy = usePolicy(policyID);

    const {translate} = useLocalize();
    const [allDomains] = useOnyx(ONYXKEYS.COLLECTION.DOMAIN, {canBeMissing: false});
    const styles = useThemeStyles();
    const illustrations = useThemeIllustrations();
    const companyCardFeedIcons = useCompanyCardFeedIcons();
    const {isBlockedToAddNewFeeds} = useIsBlockedToAddFeed(policyID);
    const icons = useMemoizedLazyExpensifyIcons(['Plus']);

    const {companyCardFeeds, feedName: selectedFeedName} = useCompanyCards({policyID});
    const {shouldShowRbrForFeedNameWithDomainID} = useCardFeedErrors();

    const feeds: CardFeedListItem[] = (Object.entries(companyCardFeeds ?? {}) as Array<[CompanyCardFeedWithDomainID, CombinedCardFeed]>).map(([feedName, feedSettings]) => {
        const plaidUrl = getPlaidInstitutionIconUrl(feedSettings.feed);
        const domain = allDomains?.[`${ONYXKEYS.COLLECTION.DOMAIN}${feedSettings.domainID}`];
        const domainName = domain?.email ? Str.extractEmailDomain(domain.email) : undefined;

        const shouldShowRBR = shouldShowRbrForFeedNameWithDomainID[feedName];

        return {
            value: feedName,
            feed: feedSettings.feed as CompanyCardFeed,
            alternateText: domainName ?? policy?.name,
            text: getCustomOrFormattedFeedName(translate, feedSettings.feed as CompanyCardFeed, feedSettings.customFeedName),
            keyForList: feedName,
            isSelected: feedName === selectedFeedName,
            isDisabled: feedSettings.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
            pendingAction: feedSettings.pendingAction,
            brickRoadIndicator: shouldShowRBR ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined,
            canShowSeveralIndicators: shouldShowRBR,
            leftElement: plaidUrl ? (
                <PlaidCardFeedIcon
                    plaidUrl={plaidUrl}
                    style={styles.mr3}
                />
            ) : (
                <Icon
                    src={getCardFeedIcon(feedSettings.feed as CompanyCardFeed, illustrations, companyCardFeedIcons)}
                    height={variables.cardIconHeight}
                    width={variables.cardIconWidth}
                    additionalStyles={[styles.mr3, styles.cardIcon]}
                />
            ),
        };
    });

    const onAddCardsPress = () => {
        clearAddNewCardFlow();
        if (isBlockedToAddNewFeeds) {
            Navigation.navigate(
                ROUTES.WORKSPACE_UPGRADE.getRoute(policyID, CONST.UPGRADE_FEATURE_INTRO_MAPPING.companyCards.alias, ROUTES.WORKSPACE_COMPANY_CARDS_SELECT_FEED.getRoute(policyID)),
            );
            return;
        }
        Navigation.navigate(ROUTES.WORKSPACE_COMPANY_CARDS_ADD_NEW.getRoute(policyID));
    };

    const goBack = () => Navigation.goBack(ROUTES.WORKSPACE_COMPANY_CARDS.getRoute(policyID));

    const selectFeed = (feed: CardFeedListItem) => {
        updateSelectedFeed(feed.value, policyID);
        goBack();
    };

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_COMPANY_CARDS_ENABLED}
        >
            <ScreenWrapper
                testID="WorkspaceCompanyCardFeedSelectorPage"
                shouldEnablePickerAvoiding={false}
                shouldEnableMaxHeight
                enableEdgeToEdgeBottomSafeAreaPadding
            >
                <HeaderWithBackButton
                    title={translate('workspace.companyCards.selectCards')}
                    onBackButtonPress={goBack}
                />
                <SelectionList
                    ListItem={RadioListItem}
                    onSelectRow={selectFeed}
                    data={feeds}
                    alternateNumberOfSupportedLines={2}
                    initiallyFocusedItemKey={selectedFeedName}
                    addBottomSafeAreaPadding
                    listFooterContent={
                        <MenuItem
                            title={translate('workspace.companyCards.addCards')}
                            icon={icons.Plus}
                            onPress={onAddCardsPress}
                        />
                    }
                />
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default WorkspaceCompanyCardFeedSelectorPage;
