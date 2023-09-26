import PropTypes from 'prop-types';
import React from 'react';
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
import assignedCardPropTypes from './assignedCardPropTypes';
import useLocalize from '../../../hooks/useLocalize';
import * as CurrencyUtils from '../../../libs/CurrencyUtils';
import Navigation from '../../../libs/Navigation/Navigation';
import styles from '../../../styles/styles';
import * as CardUtils from '../../../libs/CardUtils';

const propTypes = {
    /* Onyx Props */
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

    if (_.isEmpty(virtualCard) && _.isEmpty(physicalCard)) {
        return <NotFoundPage />;
    }

    const formattedAvailableSpendAmount = CurrencyUtils.convertToDisplayString(physicalCard.availableSpend || virtualCard.availableSpend || 0);

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
                        {!_.isEmpty(physicalCard) && (
                            <MenuItemWithTopDescription
                                description={translate('cardPage.virtualCardNumber')}
                                title={CardUtils.maskCard(virtualCard.lastFourPAN)}
                                interactive={false}
                                titleStyle={styles.walletCardNumber}
                            />
                        )}
                        {!_.isEmpty(physicalCard) && (
                            <MenuItemWithTopDescription
                                description={translate('cardPage.physicalCardNumber')}
                                title={CardUtils.maskCard(physicalCard.lastFourPAN)}
                                interactive={false}
                                titleStyle={styles.walletCardNumber}
                            />
                        )}
                    </ScrollView>
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
