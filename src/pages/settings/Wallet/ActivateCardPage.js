import React, {useRef, useCallback, useState, useEffect} from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import lodashGet from 'lodash/get';
import {isUndefined} from 'lodash';
import Text from '../../../components/Text';
import Navigation from '../../../libs/Navigation/Navigation';
import styles from '../../../styles/styles';
import MagicCodeInput from '../../../components/MagicCodeInput';
import * as DeviceCapabilities from '../../../libs/DeviceCapabilities';
import * as ErrorUtils from '../../../libs/ErrorUtils';
import * as CardSettings from '../../../libs/actions/CardSettings';
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
import assignedCardPropTypes from './assignedCardPropTypes';

const propTypes = {
    /* Onyx Props */
    /** The details about the Expensify cards */
    // cardList: PropTypes.objectOf(cardListPropTypes),
    cardList: PropTypes.shape({
        isLoading: PropTypes.bool,
        [PropTypes.string]: PropTypes.objectOf(assignedCardPropTypes),
        [PropTypes.string]: PropTypes.shape({
            // eslint-disable-next-line react/forbid-prop-types
            errors: PropTypes.object,
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
    cardList: {},
};

const ACTIVATE_CARD_CODE_DESIRED_LENGTH = 4;
const CARD_ACTIVATED_STATE = 3;

function ActivateCardPage({
    cardList,
    route: {
        params: {domain},
    },
}) {
    const {isExtraSmallScreenHeight} = useWindowDimensions();
    const {translate} = useLocalize();

    const [formError, setFormError] = useState('');
    const [activateCardCode, setActivateCardCode] = useState('');
    const [lastPressedDigit, setLastPressedDigit] = useState('');

    const cardID = lodashGet(cardList, 'physical.cardID', 0);
    const activateCardCodeInputRef = useRef(null);

    /**
     * If state of the card is CARD_ACTIVATED_STATE, navigate to card details screen.
     */
    useEffect(() => {
        if (cardList.isLoading) {
            return;
        }

        if (!cardList.isLoading && lodashGet(cardList, 'physical.state', 0) === CARD_ACTIVATED_STATE) {
            Navigation.navigate(ROUTES.getWalletCardRoute(domain));
        }
    }, [cardList, domain]);

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

    /**
     * Update lastPressedDigit with value that was pressed on BigNumberPad.
     *
     * NOTE: If the same digit is pressed twice in a row, append it to the end of the string
     * so that useEffect inside MagicCodeInput will be triggered by artificial change of the value.
     *
     * @param {String} key
     */
    const updateLastPressedDigit = useCallback(
        (key) => {
            if (lastPressedDigit === key) {
                setLastPressedDigit(lastPressedDigit + key);
            } else {
                setLastPressedDigit(key);
            }
        },
        [lastPressedDigit],
    );

    /**
     * Handle card activation code input
     *
     * @param {String} text
     */
    const onCodeInput = (text) => {
        setFormError('');
        setActivateCardCode(text);
    };

    const submitAndNavigateToNextPage = useCallback(() => {
        activateCardCodeInputRef.current.blur();
        CardSettings.clearCardListErrors(cardID);
        CardSettings.activatePhysicalExpensifyCard(Number(activateCardCode), cardID);
    }, [activateCardCode, cardID]);

    return (
        <IllustratedHeaderPageLayout
            title={translate('activateCardPage.activateCard')}
            onBackButtonPress={() => Navigation.goBack()}
            backgroundColor={themeColors.PAGE_BACKGROUND_COLORS[SCREENS.SETTINGS.PREFERENCES]}
            illustration={LottieAnimations.Magician}
        >
            <Text style={[styles.mh5, styles.textHeadline]}>{translate('activateCardPage.pleaseEnterLastFour')}</Text>
            <View style={[styles.mh5]}>
                <MagicCodeInput
                    disableKeyboard
                    autoComplete="off"
                    maxLength={ACTIVATE_CARD_CODE_DESIRED_LENGTH}
                    name="activateCardCode"
                    value={activateCardCode}
                    lastPressedDigit={lastPressedDigit}
                    onChangeText={onCodeInput}
                    errorText={formError}
                    ref={activateCardCodeInputRef}
                    shouldSubmitOnComplete={false}
                />
            </View>
            <View style={[styles.w100, styles.justifyContentEnd, styles.pageWrapper]}>
                {DeviceCapabilities.canUseTouchScreen() ? <BigNumberPad numberPressed={updateLastPressedDigit} /> : null}
                <Button
                    success
                    isLoading={cardList.isLoading}
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

ActivateCardPage.propTypes = propTypes;
ActivateCardPage.defaultProps = defaultProps;
ActivateCardPage.displayName = 'ActivateCardPage';

export default withOnyx({
    cardList: {
        key: ONYXKEYS.CARD_LIST,
    },
})(ActivateCardPage);
