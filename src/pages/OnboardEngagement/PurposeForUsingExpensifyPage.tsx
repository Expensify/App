import React, {useCallback, useMemo} from 'react';
import {View} from 'react-native';
import type {ValueOf} from 'type-fest';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Expensicons from '@components/Icon/Expensicons';
import Lottie from '@components/Lottie';
import LottieAnimations from '@components/LottieAnimations';
import type {MenuItemProps} from '@components/MenuItem';
import MenuItemList from '@components/MenuItemList';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import Navigation from '@libs/Navigation/Navigation';
import * as Report from '@userActions/Report';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

// This is not translated because it is a message coming from concierge, which only supports english
const messageCopy = {
    [CONST.INTRO_CHOICES.TRACK]:
        "Here's how to start tracking business spend for taxes:\n" +
        '\n' +
        '1. Click the green *+* > *New workspace*.\n' +
        '2. Your new workspace is now active.\n' +
        '3. To update your workspace name, click *Profile* > *Name*.\n' +
        '\n' +
        'Next, start adding expenses to your workspace:\n' +
        '\n' +
        '1. Click the green *+* > *Request money*.\n' +
        '2. Add an expense or scan a receipt.\n' +
        '3. Choose your workspace as the destination.\n' +
        '\n' +
        'Be sure to track all of your expenses in your new workspace to keep everything organized. Let me know how it goes!',
    [CONST.INTRO_CHOICES.SUBMIT]:
        "Here's how to submit expenses for reimbursement:\n" +
        '\n' +
        '1. Click the green *+* > *Request money*.\n' +
        '2. Add an expense or scan a receipt.\n' +
        "3. Enter your reimburser's email or phone number.\n" +
        '\n' +
        "And we'll take it from there to get you paid back. Give it a shot and let me know how it goes!",
    [CONST.INTRO_CHOICES.MANAGE_TEAM]: '',
    [CONST.INTRO_CHOICES.CHAT_SPLIT]:
        "Here's how to split expenses with friends:\n" +
        '\n' +
        '1. Tap the green *+* > *Request money*.\n' +
        '2. Add an expense or scan a receipt.\n' +
        "3. Enter your friend's email or phone number.\n" +
        '4. Tap *Split* next to their contact info.\n' +
        '5. Repeat for any additional friends.\n' +
        "6. Tap *Add to split* when you're done.\n" +
        '7. Review and tap *Split* to send your request(s).\n' +
        '\n' +
        "We'll send a money request to each of your friends and make sure you get paid back. Let me know how it goes!",
};

const menuIcons = {
    [CONST.INTRO_CHOICES.TRACK]: Expensicons.ReceiptSearch,
    [CONST.INTRO_CHOICES.SUBMIT]: Expensicons.Scan,
    [CONST.INTRO_CHOICES.MANAGE_TEAM]: Expensicons.MoneyBag,
    [CONST.INTRO_CHOICES.CHAT_SPLIT]: Expensicons.Briefcase,
};

function PurposeForUsingExpensifyModal() {
    const {translate} = useLocalize();
    const StyleUtils = useStyleUtils();
    const styles = useThemeStyles();
    const {windowHeight} = useWindowDimensions();
    const theme = useTheme();
    const backgroundColorStyle = StyleUtils.getBackgroundColorStyle(theme.PAGE_THEMES[SCREENS.ONBOARD_ENGAGEMENT.ROOT].backgroundColor);
    const appBGColor = StyleUtils.getBackgroundColorStyle(theme.appBG);

    const navigateBack = useCallback(() => {
        Report.dismissEngagementModal();
        Navigation.goBack();
    }, []);

    const completeEngagement = useCallback((message: string, choice: ValueOf<typeof CONST.INTRO_CHOICES>) => {
        if (choice === CONST.INTRO_CHOICES.MANAGE_TEAM) {
            return Navigation.navigate(ROUTES.ONBOARD_MANAGE_EXPENSES);
        }

        Report.completeEngagementModal(message, choice);
        Report.navigateToConciergeChat(true);
    }, []);

    const menuItems: MenuItemProps[] = useMemo(
        () =>
            Object.values(CONST.INTRO_CHOICES).map((choice) => {
                const translationKey = `purposeForExpensify.${choice}` as const;
                return {
                    key: translationKey,
                    title: translate(translationKey),
                    icon: menuIcons[choice],
                    iconRight: Expensicons.ArrowRight,
                    onPress: () => completeEngagement(messageCopy[choice], choice),
                    shouldShowRightIcon: true,
                    numberOfLinesTitle: 2,
                };
            }),
        [completeEngagement, translate],
    );

    return (
        <ScreenWrapper
            style={backgroundColorStyle}
            shouldEnablePickerAvoiding={false}
            includeSafeAreaPaddingBottom={false}
            testID={PurposeForUsingExpensifyModal.displayName}
        >
            <View style={[{maxHeight: windowHeight}, styles.flex1, appBGColor]}>
                <ScrollView>
                    <View style={backgroundColorStyle}>
                        <Lottie
                            source={LottieAnimations.Hands}
                            style={styles.w100}
                            webStyle={styles.w100}
                            autoPlay
                            loop
                        />
                        <HeaderWithBackButton
                            shouldShowCloseButton
                            shouldShowBackButton={false}
                            onCloseButtonPress={navigateBack}
                            shouldOverlay
                            iconFill={theme.iconColorfulBackground}
                        />
                    </View>
                    <View style={[styles.w100, styles.ph5, styles.pv5]}>
                        <Text
                            style={[styles.textHeadline, styles.preWrap, styles.mb2]}
                            numberOfLines={2}
                        >
                            {translate('purposeForExpensify.welcomeMessage')}
                        </Text>
                        <Text>{translate('purposeForExpensify.welcomeSubtitle')}</Text>
                    </View>
                    <MenuItemList
                        menuItems={menuItems}
                        shouldUseSingleExecution
                    />
                </ScrollView>
            </View>
        </ScreenWrapper>
    );
}

PurposeForUsingExpensifyModal.displayName = 'PurposeForUsingExpensifyModal';
export default PurposeForUsingExpensifyModal;
