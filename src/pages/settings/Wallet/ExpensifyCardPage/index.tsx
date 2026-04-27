import {useFocusEffect} from '@react-navigation/native';
import React, {useCallback, useMemo, useState} from 'react';
import type {ViewStyle} from 'react-native';
import {View} from 'react-native';
import type {OnyxCollection} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import cardScarf from '@assets/images/card-scarf.svg';
import AddToWalletButton from '@components/AddToWalletButton/index';
import Button from '@components/Button';
import CardPreview from '@components/CardPreview';
import ConfirmModal from '@components/ConfirmModal';
import DotIndicatorMessage from '@components/DotIndicatorMessage';
import FrozenCardHeader from '@components/FrozenCardHeader';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import {useLockedAccountActions, useLockedAccountState} from '@components/LockedAccountModalProvider';
import MenuItem from '@components/MenuItem';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import {useMultifactorAuthentication} from '@components/MultifactorAuthentication/Context';
import {usePersonalDetails, useSession} from '@components/OnyxListItemProvider';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useEnvironment from '@hooks/useEnvironment';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useNonPersonalCardList from '@hooks/useNonPersonalCardList';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {freezeCard, unfreezeCard} from '@libs/actions/Card';
import {resetValidateActionCodeSent} from '@libs/actions/User';
import {clearRevealedPIN, useRevealedPIN} from '@libs/CardPINStore';
import {
    formatCardExpiration,
    getCardCurrency,
    getCardHintText,
    getDomainCards,
    getTranslationKeyForLimitType,
    isCardFrozen,
    isTravelCard,
    maskCard,
    maskPin,
    supportsPINManagementFeatures,
} from '@libs/CardUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {DomainCardNavigatorParamList, SettingsNavigatorParamList} from '@libs/Navigation/types';
import {isPolicyAdmin} from '@libs/PolicyUtils';
import {getPolicyExpenseChat} from '@libs/ReportUtils';
import {buildCannedSearchQuery} from '@libs/SearchQueryUtils';
import {getSpendRuleByCardID, getSpendRuleSummaryText} from '@libs/SpendRulesUtils';
import NotFoundPage from '@pages/ErrorPage/NotFoundPage';
import RedDotCardSection from '@pages/settings/Wallet/RedDotCardSection';
import CardDetails from '@pages/settings/Wallet/WalletPage/CardDetails';
import variables from '@styles/variables';
import {openOldDotLink} from '@userActions/Link';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type {Policy} from '@src/types/onyx';
import {useExpensifyCardActions, useExpensifyCardState} from './ExpensifyCardContextProvider';

type ExpensifyCardPageProps =
    | PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.WALLET.DOMAIN_CARD>
    | PlatformStackScreenProps<DomainCardNavigatorParamList, typeof SCREENS.DOMAIN_CARD.DOMAIN_CARD_DETAIL>;

type PossibleTitles = 'cardPage.smartLimit.title' | 'cardPage.monthlyLimit.title' | 'cardPage.fixedLimit.title';

type LimitTypeTranslationKeys = {
    limitNameKey: TranslationPaths | undefined;
    limitTitleKey: PossibleTitles | undefined;
};

function getLimitTypeTranslationKeys(limitType: ValueOf<typeof CONST.EXPENSIFY_CARD.LIMIT_TYPES> | undefined): LimitTypeTranslationKeys {
    switch (limitType) {
        case CONST.EXPENSIFY_CARD.LIMIT_TYPES.SMART:
            return {limitNameKey: 'cardPage.smartLimit.name', limitTitleKey: 'cardPage.smartLimit.title'};
        case CONST.EXPENSIFY_CARD.LIMIT_TYPES.MONTHLY:
            return {limitNameKey: 'cardPage.monthlyLimit.name', limitTitleKey: 'cardPage.monthlyLimit.title'};
        case CONST.EXPENSIFY_CARD.LIMIT_TYPES.FIXED:
            return {limitNameKey: 'cardPage.fixedLimit.name', limitTitleKey: 'cardPage.fixedLimit.title'};
        default:
            return {limitNameKey: undefined, limitTitleKey: undefined};
    }
}

function ExpensifyCardPage({route}: ExpensifyCardPageProps) {
    const {isProduction} = useEnvironment();
    const {cardID} = route.params;
    const {convertToDisplayString} = useCurrencyListActions();
    const [account] = useOnyx(ONYXKEYS.ACCOUNT);
    const cardList = useNonPersonalCardList();
    const [cardSettings] = useOnyx(`${ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS}${cardList?.[cardID]?.fundID}`);
    const styles = useThemeStyles();
    const {isOffline} = useNetwork();
    const {translate} = useLocalize();
    const {executeScenario} = useMultifactorAuthentication();
    const shouldDisplayCardDomain = !isTravelCard(cardList?.[cardID]) && (!cardList?.[cardID]?.nameValuePairs?.issuedBy || !cardList?.[cardID]?.nameValuePairs?.isVirtual);
    const domain = cardList?.[cardID]?.domainName ?? '';
    const expensifyCardTitle = isTravelCard(cardList?.[cardID]) ? translate('cardPage.expensifyTravelCard') : translate('cardPage.expensifyCard');
    const pageTitle = shouldDisplayCardDomain ? expensifyCardTitle : (cardList?.[cardID]?.nameValuePairs?.cardTitle ?? expensifyCardTitle);
    const {displayName} = useCurrentUserPersonalDetails();
    const personalDetails = usePersonalDetails();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Flag', 'MoneySearch', 'FreezeCard', 'Key', 'Eye', 'CreditCardLock']);

    const cardsToShow = useMemo(() => {
        if (shouldDisplayCardDomain) {
            return getDomainCards(cardList)[domain]?.filter((card) => !card?.nameValuePairs?.issuedBy || !card?.nameValuePairs?.isVirtual) ?? [];
        }
        return [cardList?.[cardID]];
    }, [shouldDisplayCardDomain, cardList, cardID, domain]);
    const currentCard = useMemo(() => cardsToShow?.find((card) => String(card?.cardID) === cardID) ?? cardsToShow?.at(0), [cardsToShow, cardID]);

    const virtualCards = useMemo(() => cardsToShow?.filter((card) => card?.nameValuePairs?.isVirtual && !isTravelCard(card)), [cardsToShow]);
    const travelCards = useMemo(() => cardsToShow?.filter((card) => card?.nameValuePairs?.isVirtual && isTravelCard(card)), [cardsToShow]);
    const physicalCards = useMemo(() => cardsToShow?.filter((card) => !card?.nameValuePairs?.isVirtual), [cardsToShow]);
    const cardToAdd = useMemo(() => {
        return virtualCards?.at(0);
    }, [virtualCards]);

    const {cardsDetails, isCardDetailsLoading, cardsDetailsErrors} = useExpensifyCardState();
    const {setCardsDetails} = useExpensifyCardActions();
    const currentPhysicalCard = useMemo(() => physicalCards?.find((card) => String(card?.cardID) === cardID) ?? physicalCards?.at(0), [physicalCards, cardID]);
    const revealedPIN = useRevealedPIN(String(currentPhysicalCard?.cardID));

    // Resets card details and revealed PIN when navigating away from the page.
    useFocusEffect(
        useCallback(() => {
            return () => {
                setCardsDetails((oldCardDetails) => ({...oldCardDetails, [cardID]: null}));
                clearRevealedPIN();
            };
        }, [cardID, setCardsDetails]),
    );

    const {isAccountLocked} = useLockedAccountState();
    const {showLockedAccountModal} = useLockedAccountActions();

    const hasDetectedDomainFraud = cardsToShow?.some((card) => card?.fraud === CONST.EXPENSIFY_CARD.FRAUD_TYPES.DOMAIN);
    const hasDetectedIndividualFraud = cardsToShow?.some((card) => card?.fraud === CONST.EXPENSIFY_CARD.FRAUD_TYPES.INDIVIDUAL);

    // Cards that are already activated and working (OPEN) and cards shipped but not activated yet can be reported as missing or damaged
    const shouldShowReportLostCardButton = currentPhysicalCard?.state === CONST.EXPENSIFY_CARD.STATE.NOT_ACTIVATED || currentPhysicalCard?.state === CONST.EXPENSIFY_CARD.STATE.OPEN;

    const currency = getCardCurrency(currentCard, cardSettings);
    const shouldShowPIN = currency !== CONST.CURRENCY.USD;
    const canChangePIN = supportsPINManagementFeatures(currentPhysicalCard) && currentPhysicalCard?.state === CONST.EXPENSIFY_CARD.STATE.OPEN;
    const canRevealPIN = canChangePIN && revealedPIN === undefined;
    const formattedAvailableSpendAmount = convertToDisplayString(currentCard?.availableSpend, currency);
    const {limitNameKey, limitTitleKey} = getLimitTypeTranslationKeys(currentCard?.nameValuePairs?.limitType);

    const isSignedInAsDelegate = !!account?.delegatedAccess?.delegate || false;

    const session = useSession();
    const isCardHolder = currentCard?.accountID === session?.accountID;
    const frozenByAccountID = currentCard?.nameValuePairs?.frozen?.byAccountID;

    const canManageCardFreeze = isCardHolder && !!currentCard && !isAccountLocked;

    const policySelector = useCallback(
        (allPolicies: OnyxCollection<Policy>): Policy | undefined => {
            const workspaceAccountID = Number(currentCard?.fundID);
            if (!workspaceAccountID || Number.isNaN(workspaceAccountID)) {
                return undefined;
            }

            return Object.values(allPolicies ?? {}).find((policy) => policy?.workspaceAccountID === workspaceAccountID);
        },
        [currentCard?.fundID],
    );
    const [policyForCurrentCard] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {selector: policySelector}, [policySelector]);
    const policyIDForCurrentCard = policyForCurrentCard?.id;
    const isWorkspaceAdmin = isPolicyAdmin(policyForCurrentCard, session?.email);
    const canUnfreezeCard = canManageCardFreeze && (frozenByAccountID === session?.accountID || isWorkspaceAdmin);

    const spendRule = useMemo(() => getSpendRuleByCardID(cardSettings ? {privateExpensifyCardSettings: cardSettings} : undefined, cardID), [cardSettings, cardID]);
    const spendRulesSummary = useMemo(
        () => (spendRule ? getSpendRuleSummaryText(spendRule.formValues, currency, translate, convertToDisplayString) : []),
        [currency, spendRule, translate, convertToDisplayString],
    );

    const navigateToSpendRulesPage = useCallback(() => {
        if (!policyIDForCurrentCard) {
            return;
        }
        Navigation.navigate(ROUTES.SETTINGS_WALLET_EXPENSIFY_CARD_SPEND_RULES.getRoute(policyIDForCurrentCard, spendRule?.ruleID));
    }, [policyIDForCurrentCard, spendRule?.ruleID]);

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

    const scarfOverlayStyle = useMemo<ViewStyle>(
        () => ({
            top: 0,
            left: (variables.cardPreviewWidth - variables.cardScarfOverlayWidth) / 2,
            zIndex: variables.cardScarfOverlayZIndex,
            width: variables.cardScarfOverlayWidth,
            height: variables.cardScarfOverlayHeight,
        }),
        [],
    );

    const [isFreezeModalVisible, setIsFreezeModalVisible] = useState(false);
    const [isUnfreezeModalVisible, setIsUnfreezeModalVisible] = useState(false);

    const handleFreezePress = useCallback(() => {
        setIsFreezeModalVisible(true);
    }, []);

    const handleDismissFreezeModal = useCallback(() => {
        setIsFreezeModalVisible(false);
    }, []);

    const handleConfirmFreeze = useCallback(() => {
        if (!currentCard) {
            return;
        }
        freezeCard(Number(currentCard?.fundID ?? CONST.DEFAULT_NUMBER_ID), currentCard, session?.accountID ?? CONST.DEFAULT_NUMBER_ID);
        handleDismissFreezeModal();
    }, [currentCard, handleDismissFreezeModal, session?.accountID]);

    const handleUnfreezePress = useCallback(() => {
        setIsUnfreezeModalVisible(true);
    }, []);

    const handleAskToUnfreezePress = useCallback(() => {
        const cardHolderWorkspaceChatReportID = getPolicyExpenseChat(currentCard?.accountID, policyIDForCurrentCard)?.reportID;
        if (!cardHolderWorkspaceChatReportID) {
            return;
        }
        Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(cardHolderWorkspaceChatReportID));
    }, [currentCard?.accountID, policyIDForCurrentCard]);

    const handleDismissUnfreezeModal = useCallback(() => {
        setIsUnfreezeModalVisible(false);
    }, []);

    const handleConfirmUnfreeze = useCallback(() => {
        if (!currentCard) {
            return;
        }
        unfreezeCard(Number(currentCard?.fundID ?? CONST.DEFAULT_NUMBER_ID), currentCard, session?.accountID ?? CONST.DEFAULT_NUMBER_ID);
        handleDismissUnfreezeModal();
    }, [currentCard, handleDismissUnfreezeModal, session?.accountID]);

    if (!currentCard) {
        return <NotFoundPage onBackButtonPress={() => Navigation.goBack(ROUTES.SETTINGS_WALLET)} />;
    }

    return (
        <ScreenWrapper testID="ExpensifyCardPage">
            <HeaderWithBackButton
                title={pageTitle}
                onBackButtonPress={() => Navigation.closeRHPFlow()}
            />
            <ScrollView>
                {canManageCardFreeze && isCardFrozen(currentCard) ? (
                    <FrozenCardHeader
                        isWorkspaceAdmin={isWorkspaceAdmin}
                        frozenByAccountID={currentCard?.nameValuePairs?.frozen?.byAccountID}
                        frozenDate={currentCard?.nameValuePairs?.frozen?.date}
                        canUnfreezeCard={canUnfreezeCard}
                        onAskToUnfreezePress={handleAskToUnfreezePress}
                        onUnfreezePress={handleUnfreezePress}
                        cardPreview={
                            <CardPreview
                                overlayImage={cardScarf}
                                overlayContainerStyle={scarfOverlayStyle}
                            />
                        }
                    />
                ) : (
                    <View style={[styles.flex1, styles.mb9, styles.mt9]}>
                        <CardPreview />
                    </View>
                )}

                {hasDetectedDomainFraud && (
                    <DotIndicatorMessage
                        style={styles.pageWrapper}
                        textStyles={styles.walletLockedMessage}
                        messages={{error: translate('cardPage.cardLocked')}}
                        type="error"
                    />
                )}

                {hasDetectedIndividualFraud && !hasDetectedDomainFraud && (
                    <>
                        <RedDotCardSection
                            title={translate('cardPage.suspiciousBannerTitle')}
                            description={translate('cardPage.suspiciousBannerDescription')}
                        />

                        <Button
                            style={[styles.mh5, styles.mb5]}
                            text={translate('cardPage.reviewTransaction')}
                            onPress={() => openOldDotLink(CONST.OLDDOT_URLS.INBOX)}
                        />
                    </>
                )}

                {!hasDetectedDomainFraud && (
                    <>
                        <MenuItemWithTopDescription
                            description={translate('cardPage.availableSpend')}
                            title={formattedAvailableSpendAmount}
                            interactive={false}
                            titleStyle={styles.newKansasLarge}
                        />
                        {!!limitNameKey && !!limitTitleKey && (
                            <MenuItemWithTopDescription
                                description={translate(limitNameKey)}
                                title={translate(limitTitleKey, formattedAvailableSpendAmount)}
                                interactive={false}
                                titleStyle={styles.walletCardLimit}
                                numberOfLinesTitle={3}
                            />
                        )}
                        {virtualCards.map((card) => (
                            <React.Fragment key={card.cardID}>
                                {!!cardsDetails[card.cardID] && cardsDetails[card.cardID]?.pan ? (
                                    <CardDetails
                                        pan={cardsDetails[card.cardID]?.pan}
                                        expiration={formatCardExpiration(cardsDetails[card.cardID]?.expiration ?? '')}
                                        cvv={cardsDetails[card.cardID]?.cvv}
                                        onUpdateAddressPress={() => {
                                            if (route.name === SCREENS.DOMAIN_CARD.DOMAIN_CARD_DETAIL) {
                                                Navigation.navigate(ROUTES.SETTINGS_DOMAIN_CARD_UPDATE_ADDRESS.getRoute(String(card.cardID)));
                                                return;
                                            }
                                            Navigation.navigate(ROUTES.SETTINGS_WALLET_CARD_DIGITAL_DETAILS_UPDATE_ADDRESS.getRoute(domain));
                                        }}
                                        limitType={card?.nameValuePairs?.limitType}
                                        cardHintText={getCardHintText(
                                            card?.nameValuePairs?.validFrom,
                                            card?.nameValuePairs?.validThru,
                                            personalDetails?.[card?.accountID ?? CONST.DEFAULT_NUMBER_ID]?.timezone?.selected,
                                            translate,
                                        )}
                                    />
                                ) : (
                                    <>
                                        <MenuItemWithTopDescription
                                            description={translate('cardPage.virtualCardNumber')}
                                            title={maskCard('')}
                                            interactive={false}
                                            titleStyle={styles.walletCardNumber}
                                            shouldShowRightComponent
                                            shouldBeAccessible={isSignedInAsDelegate ? undefined : false}
                                            rightComponent={
                                                !isSignedInAsDelegate ? (
                                                    <Button
                                                        text={translate('cardPage.cardDetails.revealDetails')}
                                                        onPress={() => {
                                                            if (isAccountLocked) {
                                                                showLockedAccountModal();
                                                                return;
                                                            }

                                                            resetValidateActionCodeSent();
                                                            if (route.name === SCREENS.DOMAIN_CARD.DOMAIN_CARD_DETAIL) {
                                                                Navigation.navigate(ROUTES.SETTINGS_DOMAIN_CARD_CONFIRM_MAGIC_CODE.getRoute(String(card.cardID)));
                                                                return;
                                                            }
                                                            Navigation.navigate(ROUTES.SETTINGS_WALLET_DOMAIN_CARD_CONFIRM_MAGIC_CODE.getRoute(String(card.cardID)));
                                                        }}
                                                        isDisabled={isCardDetailsLoading[card.cardID] || isOffline}
                                                        isLoading={isCardDetailsLoading[card.cardID]}
                                                    />
                                                ) : undefined
                                            }
                                        />

                                        <MenuItemWithTopDescription
                                            description={translate('workspace.card.issueNewCard.limitType')}
                                            title={translate(getTranslationKeyForLimitType(card?.nameValuePairs?.limitType))}
                                            interactive={false}
                                            hintText={getCardHintText(
                                                card?.nameValuePairs?.validFrom,
                                                card?.nameValuePairs?.validThru,
                                                personalDetails?.[card?.accountID ?? CONST.DEFAULT_NUMBER_ID]?.timezone?.selected,
                                                translate,
                                            )}
                                        />

                                        <DotIndicatorMessage
                                            messages={cardsDetailsErrors[card.cardID] ? {error: translate(cardsDetailsErrors[card.cardID] as TranslationPaths)} : {}}
                                            type="error"
                                            style={[styles.ph5, styles.mv2]}
                                        />
                                    </>
                                )}
                                {!isSignedInAsDelegate && (
                                    <MenuItemWithTopDescription
                                        title={translate('cardPage.reportFraud')}
                                        titleStyle={styles.walletCardMenuItem}
                                        icon={expensifyIcons.Flag}
                                        shouldShowRightIcon
                                        onPress={() => {
                                            if (isAccountLocked) {
                                                showLockedAccountModal();
                                                return;
                                            }
                                            if (route.name === SCREENS.DOMAIN_CARD.DOMAIN_CARD_DETAIL) {
                                                Navigation.navigate(ROUTES.SETTINGS_DOMAIN_CARD_REPORT_FRAUD.getRoute(String(card.cardID)));
                                                return;
                                            }
                                            Navigation.navigate(ROUTES.SETTINGS_REPORT_FRAUD.getRoute(String(card.cardID)));
                                        }}
                                    />
                                )}
                            </React.Fragment>
                        ))}
                        {isTravelCard(cardList?.[cardID]) &&
                            travelCards.map((card) => (
                                <React.Fragment key={card.cardID}>
                                    {!!cardsDetails[card.cardID] && cardsDetails[card.cardID]?.cvv ? (
                                        <CardDetails cvv={cardsDetails[card.cardID]?.cvv} />
                                    ) : (
                                        <>
                                            <MenuItemWithTopDescription
                                                description={translate('cardPage.travelCardCvv')}
                                                title="•••"
                                                interactive={false}
                                                titleStyle={styles.walletCardNumber}
                                                shouldShowRightComponent
                                                shouldBeAccessible={isSignedInAsDelegate ? undefined : false}
                                                rightComponent={
                                                    !isSignedInAsDelegate ? (
                                                        <Button
                                                            text={translate('cardPage.cardDetails.revealCvv')}
                                                            onPress={() => Navigation.navigate(ROUTES.SETTINGS_WALLET_DOMAIN_CARD_CONFIRM_MAGIC_CODE.getRoute(String(card.cardID)))}
                                                            isDisabled={isCardDetailsLoading[card.cardID] || isOffline}
                                                            isLoading={isCardDetailsLoading[card.cardID]}
                                                        />
                                                    ) : undefined
                                                }
                                            />
                                            <DotIndicatorMessage
                                                messages={cardsDetailsErrors[card.cardID] ? {error: translate(cardsDetailsErrors[card.cardID] as TranslationPaths)} : {}}
                                                type="error"
                                                style={[styles.ph5]}
                                            />
                                        </>
                                    )}
                                    {!isSignedInAsDelegate && (
                                        <MenuItemWithTopDescription
                                            title={translate('cardPage.reportTravelFraud')}
                                            titleStyle={styles.walletCardMenuItem}
                                            icon={expensifyIcons.Flag}
                                            shouldShowRightIcon
                                            onPress={() => Navigation.navigate(ROUTES.SETTINGS_REPORT_FRAUD.getRoute(String(card.cardID)))}
                                        />
                                    )}
                                </React.Fragment>
                            ))}
                        {shouldShowReportLostCardButton && (
                            <>
                                <MenuItemWithTopDescription
                                    description={translate('cardPage.physicalCardNumber')}
                                    title={maskCard(currentPhysicalCard?.lastFourPAN)}
                                    interactive={false}
                                    titleStyle={styles.walletCardNumber}
                                />
                                {shouldShowPIN && (
                                    <MenuItemWithTopDescription
                                        description={translate('cardPage.physicalCardPin')}
                                        title={maskPin(revealedPIN)}
                                        interactive={false}
                                        titleStyle={styles.walletCardNumber}
                                        shouldShowRightComponent={canRevealPIN}
                                        rightComponent={
                                            canRevealPIN ? (
                                                <Button
                                                    icon={expensifyIcons.Eye}
                                                    text={translate('cardPage.revealPin')}
                                                    onPress={() => {
                                                        executeScenario(CONST.MULTIFACTOR_AUTHENTICATION.SCENARIO.REVEAL_PIN, {
                                                            cardID: String(currentPhysicalCard?.cardID),
                                                        });
                                                    }}
                                                    isDisabled={isOffline}
                                                />
                                            ) : undefined
                                        }
                                    />
                                )}
                                {canChangePIN && (
                                    <MenuItem
                                        title={translate('cardPage.changePin')}
                                        icon={expensifyIcons.Key}
                                        shouldShowRightIcon
                                        onPress={() => {
                                            const physicalCardID = String(currentPhysicalCard?.cardID);
                                            if (currentPhysicalCard?.isOfflinePINMarket) {
                                                Navigation.navigate(ROUTES.SETTINGS_WALLET_CARD_CHANGE_PIN_ATM.getRoute(physicalCardID));
                                            } else {
                                                Navigation.navigate(ROUTES.SETTINGS_WALLET_CARD_CHANGE_PIN.getRoute(physicalCardID));
                                            }
                                        }}
                                    />
                                )}
                                <MenuItem
                                    title={translate('reportCardLostOrDamaged.screenTitle')}
                                    icon={expensifyIcons.Flag}
                                    shouldShowRightIcon
                                    onPress={() => {
                                        if (isAccountLocked) {
                                            showLockedAccountModal();
                                            return;
                                        }
                                        Navigation.navigate(ROUTES.SETTINGS_WALLET_REPORT_CARD_LOST_OR_DAMAGED.getRoute(String(currentPhysicalCard?.cardID)));
                                    }}
                                />
                            </>
                        )}

                        {!isProduction && isWorkspaceAdmin && spendRulesSummary.length > 0 && (
                            <MenuItemWithTopDescription
                                description={translate('cardPage.spendRules')}
                                descriptionTextStyle={[styles.fontSizeLabel]}
                                titleComponent={spendRulesTitleComponent}
                                onPress={navigateToSpendRulesPage}
                                accessibilityLabel={spendRulesSummary.join('. ')}
                            />
                        )}

                        <MenuItem
                            icon={expensifyIcons.MoneySearch}
                            title={translate('workspace.common.viewTransactions')}
                            style={styles.mt3}
                            onPress={() => {
                                Navigation.navigate(
                                    ROUTES.SEARCH_ROOT.getRoute({
                                        query: buildCannedSearchQuery({type: CONST.SEARCH.DATA_TYPES.EXPENSE, status: CONST.SEARCH.STATUS.EXPENSE.ALL, cardID}),
                                    }),
                                );
                            }}
                        />
                        {!isProduction && isWorkspaceAdmin && (
                            <MenuItem
                                icon={expensifyIcons.CreditCardLock}
                                title={translate('cardPage.editSpendRules')}
                                onPress={navigateToSpendRulesPage}
                            />
                        )}
                        {canManageCardFreeze && !isCardFrozen(currentCard) && (
                            <MenuItem
                                icon={expensifyIcons.FreezeCard}
                                title={translate('cardPage.freezeCard')}
                                disabled={isOffline}
                                onPress={handleFreezePress}
                            />
                        )}
                    </>
                )}
                {cardToAdd !== undefined && (
                    <AddToWalletButton
                        card={cardToAdd}
                        style={styles.alignSelfCenter}
                        cardHolderName={displayName ?? ''}
                        cardDescription={expensifyCardTitle}
                    />
                )}
            </ScrollView>
            {currentPhysicalCard?.state === CONST.EXPENSIFY_CARD.STATE.NOT_ACTIVATED && (
                <Button
                    success
                    large
                    style={[styles.w100, styles.p5]}
                    onPress={() => Navigation.navigate(ROUTES.SETTINGS_WALLET_CARD_ACTIVATE.getRoute(String(currentPhysicalCard?.cardID)))}
                    text={translate('activateCardPage.activatePhysicalCard')}
                />
            )}
            {currentPhysicalCard?.state === CONST.EXPENSIFY_CARD.STATE.STATE_NOT_ISSUED && (
                <Button
                    success
                    large
                    text={translate('cardPage.getPhysicalCard')}
                    pressOnEnter
                    onPress={() => Navigation.navigate(ROUTES.MISSING_PERSONAL_DETAILS.getRoute(String(currentPhysicalCard.cardID)))}
                    style={[styles.mh5, styles.mb5]}
                />
            )}
            <ConfirmModal
                title={`${translate('cardPage.freezeCard')}?`}
                isVisible={isFreezeModalVisible}
                onConfirm={handleConfirmFreeze}
                onCancel={handleDismissFreezeModal}
                onBackdropPress={handleDismissFreezeModal}
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
                onCancel={handleDismissUnfreezeModal}
                onBackdropPress={handleDismissUnfreezeModal}
                shouldSetModalVisibility={false}
                prompt={translate('cardPage.unfreezeDescription')}
                confirmText={translate('cardPage.unfreezeCard')}
                cancelText={translate('common.cancel')}
            />
        </ScreenWrapper>
    );
}

export default ExpensifyCardPage;
