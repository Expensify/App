import React, {useCallback, useEffect, useRef, useState} from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import IllustratedHeaderPageLayout from '@components/IllustratedHeaderPageLayout';
import LottieAnimations from '@components/LottieAnimations';
import MagicCodeInput from '@components/MagicCodeInput';
import type {MagicCodeInputHandle} from '@components/MagicCodeInput';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {activatePhysicalExpensifyCard, clearCardListErrors} from '@libs/actions/Card';
import {filterPersonalCards} from '@libs/CardUtils';
import {getLatestErrorMessage} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import NotFoundPage from '@pages/ErrorPage/NotFoundPage';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Route} from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type {CardList} from '@src/types/onyx';
import {getEmptyObject, isEmptyObject} from '@src/types/utils/EmptyObject';

type ActivatePhysicalCardPageBaseProps = {
    cardID?: string;
    navigateBackTo?: Route;
};

const LAST_FOUR_DIGITS_LENGTH = 4;

function ActivatePhysicalCardPageBase({cardID = '', navigateBackTo}: ActivatePhysicalCardPageBaseProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {isExtraSmallScreenHeight} = useResponsiveLayout();
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const [cardList = getEmptyObject<CardList>()] = useOnyx(ONYXKEYS.CARD_LIST, {selector: filterPersonalCards, canBeMissing: true});

    const [formError, setFormError] = useState('');
    const [lastFourDigits, setLastFourDigits] = useState('');
    const [canShowError, setCanShowError] = useState<boolean>(false);

    const inactiveCard = cardList?.[cardID];
    const cardError = getLatestErrorMessage(inactiveCard ?? {});

    const activateCardCodeInputRef = useRef<MagicCodeInputHandle>(null);

    /**
     * If state of the card is CONST.EXPENSIFY_CARD.STATE.OPEN, navigate to card details screen.
     */
    useEffect(() => {
        if (inactiveCard?.state !== CONST.EXPENSIFY_CARD.STATE.OPEN || inactiveCard?.isLoading) {
            return;
        }

        Navigation.navigate(ROUTES.SETTINGS_WALLET_DOMAIN_CARD.getRoute(cardID));
    }, [cardID, cardList, inactiveCard?.isLoading, inactiveCard?.state]);

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
            onBackButtonPress={() => Navigation.goBack(navigateBackTo ?? ROUTES.SETTINGS_WALLET_DOMAIN_CARD.getRoute(cardID))}
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
