import PropTypes from 'prop-types';
import React, {useState} from 'react';
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

    const menuItems = [
        {
            key: 'purposeForExpensify.track',
            title: translate('purposeForExpensify.track'),
            icon: Expensicons.ReceiptSearch,
            iconRight: Expensicons.ArrowRight,
            onPress: () => {debugger;},
            shouldShowRightIcon: true,
        },
        {
            key: 'purposeForExpensify.submit',
            title: translate('purposeForExpensify.submit'),
            icon: Expensicons.Scan,
            iconRight: Expensicons.ArrowRight,
            onPress: () => {debugger;},
            shouldShowRightIcon: true,
        },
        {
            key: 'purposeForExpensify.VSB',
            title: translate('purposeForExpensify.VSB'),
            icon: Expensicons.MoneyBag,
            iconRight: Expensicons.ArrowRight,
            onPress: () => {debugger;},
            shouldShowRightIcon: true,
        },
        {
            key: 'purposeForExpensify.SMB',
            title: translate('purposeForExpensify.SMB'),
            icon: Expensicons.Briefcase,
            iconRight: Expensicons.ArrowRight,
            onPress: () => {debugger;},
            shouldShowRightIcon: true,
        },
    ];

    return (
        <Modal
            type={isSmallScreenWidth ? CONST.MODAL.MODAL_TYPE.BOTTOM_DOCKED : CONST.MODAL.MODAL_TYPE.RIGHT_DOCKED}
            isVisible={isModalOpen}
            fullscreen
            onClose={() => setIsModalOpen(false)}
        >
            <View>
                <HeaderWithBackButton
                    shouldShowCloseButton
                    shouldShowBackButton={false}
                    onCloseButtonPress={() => setIsModalOpen(false)}
                />
                <View style={StyleSheet.absoluteFillObject}>
                    <Lottie
                        source={LottieAnimations.Hands}
                        style={styles.w100}
                        webStyle={styles.w100}
                        autoPlay
                        loop
                    />
                </View>
                <View style={[styles.w100, styles.ph5, styles.pb5, {marginTop: 350}]}>
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
