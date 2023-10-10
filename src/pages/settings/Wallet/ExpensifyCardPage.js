import PropTypes from 'prop-types';
import React, {useReducer} from 'react';
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
import Button from '../../../components/Button';
import CardDetails from './WalletPage/CardDetails';
// eslint-disable-next-line rulesdir/no-api-in-views
import * as API from '../../../libs/API';
import CONST from '../../../CONST';
import * as revealCardDetailsUtils from './revealCardDetailsUtils';

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

    const [{isLoading, details, error}, dispatch] = useReducer(revealCardDetailsUtils.reducer, revealCardDetailsUtils.initialState);

    if (_.isEmpty(virtualCard) && _.isEmpty(physicalCard)) {
        return <NotFoundPage />;
    }

    const formattedAvailableSpendAmount = CurrencyUtils.convertToDisplayString(physicalCard.availableSpend || virtualCard.availableSpend || 0);

    const handleRevealDetails = () => {
        dispatch({type: revealCardDetailsUtils.ACTION_TYPES.start});
        // eslint-disable-next-line rulesdir/no-api-in-views,rulesdir/no-api-side-effects-method
        API.makeRequestWithSideEffects('RevealVirtualCardDetails', {cardID: virtualCard.cardID})
            .then((response) => {
                if (response.jsonCode !== CONST.JSON_CODE.SUCCESS) {
                    dispatch({type: revealCardDetailsUtils.ACTION_TYPES.FAIL, payload: response.message});
                    return;
                }
                dispatch({type: revealCardDetailsUtils.ACTION_TYPES.SUCCESS, payload: response});
            })
            .catch((err) => {
                dispatch({type: revealCardDetailsUtils.ACTION_TYPES.FAIL, payload: err.message});
            });
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
                                {details.pan ? (
                                    <CardDetails
                                        pan={details.pan}
                                        expiration={details.expiration}
                                        cvv={details.cvv}
                                        privatePersonalDetails={{address: details.address}}
                                    />
                                ) : (
                                    <MenuItemWithTopDescription
                                        description={translate('cardPage.virtualCardNumber')}
                                        title={CardUtils.maskCard(virtualCard.lastFourPAN)}
                                        interactive={false}
                                        titleStyle={styles.walletCardNumber}
                                        shouldShowRightComponent
                                        error={error}
                                        rightComponent={
                                            <Button
                                                medium
                                                text={translate('cardPage.cardDetails.revealDetails')}
                                                onPress={handleRevealDetails}
                                                isDisabled={isLoading}
                                                isLoading={isLoading}
                                            />
                                        }
                                    />
                                )}
                            </>
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
