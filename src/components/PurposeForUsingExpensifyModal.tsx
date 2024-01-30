import {useNavigation} from '@react-navigation/native';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {ScrollView, View} from 'react-native';
import type {ValueOf} from 'type-fest';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import * as Report from '@userActions/Report';
import * as Welcome from '@userActions/Welcome';
import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';
import HeaderWithBackButton from './HeaderWithBackButton';
import * as Expensicons from './Icon/Expensicons';
import Lottie from './Lottie';
import LottieAnimations from './LottieAnimations';
import type {MenuItemProps} from './MenuItem';
import MenuItemList from './MenuItemList';
import Modal from './Modal';
import Text from './Text';

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
    [CONST.INTRO_CHOICES.MANAGE_TEAM]:
        "Great! To manage your team's expenses, create a workspace to keep everything contained:\n" +
        '\n' +
        '1. Press your avatar icon\n' +
        '2. Choose Workspaces\n' +
        '3. Choose New Workspace\n' +
        '4. Name your workspace something meaningful (eg, "Galaxy Food Inc.")\n' +
        '\n' +
        'Once you have your workspace set up, you can invite your team to it via the Members pane and connect a business bank account to reimburse them!',
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
    const {isSmallScreenWidth, windowHeight} = useWindowDimensions();
    const navigation = useNavigation();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const theme = useTheme();

    useEffect(() => {
        const navigationState = navigation.getState();
        const routes = navigationState.routes;
        const currentRoute = routes[navigationState.index];
        if (currentRoute && NAVIGATORS.CENTRAL_PANE_NAVIGATOR !== currentRoute.name && currentRoute.name !== SCREENS.HOME) {
            return;
        }

        Welcome.show(routes, () => setIsModalOpen(true));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const closeModal = useCallback(() => {
        Report.dismissEngagementModal();
        setIsModalOpen(false);
    }, []);

    const completeModalAndClose = useCallback((message: string, choice: ValueOf<typeof CONST.INTRO_CHOICES>) => {
        Report.completeEngagementModal(message, choice);
        setIsModalOpen(false);
        Report.navigateToConciergeChat();
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
                    onPress: () => completeModalAndClose(messageCopy[choice], choice),
                    shouldShowRightIcon: true,
                    numberOfLinesTitle: 2,
                };
            }),
        [completeModalAndClose, translate],
    );

    return (
        <Modal
            type={isSmallScreenWidth ? CONST.MODAL.MODAL_TYPE.BOTTOM_DOCKED : CONST.MODAL.MODAL_TYPE.RIGHT_DOCKED}
            isVisible={isModalOpen}
            onClose={closeModal}
            innerContainerStyle={styles.pt0}
            shouldUseCustomBackdrop
        >
            <View style={{maxHeight: windowHeight}}>
                <ScrollView>
                    <View style={StyleUtils.getBackgroundColorStyle(theme.PAGE_THEMES[SCREENS.SETTINGS.WORKSPACES].backgroundColor)}>
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
                            onCloseButtonPress={closeModal}
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
        </Modal>
    );
}

PurposeForUsingExpensifyModal.displayName = 'PurposeForUsingExpensifyModal';

export default PurposeForUsingExpensifyModal;
