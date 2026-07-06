import Button from '@components/Button';
import IllustratedHeaderPageLayout from '@components/IllustratedHeaderPageLayout';
import LottieAnimations from '@components/LottieAnimations';
import MagicCodeInput from '@components/MagicCodeInput';
import type {MagicCodeInputHandle} from '@components/MagicCodeInput';
import Text from '@components/Text';

import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useNonPersonalCardList from '@hooks/useNonPersonalCardList';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import {activatePhysicalExpensifyCard, clearCardListErrors} from '@libs/actions/Card';
import {getLatestErrorMessage} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';

import NotFoundPage from '@pages/ErrorPage/NotFoundPage';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {Route} from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type {CardList} from '@src/types/onyx';
import {getEmptyObject, isEmptyObject} from '@src/types/utils/EmptyObject';

import React, {useCallback, useEffect, useRef, useState} from 'react';
import {View} from 'react-native';

type ActivatePhysicalCardPageBaseProps = {
    cardID?: string;
    navigateBackTo?: Route;

    /** Whether the flow was launched from the top-level DomainCard route (deep-linked from OldDot) rather than the Settings wallet card route */
    isFromDomainCardDetail?: boolean;
};

const LAST_FOUR_DIGITS_LENGTH = 4;

function ActivatePhysicalCardPageBase({cardID = '', navigateBackTo, isFromDomainCardDetail = false}: ActivatePhysicalCardPageBaseProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {isExtraSmallScreenHeight} = useResponsiveLayout();
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const cardList = useNonPersonalCardList() ?? getEmptyObject<CardList>();

    const [formError, setFormError] = useState('');
    const [lastFourDigits, setLastFourDigits] = useState('');
    const [canShowError, setCanShowError] = useState<boolean>(false);

    const inactiveCard = cardList?.[cardID];
    const cardError = getLatestErrorMessage(inactiveCard ?? {});

    const activateCardCodeInputRef = useRef<MagicCodeInputHandle>(null);

    /**
     * If state of the card is CONST.EXPENSIFY_CARD.STATE.OPEN, return to the card details screen.
     */
    useEffect(() => {
        if (inactiveCard?.state !== CONST.EXPENSIFY_CARD.STATE.OPEN || inactiveCard?.isLoading) {
            return;
        }

        // Collapse the activate flow back onto the existing card route instead of pushing a new one, so the user is not left
        // with a duplicate card details screen and a stale route to back through.
        const cardDetailRoute = isFromDomainCardDetail ? ROUTES.SETTINGS_DOMAIN_CARD_DETAIL.getRoute(cardID) : ROUTES.SETTINGS_WALLET_DOMAIN_CARD.getRoute(cardID);
        Navigation.goBack(cardDetailRoute, {compareParams: false});
    }, [cardID, cardList, inactiveCard?.isLoading, inactiveCard?.state, isFromDomainCardDetail]);

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

    const submitAndNavigateToNextPage = useCallback(() => {
        setCanShowError(true);
        activateCardCodeInputRef.current?.blur();

        if (lastFourDigits.replace(CONST.MAGIC_CODE_EMPTY_CHAR, '').length !== LAST_FOUR_DIGITS_LENGTH) {
            setFormError(translate('activateCardPage.error.thatDidNotMatch'));
            return;
        }
        if (inactiveCard?.cardID === undefined) {
            return;
        }

        activatePhysicalExpensifyCard(lastFourDigits, inactiveCard?.cardID);
    }, [lastFourDigits, inactiveCard?.cardID, translate]);

    if (isEmptyObject(inactiveCard)) {
        return <NotFoundPage />;
    }

    return (
        <IllustratedHeaderPageLayout
            title={translate('activateCardPage.activateCard')}
            onBackButtonPress={() =>
                Navigation.goBack(navigateBackTo ?? (isFromDomainCardDetail ? ROUTES.SETTINGS_DOMAIN_CARD_DETAIL.getRoute(cardID) : ROUTES.SETTINGS_WALLET_DOMAIN_CARD.getRoute(cardID)))
            }
            backgroundColor={theme.PAGE_THEMES[SCREENS.SETTINGS.PREFERENCES.ROOT].backgroundColor}
            illustration={LottieAnimations.Magician}
            scrollViewContainerStyles={[styles.mnh100]}
            childrenContainerStyles={[styles.flex1]}
            testID="ActivatePhysicalCardPageBase"
            shouldShowOfflineIndicatorInWideScreen
        >
            <Text style={[styles.mh5, styles.textHeadline]}>{translate('activateCardPage.pleaseEnterLastFour')}</Text>
            <View style={[styles.mh5, styles.mt5]}>
                <MagicCodeInput
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

export default ActivatePhysicalCardPageBase;
