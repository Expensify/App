import {cardByIdSelector} from '@selectors/Card';
import {Str} from 'expensify-common';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {InteractionManager, View} from 'react-native';
import cardScarf from '@assets/images/card-scarf.svg';
import Badge from '@components/Badge';
import ConfirmModal from '@components/ConfirmModal';
import DecisionModal from '@components/DecisionModal';
import FrozenCardHeader from '@components/FrozenCardHeader';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
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
import usePermissions from '@hooks/usePermissions';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import {getAllCardsForWorkspace, getTranslationKeyForLimitType, isCardFrozen, maskCard} from '@libs/CardUtils';
import {convertToDisplayString} from '@libs/CurrencyUtils';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {getDisplayNameOrDefault} from '@libs/PersonalDetailsUtils';
import {isPolicyAdmin} from '@libs/PolicyUtils';
import {buildCannedSearchQuery} from '@libs/SearchQueryUtils';
import Navigation from '@navigation/Navigation';
import NotFoundPage from '@pages/ErrorPage/NotFoundPage';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import variables from '@styles/variables';
import {deactivateCard as deactivateCardAction, freezeCard as freezeCardAction, openCardDetailsPage, unfreezeCard as unfreezeCardAction} from '@userActions/Card';
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
    const [isFreezeModalVisible, setIsFreezeModalVisible] = useState(false);
    const [isUnfreezeModalVisible, setIsUnfreezeModalVisible] = useState(false);
    const {translate} = useLocalize();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['FallbackAvatar', 'FreezeCard', 'Hourglass', 'MoneySearch', 'Trashcan'] as const);
    const illustrations = useMemoizedLazyIllustrations(['ExpensifyCardImage']);
    // We need to use isSmallScreenWidth instead of shouldUseNarrowLayout to use the correct modal type for the decision modal
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {isBetaEnabled} = usePermissions();

    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST);
    const [session] = useOnyx(ONYXKEYS.SESSION);
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
    const [cardFromCardList] = useOnyx(ONYXKEYS.CARD_LIST, {selector: cardByIdSelector(cardID)});
    const [cardFeeds] = useCardFeeds(policyID);
    const expensifyCardSettings = useExpensifyCardFeeds(policyID);
    const [allFeedsCards, allFeedsCardsResult] = useOnyx(ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST);
    const workspaceCards = getAllCardsForWorkspace(defaultFundID, allFeedsCards, cardFeeds, expensifyCardSettings);

    const isWorkspaceCardRhp = route.name === SCREENS.WORKSPACE.EXPENSIFY_CARD_DETAILS;
    const card = workspaceCards?.[cardID] ?? cardFromCardList;
    const currency = useCurrencyForExpensifyCard({policyID});
    const cardholder = personalDetails?.[card?.accountID ?? CONST.DEFAULT_NUMBER_ID];
    const isVirtual = !!card?.nameValuePairs?.isVirtual;
    const formattedAvailableSpendAmount = convertToDisplayString(card?.availableSpend, currency);
    const formattedLimit = convertToDisplayString(card?.nameValuePairs?.unapprovedExpenseLimit, currency);
    const displayName = getDisplayNameOrDefault(cardholder);
    const translationForLimitType = getTranslationKeyForLimitType(card?.nameValuePairs?.limitType);
    const isAdmin = isPolicyAdmin(policy, session?.email);

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

    const handleFreezePress = () => {
        setIsFreezeModalVisible(true);
    };

    const handleConfirmFreeze = () => {
        if (!card) {
            return;
        }
        freezeCardAction(Number(card?.fundID ?? defaultFundID ?? CONST.DEFAULT_NUMBER_ID), card, session?.accountID ?? CONST.DEFAULT_NUMBER_ID);
        setIsFreezeModalVisible(false);
    };

    const handleUnfreezePress = () => {
        setIsUnfreezeModalVisible(true);
    };

    const handleConfirmUnfreeze = () => {
        if (!card) {
            return;
        }
        unfreezeCardAction(Number(card?.fundID ?? defaultFundID ?? CONST.DEFAULT_NUMBER_ID), card);
        setIsUnfreezeModalVisible(false);
    };

    const canManageCardFreeze = isBetaEnabled(CONST.BETAS.FREEZE_CARD) && isAdmin && !!card;
    const scarfOverlayStyle = useMemo(
        () => ({
            top: 0,
            left: (variables.cardPreviewWidth - variables.cardScarfOverlayWidth) / 2,
            zIndex: variables.cardScarfOverlayZIndex,
            width: variables.cardScarfOverlayWidth,
            height: variables.cardScarfOverlayHeight,
        }),
        [],
    );
    const workspaceCardImage = (
        <>
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
        </>
    );

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
                    {canManageCardFreeze && isCardFrozen(card) ? (
                        <FrozenCardHeader
                            cardID={cardID}
                            onUnfreezePress={handleUnfreezePress}
                            cardPreview={
                                <View style={[styles.pRelative, styles.alignSelfCenter, StyleUtils.getWidthStyle(variables.cardPreviewWidth)]}>
                                    <View style={styles.walletCard}>{workspaceCardImage}</View>
                                    <View
                                        pointerEvents="none"
                                        style={[styles.pAbsolute, scarfOverlayStyle]}
                                    >
                                        <ImageSVG
                                            src={cardScarf}
                                            contentFit="contain"
                                            width="100%"
                                            height="100%"
                                        />
                                    </View>
                                </View>
                            }
                        />
                    ) : (
                        <View style={[styles.walletCard, styles.mb3]}>{workspaceCardImage}</View>
                    )}

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
                    {isAdmin && !isCardFrozen(card) && (
                        <MenuItem
                            icon={expensifyIcons.FreezeCard}
                            title={translate('cardPage.freezeCard')}
                            disabled={isOffline}
                            onPress={handleFreezePress}
                        />
                    )}
                    <MenuItem
                        icon={expensifyIcons.Trashcan}
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
                    <ConfirmModal
                        title={`${translate('cardPage.freezeCard')}?`}
                        isVisible={isFreezeModalVisible}
                        onConfirm={handleConfirmFreeze}
                        onCancel={() => setIsFreezeModalVisible(false)}
                        onBackdropPress={() => setIsFreezeModalVisible(false)}
                        shouldSetModalVisibility={false}
                        prompt={translate('cardPage.freezeDescription')}
                        confirmText={translate('cardPage.freezeCard')}
                        cancelText={translate('common.cancel')}
                        danger
                    />
                    <ConfirmModal
                        title={`${translate('cardPage.unfreezeCard')}?`}
                        isVisible={isUnfreezeModalVisible}
                        onConfirm={handleConfirmUnfreeze}
                        onCancel={() => setIsUnfreezeModalVisible(false)}
                        onBackdropPress={() => setIsUnfreezeModalVisible(false)}
                        shouldSetModalVisibility={false}
                        prompt={translate('cardPage.unfreezeDescription')}
                        confirmText={translate('cardPage.unfreezeCard')}
                        cancelText={translate('common.cancel')}
                    />
                </ScrollView>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default WorkspaceExpensifyCardDetailsPage;
