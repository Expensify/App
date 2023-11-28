import PropTypes from 'prop-types';
import React, {useState} from 'react';
import {withOnyx} from 'react-native-onyx';
import useLocalize from '@hooks/useLocalize';
import compose from '@libs/compose';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import useThemeStyles from "@styles/useThemeStyles";
import useWindowDimensions from "@hooks/useWindowDimensions";
import withLocalize, {withLocalizePropTypes} from "@components/withLocalize";
import ScreenWrapper from "./ScreenWrapper";
import MenuItemList from "./MenuItemList";
import HeaderWithBackButton from "./HeaderWithBackButton";
import withWindowDimensions, {windowDimensionsPropTypes} from './withWindowDimensions';
import Modal from "./Modal";
import HeaderGap from "./HeaderGap";
import * as Expensicons from './Icon/Expensicons';

const propTypes = {

    /** Session info for the currently logged in user. */
    session: PropTypes.shape({
        /** Currently logged in user accountID */
        accountID: PropTypes.number,
    }),

    ...withLocalizePropTypes,

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
            icon: Expensicons.ReceiptSearch,
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
        >
            <ScreenWrapper
                style={[styles.pb0]}
                includePaddingTop={false}
                includeSafeAreaPaddingBottom={false}
                testID='asdfasdf'
            >
                {isSmallScreenWidth && <HeaderGap />}
                <HeaderWithBackButton
                    shouldShowCloseButton
                    shouldShowBackButton={false}
                    onCloseButtonPress={() => setIsModalOpen(false)}
                />
                <MenuItemList
                    menuItems={menuItems}
                    shouldUseSingleExecution
                />
            </ScreenWrapper>
        </Modal>
    );
}

PurposeForUsingExpensifyModal.propTypes = propTypes;
PurposeForUsingExpensifyModal.defaultProps = defaultProps;
PurposeForUsingExpensifyModal.displayName = 'AddPaymentMethodMenu';

export default compose(
    withWindowDimensions,
    withLocalize,
    withOnyx({
        session: {
            key: ONYXKEYS.SESSION,
        },
    }),
)(PurposeForUsingExpensifyModal);
