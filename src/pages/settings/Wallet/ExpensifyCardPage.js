import PropTypes from 'prop-types';
import React, {useState} from 'react';
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
import * as CardUtils from '@libs/CardUtils';
import * as CurrencyUtils from '@libs/CurrencyUtils';
import Navigation from '@libs/Navigation/Navigation';
import NotFoundPage from '@pages/ErrorPage/NotFoundPage';
import useTheme from '@styles/themes/useTheme';
import useThemeStyles from '@styles/useThemeStyles';
import * as Card from '@userActions/Card';
import * as Link from '@userActions/Link';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import assignedCardPropTypes from './assignedCardPropTypes';
import DangerCardSection from './DangerCardSection';
import CardDetails from './WalletPage/CardDetails';

const propTypes = {
    /* Onyx Props */
    /** The details about the Expensify cards */
    cardList: PropTypes.objectOf(assignedCardPropTypes),

    /** Navigation route context info provided by react navigation */
    route: PropTypes.shape({
        params: PropTypes.shape({
            /** domain passed via route /settings/wallet/card/:domain */
            domain: PropTypes.string,
        }),
    }).isRequired,
};

const defaultProps = {
    cardList: {},
};

function ExpensifyCardPage({
    cardList,
    route: {
        params: {domain},
    },
}) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {isOffline} = useNetwork();
    const {translate} = useLocalize();
    const domainCards = CardUtils.getDomainCards(cardList)[domain];
    const virtualCard = _.find(domainCards, (card) => card.isVirtual) || {};
    const physicalCard = _.find(domainCards, (card) => !card.isVirtual) || {};

    const [isLoading, setIsLoading] = useState(false);
    const [details, setDetails] = useState({});
    const [cardDetailsError, setCardDetailsError] = useState('');

    if (_.isEmpty(virtualCard) && _.isEmpty(physicalCard)) {
        return <NotFoundPage />;
    }

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

    const hasDetectedDomainFraud = _.some(domainCards, (card) => card.fraud === CONST.EXPENSIFY_CARD.FRAUD_TYPES.DOMAIN);
    const hasDetectedIndividualFraud = _.some(domainCards, (card) => card.fraud === CONST.EXPENSIFY_CARD.FRAUD_TYPES.INDIVIDUAL);
    const cardDetailsErrorObject = cardDetailsError ? {error: cardDetailsError} : {};

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
                                style={[styles.pageWrapper]}
                                textStyle={[styles.walletLockedMessage]}
                                messages={{0: translate('cardPage.cardLocked')}}
                                type="error"
                            />
                        ) : null}

                        {hasDetectedIndividualFraud && !hasDetectedDomainFraud ? (
                            <>
                                <DangerCardSection
                                    title={translate('cardPage.suspiciousBannerTitle')}
                                    description={translate('cardPage.suspiciousBannerDescription')}
                                />
                                <MenuItemWithTopDescription
                                    title={translate('cardPage.reviewTransaction')}
                                    titleStyle={styles.walletCardMenuItem}
                                    icon={Expensicons.MagnifyingGlass}
                                    iconFill={theme.icon}
                                    shouldShowRightIcon
                                    brickRoadIndicator="error"
                                    onPress={() => Link.openOldDotLink('inbox')}
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
                                                expiration={details.expiration}
                                                cvv={details.cvv}
                                                privatePersonalDetails={{address: details.address}}
                                                domain={domain}
                                            />
                                        ) : (
                                            <>
                                                <MenuItemWithTopDescription
                                                    description={translate('cardPage.virtualCardNumber')}
                                                    title={CardUtils.maskCard(virtualCard.lastFourPAN)}
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
                                {!_.isEmpty(physicalCard) && (
                                    <>
                                        <MenuItemWithTopDescription
                                            description={translate('cardPage.physicalCardNumber')}
                                            title={CardUtils.maskCard(physicalCard.lastFourPAN)}
                                            interactive={false}
                                            titleStyle={styles.walletCardMenuItem}
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
})(ExpensifyCardPage);
