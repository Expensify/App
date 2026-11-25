import Button from '@components/Button';
import ButtonDisabledWhenOffline from '@components/Button/composed/ButtonDisabledWhenOffline';
import IllustratedHeaderPageLayout from '@components/IllustratedHeaderPageLayout';
import LottieAnimations from '@components/LottieAnimations';
import Text from '@components/Text';
import ValidateCodeInput from '@components/ValidateCodeInput';
import type {ValidateCodeInputHandle} from '@components/ValidateCodeInput';

import useLocalize from '@hooks/useLocalize';
import useNonPersonalCardList from '@hooks/useNonPersonalCardList';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import {activatePhysicalExpensifyCard, clearCardListErrors} from '@libs/actions/Card';
import {getLatestErrorMessage} from '@libs/ErrorUtils';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';

import NotFoundPage from '@pages/ErrorPage/NotFoundPage';

import CONST from '@src/CONST';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import type {Route} from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type {CardList} from '@src/types/onyx';
import {getEmptyObject, isEmptyObject} from '@src/types/utils/EmptyObject';

import React, {useEffect, useRef, useState} from 'react';
import {View} from 'react-native';

type ActivatePhysicalCardPageBaseProps = {
    cardID?: string;
    navigateBackTo?: Route;

    /** The card details page the flow returns to once the card is activated */
    cardDetailsPath?: Route;
};

const LAST_FOUR_DIGITS_LENGTH = 4;

/**
 * DEMO ONLY: when true, any four digits skip the activation API and go straight to the activation success screen. The card
 * stays inactive, so the flow can be shown again from the Home activate callout. Set to false before this ships.
 */
const IS_ACTIVATION_DEMO_ENABLED = true;

function ActivatePhysicalCardPageBase({cardID = '', navigateBackTo, cardDetailsPath}: ActivatePhysicalCardPageBaseProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {isExtraSmallScreenHeight} = useResponsiveLayout();
    const {translate} = useLocalize();
    const cardList = useNonPersonalCardList() ?? getEmptyObject<CardList>();

    const [formError, setFormError] = useState('');
    const [lastFourDigits, setLastFourDigits] = useState('');
    const [canShowError, setCanShowError] = useState<boolean>(false);

    const inactiveCard = cardList?.[cardID];
    const cardError = getLatestErrorMessage(inactiveCard ?? {});

    const activateCardCodeInputRef = useRef<ValidateCodeInputHandle>(null);
    const hasHandledActiveCardRef = useRef(false);

    // Only a card activated from this screen shows the success screen. One that is already active goes straight to its details.
    const hasSubmittedActivationRef = useRef(false);

    // Opened from the Home activate item, the screen under this one is Home itself rather than the card details, so the card
    // details suffix is added here. The success screen can only open on top of a card details path.
    const cardDetailsSuffix = DYNAMIC_ROUTES.WALLET_DOMAIN_CARD.getRoute(cardID);
    const cardDetailsRoute = cardDetailsPath?.endsWith(cardDetailsSuffix) ? cardDetailsPath : createDynamicRoute(cardDetailsSuffix, cardDetailsPath ?? ROUTES.SETTINGS_WALLET);

    /** Replaces this screen with the activation success screen, which leads on to the card details */
    const goToActivationSuccess = () => {
        Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.WALLET_CARD_ACTIVATION_SUCCESS.getRoute(cardID), cardDetailsRoute), {forceReplace: true});
    };

    /**
     * Once the card's state is CONST.EXPENSIFY_CARD.STATE.OPEN, go to the activation success screen.
     */
    useEffect(() => {
        if (inactiveCard?.state !== CONST.EXPENSIFY_CARD.STATE.OPEN || inactiveCard?.isLoading || hasHandledActiveCardRef.current) {
            return;
        }
        hasHandledActiveCardRef.current = true;

        if (!hasSubmittedActivationRef.current) {
            // Collapse the activate flow back onto the existing card route instead of pushing a new one, so the user is not left
            // with a duplicate card details screen and a stale route to back through.
            Navigation.goBack(cardDetailsRoute, {compareParams: false});
            return;
        }

        goToActivationSuccess();
        // eslint-disable-next-line react-hooks/exhaustive-deps -- goToActivationSuccess and cardDetailsRoute only depend on cardID and cardDetailsPath, which are listed
    }, [cardID, cardList, inactiveCard?.isLoading, inactiveCard?.state, cardDetailsPath]);

    useEffect(() => {
        if (!inactiveCard?.cardID) {
            return;
        }
        clearCardListErrors(inactiveCard?.cardID);
    }, [inactiveCard?.cardID]);

    /**
     * Handle card activation code input
     */
    const onCodeInput = (text: string) => {
        setFormError('');

        if (cardError && inactiveCard?.cardID) {
            clearCardListErrors(inactiveCard?.cardID);
        }

        setLastFourDigits(text);
    };

    const submitAndNavigateToNextPage = () => {
        setCanShowError(true);
        activateCardCodeInputRef.current?.blur();

        if (lastFourDigits.replace(CONST.VALIDATE_CODE_EMPTY_CHAR, '').length !== LAST_FOUR_DIGITS_LENGTH) {
            setFormError(translate('activateCardPage.error.thatDidNotMatch'));
            return;
        }
        if (inactiveCard?.cardID === undefined) {
            return;
        }

        if (IS_ACTIVATION_DEMO_ENABLED) {
            goToActivationSuccess();
            return;
        }

        hasSubmittedActivationRef.current = true;
        activatePhysicalExpensifyCard(lastFourDigits, inactiveCard?.cardID);
    };

    if (isEmptyObject(inactiveCard)) {
        return <NotFoundPage />;
    }

    return (
        <IllustratedHeaderPageLayout
            title={translate('activateCardPage.activateCard')}
            onBackButtonPress={() => Navigation.goBack(navigateBackTo ?? cardDetailsPath ?? createDynamicRoute(DYNAMIC_ROUTES.WALLET_DOMAIN_CARD.getRoute(cardID), ROUTES.SETTINGS_WALLET))}
            backgroundColor={theme.PAGE_THEMES[SCREENS.SETTINGS.PREFERENCES.ROOT].backgroundColor}
            illustration={LottieAnimations.Magician}
            scrollViewContainerStyles={[styles.mnh100]}
            childrenContainerStyles={[styles.flex1]}
            testID="ActivatePhysicalCardPageBase"
            shouldShowOfflineIndicatorInWideScreen
        >
            <Text style={[styles.mh5, styles.textHeadline]}>{translate('activateCardPage.pleaseEnterLastFour')}</Text>
            <View style={[styles.mh5, styles.mt5]}>
                <ValidateCodeInput
                    autoComplete="off"
                    maxLength={LAST_FOUR_DIGITS_LENGTH}
                    name="activateCardCode"
                    value={lastFourDigits}
                    onChangeText={onCodeInput}
                    onFulfill={submitAndNavigateToNextPage}
                    errorText={canShowError ? formError || cardError : ''}
                    ref={activateCardCodeInputRef}
                />
            </View>
            <ButtonDisabledWhenOffline
                sentryLabel={CONST.SENTRY_LABEL.EXPENSIFY_CARD_PAGE.ACTIVATE_PHYSICAL_CARD_SUBMIT}
                variant={CONST.BUTTON_VARIANT.SUCCESS}
                isLoading={inactiveCard?.isLoading}
                size={isExtraSmallScreenHeight ? CONST.BUTTON_SIZE.MEDIUM : CONST.BUTTON_SIZE.LARGE}
                style={[styles.w100, styles.p5, styles.mtAuto]}
                onPress={submitAndNavigateToNextPage}
            >
                <Button.KeyboardShortcut />
                <Button.Text>{translate('activateCardPage.activatePhysicalCard')}</Button.Text>
            </ButtonDisabledWhenOffline>
        </IllustratedHeaderPageLayout>
    );
}

export default ActivatePhysicalCardPageBase;
