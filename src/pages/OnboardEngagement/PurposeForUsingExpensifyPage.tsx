import React, {useCallback, useMemo} from 'react';
import {ScrollView, View} from 'react-native';
import type {ValueOf} from 'type-fest';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Expensicons from '@components/Icon/Expensicons';
import Lottie from '@components/Lottie';
import LottieAnimations from '@components/LottieAnimations';
import type {MenuItemProps} from '@components/MenuItem';
import MenuItemList from '@components/MenuItemList';
import ScreenWrapper from '@components/ScreenWrapper';
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
        'Great! To track your expenses, I suggest you create a workspace to keep everything contained:\n' +
        '\n' +
        '1. Press your avatar icon\n' +
        '2. Choose Workspaces\n' +
        '3. Choose New Workspace\n' +
        '4. Name your workspace something meaningful (eg, "My Business Expenses")\n' +
        '\n' +
        'Once you have your workspace set up, you can add expenses to it as follows:\n' +
        '\n' +
        '1. Choose My Business Expenses (or whatever you named it) in the list of chat rooms\n' +
        '2. Choose the + button in the chat compose window\n' +
        '3. Choose Request money\n' +
        "4. Choose what kind of expense you'd like to log, whether a manual expense, scanned receipt, or tracked distance.\n" +
        '\n' +
        "That'll be stored in your My Business Expenses room for your later access. Thanks for asking, and let me know how it goes!",
    [CONST.INTRO_CHOICES.SUBMIT]:
        'Hi there, to submit expenses for reimbursement, please:\n' +
        '\n' +
        '1. Press the big green + button\n' +
        '2. Choose Request money\n' +
        '3. Indicate how much to request, either manually, by scanning a receipt, or by tracking distance\n' +
        '4. Enter the email address or phone number of your boss\n' +
        '\n' +
        "And we'll take it from there to get you paid back. Please give it a shot and let me know how it goes!",
    [CONST.INTRO_CHOICES.MANAGE_TEAM]: '',
    [CONST.INTRO_CHOICES.CHAT_SPLIT]:
        'Hi there, to split an expense such as with a friend, please:\n' +
        '\n' +
        '1. Press the big green + button\n' +
        '2. Choose *Request money*\n' +
        '3. Indicate how much was spent, either manually, by scanning a receipt, or by tracking distance\n' +
        '4. Enter the email address or phone number of your friend\n' +
        '5. Press *Split* next to their name\n' +
        '6. Repeat as many times as you like for each of your friends\n' +
        '7. Press *Add to split* when done adding friends\n' +
        '8. Press Split to split the bill\n' +
        '\n' +
        "This will send a money request to each of your friends for however much they owe you, and we'll take care of getting you paid back. Thanks for asking, and let me know how it goes!",
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
        Report.navigateToConciergeChat(false, true);
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
