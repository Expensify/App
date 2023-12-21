import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import React, {useCallback, useEffect, useState} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import compose from '@libs/compose';
import * as Report from '@userActions/Report';
import * as Welcome from '@userActions/Welcome';
import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import HeaderWithBackButton from './HeaderWithBackButton';
import * as Expensicons from './Icon/Expensicons';
import Lottie from './Lottie';
import LottieAnimations from './LottieAnimations';
import MenuItemList from './MenuItemList';
import Modal from './Modal';
import Text from './Text';
import withNavigation from './withNavigation';
import withWindowDimensions, {windowDimensionsPropTypes} from './withWindowDimensions';

const propTypes = {
    /** Session info for the currently logged in user. */
    session: PropTypes.shape({
        /** Currently logged in user accountID */
        accountID: PropTypes.number,
    }),

    ...windowDimensionsPropTypes,
};

const defaultProps = {
    session: {},
};

function PurposeForUsingExpensifyModal(props) {
    const {translate} = useLocalize();
    const StyleUtils = useStyleUtils();
    const styles = useThemeStyles();
    const {isSmallScreenWidth} = useWindowDimensions();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const theme = useTheme();

    useEffect(() => {
        const navigationState = props.navigation.getState();
        const routes = lodashGet(navigationState, 'routes', []);
        const currentRoute = routes[navigationState.index];
        if (currentRoute && ![NAVIGATORS.CENTRAL_PANE_NAVIGATOR, SCREENS.HOME].includes(currentRoute.name)) {
            return;
        }
        if (lodashGet(props.demoInfo, 'money2020.isBeginningDemo', false)) {
            return;
        }
        Welcome.show({routes, showEngagementModal: () => setIsModalOpen(true)});
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // This is not translated because it is a message coming from concierge, which only supports english
    const messageCopy = {
        track:
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
        submit:
            'Hi there, to submit expenses for reimbursement, please:\n' +
            '\n' +
            '1. Press the big green + button\n' +
            '2. Choose Request money\n' +
            '3. Indicate how much to request, either manually, by scanning a receipt, or by tracking distance\n' +
            '4. Enter the email address or phone number of your boss\n' +
            '\n' +
            "And we'll take it from there to get you paid back. Please give it a shot and let me know how it goes!",
        business:
            "Great! To manage your team's expenses, create a workspace to keep everything contained:\n" +
            '\n' +
            '1. Press your avatar icon\n' +
            '2. Choose Workspaces\n' +
            '3. Choose New Workspace\n' +
            '4. Name your workspace something meaningful (eg, "Galaxy Food Inc.")\n' +
            '\n' +
            'Once you have your workspace set up, you can invite your team to it via the Members pane and connect a business bank account to reimburse them!',
        chatSplit:
            'Hi there, to split an expense such as with a friend, please:\n' +
            '\n' +
            'Press the big green + button\n' +
            'Choose *Request money*\n' +
            'Indicate how much was spent, either manually, by scanning a receipt, or by tracking distance\n' +
            'Enter the email address or phone number of your friend\n' +
            'Press *Split* next to their name\n' +
            'Repeat as many times as you like for each of your friends\n' +
            'Press *Add to split* when done adding friends\n' +
            'Press Split to split the bill\n' +
            '\n' +
            "This will send a money request to each of your friends for however much they owe you, and we'll take care of getting you paid back. Thanks for asking, and let me know how it goes!",
    };

    const closeModal = useCallback(() => {
        Report.dismissEngagementModal();
        setIsModalOpen(false);
    }, []);

    const completeModalAndClose = (message, choice) => {
        Report.completeEngagementModal(message, choice);
        setIsModalOpen(false);
        Report.navigateToConciergeChat();
    };

    const menuItems = [
        {
            key: 'purposeForExpensify.track',
            title: translate('purposeForExpensify.track'),
            icon: Expensicons.ReceiptSearch,
            iconRight: Expensicons.ArrowRight,
            onPress: () => completeModalAndClose(messageCopy.track, 'trackNewDot'),
            shouldShowRightIcon: true,
            numberOfLinesTitle: 2,
        },
        {
            key: 'purposeForExpensify.submit',
            title: translate('purposeForExpensify.submit'),
            icon: Expensicons.Scan,
            iconRight: Expensicons.ArrowRight,
            onPress: () => completeModalAndClose(messageCopy.submit, 'submitNewDot'),
            shouldShowRightIcon: true,
            numberOfLinesTitle: 2,
        },
        {
            key: 'purposeForExpensify.business',
            title: translate('purposeForExpensify.business'),
            icon: Expensicons.MoneyBag,
            iconRight: Expensicons.ArrowRight,
            onPress: () => completeModalAndClose(messageCopy.business, 'businessNewDot'),
            shouldShowRightIcon: true,
            numberOfLinesTitle: 2,
        },
        {
            key: 'purposeForExpensify.chatSplit',
            title: translate('purposeForExpensify.chatSplit'),
            icon: Expensicons.Briefcase,
            iconRight: Expensicons.ArrowRight,
            onPress: () => completeModalAndClose(messageCopy.chatSplit, 'chatSplitNewDot'),
            shouldShowRightIcon: true,
            numberOfLinesTitle: 2,
        },
    ];

    return (
        <Modal
            type={isSmallScreenWidth ? CONST.MODAL.MODAL_TYPE.BOTTOM_DOCKED : CONST.MODAL.MODAL_TYPE.RIGHT_DOCKED}
            isVisible={isModalOpen}
            onClose={closeModal}
            innerContainerStyle={styles.pt0}
            shouldUseCustomBackdrop
        >
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
                <Text style={styles.baseFontStyle}>{translate('purposeForExpensify.welcomeSubtitle')}</Text>
            </View>
            <MenuItemList
                menuItems={menuItems}
                shouldUseSingleExecution
            />
        </Modal>
    );
}

PurposeForUsingExpensifyModal.propTypes = propTypes;
PurposeForUsingExpensifyModal.defaultProps = defaultProps;
PurposeForUsingExpensifyModal.displayName = 'PurposeForUsingExpensifyModal';

export default compose(
    withWindowDimensions,
    withNavigation,
    withOnyx({
        session: {
            key: ONYXKEYS.SESSION,
        },
    }),
)(PurposeForUsingExpensifyModal);
