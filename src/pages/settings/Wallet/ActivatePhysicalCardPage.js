import React, {useRef, useCallback, useState, useEffect} from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import lodashGet from 'lodash/get';
import _ from 'underscore';
import Text from '../../../components/Text';
import Navigation from '../../../libs/Navigation/Navigation';
import styles from '../../../styles/styles';
import MagicCodeInput from '../../../components/MagicCodeInput';
import * as DeviceCapabilities from '../../../libs/DeviceCapabilities';
import * as ErrorUtils from '../../../libs/ErrorUtils';
import * as CardSettings from '../../../libs/actions/Card';
import BigNumberPad from '../../../components/BigNumberPad';
import Button from '../../../components/Button';
import IllustratedHeaderPageLayout from '../../../components/IllustratedHeaderPageLayout';
import themeColors from '../../../styles/themes/default';
import SCREENS from '../../../SCREENS';
import * as LottieAnimations from '../../../components/LottieAnimations';
import useWindowDimensions from '../../../hooks/useWindowDimensions';
import ONYXKEYS from '../../../ONYXKEYS';
import useLocalize from '../../../hooks/useLocalize';
import ROUTES from '../../../ROUTES';
import CONST from '../../../CONST';
import assignedCardPropTypes from './assignedCardPropTypes';
import * as CardUtils from '../../../libs/CardUtils';
import useNetwork from '../../../hooks/useNetwork';
import NotFoundPage from '../../ErrorPage/NotFoundPage';

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
            backgroundColor={themeColors.PAGE_BACKGROUND_COLORS[SCREENS.SETTINGS.PREFERENCES]}
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
