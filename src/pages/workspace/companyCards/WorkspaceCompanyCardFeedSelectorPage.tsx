import {isUserValidatedSelector} from '@selectors/Account';
import {Str} from 'expensify-common';
import React, {useState} from 'react';
import {View} from 'react-native';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Icon from '@components/Icon';
import MenuItem from '@components/MenuItem';
import PlaidCardFeedIcon from '@components/PlaidCardFeedIcon';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/ListItem/RadioListItem';
import Text from '@components/Text';
import useCardFeedErrors from '@hooks/useCardFeedErrors';
import type {CombinedCardFeed, CompanyCardFeedWithDomainID} from '@hooks/useCardFeeds';
import {useCompanyCardFeedIcons} from '@hooks/useCompanyCardIcons';
import useCompanyCards from '@hooks/useCompanyCards';
import useIsBlockedToAddFeed from '@hooks/useIsBlockedToAddFeed';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useOtherFeedsForFeedSelector from '@hooks/useOtherFeedsForFeedSelector';
import type {CardFeedListItem} from '@hooks/useOtherFeedsForFeedSelector';
import usePolicy from '@hooks/usePolicy';
import usePrimaryContactMethod from '@hooks/usePrimaryContactMethod';
import useThemeIllustrations from '@hooks/useThemeIllustrations';
import useThemeStyles from '@hooks/useThemeStyles';
import {getLinkedPolicyName} from '@libs/CardFeedUtils';
import {getCardFeedIcon, getCardFeedWithDomainID, getCustomOrFormattedFeedName, getPlaidInstitutionIconUrl} from '@libs/CardUtils';
import {getMicroSecondOnyxErrorWithTranslationKey} from '@libs/ErrorUtils';
import {isEmailPublicDomain} from '@libs/LoginUtils';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import Navigation from '@navigation/Navigation';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import variables from '@styles/variables';
import {updateSelectedFeed} from '@userActions/Card';
import {clearAddNewCardFlow, linkCardFeedToPolicy} from '@userActions/CompanyCards';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {CompanyCardFeedWithNumber} from '@src/types/onyx/CardFeeds';
import type {Errors} from '@src/types/onyx/OnyxCommon';

type WorkspaceCompanyCardFeedSelectorPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.COMPANY_CARDS_SELECT_FEED>;

function WorkspaceCompanyCardFeedSelectorPage({route}: WorkspaceCompanyCardFeedSelectorPageProps) {
    const {policyID} = route.params;
    const policy = usePolicy(policyID);

    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const [allDomains] = useOnyx(ONYXKEYS.COLLECTION.DOMAIN);
    const [isUserValidated] = useOnyx(ONYXKEYS.ACCOUNT, {selector: isUserValidatedSelector});
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const [loginList] = useOnyx(ONYXKEYS.LOGIN_LIST);
    const styles = useThemeStyles();
    const illustrations = useThemeIllustrations();
    const companyCardFeedIcons = useCompanyCardFeedIcons();
    const {isBlockedToAddNewFeeds} = useIsBlockedToAddFeed(policyID);
    const icons = useMemoizedLazyExpensifyIcons(['Plus']);
    const [feedWithError, setFeedWithError] = useState<{feed?: string; error?: Errors} | undefined>(undefined);

    const {companyCardFeeds, feedName: selectedFeedName} = useCompanyCards({policyID});
    const {shouldShowRbrForFeedNameWithDomainID} = useCardFeedErrors();
    const otherFeeds = useOtherFeedsForFeedSelector(policyID);
    const primaryContactMethod = usePrimaryContactMethod();

    const isUserFromPublicDomain = isEmailPublicDomain(primaryContactMethod);

    const feeds: CardFeedListItem[] = (Object.entries(companyCardFeeds ?? {}) as Array<[CompanyCardFeedWithDomainID, CombinedCardFeed]>).map(([feedName, feedSettings]) => {
        const plaidUrl = getPlaidInstitutionIconUrl(feedSettings.feed);
        const domain = allDomains?.[`${ONYXKEYS.COLLECTION.DOMAIN}${feedSettings.domainID}`];
        const domainName = domain?.email ? Str.extractEmailDomain(domain.email) : undefined;

        const shouldShowRBR = shouldShowRbrForFeedNameWithDomainID[feedName];

        const policyName = getLinkedPolicyName(allPolicies, feedSettings?.preferredPolicy, policyID, policy?.name);

        return {
            value: feedName,
            feed: feedSettings.feed as CompanyCardFeedWithNumber,
            alternateText: domainName ?? policyName,
            text: getCustomOrFormattedFeedName(translate, feedSettings.feed, feedSettings.customFeedName),
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
                    src={getCardFeedIcon(feedSettings.feed, illustrations, companyCardFeedIcons)}
                    height={variables.cardIconHeight}
                    width={variables.cardIconWidth}
                    additionalStyles={[styles.mr3, styles.cardIcon]}
                />
            ),
        };
    });

    const onAddCardsPress = () => {
        if (!isUserValidated) {
            Navigation.navigate(ROUTES.WORKSPACE_COMPANY_CARDS_VERIFY_ACCOUNT.getRoute(policyID));
            return;
        }
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

    const selectOtherFeed = (feed: CardFeedListItem) => {
        if (isUserFromPublicDomain) {
            Navigation.navigate(ROUTES.WORKSPACE_COMPANY_CARD_ADD_WORK_EMAIL.getRoute(policyID, feed.value));
            return;
        }
        const primaryLoginKey = primaryContactMethod ? Object.keys(loginList ?? {}).find((login) => login.toLowerCase() === primaryContactMethod.toLowerCase()) : undefined;
        const isPrimaryContactValidated = primaryLoginKey ? !!loginList?.[primaryLoginKey]?.validatedDate : !primaryContactMethod;
        if (!isPrimaryContactValidated) {
            Navigation.navigate(ROUTES.WORKSPACE_COMPANY_CARD_VERIFY_WORK_EMAIL.getRoute(policyID, feed.value));
            return;
        }
        if (!feed.fundID) {
            return;
        }
        const feedValue = getCardFeedWithDomainID(feed.feed, feed.fundID) as CompanyCardFeedWithDomainID;
        linkCardFeedToPolicy(feed.fundID, policyID, CONST.COMPANY_CARD.LINK_FEED_TYPE.COMPANY_CARD, feed?.country, feed.feed)
            .then(() => {
                updateSelectedFeed(feedValue, policyID);
                goBack();
            })
            .catch((error: TranslationPaths) => {
                setFeedWithError({
                    feed: feed.value,
                    error: getMicroSecondOnyxErrorWithTranslationKey(error),
                });
            });
    };

    const onDismissError = () => {
        setFeedWithError(undefined);
    };

    const otherMenuItemFeeds = (
        <View style={[styles.w100, styles.flexColumn]}>
            <MenuItem
                title={translate('workspace.companyCards.addCards')}
                icon={icons.Plus}
                onPress={onAddCardsPress}
                sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.ACCOUNTING.CARD_SECTION_ADD_BUTTON}
            />
            {otherFeeds.length > 0 && (
                <>
                    <Text style={[styles.ph5, styles.mv2, styles.textLabelSupporting]}>{translate('workspace.companyCards.fromOtherWorkspaces')}</Text>
                    {otherFeeds.map((feed) => {
                        const isFeedWithError = feedWithError?.feed === feed.value;
                        const itemWithError = isFeedWithError && feedWithError?.error ? {...feed, errors: feedWithError.error} : feed;
                        return (
                            <RadioListItem
                                isDisabled={isOffline}
                                onDismissError={onDismissError}
                                key={feed.keyForList}
                                keyForList={itemWithError.keyForList}
                                showTooltip={false}
                                item={itemWithError}
                                onSelectRow={selectOtherFeed}
                                isMultilineSupported
                                isAlternateTextMultilineSupported
                                alternateTextNumberOfLines={2}
                                titleNumberOfLines={2}
                                // RadioListItem defaults to flex1 on the row; inside a column footer that makes rows split height and overlap. Size rows to content instead.
                                wrapperStyle={[styles.flexReset, styles.w100]}
                            />
                        );
                    })}
                </>
            )}
        </View>
    );

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
                {feeds.length ? (
                    <SelectionList
                        ListItem={RadioListItem}
                        onSelectRow={selectFeed}
                        data={feeds}
                        alternateNumberOfSupportedLines={2}
                        initiallyFocusedItemKey={selectedFeedName}
                        addBottomSafeAreaPadding
                        listFooterContent={otherMenuItemFeeds}
                    />
                ) : (
                    <ScrollView
                        addBottomSafeAreaPadding
                        style={styles.flex1}
                        keyboardShouldPersistTaps="handled"
                    >
                        {otherMenuItemFeeds}
                    </ScrollView>
                )}
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default WorkspaceCompanyCardFeedSelectorPage;
