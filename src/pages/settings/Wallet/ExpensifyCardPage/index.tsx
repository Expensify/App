import {useFocusEffect} from '@react-navigation/native';
import {filterOutPersonalCards} from '@selectors/Card';
import React, {useCallback, useContext, useEffect, useMemo, useState} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import AddToWalletButton from '@components/AddToWalletButton/index';
import Button from '@components/Button';
import CardPreview from '@components/CardPreview';
import DotIndicatorMessage from '@components/DotIndicatorMessage';
import FormHelpMessage from '@components/FormHelpMessage';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import {LockedAccountContext} from '@components/LockedAccountModalProvider';
import MenuItem from '@components/MenuItem';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import useCurrencyList from '@hooks/useCurrencyList';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useEnvironment from '@hooks/useEnvironment';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {resetValidateActionCodeSent} from '@libs/actions/User';
import {formatCardExpiration, getDomainCards, maskCard} from '@libs/CardUtils';
import {convertToDisplayString, getCurrencyKeyByCountryCode} from '@libs/CurrencyUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {DomainCardNavigatorParamList, SettingsNavigatorParamList} from '@libs/Navigation/types';
import {arePersonalDetailsMissing} from '@libs/PersonalDetailsUtils';
import {buildCannedSearchQuery} from '@libs/SearchQueryUtils';
import NotFoundPage from '@pages/ErrorPage/NotFoundPage';
import RedDotCardSection from '@pages/settings/Wallet/RedDotCardSection';
import CardDetails from '@pages/settings/Wallet/WalletPage/CardDetails';
import {openOldDotLink} from '@userActions/Link';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type {Card, PrivatePersonalDetails} from '@src/types/onyx';
import {useExpensifyCardActions, useExpensifyCardState} from './ExpensifyCardContextProvider';

type ExpensifyCardPageProps =
    | PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.WALLET.DOMAIN_CARD>
    | PlatformStackScreenProps<DomainCardNavigatorParamList, typeof SCREENS.DOMAIN_CARD.DOMAIN_CARD_DETAIL>;

type PossibleTitles = 'cardPage.smartLimit.title' | 'cardPage.monthlyLimit.title' | 'cardPage.fixedLimit.title';

type LimitTypeTranslationKeys = {
    limitNameKey: TranslationPaths | undefined;
    limitTitleKey: PossibleTitles | undefined;
};

/**
 * Determines if the user should be redirected to the missing details page
 * before revealing their card details (for UK/EU cards only).
 */
function shouldShowMissingDetailsPage(card: OnyxEntry<Card>, privatePersonalDetails: OnyxEntry<PrivatePersonalDetails>): boolean {
    const isUKOrEUCard = card?.nameValuePairs?.feedCountry === 'GB';
    const hasMissingDetails = arePersonalDetailsMissing(privatePersonalDetails);

    return hasMissingDetails && isUKOrEUCard;
}

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
    const {cardID} = route.params;
    const [account] = useOnyx(ONYXKEYS.ACCOUNT, {canBeMissing: false});
    const [cardList] = useOnyx(ONYXKEYS.CARD_LIST, {selector: filterOutPersonalCards, canBeMissing: false});
    const [privatePersonalDetails] = useOnyx(ONYXKEYS.PRIVATE_PERSONAL_DETAILS, {canBeMissing: false});
    const {currencyList} = useCurrencyList();
    const styles = useThemeStyles();
    const {isOffline} = useNetwork();
    const {translate} = useLocalize();
    const {environmentURL} = useEnvironment();
    const isTravelCard = cardList?.[cardID]?.nameValuePairs?.isTravelCard;
    const shouldDisplayCardDomain = !isTravelCard && (!cardList?.[cardID]?.nameValuePairs?.issuedBy || !cardList?.[cardID]?.nameValuePairs?.isVirtual);
    const domain = cardList?.[cardID]?.domainName ?? '';
    const expensifyCardTitle = isTravelCard ? translate('cardPage.expensifyTravelCard') : translate('cardPage.expensifyCard');
    const pageTitle = shouldDisplayCardDomain ? expensifyCardTitle : (cardList?.[cardID]?.nameValuePairs?.cardTitle ?? expensifyCardTitle);
    const {displayName} = useCurrentUserPersonalDetails();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Flag', 'MoneySearch']);

    const [isNotFound, setIsNotFound] = useState(false);
    const cardsToShow = useMemo(() => {
        if (shouldDisplayCardDomain) {
            return getDomainCards(cardList)[domain]?.filter((card) => !card?.nameValuePairs?.issuedBy || !card?.nameValuePairs?.isVirtual) ?? [];
        }
        return [cardList?.[cardID]];
    }, [shouldDisplayCardDomain, cardList, cardID, domain]);
    const currentCard = useMemo(() => cardsToShow?.find((card) => String(card?.cardID) === cardID) ?? cardsToShow?.at(0), [cardsToShow, cardID]);

    useEffect(() => {
        setIsNotFound(!currentCard);
    }, [cardList, cardsToShow, currentCard]);

    const virtualCards = useMemo(() => cardsToShow?.filter((card) => card?.nameValuePairs?.isVirtual && !card?.nameValuePairs?.isTravelCard), [cardsToShow]);
    const travelCards = useMemo(() => cardsToShow?.filter((card) => card?.nameValuePairs?.isVirtual && card?.nameValuePairs?.isTravelCard), [cardsToShow]);
    const physicalCards = useMemo(() => cardsToShow?.filter((card) => !card?.nameValuePairs?.isVirtual), [cardsToShow]);
    const cardToAdd = useMemo(() => {
        return virtualCards?.at(0);
    }, [virtualCards]);

    const {cardsDetails, isCardDetailsLoading, cardsDetailsErrors} = useExpensifyCardState();
    const {setCardsDetails} = useExpensifyCardActions();

    // Resets card details when navigating away from the page.
    useFocusEffect(
        useCallback(() => {
            return () => {
                setCardsDetails((oldCardDetails) => ({...oldCardDetails, [cardID]: null}));
            };
        }, [cardID, setCardsDetails]),
    );

    const {isAccountLocked, showLockedAccountModal} = useContext(LockedAccountContext);

    const hasDetectedDomainFraud = cardsToShow?.some((card) => card?.fraud === CONST.EXPENSIFY_CARD.FRAUD_TYPES.DOMAIN);
    const hasDetectedIndividualFraud = cardsToShow?.some((card) => card?.fraud === CONST.EXPENSIFY_CARD.FRAUD_TYPES.INDIVIDUAL);
    const currentPhysicalCard = physicalCards?.find((card) => String(card?.cardID) === cardID);

    // Cards that are already activated and working (OPEN) and cards shipped but not activated yet can be reported as missing or damaged
    const shouldShowReportLostCardButton = currentPhysicalCard?.state === CONST.EXPENSIFY_CARD.STATE.NOT_ACTIVATED || currentPhysicalCard?.state === CONST.EXPENSIFY_CARD.STATE.OPEN;

    const currency = getCurrencyKeyByCountryCode(currencyList, currentCard?.nameValuePairs?.country ?? currentCard?.nameValuePairs?.feedCountry);
    const formattedAvailableSpendAmount = convertToDisplayString(currentCard?.availableSpend, currency);
    const {limitNameKey, limitTitleKey} = getLimitTypeTranslationKeys(currentCard?.nameValuePairs?.limitType);

    const isSignedInAsDelegate = !!account?.delegatedAccess?.delegate || false;

    if (isNotFound) {
        return <NotFoundPage onBackButtonPress={() => Navigation.goBack(ROUTES.SETTINGS_WALLET)} />;
    }

    return (
        <ScreenWrapper testID="ExpensifyCardPage">
            <HeaderWithBackButton
                title={pageTitle}
                onBackButtonPress={() => Navigation.closeRHPFlow()}
            />
            <ScrollView>
                <View style={[styles.flex1, styles.mb9, styles.mt9]}>
                    <CardPreview />
                </View>

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
                                title={translate(limitTitleKey, {formattedLimit: formattedAvailableSpendAmount})}
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
                                    />
                                ) : (
                                    <>
                                        <MenuItemWithTopDescription
                                            description={translate('cardPage.virtualCardNumber')}
                                            title={maskCard('')}
                                            interactive={false}
                                            titleStyle={styles.walletCardNumber}
                                            shouldShowRightComponent
                                            rightComponent={
                                                !isSignedInAsDelegate ? (
                                                    <Button
                                                        text={translate('cardPage.cardDetails.revealDetails')}
                                                        onPress={() => {
                                                            if (isAccountLocked) {
                                                                showLockedAccountModal();
                                                                return;
                                                            }

                                                            // Check if user needs to add personal details first (UK/EU cards only)
                                                            if (shouldShowMissingDetailsPage(card, privatePersonalDetails)) {
                                                                Navigation.navigate(ROUTES.SETTINGS_WALLET_CARD_MISSING_DETAILS.getRoute(String(card.cardID)));
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
                                        {cardsDetailsErrors[card.cardID] === 'cardPage.missingPrivateDetails' ? (
                                            <FormHelpMessage
                                                isError
                                                shouldShowRedDotIndicator
                                                message={translate('cardPage.missingPrivateDetails', {
                                                    missingDetailsLink: `${environmentURL}/${ROUTES.SETTINGS_WALLET_CARD_MISSING_DETAILS.getRoute(String(card.cardID))}`,
                                                })}
                                                style={[styles.ph5, styles.mv2]}
                                                shouldRenderMessageAsHTML
                                            />
                                        ) : (
                                            <DotIndicatorMessage
                                                messages={cardsDetailsErrors[card.cardID] ? {error: translate(cardsDetailsErrors[card.cardID] as TranslationPaths)} : {}}
                                                type="error"
                                                style={[styles.ph5, styles.mv2]}
                                            />
                                        )}
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
                        {isTravelCard &&
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
                    onPress={() => Navigation.navigate(ROUTES.MISSING_PERSONAL_DETAILS.getRoute())}
                    style={[styles.mh5, styles.mb5]}
                />
            )}
        </ScreenWrapper>
    );
}

export default ExpensifyCardPage;
