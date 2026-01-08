import {Str} from 'expensify-common';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {InteractionManager, View} from 'react-native';
import Badge from '@components/Badge';
import ConfirmModal from '@components/ConfirmModal';
import DecisionModal from '@components/DecisionModal';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import {Hourglass} from '@components/Icon/Expensicons';
import * as Expensicons from '@components/Icon/Expensicons';
import ImageSVG from '@components/ImageSVG';
import MenuItem from '@components/MenuItem';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import useCardFeeds from '@hooks/useCardFeeds';
import useCurrencyForExpensifyCard from '@hooks/useCurrencyForExpensifyCard';
import useDefaultFundID from '@hooks/useDefaultFundID';
import useExpensifyCardFeeds from '@hooks/useExpensifyCardFeeds';
import {useMemoizedLazyExpensifyIcons, useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import {getAllCardsForWorkspace, getTranslationKeyForLimitType, maskCard} from '@libs/CardUtils';
import {convertToDisplayString} from '@libs/CurrencyUtils';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {getDisplayNameOrDefault} from '@libs/PersonalDetailsUtils';
import {buildCannedSearchQuery} from '@libs/SearchQueryUtils';
import Navigation from '@navigation/Navigation';
import NotFoundPage from '@pages/ErrorPage/NotFoundPage';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import variables from '@styles/variables';
import {deactivateCard as deactivateCardAction, openCardDetailsPage} from '@userActions/Card';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

type WorkspaceExpensifyCardDetailsPageProps = PlatformStackScreenProps<
    SettingsNavigatorParamList,
    typeof SCREENS.WORKSPACE.EXPENSIFY_CARD_DETAILS | typeof SCREENS.EXPENSIFY_CARD.EXPENSIFY_CARD_DETAILS
>;

function WorkspaceExpensifyCardDetailsPage({route}: WorkspaceExpensifyCardDetailsPageProps) {
    const {policyID, cardID, backTo} = route.params;
    const defaultFundID = useDefaultFundID(policyID);

    const [isDeactivateModalVisible, setIsDeactivateModalVisible] = useState(false);
    const [isOfflineModalVisible, setIsOfflineModalVisible] = useState(false);
    const {translate} = useLocalize();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['MoneySearch', 'FallbackAvatar']);
    const illustrations = useMemoizedLazyIllustrations(['ExpensifyCardImage']);
    // We need to use isSmallScreenWidth instead of shouldUseNarrowLayout to use the correct modal type for the decision modal
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();

    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {canBeMissing: false});
    const [cardFeeds] = useCardFeeds(policyID);
    const expensifyCardSettings = useExpensifyCardFeeds(policyID);
    const [allFeedsCards, allFeedsCardsResult] = useOnyx(ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST, {canBeMissing: true});
    const workspaceCards = getAllCardsForWorkspace(defaultFundID, allFeedsCards, cardFeeds, expensifyCardSettings);

    const isWorkspaceCardRhp = route.name === SCREENS.WORKSPACE.EXPENSIFY_CARD_DETAILS;
    const card = workspaceCards?.[cardID];
    const currency = useCurrencyForExpensifyCard({policyID});
    const cardholder = personalDetails?.[card?.accountID ?? CONST.DEFAULT_NUMBER_ID];
    const isVirtual = !!card?.nameValuePairs?.isVirtual;
    const formattedAvailableSpendAmount = convertToDisplayString(card?.availableSpend, currency);
    const formattedLimit = convertToDisplayString(card?.nameValuePairs?.unapprovedExpenseLimit, currency);
    const displayName = getDisplayNameOrDefault(cardholder);
    const translationForLimitType = getTranslationKeyForLimitType(card?.nameValuePairs?.limitType);

    const shouldGoBack = useRef(false);

    const fetchCardDetails = useCallback(() => {
        openCardDetailsPage(Number(cardID));
    }, [cardID]);

    const {isOffline} = useNetwork({onReconnect: fetchCardDetails});

    useEffect(() => fetchCardDetails(), [fetchCardDetails]);

    const deactivateCard = () => {
        setIsDeactivateModalVisible(false);
        shouldGoBack.current = true;
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        InteractionManager.runAfterInteractions(() => {
            deactivateCardAction(defaultFundID, card);
        });
    };

    if (!card && !isLoadingOnyxValue(allFeedsCardsResult)) {
        return <NotFoundPage />;
    }

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_EXPENSIFY_CARDS_ENABLED}
        >
            <ScreenWrapper
                enableEdgeToEdgeBottomSafeAreaPadding
                testID="WorkspaceExpensifyCardDetailsPage"
            >
                <HeaderWithBackButton
                    title={translate('workspace.expensifyCard.cardDetails')}
                    onBackButtonPress={() => Navigation.goBack(backTo)}
                />
                <ScrollView addBottomSafeAreaPadding>
                    <View style={[styles.walletCard, styles.mb3]}>
                        <ImageSVG
                            contentFit="contain"
                            src={illustrations.ExpensifyCardImage}
                            pointerEvents="none"
                            height={variables.cardPreviewHeight}
                            width={variables.cardPreviewWidth}
                        />
                        <Badge
                            badgeStyles={styles.cardBadge}
                            textStyles={styles.cardBadgeText}
                            text={translate(isVirtual ? 'workspace.expensifyCard.virtual' : 'workspace.expensifyCard.physical')}
                        />
                    </View>

                    {!cardholder?.validated && (
                        <MenuItem
                            icon={Hourglass}
                            iconStyles={styles.mln2}
                            descriptionTextStyle={StyleUtils.combineStyles([styles.textLabelSupporting, styles.ml0, StyleUtils.getLineHeightStyle(variables.fontSizeNormal)])}
                            description={translate('workspace.expensifyCard.cardPending', {name: displayName})}
                            numberOfLinesDescription={0}
                            interactive={false}
                        />
                    )}

                    <MenuItem
                        label={translate('workspace.card.issueNewCard.cardholder')}
                        title={displayName}
                        icon={cardholder?.avatar ?? expensifyIcons.FallbackAvatar}
                        iconType={CONST.ICON_TYPE_AVATAR}
                        description={Str.removeSMSDomain(cardholder?.login ?? '')}
                        interactive={false}
                    />
                    <MenuItemWithTopDescription
                        description={translate(isVirtual ? 'cardPage.virtualCardNumber' : 'cardPage.physicalCardNumber')}
                        title={maskCard(card?.lastFourPAN)}
                        interactive={false}
                        titleStyle={styles.walletCardNumber}
                    />
                    <OfflineWithFeedback pendingAction={card?.pendingFields?.availableSpend}>
                        <MenuItemWithTopDescription
                            description={translate('cardPage.availableSpend')}
                            title={formattedAvailableSpendAmount}
                            interactive={false}
                            titleStyle={styles.newKansasLarge}
                        />
                    </OfflineWithFeedback>
                    <OfflineWithFeedback pendingAction={card?.nameValuePairs?.pendingFields?.unapprovedExpenseLimit}>
                        <MenuItemWithTopDescription
                            description={translate('workspace.expensifyCard.cardLimit')}
                            title={formattedLimit}
                            shouldShowRightIcon
                            onPress={() =>
                                Navigation.navigate(
                                    isWorkspaceCardRhp
                                        ? ROUTES.WORKSPACE_EXPENSIFY_CARD_LIMIT.getRoute(policyID, cardID, Navigation.getActiveRoute())
                                        : ROUTES.EXPENSIFY_CARD_LIMIT.getRoute(policyID, cardID, Navigation.getActiveRoute()),
                                )
                            }
                        />
                    </OfflineWithFeedback>
                    <OfflineWithFeedback pendingAction={card?.nameValuePairs?.pendingFields?.limitType}>
                        <MenuItemWithTopDescription
                            description={translate('workspace.card.issueNewCard.limitType')}
                            title={translationForLimitType ? translate(translationForLimitType) : ''}
                            shouldShowRightIcon
                            onPress={() =>
                                Navigation.navigate(
                                    isWorkspaceCardRhp
                                        ? ROUTES.WORKSPACE_EXPENSIFY_CARD_LIMIT_TYPE.getRoute(policyID, cardID, Navigation.getActiveRoute())
                                        : ROUTES.EXPENSIFY_CARD_LIMIT_TYPE.getRoute(policyID, cardID, Navigation.getActiveRoute()),
                                )
                            }
                        />
                    </OfflineWithFeedback>
                    <OfflineWithFeedback pendingAction={card?.nameValuePairs?.pendingFields?.cardTitle}>
                        <MenuItemWithTopDescription
                            description={translate('workspace.card.issueNewCard.cardName')}
                            title={card?.nameValuePairs?.cardTitle}
                            shouldShowRightIcon
                            onPress={() =>
                                Navigation.navigate(
                                    isWorkspaceCardRhp
                                        ? ROUTES.WORKSPACE_EXPENSIFY_CARD_NAME.getRoute(policyID, cardID, Navigation.getActiveRoute())
                                        : ROUTES.EXPENSIFY_CARD_NAME.getRoute(policyID, cardID, Navigation.getActiveRoute()),
                                )
                            }
                        />
                    </OfflineWithFeedback>
                    <MenuItem
                        icon={expensifyIcons.MoneySearch}
                        title={translate('workspace.common.viewTransactions')}
                        style={styles.mt3}
                        onPress={() => {
                            Navigation.navigate(
                                ROUTES.SEARCH_ROOT.getRoute({
                                    query: buildCannedSearchQuery({
                                        type: CONST.SEARCH.DATA_TYPES.EXPENSE,
                                        status: CONST.SEARCH.STATUS.EXPENSE.ALL,
                                        cardID,
                                    }),
                                }),
                            );
                        }}
                    />
                    <MenuItem
                        icon={Expensicons.Trashcan}
                        title={translate('workspace.expensifyCard.deactivate')}
                        style={styles.mb1}
                        onPress={() => (isOffline ? setIsOfflineModalVisible(true) : setIsDeactivateModalVisible(true))}
                    />
                    <ConfirmModal
                        title={translate('workspace.card.deactivateCardModal.deactivateCard')}
                        isVisible={isDeactivateModalVisible}
                        onConfirm={deactivateCard}
                        onCancel={() => setIsDeactivateModalVisible(false)}
                        shouldSetModalVisibility={false}
                        prompt={translate('workspace.card.deactivateCardModal.deactivateConfirmation')}
                        confirmText={translate('workspace.card.deactivateCardModal.deactivate')}
                        cancelText={translate('common.cancel')}
                        danger
                        onModalHide={() => shouldGoBack.current && Navigation.goBack()}
                    />
                    <DecisionModal
                        title={translate('common.youAppearToBeOffline')}
                        prompt={translate('common.offlinePrompt')}
                        isSmallScreenWidth={isSmallScreenWidth}
                        onSecondOptionSubmit={() => setIsOfflineModalVisible(false)}
                        secondOptionText={translate('common.buttonConfirm')}
                        isVisible={isOfflineModalVisible}
                        onClose={() => setIsOfflineModalVisible(false)}
                    />
                </ScrollView>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default WorkspaceExpensifyCardDetailsPage;
