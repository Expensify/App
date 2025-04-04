import React, {useEffect, useMemo, useState} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import Button from '@components/Button';
import CardPreview from '@components/CardPreview';
import DotIndicatorMessage from '@components/DotIndicatorMessage';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Expensicons from '@components/Icon/Expensicons';
import MenuItem from '@components/MenuItem';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import ValidateCodeActionModal from '@components/ValidateCodeActionModal';
import useBeforeRemove from '@hooks/useBeforeRemove';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useThemeStyles from '@hooks/useThemeStyles';
import {requestValidateCodeAction} from '@libs/actions/User';
import {formatCardExpiration, getDomainCards, maskCard} from '@libs/CardUtils';
import {convertToDisplayString} from '@libs/CurrencyUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {buildCannedSearchQuery} from '@libs/SearchQueryUtils';
import NotFoundPage from '@pages/ErrorPage/NotFoundPage';
import {revealVirtualCardDetails} from '@userActions/Card';
import {openOldDotLink} from '@userActions/Link';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {ExpensifyCardDetails} from '@src/types/onyx/Card';
import RedDotCardSection from './RedDotCardSection';
import CardDetails from './WalletPage/CardDetails';

type ExpensifyCardPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.WALLET.DOMAIN_CARD>;

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

function ExpensifyCardPage({
    route: {
        params: {cardID = ''},
    },
}: ExpensifyCardPageProps) {
    const [account] = useOnyx(ONYXKEYS.ACCOUNT);
    const [loginList] = useOnyx(ONYXKEYS.LOGIN_LIST);
    const [cardList] = useOnyx(ONYXKEYS.CARD_LIST);

    const styles = useThemeStyles();
    const {isOffline} = useNetwork();
    const {translate} = useLocalize();
    const [isValidateCodeActionModalVisible, setIsValidateCodeActionModalVisible] = useState(false);
    const [currentCardID, setCurrentCardID] = useState<number>(-1);
    const shouldDisplayCardDomain = !cardList?.[cardID]?.nameValuePairs?.issuedBy || !cardList?.[cardID]?.nameValuePairs?.isVirtual;
    const domain = cardList?.[cardID]?.domainName ?? '';
    const pageTitle = shouldDisplayCardDomain ? translate('cardPage.expensifyCard') : cardList?.[cardID]?.nameValuePairs?.cardTitle ?? translate('cardPage.expensifyCard');

    const [isNotFound, setIsNotFound] = useState(false);
    const cardsToShow = useMemo(() => {
        if (shouldDisplayCardDomain) {
            return getDomainCards(cardList)[domain]?.filter((card) => !card?.nameValuePairs?.issuedBy || !card?.nameValuePairs?.isVirtual) ?? [];
        }
        return [cardList?.[cardID]];
    }, [shouldDisplayCardDomain, cardList, cardID, domain]);

    useBeforeRemove(() => setIsValidateCodeActionModalVisible(false));

    useEffect(() => {
        setIsNotFound(!cardsToShow);
    }, [cardList, cardsToShow]);

    const virtualCards = useMemo(() => cardsToShow?.filter((card) => card?.nameValuePairs?.isVirtual), [cardsToShow]);
    const physicalCards = useMemo(() => cardsToShow?.filter((card) => !card?.nameValuePairs?.isVirtual), [cardsToShow]);
    const [cardsDetails, setCardsDetails] = useState<Record<number, ExpensifyCardDetails | null>>({});
    const [isCardDetailsLoading, setIsCardDetailsLoading] = useState<Record<number, boolean>>({});
    const [cardsDetailsErrors, setCardsDetailsErrors] = useState<Record<number, string>>({});

    const openValidateCodeModal = (revealedCardID: number) => {
        setCurrentCardID(revealedCardID);
        setIsValidateCodeActionModalVisible(true);
    };

    const handleRevealDetails = (validateCode: string) => {
        setIsCardDetailsLoading((prevState: Record<number, boolean>) => ({
            ...prevState,
            [currentCardID]: true,
        }));
        // We can't store the response in Onyx for security reasons.
        // That is why this action is handled manually and the response is stored in a local state
        // Hence eslint disable here.
        // eslint-disable-next-line rulesdir/no-thenable-actions-in-views
        revealVirtualCardDetails(currentCardID, validateCode)
            .then((value) => {
                setCardsDetails((prevState: Record<number, ExpensifyCardDetails | null>) => ({...prevState, [currentCardID]: value}));
                setCardsDetailsErrors((prevState) => ({
                    ...prevState,
                    [currentCardID]: '',
                }));
            })
            .catch((error: string) => {
                setCardsDetailsErrors((prevState) => ({
                    ...prevState,
                    [currentCardID]: error,
                }));
            })
            .finally(() => {
                setIsCardDetailsLoading((prevState: Record<number, boolean>) => ({...prevState, [currentCardID]: false}));
                setIsValidateCodeActionModalVisible(false);
            });
    };

    const hasDetectedDomainFraud = cardsToShow?.some((card) => card?.fraud === CONST.EXPENSIFY_CARD.FRAUD_TYPES.DOMAIN);
    const hasDetectedIndividualFraud = cardsToShow?.some((card) => card?.fraud === CONST.EXPENSIFY_CARD.FRAUD_TYPES.INDIVIDUAL);

    const formattedAvailableSpendAmount = convertToDisplayString(cardsToShow?.at(0)?.availableSpend);
    const {limitNameKey, limitTitleKey} = getLimitTypeTranslationKeys(cardsToShow?.at(0)?.nameValuePairs?.limitType);

    const primaryLogin = account?.primaryLogin ?? '';
    const loginData = loginList?.[primaryLogin];
    const isSignedInAsdelegate = !!account?.delegatedAccess?.delegate || false;

    if (isNotFound) {
        return <NotFoundPage onBackButtonPress={() => Navigation.goBack(ROUTES.SETTINGS_WALLET)} />;
    }

    return (
        <ScreenWrapper testID={ExpensifyCardPage.displayName}>
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
                            <>
                                {!!cardsDetails[card.cardID] && cardsDetails[card.cardID]?.pan ? (
                                    <CardDetails
                                        pan={cardsDetails[card.cardID]?.pan}
                                        expiration={formatCardExpiration(cardsDetails[card.cardID]?.expiration ?? '')}
                                        cvv={cardsDetails[card.cardID]?.cvv}
                                        domain={domain}
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
                                                !isSignedInAsdelegate ? (
                                                    <Button
                                                        text={translate('cardPage.cardDetails.revealDetails')}
                                                        onPress={() => openValidateCodeModal(card.cardID)}
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
                                {!isSignedInAsdelegate && (
                                    <MenuItemWithTopDescription
                                        title={translate('cardPage.reportFraud')}
                                        titleStyle={styles.walletCardMenuItem}
                                        icon={Expensicons.Flag}
                                        shouldShowRightIcon
                                        onPress={() => Navigation.navigate(ROUTES.SETTINGS_REPORT_FRAUD.getRoute(String(card.cardID)))}
                                    />
                                )}
                            </>
                        ))}
                        {physicalCards.map((card) => {
                            if (card.state !== CONST.EXPENSIFY_CARD.STATE.OPEN) {
                                return null;
                            }
                            return (
                                <>
                                    <MenuItemWithTopDescription
                                        description={translate('cardPage.physicalCardNumber')}
                                        title={maskCard(card?.lastFourPAN)}
                                        interactive={false}
                                        titleStyle={styles.walletCardNumber}
                                    />
                                    <MenuItem
                                        title={translate('reportCardLostOrDamaged.report')}
                                        icon={Expensicons.Flag}
                                        shouldShowRightIcon
                                        onPress={() => Navigation.navigate(ROUTES.SETTINGS_WALLET_REPORT_CARD_LOST_OR_DAMAGED.getRoute(String(card.cardID)))}
                                    />
                                </>
                            );
                        })}
                        <MenuItem
                            icon={Expensicons.MoneySearch}
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
            </ScrollView>
            {physicalCards?.some((card) => card?.state === CONST.EXPENSIFY_CARD.STATE.NOT_ACTIVATED) && (
                <Button
                    success
                    large
                    style={[styles.w100, styles.p5]}
                    onPress={() =>
                        Navigation.navigate(
                            ROUTES.SETTINGS_WALLET_CARD_ACTIVATE.getRoute(String(physicalCards?.find((card) => card?.state === CONST.EXPENSIFY_CARD.STATE.NOT_ACTIVATED)?.cardID)),
                        )
                    }
                    text={translate('activateCardPage.activatePhysicalCard')}
                />
            )}
            {physicalCards?.some((card) => card?.state === CONST.EXPENSIFY_CARD.STATE.STATE_NOT_ISSUED) && (
                <Button
                    success
                    large
                    text={translate('cardPage.getPhysicalCard')}
                    pressOnEnter
                    onPress={() => Navigation.navigate(ROUTES.MISSING_PERSONAL_DETAILS)}
                    style={[styles.mh5, styles.mb5]}
                />
            )}
            <ValidateCodeActionModal
                handleSubmitForm={handleRevealDetails}
                clearError={() => {}}
                sendValidateCode={() => requestValidateCodeAction()}
                onClose={() => setIsValidateCodeActionModalVisible(false)}
                isVisible={isValidateCodeActionModalVisible}
                hasMagicCodeBeenSent={!!loginData?.validateCodeSent}
                title={translate('cardPage.validateCardTitle')}
                descriptionPrimary={translate('cardPage.enterMagicCode', {contactMethod: primaryLogin})}
            />
        </ScreenWrapper>
    );
}

ExpensifyCardPage.displayName = 'ExpensifyCardPage';

export default ExpensifyCardPage;
