import PropTypes from 'prop-types';
import React, {useState, useCallback} from 'react';
import {withOnyx} from 'react-native-onyx';
import useLocalize from '@hooks/useLocalize';
import compose from '@libs/compose';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import useThemeStyles from "@styles/useThemeStyles";
import useTheme from '@styles/themes/useTheme';
import useWindowDimensions from "@hooks/useWindowDimensions";
import {View, StyleSheet} from "react-native";
import LottieAnimations from "./LottieAnimations";
import Text from "./Text";
import * as Report from '../libs/actions/Report';
import MenuItemList from "./MenuItemList";
import withWindowDimensions, {windowDimensionsPropTypes} from './withWindowDimensions';
import Modal from "./Modal";
import * as Expensicons from './Icon/Expensicons';
import Lottie from "@components/Lottie";
import * as Illustrations from '@components/Icon/Illustrations';
import HeaderWithBackButton from "@components/HeaderWithBackButton";
import Image from "@components/Image";
import * as StyleUtils from "@styles/StyleUtils";
import SCREENS from "@src/SCREENS";

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

function PurposeForUsingExpensifyModal() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {isSmallScreenWidth} = useWindowDimensions();
    const [isModalOpen, setIsModalOpen] = useState(true);
    const theme = useTheme();

    // This is not translated because it is a message coming from concierge, which only supports english
    const messageCopy = {
        track: 'Great! To track your expenses, I suggest you create a workspace to keep everything contained:<br />' +
            '<br />' +
            '1. Press your avatar icon<br />' +
            '2. Choose Workspaces<br />' +
            '3. Choose New Workspace<br />' +
            '4. Name your workspace something meaningful (eg, "My Business Expenses")<br />' +
            '<br />' +
            'Once you have your workspace set up, you can add expenses to it as follows:<br />' +
            '<br />' +
            '1. Choose My Business Expenses (or whatever you named it) in the list of chat rooms<br />' +
            '2. Choose the + button in the chat compose window<br />' +
            '3. Choose Request money<br />' +
            '4. Choose what kind of expense you\'d like to log, whether a manual expense, scanned receipt, or tracked distance.<br />' +
            '<br />' +
            'That\'ll be stored in your My Business Expenses room for your later access. Thanks for asking, and let me know how it goes!',
        submit: 'Hi there, to submit expenses for reimbursement, please:<br />' +
            '<br />' +
            '1. Press the big green + button<br />' +
            '2. Choose Request money<br />' +
            '3. Indicate how much to request, either manually, by scanning a receipt, or by tracking distance<br />' +
            '4. Enter the email address or phone number of your boss<br />' +
            '<br />' +
            'And we\'ll take it from there to get you paid back. Please give it a shot and let me know how it goes!',
        business: 'Great! To manage your team\'s expenses, create a workspace to keep everything contained:<br />' +
            '<br />' +
            '1. Press your avatar icon<br />' +
            '2. Choose Workspaces<br />' +
            '3. Choose New Workspace<br />' +
            '4. Name your workspace something meaningful (eg, "Galaxy Food Inc.")<br />' +
            '<br />' +
            'Once you have your workspace set up, you can invite your team to it via the Members pane and connect a business bank account to reimburse them!',
        chatSplit: 'Hi there, to split an expense such as with a friend, please:<br />' +
            '<br />' +
            'Press the big green + button<br />' +
            'Choose *Request money*<br />' +
            'Indicate how much was spent, either manually, by scanning a receipt, or by tracking distance<br />' +
            'Enter the email address or phone number of your friend<br />' +
            'Press *Split* next to their name<br />' +
            'Repeat as many times as you like for each of your friends<br />' +
            'Press *Add to split* when done adding friends<br />' +
            'Press Split to split the bill<br />' +
            '<br />' +
            'This will send a money request to each of your friends for however much they owe you, and we\'ll take care of getting you paid back. Thanks for asking, and let me know how it goes!',
    }

    const closeModal = useCallback(() => {
        setIsModalOpen(false);
    }, []);

    const completeModalAndClose = (message, choice) => {
        Report.completeEngagementModal(message, choice);
        closeModal();
    }

    const menuItems = [
        {
            key: 'purposeForExpensify.track',
            title: translate('purposeForExpensify.track'),
            icon: Expensicons.ReceiptSearch,
            iconRight: Expensicons.ArrowRight,
            onPress: () => completeModalAndClose(messageCopy.track, 'trackNewDot'),
            shouldShowRightIcon: true,
        },
        {
            key: 'purposeForExpensify.submit',
            title: translate('purposeForExpensify.submit'),
            icon: Expensicons.Scan,
            iconRight: Expensicons.ArrowRight,
            onPress: () => completeModalAndClose(messageCopy.submit, 'submitNewDot'),
            shouldShowRightIcon: true,
        },
        {
            key: 'purposeForExpensify.business',
            title: translate('purposeForExpensify.business'),
            icon: Expensicons.MoneyBag,
            iconRight: Expensicons.ArrowRight,
            onPress: () => completeModalAndClose(messageCopy.business, 'businessNewDot'),
            shouldShowRightIcon: true,
        },
        {
            key: 'purposeForExpensify.chatSplit',
            title: translate('purposeForExpensify.chatSplit'),
            icon: Expensicons.Briefcase,
            iconRight: Expensicons.ArrowRight,
            onPress: () => completeModalAndClose(messageCopy.chatSplit, 'chatSplitNewDot'),
            shouldShowRightIcon: true,
        },
    ];

    return (
        <Modal
            type={isSmallScreenWidth ? CONST.MODAL.MODAL_TYPE.BOTTOM_DOCKED : CONST.MODAL.MODAL_TYPE.RIGHT_DOCKED}
            isVisible={isModalOpen}
            fullscreen
            onClose={closeModal}
        >
            <View>
                <View>
                    <Lottie
                        source={LottieAnimations.Hands}
                        style={styles.w100}
                        webStyle={styles.w100}
                        autoPlay
                        loop
                    />
                </View>
                <HeaderWithBackButton
                    shouldShowCloseButton
                    shouldShowBackButton={false}
                    onCloseButtonPress={() => setIsModalOpen(false)}
                    shouldOverlay
                />
                <View style={[styles.w100, styles.ph5, styles.pb5]}>
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
            </View>
        </Modal>
    );
}

PurposeForUsingExpensifyModal.propTypes = propTypes;
PurposeForUsingExpensifyModal.defaultProps = defaultProps;
PurposeForUsingExpensifyModal.displayName = 'AddPaymentMethodMenu';

export default compose(
    withWindowDimensions,
    withOnyx({
        session: {
            key: ONYXKEYS.SESSION,
        },
    }),
)(PurposeForUsingExpensifyModal);
