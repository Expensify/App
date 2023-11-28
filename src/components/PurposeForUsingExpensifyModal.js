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
import Header from "./Header";
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
            key: 'twoFactorAuth.headerTitle',
            title: translate('twoFactorAuth.headerTitle'),
            icon: Expensicons.ReceiptSearch,
            iconRight: Expensicons.ArrowRight,
            onPress: () => {debugger;},
            shouldShowRightIcon: true,
        },
        {
            key: 'twoFactorAuth.headerTitle',
            title: translate('twoFactorAuth.headerTitle'),
            icon: Expensicons.ReceiptSearch,
            iconRight: Expensicons.ArrowRight,
            onPress: () => {debugger;},
            shouldShowRightIcon: true,
        },
        {
            key: 'twoFactorAuth.headerTitle',
            title: translate('twoFactorAuth.headerTitle'),
            icon: Expensicons.MoneyBag,
            iconRight: Expensicons.ArrowRight,
            onPress: () => {debugger;},
            shouldShowRightIcon: true,
        },
        {
            key: 'twoFactorAuth.headerTitle',
            title: translate('twoFactorAuth.headerTitle'),
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
        >
            <ScreenWrapper
                style={[styles.pb0]}
                includePaddingTop={false}
                includeSafeAreaPaddingBottom={false}
                testID='asdfasdf'
            >
                {isSmallScreenWidth && <HeaderGap />}
                <Header
                    title={translate('avatarCropModal.title')}
                    shouldShowCloseButton
                    closeButtonPress={() => setIsModalOpen(false)}
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
