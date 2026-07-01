import type {NavigationProp} from '@react-navigation/native';
import {useNavigation} from '@react-navigation/native';
import {cardByIdSelector} from '@selectors/Card';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {View} from 'react-native';
import cardScarf from '@assets/images/card-scarf.svg';
import Badge from '@components/Badge';
import DecisionModal from '@components/DecisionModal';
import FrozenCardHeader from '@components/FrozenCardHeader';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ImageSVG from '@components/ImageSVG';
import MenuItem from '@components/MenuItem';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import useCardFeeds from '@hooks/useCardFeeds';
import useConfirmModal from '@hooks/useConfirmModal';
import useCurrencyForExpensifyCard from '@hooks/useCurrencyForExpensifyCard';
import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDefaultFundID from '@hooks/useDefaultFundID';
import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useExpensifyCardFeeds from '@hooks/useExpensifyCardFeeds';
import {useMemoizedLazyExpensifyIcons, useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import {openPolicyExpensifyCardsPage} from '@libs/actions/Policy/Policy';
import navigateToCardTransactions from '@libs/CardNavigationUtils';
import {getAllCardsForWorkspace, getCardFeedTextColor, getCardHintText, getTranslationKeyForLimitType, isCardFrozen, maskCard} from '@libs/CardUtils';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {temporaryGetDisplayNameOrDefault} from '@libs/PersonalDetailsUtils';
import {arePolicyRulesEnabled, canMemberWrite} from '@libs/PolicyUtils';
import {getSpendRuleByCardID, getSpendRuleSummaryText} from '@libs/SpendRulesUtils';
import Navigation from '@navigation/Navigation';
import NotFoundPage from '@pages/ErrorPage/NotFoundPage';
import CardDetailsActionButtons, {CardDetailsActionButton} from '@pages/settings/Wallet/CardDetailsActionButtons';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import variables from '@styles/variables';
import {deactivateCard as deactivateCardAction, freezeCard as freezeCardAction, openCardDetailsPage, unfreezeCard as unfreezeCardAction} from '@userActions/Card';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

type DynamicWorkspaceExpensifyCardDetailsPageProps = PlatformStackScreenProps<
    SettingsNavigatorParamList,
    typeof SCREENS.WORKSPACE.DYNAMIC_EXPENSIFY_CARD_DETAILS | typeof SCREENS.EXPENSIFY_CARD.DYNAMIC_EXPENSIFY_CARD_DETAILS
>;

type LimitHintTranslationKey = 'cardPage.smartLimit.title' | 'cardPage.monthlyLimit.title' | 'cardPage.fixedLimit.title';

function getLimitHintTranslationKey(limitType?: string): LimitHintTranslationKey | undefined {
    switch (limitType) {
        case CONST.EXPENSIFY_CARD.LIMIT_TYPES.SMART:
            return 'cardPage.smartLimit.title';
        case CONST.EXPENSIFY_CARD.LIMIT_TYPES.MONTHLY:
            return 'cardPage.monthlyLimit.title';
        case CONST.EXPENSIFY_CARD.LIMIT_TYPES.FIXED:
            return 'cardPage.fixedLimit.title';
        default:
            return undefined;
    }
}

function DynamicWorkspaceExpensifyCardDetailsPage({route}: DynamicWorkspaceExpensifyCardDetailsPageProps) {
    const navigation = useNavigation<NavigationProp<SettingsNavigatorParamList>>();
    const {policyID, cardID} = route.params;
    const isWorkspaceFlow = route.name === SCREENS.WORKSPACE.DYNAMIC_EXPENSIFY_CARD_DETAILS;
    const backPath = useDynamicBackPath(isWorkspaceFlow ? DYNAMIC_ROUTES.WORKSPACE_EXPENSIFY_CARD_DETAILS.path : DYNAMIC_ROUTES.EXPENSIFY_CARD_DETAILS.path);
    const {convertToDisplayString} = useCurrencyListActions();
    const defaultFundID = useDefaultFundID(policyID);

    const [isOfflineModalVisible, setIsOfflineModalVisible] = useState(false);
    const {translate} = useLocalize();
    const {login: currentUserLogin = ''} = useCurrentUserPersonalDetails();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['FreezeCard', 'MoneySearch', 'Trashcan', 'CreditCardLock']);
    const illustrations = useMemoizedLazyIllustrations(['ExpensifyCardImage']);
    // We need to use isSmallScreenWidth instead of shouldUseNarrowLayout to use the correct modal type for the decision modal
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {showConfirmModal} = useConfirmModal();

    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST);
    const [session] = useOnyx(ONYXKEYS.SESSION);
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`);
    const [cardFromCardList] = useOnyx(ONYXKEYS.CARD_LIST, {selector: cardByIdSelector(cardID)});
    const [cardFeeds] = useCardFeeds(policyID);
    const expensifyCardSettings = useExpensifyCardFeeds(policyID);
    const [fundCardSettings] = useOnyx(`${ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS}${defaultFundID}`);
    const [allFeedsCards, allFeedsCardsResult] = useOnyx(ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST);
    const workspaceCards = getAllCardsForWorkspace(defaultFundID, allFeedsCards, cardFeeds, expensifyCardSettings, /* includeDeactivated */ true);

    const workspaceCard = workspaceCards?.[cardID];
    const card = workspaceCard ?? cardFromCardList;
    const currency = useCurrencyForExpensifyCard({policyID, fundID: defaultFundID});
    const cardholder = personalDetails?.[card?.accountID ?? CONST.DEFAULT_NUMBER_ID];
    const isVirtual = !!card?.nameValuePairs?.isVirtual;
    const formattedAvailableSpendAmount = convertToDisplayString(card?.availableSpend, currency);
    const formattedLimit = convertToDisplayString(card?.nameValuePairs?.unapprovedExpenseLimit, currency);
    const displayName = temporaryGetDisplayNameOrDefault({passedPersonalDetails: cardholder, translate});
    const translationForLimitType = getTranslationKeyForLimitType(card?.nameValuePairs?.limitType);
    const remainingLimitHintTranslationKey = getLimitHintTranslationKey(card?.nameValuePairs?.limitType);
    const remainingLimitHint = remainingLimitHintTranslationKey ? translate(remainingLimitHintTranslationKey, formattedAvailableSpendAmount) : undefined;
    const canWriteExpensifyCard = canMemberWrite(policy, currentUserLogin, CONST.POLICY.POLICY_FEATURE.EXPENSIFY_CARD);
    const canEditSpendRules = canWriteExpensifyCard && arePolicyRulesEnabled(policy, policyCategories);
    const isDeactivated = card?.state === CONST.EXPENSIFY_CARD.STATE.STATE_DEACTIVATED;
    const isCardOpen = card?.state === CONST.EXPENSIFY_CARD.STATE.OPEN;

    const fetchCardDetails = useCallback(() => {
        openCardDetailsPage(Number(cardID));
    }, [cardID]);

    const {isOffline} = useNetwork({onReconnect: fetchCardDetails});
    useEffect(() => fetchCardDetails(), [fetchCardDetails]);

    useEffect(() => {
        if (!canWriteExpensifyCard) {
            return;
        }
        if (!defaultFundID || defaultFundID === CONST.DEFAULT_NUMBER_ID) {
            return;
        }
        if (fundCardSettings?.isLoading) {
            return;
        }
        if (fundCardSettings?.hasOnceLoaded) {
            return;
        }

        openPolicyExpensifyCardsPage(policyID, defaultFundID);
    }, [canWriteExpensifyCard, defaultFundID, fundCardSettings?.hasOnceLoaded, fundCardSettings?.isLoading, policyID]);

    const deactivateCard = () => {
        showConfirmModal({
            title: translate('workspace.card.deactivateCardModal.deactivateCard'),
            shouldSetModalVisibility: false,
            prompt: translate('workspace.card.deactivateCardModal.deactivateConfirmation'),
            confirmText: translate('workspace.card.deactivateCardModal.deactivate'),
            cancelText: translate('common.cancel'),
            danger: true,
        }).then(({action}) => {
            if (action !== ModalActions.CONFIRM) {
                return;
            }

            Navigation.goBack(undefined, {
                afterTransition: () => deactivateCardAction(defaultFundID, card),
            });
        });
    };

    const handleFreezePress = () => {
        showConfirmModal({
            title: `${translate('cardPage.freezeCard')}?`,
            shouldSetModalVisibility: false,
            prompt: translate('cardPage.freezeDescription'),
            confirmText: translate('cardPage.freezeCard'),
            cancelText: translate('common.cancel'),
            danger: true,
        }).then((result) => {
            if (result.action !== ModalActions.CONFIRM || !card) {
                return;
            }
            freezeCardAction(Number(card?.fundID ?? defaultFundID ?? CONST.DEFAULT_NUMBER_ID), card, session?.accountID ?? CONST.DEFAULT_NUMBER_ID);
        });
    };

    const handleUnfreezePress = () => {
        showConfirmModal({
            title: `${translate('cardPage.unfreezeCard')}?`,
            shouldSetModalVisibility: false,
            prompt: translate('cardPage.unfreezeDescription'),
            confirmText: translate('cardPage.unfreezeCard'),
            cancelText: translate('common.cancel'),
        }).then((result) => {
            if (result.action !== ModalActions.CONFIRM || !card) {
                return;
            }
            unfreezeCardAction(Number(card?.fundID ?? defaultFundID ?? CONST.DEFAULT_NUMBER_ID), card, session?.accountID ?? CONST.DEFAULT_NUMBER_ID);
        });
    };

    const spendRule = getSpendRuleByCardID(expensifyCardSettings, cardID);
    const spendRulesSummary = spendRule ? getSpendRuleSummaryText(spendRule.formValues, currency, translate, convertToDisplayString) : [];

    const navigateToSpendRules = () => {
        if (!spendRule) {
            navigation.navigate(SCREENS.WORKSPACE.RULES_SPEND_NEW, {policyID});
            return;
        }

        navigation.navigate(SCREENS.WORKSPACE.RULES_SPEND_EDIT, {policyID, ruleID: spendRule.ruleID});
    };

    const navigateToTransactions = () => navigateToCardTransactions(cardID);

    const spendRulesTitleComponent = useMemo(
        () => (
            <View>
                {spendRulesSummary.map((summary) => (
                    <Text
                        key={summary}
                        numberOfLines={2}
                    >
                        {summary}
                    </Text>
                ))}
            </View>
        ),
        [spendRulesSummary],
    );

    const canManageCardFreeze = canWriteExpensifyCard && !!card;
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
            <Text
                style={[styles.walletCardHolder, {color: getCardFeedTextColor(CONST.EXPENSIFY_CARD.BANK)}]}
                numberOfLines={1}
                ellipsizeMode="tail"
            >
                {displayName}
            </Text>
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
            policyFeature={CONST.POLICY.POLICY_FEATURE.EXPENSIFY_CARD}
        >
            <ScreenWrapper
                enableEdgeToEdgeBottomSafeAreaPadding
                testID="DynamicWorkspaceExpensifyCardDetailsPage"
            >
                <HeaderWithBackButton
                    title={translate('cardPage.expensifyCard')}
                    onBackButtonPress={() => Navigation.goBack(backPath)}
                />
                <ScrollView addBottomSafeAreaPadding>
                    {canManageCardFreeze && isCardFrozen(card) ? (
                        <FrozenCardHeader
                            isWorkspaceAdmin={canWriteExpensifyCard}
                            frozenByAccountID={card?.nameValuePairs?.frozen?.byAccountID}
                            frozenDate={card?.nameValuePairs?.frozen?.date}
                            style={styles.mt8}
                            onUnfreezePress={handleUnfreezePress}
                            cardPreview={
                                <View
                                    style={[
                                        styles.pRelative,
                                        styles.alignSelfCenter,
                                        StyleUtils.getWidthStyle(variables.cardPreviewWidth),
                                        StyleUtils.getHeight(variables.cardScarfOverlayHeight),
                                    ]}
                                >
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
                            canUnfreezeCard={canManageCardFreeze}
                            onAskToUnfreezePress={() => {}}
                        >
                            <CardDetailsActionButton
                                medium
                                text={translate('workspace.common.viewTransactions')}
                                icon={expensifyIcons.MoneySearch}
                                onPress={navigateToTransactions}
                                innerStyles={styles.ph2}
                                style={styles.w100}
                            />
                        </FrozenCardHeader>
                    ) : (
                        <View style={[styles.walletCard, styles.mb3, styles.mt8]}>{workspaceCardImage}</View>
                    )}
                    {(!isCardFrozen(card) || !canManageCardFreeze) && (
                        <CardDetailsActionButtons>
                            {canManageCardFreeze && isCardOpen && !isCardFrozen(card) && (
                                <CardDetailsActionButton
                                    text={translate('cardPage.freezeCard')}
                                    icon={expensifyIcons.FreezeCard}
                                    onPress={handleFreezePress}
                                    isDisabled={isOffline}
                                />
                            )}
                            <CardDetailsActionButton
                                text={translate('workspace.common.viewTransactions')}
                                icon={expensifyIcons.MoneySearch}
                                onPress={navigateToTransactions}
                            />
                        </CardDetailsActionButtons>
                    )}

                    <OfflineWithFeedback pendingAction={card?.nameValuePairs?.pendingFields?.cardTitle}>
                        <MenuItemWithTopDescription
                            description={translate('workspace.card.issueNewCard.cardName')}
                            title={card?.nameValuePairs?.cardTitle}
                            shouldShowRightIcon={canWriteExpensifyCard}
                            onPress={() => Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.EXPENSIFY_CARD_NAME.path))}
                            interactive={canWriteExpensifyCard}
                        />
                    </OfflineWithFeedback>
                    <MenuItemWithTopDescription
                        description={translate(isVirtual ? 'cardPage.virtualCardNumber' : 'cardPage.physicalCardNumber')}
                        title={maskCard(card?.lastFourPAN)}
                        interactive={false}
                        titleStyle={styles.walletCardNumber}
                    />
                    {spendRulesSummary.length > 0 && (
                        <MenuItemWithTopDescription
                            interactive={false}
                            description={translate('cardPage.spendRules')}
                            descriptionTextStyle={[styles.fontSizeLabel]}
                            titleComponent={spendRulesTitleComponent}
                            accessibilityLabel={spendRulesSummary.join('. ')}
                        />
                    )}
                    <OfflineWithFeedback pendingAction={card?.pendingFields?.availableSpend}>
                        <MenuItemWithTopDescription
                            description={translate('cardPage.availableSpend')}
                            title={formattedAvailableSpendAmount}
                            interactive={false}
                            titleStyle={styles.walletCardLimit}
                            hintText={remainingLimitHint}
                        />
                    </OfflineWithFeedback>
                    <OfflineWithFeedback pendingAction={card?.nameValuePairs?.pendingFields?.limitType}>
                        <MenuItemWithTopDescription
                            description={translate('workspace.card.issueNewCard.limitType')}
                            title={translationForLimitType ? translate(translationForLimitType) : ''}
                            shouldShowRightIcon={canWriteExpensifyCard}
                            onPress={() => Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.EXPENSIFY_CARD_LIMIT_TYPE.path))}
                            interactive={canWriteExpensifyCard}
                            hintText={getCardHintText(card?.nameValuePairs?.validFrom, card?.nameValuePairs?.validThru, cardholder?.timezone?.selected, translate)}
                        />
                    </OfflineWithFeedback>
                    <OfflineWithFeedback pendingAction={card?.nameValuePairs?.pendingFields?.unapprovedExpenseLimit}>
                        <MenuItemWithTopDescription
                            description={translate('workspace.expensifyCard.cardLimit')}
                            title={formattedLimit}
                            shouldShowRightIcon={canWriteExpensifyCard}
                            onPress={() => Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.EXPENSIFY_CARD_LIMIT.path))}
                            interactive={canWriteExpensifyCard}
                        />
                    </OfflineWithFeedback>

                    <View style={styles.mt6}>
                        {canEditSpendRules && (
                            <MenuItem
                                icon={expensifyIcons.CreditCardLock}
                                title={translate('cardPage.editSpendRules')}
                                onPress={navigateToSpendRules}
                            />
                        )}
                        {canWriteExpensifyCard && !isDeactivated && (
                            <MenuItem
                                icon={expensifyIcons.Trashcan}
                                title={translate('workspace.expensifyCard.deactivate')}
                                style={styles.mb1}
                                onPress={() => (isOffline ? setIsOfflineModalVisible(true) : deactivateCard())}
                            />
                        )}
                    </View>
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

export default DynamicWorkspaceExpensifyCardDetailsPage;
