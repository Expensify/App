import type {StackScreenProps} from '@react-navigation/stack';
import React, {useEffect, useMemo, useState} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
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
import type {PublicScreensParamList} from '@libs/Navigation/types';
import NotFoundPage from '@pages/ErrorPage/NotFoundPage';
import * as Card from '@userActions/Card';
import * as Link from '@userActions/Link';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {GetPhysicalCardForm} from '@src/types/form';
import type {LoginList, Card as OnyxCard, PrivatePersonalDetails} from '@src/types/onyx';
import type {TCardDetails} from '@src/types/onyx/Card';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
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

type ExpensifyCardPageProps = ExpensifyCardPageOnyxProps & StackScreenProps<PublicScreensParamList, typeof SCREENS.TRANSITION_BETWEEN_APPS>;

function ExpensifyCardPage({
    cardList,
    draftValues,
    privatePersonalDetails,
    loginList,
    route: {
        params: {domain = ''},
    },
}: ExpensifyCardPageProps) {
    const styles = useThemeStyles();
    const {isOffline} = useNetwork();
    const {translate} = useLocalize();
    const domainCards = useMemo(() => cardList && CardUtils.getDomainCards(cardList)[domain], [cardList, domain]);
    const virtualCard = useMemo(() => domainCards?.find((card) => card.nameValuePairs?.isVirtual), [domainCards]);
    const physicalCard = useMemo(() => domainCards?.find((card) => !card.nameValuePairs?.isVirtual), [domainCards]);

    const [isLoading, setIsLoading] = useState(false);
    const [isNotFound, setIsNotFound] = useState(false);
    const [details, setDetails] = useState<TCardDetails>();
    const [cardDetailsError, setCardDetailsError] = useState('');

    useEffect(() => {
        if (!cardList) {
            return;
        }
        setIsNotFound(isEmptyObject(virtualCard) && isEmptyObject(physicalCard));
    }, [cardList, physicalCard, virtualCard]);

    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- availableSpend can be 0
    const formattedAvailableSpendAmount = CurrencyUtils.convertToDisplayString(physicalCard?.availableSpend || virtualCard?.availableSpend || 0);

    const handleRevealDetails = () => {
        setIsLoading(true);
        // We can't store the response in Onyx for security reasons.
        // That is why this action is handled manually and the response is stored in a local state
        // Hence eslint disable here.
        // eslint-disable-next-line rulesdir/no-thenable-actions-in-views
        Card.revealVirtualCardDetails(virtualCard?.cardID ?? 0)
            .then((value) => {
                setDetails(value as TCardDetails);
                setCardDetailsError('');
            })
            .catch(setCardDetailsError)
            .finally(() => setIsLoading(false));
    };

    const goToGetPhysicalCardFlow = () => {
        let updatedDraftValues = draftValues;
        if (!draftValues) {
            updatedDraftValues = GetPhysicalCardUtils.getUpdatedDraftValues(null, privatePersonalDetails, loginList);
            // Form draft data needs to be initialized with the private personal details
            // If no draft data exists
            FormActions.setDraftValues(ONYXKEYS.FORMS.GET_PHYSICAL_CARD_FORM, updatedDraftValues);
        }

        GetPhysicalCardUtils.goToNextPhysicalCardRoute(domain, GetPhysicalCardUtils.getUpdatedPrivatePersonalDetails(updatedDraftValues));
    };

    const hasDetectedDomainFraud = domainCards?.some((card) => card.fraud === CONST.EXPENSIFY_CARD.FRAUD_TYPES.DOMAIN);
    const hasDetectedIndividualFraud = domainCards?.some((card) => card.fraud === CONST.EXPENSIFY_CARD.FRAUD_TYPES.INDIVIDUAL);

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
                        title={translate('cardPage.expensifyCard')}
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
                                messages={{error: 'cardPage.cardLocked'}}
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
                                {!isEmptyObject(virtualCard) && (
                                    <>
                                        {details?.pan ? (
                                            <CardDetails
                                                pan={details.pan}
                                                expiration={CardUtils.formatCardExpiration(details.expiration)}
                                                cvv={details.cvv}
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
                                                            onPress={handleRevealDetails}
                                                            isDisabled={isLoading || isOffline}
                                                            isLoading={isLoading}
                                                        />
                                                    }
                                                />
                                                <DotIndicatorMessage
                                                    messages={cardDetailsError ? {error: cardDetailsError} : {}}
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
                                            onPress={() => Navigation.navigate(ROUTES.SETTINGS_REPORT_FRAUD.getRoute(domain))}
                                        />
                                    </>
                                )}
                                {physicalCard?.state === CONST.EXPENSIFY_CARD.STATE.OPEN && (
                                    <>
                                        <MenuItemWithTopDescription
                                            description={translate('cardPage.physicalCardNumber')}
                                            title={CardUtils.maskCard(physicalCard?.lastFourPAN)}
                                            interactive={false}
                                            titleStyle={styles.walletCardNumber}
                                        />
                                        <MenuItem
                                            title={translate('reportCardLostOrDamaged.report')}
                                            icon={Expensicons.Flag}
                                            shouldShowRightIcon
                                            onPress={() => Navigation.navigate(ROUTES.SETTINGS_WALLET_REPORT_CARD_LOST_OR_DAMAGED.getRoute(domain))}
                                        />
                                    </>
                                )}
                            </>
                        )}
                    </ScrollView>
                    {physicalCard?.state === CONST.EXPENSIFY_CARD.STATE.NOT_ACTIVATED && (
                        <Button
                            success
                            large
                            style={[styles.w100, styles.p5]}
                            onPress={() => Navigation.navigate(ROUTES.SETTINGS_WALLET_CARD_ACTIVATE.getRoute(domain))}
                            text={translate('activateCardPage.activatePhysicalCard')}
                        />
                    )}
                    {physicalCard?.state === CONST.EXPENSIFY_CARD.STATE.STATE_NOT_ISSUED && (
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
