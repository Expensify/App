import React, {useRef, useCallback, useState, useEffect} from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import lodashGet from 'lodash/get';
import {isUndefined} from 'lodash';
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

    const activateCardCodeInputRef = useRef(null);

    /**
     * If state of the card is CONST.CARD_STATE.OPEN, navigate to card details screen.
     */
    useEffect(() => {
        if (cardList[cardID].isLoading || lodashGet(cardList, `${cardID}.state`, 0) !== CONST.CARD_STATE.OPEN) {
            return;
        }
        Navigation.navigate(ROUTES.SETTINGS_WALLET_DOMAINCARDS.getRoute(domain));
    }, [cardID, cardList, domain]);

    /**
     * Set form error if there is one for cardID in onyx
     */
    useEffect(() => {
        if (isUndefined(lodashGet(cardList[cardID], 'errors', undefined))) {
            setFormError('');
        } else {
            setFormError(ErrorUtils.getLatestErrorMessage(cardList[cardID]));
        }
    }, [cardList, cardID]);

    useEffect(() => {
        return () => {
            CardSettings.clearCardListErrors(cardID);
        };
    }, [cardID]);

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
        setLastFourDigits(text);
    };

    const submitAndNavigateToNextPage = useCallback(() => {
        if (lastFourDigits.replace(CONST.MAGIC_CODE_EMPTY_CHAR, '').length !== LAST_FOUR_DIGITS_LENGTH) {
            setFormError(translate('activateCardPage.error.notEnoughDigits'));
            return;
        }

        activateCardCodeInputRef.current.blur();
        CardSettings.activatePhysicalExpensifyCard(Number(lastFourDigits), cardID);
    }, [lastFourDigits, cardID]);

    return (
        <IllustratedHeaderPageLayout
            title={translate('activateCardPage.activateCard')}
            onBackButtonPress={() => Navigation.navigate(ROUTES.SETTINGS_WALLET_DOMAINCARDS.getRoute(domain))}
            backgroundColor={themeColors.PAGE_BACKGROUND_COLORS[SCREENS.SETTINGS.PREFERENCES]}
            illustration={LottieAnimations.Magician}
        >
            <Text style={[styles.mh5, styles.textHeadline]}>{translate('activateCardPage.pleaseEnterLastFour')}</Text>
            <View style={[styles.mh5]}>
                <MagicCodeInput
                    isDisableKeyboard
                    autoComplete="off"
                    maxLength={LAST_FOUR_DIGITS_LENGTH}
                    name="activateCardCode"
                    value={lastFourDigits}
                    lastPressedDigit={lastPressedDigit}
                    onChangeText={onCodeInput}
                    errorText={formError}
                    ref={activateCardCodeInputRef}
                    shouldSubmitOnComplete={false}
                />
            </View>
            <View style={[styles.w100, styles.justifyContentEnd, styles.pageWrapper]}>
                {DeviceCapabilities.canUseTouchScreen() && <BigNumberPad numberPressed={updateLastPressedDigit} />}
                <Button
                    success
                    isDisabled={isOffline}
                    isLoading={cardList[cardID].isLoading}
                    medium={isExtraSmallScreenHeight}
                    style={[styles.w100, styles.mt5]}
                    onPress={submitAndNavigateToNextPage}
                    pressOnEnter
                    text={translate('activateCardPage.activatePhysicalCard')}
                />
            </View>
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
