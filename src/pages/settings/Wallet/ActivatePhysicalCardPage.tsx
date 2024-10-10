import React, {useCallback, useEffect, useRef, useState} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import BigNumberPad from '@components/BigNumberPad';
import Button from '@components/Button';
import IllustratedHeaderPageLayout from '@components/IllustratedHeaderPageLayout';
import LottieAnimations from '@components/LottieAnimations';
import MagicCodeInput from '@components/MagicCodeInput';
import type {MagicCodeInputHandle} from '@components/MagicCodeInput';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import * as DeviceCapabilities from '@libs/DeviceCapabilities';
import * as ErrorUtils from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import NotFoundPage from '@pages/ErrorPage/NotFoundPage';
import * as CardSettings from '@userActions/Card';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type {Card} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

type ActivatePhysicalCardPageOnyxProps = {
    /** Card list propTypes */
    cardList: OnyxEntry<Record<string, Card>>;
};

type ActivatePhysicalCardPageProps = ActivatePhysicalCardPageOnyxProps & PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.WALLET.CARD_ACTIVATE>;

const LAST_FOUR_DIGITS_LENGTH = 4;
const MAGIC_INPUT_MIN_HEIGHT = 86;

function ActivatePhysicalCardPage({
    cardList,
    route: {
        params: {cardID = ''},
    },
}: ActivatePhysicalCardPageProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {isExtraSmallScreenHeight} = useResponsiveLayout();
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();

    const [formError, setFormError] = useState('');
    const [lastFourDigits, setLastFourDigits] = useState('');
    const [lastPressedDigit, setLastPressedDigit] = useState('');

    const inactiveCard = cardList?.[cardID];
    const cardError = ErrorUtils.getLatestErrorMessage(inactiveCard ?? {});

    const activateCardCodeInputRef = useRef<MagicCodeInputHandle>(null);

    /**
     * If state of the card is CONST.EXPENSIFY_CARD.STATE.OPEN, navigate to card details screen.
     */
    useEffect(() => {
        if (inactiveCard?.state !== CONST.EXPENSIFY_CARD.STATE.OPEN || inactiveCard?.isLoading) {
            return;
        }

        Navigation.navigate(ROUTES.SETTINGS_WALLET_DOMAINCARD.getRoute(cardID));
    }, [cardID, cardList, inactiveCard?.isLoading, inactiveCard?.state]);

    useEffect(
        () => () => {
            if (!inactiveCard?.cardID) {
                return;
            }
            CardSettings.clearCardListErrors(inactiveCard?.cardID);
        },
        [inactiveCard?.cardID],
    );

    /**
     * Update lastPressedDigit with value that was pressed on BigNumberPad.
     *
     * NOTE: If the same digit is pressed twice in a row, append it to the end of the string
     * so that useEffect inside MagicCodeInput will be triggered by artificial change of the value.
     */
    const updateLastPressedDigit = useCallback((key: string) => setLastPressedDigit(lastPressedDigit === key ? lastPressedDigit + key : key), [lastPressedDigit]);

    /**
     * Handle card activation code input
     */
    const onCodeInput = (text: string) => {
        setFormError('');

        if (cardError && inactiveCard?.cardID) {
            CardSettings.clearCardListErrors(inactiveCard?.cardID);
        }

        setLastFourDigits(text);
    };

    const submitAndNavigateToNextPage = useCallback(() => {
        activateCardCodeInputRef.current?.blur();

        if (lastFourDigits.replace(CONST.MAGIC_CODE_EMPTY_CHAR, '').length !== LAST_FOUR_DIGITS_LENGTH) {
            setFormError(translate('activateCardPage.error.thatDidntMatch'));
            return;
        }
        if (inactiveCard?.cardID === undefined) {
            return;
        }

        CardSettings.activatePhysicalExpensifyCard(lastFourDigits, inactiveCard?.cardID);
    }, [lastFourDigits, inactiveCard?.cardID, translate]);

    if (isEmptyObject(inactiveCard)) {
        return <NotFoundPage />;
    }

    return (
        <IllustratedHeaderPageLayout
            title={translate('activateCardPage.activateCard')}
            onBackButtonPress={() => Navigation.goBack(ROUTES.SETTINGS_WALLET_DOMAINCARD.getRoute(cardID))}
            backgroundColor={theme.PAGE_THEMES[SCREENS.SETTINGS.PREFERENCES.ROOT].backgroundColor}
            illustration={LottieAnimations.Magician}
            scrollViewContainerStyles={[styles.mnh100]}
            childrenContainerStyles={[styles.flex1]}
            testID={ActivatePhysicalCardPage.displayName}
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
                isLoading={inactiveCard?.isLoading}
                medium={isExtraSmallScreenHeight}
                large={!isExtraSmallScreenHeight}
                style={[styles.w100, styles.p5, styles.mtAuto]}
                onPress={submitAndNavigateToNextPage}
                pressOnEnter
                text={translate('activateCardPage.activatePhysicalCard')}
            />
        </IllustratedHeaderPageLayout>
    );
}

ActivatePhysicalCardPage.displayName = 'ActivatePhysicalCardPage';

export default withOnyx<ActivatePhysicalCardPageProps, ActivatePhysicalCardPageOnyxProps>({
    cardList: {
        key: ONYXKEYS.CARD_LIST,
    },
})(ActivatePhysicalCardPage);
