import PropTypes from 'prop-types';
import React, {useEffect, useMemo, useState} from 'react';
import {ScrollView, View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import Button from '@components/Button';
import CardPreview from '@components/CardPreview';
import DotIndicatorMessage from '@components/DotIndicatorMessage';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Expensicons from '@components/Icon/Expensicons';
import MenuItem from '@components/MenuItem';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useThemeStyles from '@hooks/useThemeStyles';
import * as CardUtils from '@libs/CardUtils';
import * as CurrencyUtils from '@libs/CurrencyUtils';
import FormUtils from '@libs/FormUtils';
import * as GetPhysicalCardUtils from '@libs/GetPhysicalCardUtils';
import Navigation from '@libs/Navigation/Navigation';
import NotFoundPage from '@pages/ErrorPage/NotFoundPage';
import * as Card from '@userActions/Card';
import * as Link from '@userActions/Link';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import assignedCardPropTypes from './assignedCardPropTypes';
import RedDotCardSection from './RedDotCardSection';
import CardDetails from './WalletPage/CardDetails';

const propTypes = {
    /* Onyx Props */
    /** The details about the Expensify cards */
    cardList: PropTypes.objectOf(assignedCardPropTypes),
    /** Draft values used by the get physical card form */
    draftValues: PropTypes.shape({
        addressLine1: PropTypes.string,
        addressLine2: PropTypes.string,
        city: PropTypes.string,
        state: PropTypes.string,
        country: PropTypes.string,
        zipPostCode: PropTypes.string,
        phoneNumber: PropTypes.string,
        legalFirstName: PropTypes.string,
        legalLastName: PropTypes.string,
    }),
    loginList: PropTypes.shape({
        /** The partner creating the account. It depends on the source: website, mobile, integrations, ... */
        partnerName: PropTypes.string,

        /** Phone/Email associated with user */
        partnerUserID: PropTypes.string,

        /** The date when the login was validated, used to show the brickroad status */
        validatedDate: PropTypes.string,

        /** Field-specific server side errors keyed by microtime */
        errorFields: PropTypes.objectOf(PropTypes.objectOf(PropTypes.string)),

        /** Field-specific pending states for offline UI status */
        pendingFields: PropTypes.objectOf(PropTypes.objectOf(PropTypes.string)),
    }),
    /** User's private personal details */
    privatePersonalDetails: PropTypes.shape({
        legalFirstName: PropTypes.string,
        legalLastName: PropTypes.string,
        phoneNumber: PropTypes.string,
        /** User's home address */
        address: PropTypes.shape({
            street: PropTypes.string,
            city: PropTypes.string,
            state: PropTypes.string,
            zip: PropTypes.string,
            country: PropTypes.string,
        }),
    }),

    /** Navigation route context info provided by react navigation */
    route: PropTypes.shape({
        params: PropTypes.shape({
            /** domain passed via route /settings/wallet/card/:domain */
            domain: PropTypes.string,
        }),
    }).isRequired,
};

const defaultProps = {
    cardList: null,
    draftValues: {
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        country: '',
        zipPostCode: '',
        phoneNumber: '',
        legalFirstName: '',
        legalLastName: '',
    },
    loginList: {},
    privatePersonalDetails: {
        legalFirstName: '',
        legalLastName: '',
        phoneNumber: null,
        address: {
            street: '',
            city: '',
            state: '',
            zip: '',
            country: '',
        },
    },
};

function ExpensifyCardPage({
    cardList,
    draftValues,
    loginList,
    privatePersonalDetails,
    route: {
        params: {domain},
    },
}) {
    const styles = useThemeStyles();
    const {isOffline} = useNetwork();
    const {translate} = useLocalize();
    const domainCards = useMemo(() => cardList && CardUtils.getDomainCards(cardList)[domain], [cardList, domain]);
    const virtualCard = useMemo(() => (domainCards && _.find(domainCards, (card) => card.isVirtual)) || {}, [domainCards]);
    const physicalCard = useMemo(() => (domainCards && _.find(domainCards, (card) => !card.isVirtual)) || {}, [domainCards]);

    const [isLoading, setIsLoading] = useState(false);
    const [isNotFound, setIsNotFound] = useState(false);
    const [details, setDetails] = useState({});
    const [cardDetailsError, setCardDetailsError] = useState('');

    useEffect(() => {
        if (!cardList) {
            return;
        }
        setIsNotFound(_.isEmpty(virtualCard) && _.isEmpty(physicalCard));
    }, [cardList, physicalCard, virtualCard]);

    const formattedAvailableSpendAmount = CurrencyUtils.convertToDisplayString(physicalCard.availableSpend || virtualCard.availableSpend || 0);

    const handleRevealDetails = () => {
        setIsLoading(true);
        // We can't store the response in Onyx for security reasons.
        // That is why this action is handled manually and the response is stored in a local state
        // Hence eslint disable here.
        // eslint-disable-next-line rulesdir/no-thenable-actions-in-views
        Card.revealVirtualCardDetails(virtualCard.cardID)
            .then((value) => {
                setDetails(value);
                setCardDetailsError('');
            })
            .catch(setCardDetailsError)
            .finally(() => setIsLoading(false));
    };

    const goToGetPhysicalCardFlow = () => {
        const updatedDraftValues = GetPhysicalCardUtils.getUpdatedDraftValues(draftValues, privatePersonalDetails, loginList);

        GetPhysicalCardUtils.goToNextPhysicalCardRoute(domain, GetPhysicalCardUtils.getUpdatedPrivatePersonalDetails(updatedDraftValues), loginList);
    };

    const hasDetectedDomainFraud = _.some(domainCards, (card) => card.fraud === CONST.EXPENSIFY_CARD.FRAUD_TYPES.DOMAIN);
    const hasDetectedIndividualFraud = _.some(domainCards, (card) => card.fraud === CONST.EXPENSIFY_CARD.FRAUD_TYPES.INDIVIDUAL);
    const cardDetailsErrorObject = cardDetailsError ? {error: cardDetailsError} : {};

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
                        onBackButtonPress={() => Navigation.goBack(ROUTES.SETTINGS_WALLET)}
                    />
                    <ScrollView contentContainerStyle={safeAreaPaddingBottomStyle}>
                        <View style={[styles.flex1, styles.mb9, styles.mt9]}>
                            <CardPreview />
                        </View>

                        {hasDetectedDomainFraud ? (
                            <DotIndicatorMessage
                                style={styles.pageWrapper}
                                textStyles={styles.walletLockedMessage}
                                messages={{0: translate('cardPage.cardLocked')}}
                                type="error"
                            />
                        ) : null}

                        {hasDetectedIndividualFraud && !hasDetectedDomainFraud ? (
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
                        ) : null}

                        {!hasDetectedDomainFraud ? (
                            <>
                                <MenuItemWithTopDescription
                                    description={translate('cardPage.availableSpend')}
                                    title={formattedAvailableSpendAmount}
                                    interactive={false}
                                    titleStyle={styles.newKansasLarge}
                                />
                                {!_.isEmpty(virtualCard) && (
                                    <>
                                        {details.pan ? (
                                            <CardDetails
                                                pan={details.pan}
                                                expiration={CardUtils.formatCardExpiration(details.expiration)}
                                                cvv={details.cvv}
                                                privatePersonalDetails={{address: details.address}}
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
                                                    messages={cardDetailsErrorObject}
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
                                {physicalCard.state === CONST.EXPENSIFY_CARD.STATE.OPEN && (
                                    <>
                                        <MenuItemWithTopDescription
                                            description={translate('cardPage.physicalCardNumber')}
                                            title={CardUtils.maskCard(physicalCard.lastFourPAN)}
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
                        ) : null}
                    </ScrollView>
                    {physicalCard.state === CONST.EXPENSIFY_CARD.STATE.NOT_ACTIVATED && (
                        <Button
                            success
                            style={[styles.w100, styles.p5]}
                            onPress={() => Navigation.navigate(ROUTES.SETTINGS_WALLET_CARD_ACTIVATE.getRoute(domain))}
                            text={translate('activateCardPage.activatePhysicalCard')}
                        />
                    )}
                    {physicalCard.state === CONST.EXPENSIFY_CARD.STATE.STATE_NOT_ISSUED && (
                        <Button
                            success
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

ExpensifyCardPage.propTypes = propTypes;
ExpensifyCardPage.defaultProps = defaultProps;
ExpensifyCardPage.displayName = 'ExpensifyCardPage';

export default withOnyx({
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
        key: FormUtils.getDraftKey(ONYXKEYS.FORMS.GET_PHYSICAL_CARD_FORM),
    },
})(ExpensifyCardPage);
