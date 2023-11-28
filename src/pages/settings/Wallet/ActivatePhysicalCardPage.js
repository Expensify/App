import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import BigNumberPad from '@components/BigNumberPad';
import Button from '@components/Button';
import IllustratedHeaderPageLayout from '@components/IllustratedHeaderPageLayout';
import LottieAnimations from '@components/LottieAnimations';
import MagicCodeInput from '@components/MagicCodeInput';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useWindowDimensions from '@hooks/useWindowDimensions';
import * as CardUtils from '@libs/CardUtils';
import * as DeviceCapabilities from '@libs/DeviceCapabilities';
import * as ErrorUtils from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import NotFoundPage from '@pages/ErrorPage/NotFoundPage';
import useTheme from '@styles/themes/useTheme';
import useThemeStyles from '@styles/useThemeStyles';
import * as CardSettings from '@userActions/Card';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
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

const LAST_FOUR_DIGITS_LENGTH = 4;
const MAGIC_INPUT_MIN_HEIGHT = 86;

function ActivatePhysicalCardPage({
    cardList,
    route: {
        params: {domain},
    },
}) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {isExtraSmallScreenHeight} = useWindowDimensions();
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();

    const [formError, setFormError] = useState('');
    const [lastFourDigits, setLastFourDigits] = useState('');
    const [lastPressedDigit, setLastPressedDigit] = useState('');

    const domainCards = CardUtils.getDomainCards(cardList)[domain];
    const physicalCard = _.find(domainCards, (card) => !card.isVirtual) || {};
    const cardID = lodashGet(physicalCard, 'cardID', 0);
    const cardError = ErrorUtils.getLatestErrorMessage(physicalCard);

    const activateCardCodeInputRef = useRef(null);

    /**
     * If state of the card is CONST.EXPENSIFY_CARD.STATE.OPEN, navigate to card details screen.
     */
    useEffect(() => {
        if (physicalCard.isLoading || lodashGet(cardList, `${cardID}.state`, 0) !== CONST.EXPENSIFY_CARD.STATE.OPEN) {
            return;
        }

        Navigation.navigate(ROUTES.SETTINGS_WALLET_DOMAINCARD.getRoute(domain));
    }, [cardID, cardList, domain, physicalCard.isLoading]);

    useEffect(
        () => () => {
            CardSettings.clearCardListErrors(cardID);
        },
        [cardID],
    );

    /**
     * Update lastPressedDigit with value that was pressed on BigNumberPad.
     *
     * NOTE: If the same digit is pressed twice in a row, append it to the end of the string
     * so that useEffect inside MagicCodeInput will be triggered by artificial change of the value.
     *
     * @param {String} key
     */
    const updateLastPressedDigit = useCallback((key) => setLastPressedDigit(lastPressedDigit === key ? lastPressedDigit + key : key), [lastPressedDigit]);

    /**
     * Handle card activation code input
     *
     * @param {String} text
     */
    const onCodeInput = (text) => {
        setFormError('');

        if (cardError) {
            CardSettings.clearCardListErrors(cardID);
        }

        setLastFourDigits(text);
    };

    const submitAndNavigateToNextPage = useCallback(() => {
        activateCardCodeInputRef.current.blur();

        if (lastFourDigits.replace(CONST.MAGIC_CODE_EMPTY_CHAR, '').length !== LAST_FOUR_DIGITS_LENGTH) {
            setFormError(translate('activateCardPage.error.thatDidntMatch'));
            return;
        }

        CardSettings.activatePhysicalExpensifyCard(Number(lastFourDigits), cardID);
    }, [lastFourDigits, cardID, translate]);

    if (_.isEmpty(physicalCard)) {
        return <NotFoundPage />;
    }

    return (
        <IllustratedHeaderPageLayout
            title={translate('activateCardPage.activateCard')}
            onBackButtonPress={() => Navigation.navigate(ROUTES.SETTINGS_WALLET_DOMAINCARD.getRoute(domain))}
            backgroundColor={theme.PAGE_BACKGROUND_COLORS[SCREENS.SETTINGS.PREFERENCES]}
            illustration={LottieAnimations.Magician}
            scrollViewContainerStyles={[styles.mnh100]}
            childrenContainerStyles={[styles.flex1]}
        >
            <Text style={[styles.mh5, styles.textHeadline]}>{translate('activateCardPage.pleaseEnterLastFour')}</Text>
            <View style={[styles.mh5, {minHeight: MAGIC_INPUT_MIN_HEIGHT}]}>
                <MagicCodeInput
                    isDisableKeyboard
                    autoComplete="off"
                    maxLength={LAST_FOUR_DIGITS_LENGTH}
                    name="activateCardCode"
                    value={lastFourDigits}
                    lastPressedDigit={lastPressedDigit}
                    onChangeText={onCodeInput}
                    onFulfill={submitAndNavigateToNextPage}
                    errorText={formError || cardError}
                    ref={activateCardCodeInputRef}
                />
            </View>
            <View style={[styles.w100, styles.justifyContentEnd, styles.pageWrapper, styles.pv0]}>
                {DeviceCapabilities.canUseTouchScreen() && <BigNumberPad numberPressed={updateLastPressedDigit} />}
            </View>
            <Button
                success
                isDisabled={isOffline}
                isLoading={physicalCard.isLoading}
                medium={isExtraSmallScreenHeight}
                style={[styles.w100, styles.p5, styles.mtAuto]}
                onPress={submitAndNavigateToNextPage}
                pressOnEnter
                text={translate('activateCardPage.activatePhysicalCard')}
            />
        </IllustratedHeaderPageLayout>
    );
}

ActivatePhysicalCardPage.propTypes = propTypes;
ActivatePhysicalCardPage.defaultProps = defaultProps;
ActivatePhysicalCardPage.displayName = 'ActivatePhysicalCardPage';

export default withOnyx({
    cardList: {
        key: ONYXKEYS.CARD_LIST,
    },
})(ActivatePhysicalCardPage);
