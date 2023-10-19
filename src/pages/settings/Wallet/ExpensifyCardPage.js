import PropTypes from 'prop-types';
import React, {useState} from 'react';
import {ScrollView, View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import ONYXKEYS from '../../../ONYXKEYS';
import ROUTES from '../../../ROUTES';
import NotFoundPage from '../../ErrorPage/NotFoundPage';
import CardPreview from '../../../components/CardPreview';
import HeaderWithBackButton from '../../../components/HeaderWithBackButton';
import MenuItemWithTopDescription from '../../../components/MenuItemWithTopDescription';
import ScreenWrapper from '../../../components/ScreenWrapper';
import useLocalize from '../../../hooks/useLocalize';
import * as CurrencyUtils from '../../../libs/CurrencyUtils';
import Navigation from '../../../libs/Navigation/Navigation';
import styles from '../../../styles/styles';
import * as Expensicons from '../../../components/Icon/Expensicons';
import * as CardUtils from '../../../libs/CardUtils';
import Button from '../../../components/Button';
import CardDetails from './WalletPage/CardDetails';
import MenuItem from '../../../components/MenuItem';
import CONST from '../../../CONST';
import assignedCardPropTypes from './assignedCardPropTypes';

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
    const {translate} = useLocalize();
    const domainCards = CardUtils.getDomainCards(cardList)[domain];
    const virtualCard = _.find(domainCards, (card) => card.isVirtual) || {};
    const physicalCard = _.find(domainCards, (card) => !card.isVirtual) || {};

    const [shouldShowCardDetails, setShouldShowCardDetails] = useState(false);

    if (_.isEmpty(virtualCard) && _.isEmpty(physicalCard)) {
        return <NotFoundPage />;
    }

    const formattedAvailableSpendAmount = CurrencyUtils.convertToDisplayString(physicalCard.availableSpend || virtualCard.availableSpend || 0);

    const handleRevealDetails = () => {
        setShouldShowCardDetails(true);
    };

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
                        <View style={[styles.flex1, styles.mb4, styles.mt4]}>
                            <CardPreview />
                        </View>

                        <MenuItemWithTopDescription
                            description={translate('cardPage.availableSpend')}
                            title={formattedAvailableSpendAmount}
                            interactive={false}
                            titleStyle={styles.newKansasLarge}
                        />
                        {!_.isEmpty(virtualCard) && (
                            <>
                                {shouldShowCardDetails ? (
                                    <CardDetails
                                        // This is just a temporary mock, it will be replaced in this issue https://github.com/orgs/Expensify/projects/58?pane=issue&itemId=33286617
                                        pan="1234123412341234"
                                        expiration="11/02/2024"
                                        cvv="321"
                                        domain={domain}
                                    />
                                ) : (
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
                                            />
                                        }
                                    />
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
