import type {StackScreenProps} from '@react-navigation/stack';
import React, {useEffect, useMemo, useState} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
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
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useThemeStyles from '@hooks/useThemeStyles';
import * as FormActions from '@libs/actions/FormActions';
import * as CardUtils from '@libs/CardUtils';
import * as CurrencyUtils from '@libs/CurrencyUtils';
import * as GetPhysicalCardUtils from '@libs/GetPhysicalCardUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import NotFoundPage from '@pages/ErrorPage/NotFoundPage';
import * as Card from '@userActions/Card';
import * as Link from '@userActions/Link';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {GetPhysicalCardForm} from '@src/types/form';
import type {LoginList, Card as OnyxCard, PrivatePersonalDetails} from '@src/types/onyx';
import type {ExpensifyCardDetails} from '@src/types/onyx/Card';
import RedDotCardSection from './RedDotCardSection';
import CardDetails from './WalletPage/CardDetails';

type ExpensifyCardPageOnyxProps = {
    /** User's private personal details */
    privatePersonalDetails: OnyxEntry<PrivatePersonalDetails>;

    /** The details about the Expensify cards */
    cardList: OnyxEntry<Record<string, OnyxCard>>;

    /** Draft values used by the get physical card form */
    draftValues: OnyxEntry<GetPhysicalCardForm>;

    /** Login info */
    loginList: OnyxEntry<LoginList>;
};

type ExpensifyCardPageProps = ExpensifyCardPageOnyxProps & StackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.WALLET.DOMAIN_CARD>;

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
    cardList,
    draftValues,
    privatePersonalDetails,
    loginList,
    route: {
        params: {cardID = ''},
    },
}: ExpensifyCardPageProps) {
    const styles = useThemeStyles();
    const {isOffline} = useNetwork();
    const {translate} = useLocalize();
    const shouldDisplayCardDomain = !cardList?.[cardID]?.nameValuePairs?.issuedBy || !cardList?.[cardID]?.nameValuePairs?.isVirtual;
    const domain = cardList?.[cardID]?.domainName ?? '';
    const pageTitle = shouldDisplayCardDomain ? translate('cardPage.expensifyCard') : cardList?.[cardID]?.nameValuePairs?.cardTitle ?? translate('cardPage.expensifyCard');

    const [isNotFound, setIsNotFound] = useState(false);
    const cardsToShow = useMemo(() => {
        if (shouldDisplayCardDomain) {
            return CardUtils.getDomainCards(cardList)[domain]?.filter((card) => !card?.nameValuePairs?.issuedBy || !card?.nameValuePairs?.isVirtual) ?? [];
        }
        return [cardList?.[cardID]];
    }, [shouldDisplayCardDomain, cardList, cardID, domain]);
    useEffect(() => {
        setIsNotFound(!cardsToShow);
    }, [cardList, cardsToShow]);

    const virtualCards = useMemo(() => cardsToShow?.filter((card) => card?.nameValuePairs?.isVirtual), [cardsToShow]);
    const physicalCards = useMemo(() => cardsToShow?.filter((card) => !card?.nameValuePairs?.isVirtual), [cardsToShow]);
    const [cardsDetails, setCardsDetails] = useState<Record<number, ExpensifyCardDetails | null>>({});
    const [isCardDetailsLoading, setIsCardDetailsLoading] = useState<Record<number, boolean>>({});
    const [cardsDetailsErrors, setCardsDetailsErrors] = useState<Record<number, string>>({});

    const handleRevealDetails = (revealedCardID: number) => {
        setIsCardDetailsLoading((prevState: Record<number, boolean>) => ({
            ...prevState,
            [revealedCardID]: true,
        }));
        // We can't store the response in Onyx for security reasons.
        // That is why this action is handled manually and the response is stored in a local state
        // Hence eslint disable here.
        // eslint-disable-next-line rulesdir/no-thenable-actions-in-views
        Card.revealVirtualCardDetails(revealedCardID)
            .then((value) => {
                setCardsDetails((prevState: Record<number, ExpensifyCardDetails | null>) => ({...prevState, [revealedCardID]: value}));
                setCardsDetailsErrors((prevState) => ({
                    ...prevState,
                    [revealedCardID]: '',
                }));
            })
            .catch((error: string) => {
                setCardsDetailsErrors((prevState) => ({
                    ...prevState,
                    [revealedCardID]: error,
                }));
            })
            .finally(() => setIsCardDetailsLoading((prevState: Record<number, boolean>) => ({...prevState, [revealedCardID]: false})));
    };

    const hasDetectedDomainFraud = cardsToShow?.some((card) => card?.fraud === CONST.EXPENSIFY_CARD.FRAUD_TYPES.DOMAIN);
    const hasDetectedIndividualFraud = cardsToShow?.some((card) => card?.fraud === CONST.EXPENSIFY_CARD.FRAUD_TYPES.INDIVIDUAL);

    const formattedAvailableSpendAmount = CurrencyUtils.convertToDisplayString(cardsToShow?.[0]?.availableSpend);
    const {limitNameKey, limitTitleKey} = getLimitTypeTranslationKeys(cardsToShow?.[0]?.nameValuePairs?.limitType);

    const goToGetPhysicalCardFlow = () => {
        let updatedDraftValues = draftValues;
        if (!draftValues) {
            updatedDraftValues = GetPhysicalCardUtils.getUpdatedDraftValues(undefined, privatePersonalDetails, loginList);
            // Form draft data needs to be initialized with the private personal details
            // If no draft data exists
            FormActions.setDraftValues(ONYXKEYS.FORMS.GET_PHYSICAL_CARD_FORM, updatedDraftValues);
        }

        GetPhysicalCardUtils.goToNextPhysicalCardRoute(domain, GetPhysicalCardUtils.getUpdatedPrivatePersonalDetails(updatedDraftValues));
    };

    if (isNotFound) {
        return <NotFoundPage onBackButtonPress={() => Navigation.goBack(ROUTES.SETTINGS_WALLET)} />;
    }

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            testID={ExpensifyCardPage.displayName}
        >
            {({safeAreaPaddingBottomStyle}) => (
                <>
                    <HeaderWithBackButton
                        title={pageTitle}
                        onBackButtonPress={() => Navigation.goBack()}
                    />
                    <ScrollView contentContainerStyle={safeAreaPaddingBottomStyle}>
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
                                    medium
                                    style={[styles.mh5, styles.mb5]}
                                    text={translate('cardPage.reviewTransaction')}
                                    onPress={() => Link.openOldDotLink(CONST.OLDDOT_URLS.INBOX)}
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
                                {limitNameKey && limitTitleKey && (
                                    <MenuItemWithTopDescription
                                        description={translate(limitNameKey)}
                                        title={translate(limitTitleKey, formattedAvailableSpendAmount)}
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
                                                expiration={CardUtils.formatCardExpiration(cardsDetails[card.cardID]?.expiration ?? '')}
                                                cvv={cardsDetails[card.cardID]?.cvv}
                                                domain={domain}
                                            />
                                        ) : (
                                            <>
                                                <MenuItemWithTopDescription
                                                    description={translate('cardPage.virtualCardNumber')}
                                                    title={CardUtils.maskCard('')}
                                                    interactive={false}
                                                    titleStyle={styles.walletCardNumber}
                                                    shouldShowRightComponent
                                                    rightComponent={
                                                        <Button
                                                            medium
                                                            text={translate('cardPage.cardDetails.revealDetails')}
                                                            onPress={() => handleRevealDetails(card.cardID)}
                                                            isDisabled={isCardDetailsLoading[card.cardID] || isOffline}
                                                            isLoading={isCardDetailsLoading[card.cardID]}
                                                        />
                                                    }
                                                />
                                                <DotIndicatorMessage
                                                    messages={cardsDetailsErrors[card.cardID] ? {error: cardsDetailsErrors[card.cardID]} : {}}
                                                    type="error"
                                                    style={[styles.ph5]}
                                                />
                                            </>
                                        )}
                                        <MenuItemWithTopDescription
                                            title={translate('cardPage.reportFraud')}
                                            titleStyle={styles.walletCardMenuItem}
                                            icon={Expensicons.Flag}
                                            shouldShowRightIcon
                                            onPress={() => Navigation.navigate(ROUTES.SETTINGS_REPORT_FRAUD.getRoute(String(card.cardID)))}
                                        />
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
                                                title={CardUtils.maskCard(card?.lastFourPAN)}
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
                            onPress={goToGetPhysicalCardFlow}
                            style={[styles.mh5, styles.mb5]}
                        />
                    )}
                </>
            )}
        </ScreenWrapper>
    );
}

ExpensifyCardPage.displayName = 'ExpensifyCardPage';

export default withOnyx<ExpensifyCardPageProps, ExpensifyCardPageOnyxProps>({
    cardList: {
        key: ONYXKEYS.CARD_LIST,
    },
    loginList: {
        key: ONYXKEYS.LOGIN_LIST,
    },
    privatePersonalDetails: {
        key: ONYXKEYS.PRIVATE_PERSONAL_DETAILS,
    },
    draftValues: {
        key: ONYXKEYS.FORMS.GET_PHYSICAL_CARD_FORM_DRAFT,
    },
})(ExpensifyCardPage);
