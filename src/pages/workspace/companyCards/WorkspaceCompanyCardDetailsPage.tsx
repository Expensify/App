import {format, parseISO} from 'date-fns';
import {Str} from 'expensify-common';
import React, {useState} from 'react';
import {View} from 'react-native';
import ActivityIndicator from '@components/ActivityIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ImageSVG from '@components/ImageSVG';
import MenuItem from '@components/MenuItem';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import PlaidCardFeedIcon from '@components/PlaidCardFeedIcon';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import useCardFeeds from '@hooks/useCardFeeds';
import useCardsList from '@hooks/useCardsList';
import {useCompanyCardFeedIcons} from '@hooks/useCompanyCardIcons';
import useConfirmModal from '@hooks/useConfirmModal';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeIllustrations from '@hooks/useThemeIllustrations';
import useThemeStyles from '@hooks/useThemeStyles';
import {isUsingStagingApi} from '@libs/ApiUtils';
import {getCardFeedIcon, getCompanyCardFeed, getCompanyFeeds, getDefaultCardName, getDomainOrWorkspaceAccountID, getPlaidInstitutionIconUrl, maskCardNumber} from '@libs/CardUtils';
import {getLatestErrorField} from '@libs/ErrorUtils';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {getDisplayNameOrDefault} from '@libs/PersonalDetailsUtils';
import {getConnectedIntegration} from '@libs/PolicyUtils';
import {buildCannedSearchQuery} from '@libs/SearchQueryUtils';
import Navigation from '@navigation/Navigation';
import NotFoundPage from '@pages/ErrorPage/NotFoundPage';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import variables from '@styles/variables';
import {clearCompanyCardErrorField, unassignWorkspaceCompanyCard, updateWorkspaceCompanyCard} from '@userActions/CompanyCards';
import CONFIG from '@src/CONFIG';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {CompanyCardFeedWithDomainID} from '@src/types/onyx';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';
import {getExportMenuItem} from './utils';

type WorkspaceCompanyCardDetailsPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.COMPANY_CARD_DETAILS>;

function WorkspaceCompanyCardDetailsPage({route}: WorkspaceCompanyCardDetailsPageProps) {
    const {policyID, cardID, backTo} = route.params;
    const feedName = decodeURIComponent(route.params.feed) as CompanyCardFeedWithDomainID;
    const bank = getCompanyCardFeed(feedName);

    const {translate, getLocalDateFromDatetime} = useLocalize();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const illustrations = useThemeIllustrations();
    const companyCardFeedIcons = useCompanyCardFeedIcons();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['FallbackAvatar', 'Hourglass', 'MoneySearch', 'RemoveMembers', 'Sync', 'Trashcan']);
    const {isOffline} = useNetwork();
    const {showConfirmModal} = useConfirmModal();

    const policy = usePolicy(policyID);
    const [connectionSyncProgress] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CONNECTION_SYNC_PROGRESS}${policyID}`);
    const [customCardNames] = useOnyx(ONYXKEYS.NVP_EXPENSIFY_COMPANY_CARDS_CUSTOM_NAMES);
    const [shouldUseStagingServer = isUsingStagingApi()] = useOnyx(ONYXKEYS.SHOULD_USE_STAGING_SERVER);
    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST);
    const [allBankCards, allBankCardsMetadata] = useCardsList(feedName);
    const [cardList, cardListMetadata] = useOnyx(ONYXKEYS.CARD_LIST);
    const [cardFeeds] = useCardFeeds(policyID);

    const [isUnassigning, setIsUnassigning] = useState(false);

    const workspaceAccountID = policy?.workspaceAccountID ?? CONST.DEFAULT_NUMBER_ID;
    const syncingAccountingIntegration = CONST.POLICY.CONNECTIONS.ACCOUNTING_CONNECTION_NAMES.find((integration) => integration === connectionSyncProgress?.connectionName);
    const connectedIntegration = getConnectedIntegration(policy, CONST.POLICY.CONNECTIONS.ACCOUNTING_CONNECTION_NAMES) ?? syncingAccountingIntegration;

    // Prefer feed-scoped card from WORKSPACE_CARDS_LIST to maintain proper access control.
    // Only use CARD_LIST as fallback if card is being unassigned (has pendingAction: DELETE).
    // This prevents showing cards from other feeds/workspaces via deep links while still
    // preventing NotHerePage flash during the unassignment flow.
    const feedScopedCard = allBankCards?.[cardID];
    const globalCard = cardList?.[cardID];
    const isCardBeingUnassigned = globalCard?.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;
    const card = feedScopedCard ?? (isCardBeingUnassigned ? globalCard : undefined);

    const cardholder = personalDetails?.[card?.accountID ?? CONST.DEFAULT_NUMBER_ID];
    const displayName = getDisplayNameOrDefault(cardholder);
    const exportMenuItem = getExportMenuItem(connectedIntegration, policyID, translate, policy, card);

    const companyFeeds = getCompanyFeeds(cardFeeds);
    const domainOrWorkspaceAccountID = getDomainOrWorkspaceAccountID(workspaceAccountID, companyFeeds[feedName]);
    const plaidUrl = getPlaidInstitutionIconUrl(feedName);

    // Show "Break connection" only when Mock Bank requests target non-production APIs.
    const isMockBank = bank?.includes(CONST.COMPANY_CARDS.BANK_CONNECTIONS.MOCK_BANK);
    const isUsingNonProductionAPI = shouldUseStagingServer || CONFIG.IS_USING_LOCAL_WEB;
    const shouldShowBreakConnection = isMockBank && isUsingNonProductionAPI;

    const lastScrape = card?.lastScrape
        ? format(getLocalDateFromDatetime(card.lastScrape), CONST.DATE.FNS_DATE_TIME_FORMAT_STRING)
        : translate('workspace.moreFeatures.companyCards.neverUpdated');

    const errorRowStyles = [styles.ph5, styles.mb3];

    const unassignCard = () => {
        if (card) {
            setIsUnassigning(true);
            unassignWorkspaceCompanyCard(domainOrWorkspaceAccountID, bank, card);
        }
        Navigation.setNavigationActionToMicrotaskQueue(() => Navigation.goBack());
    };

    const updateCard = () => {
        updateWorkspaceCompanyCard(domainOrWorkspaceAccountID, cardID, bank, card?.lastScrapeResult);
    };

    const breakConnection = () => {
        updateWorkspaceCompanyCard(domainOrWorkspaceAccountID, cardID, bank, card?.lastScrapeResult, true);
    };

    // Don't show NotFoundPage if the card is being unassigned or data is still loading.
    if ((!card && !isUnassigning && !isLoadingOnyxValue(allBankCardsMetadata) && !isLoadingOnyxValue(cardListMetadata)) || (isCardBeingUnassigned && !isUnassigning)) {
        return <NotFoundPage />;
    }

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_COMPANY_CARDS_ENABLED}
        >
            <ScreenWrapper
                enableEdgeToEdgeBottomSafeAreaPadding
                testID="WorkspaceCompanyCardDetailsPage"
            >
                <HeaderWithBackButton
                    title={translate('workspace.moreFeatures.companyCards.cardDetails')}
                    onBackButtonPress={() => Navigation.goBack(backTo)}
                />
                <ScrollView addBottomSafeAreaPadding>
                    <View style={[styles.walletCard, styles.mb3]}>
                        {plaidUrl ? (
                            <PlaidCardFeedIcon
                                plaidUrl={plaidUrl}
                                isLarge
                            />
                        ) : (
                            <ImageSVG
                                contentFit="contain"
                                src={getCardFeedIcon(card?.bank, illustrations, companyCardFeedIcons)}
                                pointerEvents="none"
                                height={variables.cardPreviewHeight}
                                width={variables.cardPreviewWidth}
                            />
                        )}
                    </View>
                    {!cardholder?.validated && (
                        <MenuItem
                            icon={expensifyIcons.Hourglass}
                            iconStyles={styles.mln2}
                            descriptionTextStyle={StyleUtils.combineStyles([styles.textLabelSupporting, styles.ml0, StyleUtils.getLineHeightStyle(variables.fontSizeNormal)])}
                            description={translate('workspace.expensifyCard.cardPending', {name: displayName})}
                            numberOfLinesDescription={0}
                            interactive={false}
                        />
                    )}

                    <MenuItem
                        label={translate('workspace.moreFeatures.companyCards.cardholder')}
                        title={displayName}
                        titleStyle={styles.mt1}
                        iconStyles={styles.mt1}
                        icon={cardholder?.avatar ?? expensifyIcons.FallbackAvatar}
                        iconType={CONST.ICON_TYPE_AVATAR}
                        description={Str.removeSMSDomain(cardholder?.login ?? '')}
                        interactive={false}
                    />
                    <MenuItemWithTopDescription
                        numberOfLinesTitle={3}
                        description={translate('workspace.moreFeatures.companyCards.cardNumber')}
                        title={maskCardNumber(card?.cardName ?? '', bank, true)}
                        interactive={false}
                        titleStyle={styles.walletCardNumber}
                    />
                    <OfflineWithFeedback
                        pendingAction={card?.nameValuePairs?.pendingFields?.cardTitle}
                        errorRowStyles={errorRowStyles}
                        errors={getLatestErrorField(card?.nameValuePairs ?? {}, 'cardTitle')}
                        onClose={() => clearCompanyCardErrorField(domainOrWorkspaceAccountID, cardID, bank, 'cardTitle')}
                    >
                        <MenuItemWithTopDescription
                            description={translate('workspace.moreFeatures.companyCards.cardName')}
                            title={customCardNames?.[cardID] ?? getDefaultCardName(cardholder?.firstName)}
                            shouldShowRightIcon
                            brickRoadIndicator={card?.nameValuePairs?.errorFields?.cardTitle ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                            onPress={() => Navigation.navigate(ROUTES.WORKSPACE_COMPANY_CARD_EDIT_CARD_NAME.getRoute(policyID, cardID, feedName))}
                            sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.COMPANY_CARDS.CARD_NAME}
                        />
                    </OfflineWithFeedback>
                    {exportMenuItem?.shouldShowMenuItem ? (
                        <OfflineWithFeedback
                            pendingAction={exportMenuItem?.exportType ? card?.nameValuePairs?.pendingFields?.[exportMenuItem.exportType] : undefined}
                            errorRowStyles={errorRowStyles}
                            errors={exportMenuItem.exportType ? getLatestErrorField(card?.nameValuePairs ?? {}, exportMenuItem.exportType) : undefined}
                            onClose={() => {
                                if (!exportMenuItem.exportType) {
                                    return;
                                }
                                clearCompanyCardErrorField(domainOrWorkspaceAccountID, cardID, bank, exportMenuItem.exportType);
                            }}
                        >
                            <MenuItemWithTopDescription
                                description={exportMenuItem.description}
                                title={exportMenuItem.title}
                                shouldShowRightIcon
                                onPress={() => Navigation.navigate(ROUTES.WORKSPACE_COMPANY_CARD_EXPORT.getRoute(policyID, cardID, feedName, backTo))}
                                sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.COMPANY_CARDS.CARD_EXPORT}
                            />
                        </OfflineWithFeedback>
                    ) : null}
                    <MenuItemWithTopDescription
                        shouldShowRightComponent={card?.isLoadingLastUpdated}
                        rightComponent={
                            <ActivityIndicator
                                style={[styles.popoverMenuIcon]}
                                reasonAttributes={{
                                    context: 'WorkspaceCompanyCardDetailsPage',
                                    isLoadingLastUpdated: card?.isLoadingLastUpdated,
                                }}
                            />
                        }
                        description={translate('workspace.moreFeatures.companyCards.lastUpdated')}
                        title={card?.isLoadingLastUpdated ? translate('workspace.moreFeatures.companyCards.updating') : lastScrape}
                        interactive={false}
                    />
                    <OfflineWithFeedback
                        pendingAction={card?.pendingFields?.scrapeMinDate}
                        errorRowStyles={errorRowStyles}
                        errors={getLatestErrorField(card ?? {}, 'scrapeMinDate')}
                        onClose={() => clearCompanyCardErrorField(domainOrWorkspaceAccountID, cardID, bank, 'scrapeMinDate', true)}
                    >
                        <MenuItemWithTopDescription
                            description={translate('workspace.moreFeatures.companyCards.transactionStartDate')}
                            title={card?.scrapeMinDate ? format(parseISO(card.scrapeMinDate), CONST.DATE.FNS_FORMAT_STRING) : ''}
                            shouldShowRightIcon
                            brickRoadIndicator={card?.errorFields?.scrapeMinDate ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                            onPress={() => Navigation.navigate(ROUTES.WORKSPACE_COMPANY_CARD_EDIT_TRANSACTION_START_DATE.getRoute(policyID, cardID, feedName))}
                            sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.COMPANY_CARDS.TRANSACTION_START_DATE}
                        />
                    </OfflineWithFeedback>
                    <MenuItem
                        icon={expensifyIcons.MoneySearch}
                        title={translate('workspace.common.viewTransactions')}
                        style={styles.mt3}
                        sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.COMPANY_CARDS.VIEW_TRANSACTIONS}
                        onPress={() => {
                            Navigation.navigate(
                                ROUTES.SEARCH_ROOT.getRoute({
                                    query: buildCannedSearchQuery({type: CONST.SEARCH.DATA_TYPES.EXPENSE, status: CONST.SEARCH.STATUS.EXPENSE.ALL, cardID}),
                                }),
                            );
                        }}
                    />
                    <OfflineWithFeedback
                        pendingAction={card?.pendingFields?.lastScrape}
                        errorRowStyles={errorRowStyles}
                        errors={getLatestErrorField(card ?? {}, 'lastScrape')}
                        onClose={() => clearCompanyCardErrorField(domainOrWorkspaceAccountID, cardID, bank, 'lastScrape', true)}
                    >
                        <MenuItem
                            icon={expensifyIcons.Sync}
                            disabled={isOffline || card?.isLoadingLastUpdated}
                            title={translate('workspace.moreFeatures.companyCards.updateCard')}
                            brickRoadIndicator={card?.errorFields?.lastScrape ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                            onPress={updateCard}
                            sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.COMPANY_CARDS.UPDATE_CARD}
                        />
                    </OfflineWithFeedback>
                    {shouldShowBreakConnection && (
                        <MenuItem
                            icon={expensifyIcons.Trashcan}
                            disabled={isOffline || card?.isLoadingLastUpdated}
                            title="Break connection (Testing)"
                            onPress={breakConnection}
                        />
                    )}
                    <MenuItem
                        icon={expensifyIcons.RemoveMembers}
                        title={translate('workspace.moreFeatures.companyCards.unassignCard')}
                        style={styles.mb1}
                        onPress={() => {
                            showConfirmModal({
                                shouldSetModalVisibility: false,
                                title: translate('workspace.moreFeatures.companyCards.unassignCard'),
                                prompt: translate('workspace.moreFeatures.companyCards.unassignCardDescription'),
                                confirmText: translate('workspace.moreFeatures.companyCards.unassign'),
                                cancelText: translate('common.cancel'),
                                danger: true,
                            }).then((result) => {
                                if (result.action !== ModalActions.CONFIRM) {
                                    return;
                                }

                                unassignCard();
                            });
                        }}
                        sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.COMPANY_CARDS.UNASSIGN_CARD}
                    />
                </ScrollView>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default WorkspaceCompanyCardDetailsPage;
