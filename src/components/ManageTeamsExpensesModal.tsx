import {useNavigation} from '@react-navigation/native';
import React, {useCallback, useMemo, useState} from 'react';
import {ScrollView, View} from 'react-native';
import Button from '@components/Button';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import * as DeviceCapabilities from '@libs/DeviceCapabilities';
import * as Report from '@userActions/Report';
import CONST from '@src/CONST';
import HeaderWithBackButton from './HeaderWithBackButton';
import * as Expensicons from './Icon/Expensicons';
import type {MenuItemProps} from './MenuItem';
import MenuItemList from './MenuItemList';
import Modal from './Modal';
import Text from './Text';

const TEAMS_EXPENSE_CHOICE = {
    MULTI_LEVEL: 'Multi level approval',
    CUSTOM_EXPENSE: 'Custom expense coding',
    CARD_TRACKING: 'Company Card Tracking',
    ACCOUNTING: 'Accounting integrations',
    RULE: 'Rule enforcement',
};

const menuIcons = {
    [TEAMS_EXPENSE_CHOICE.MULTI_LEVEL]: Expensicons.Task,
    [TEAMS_EXPENSE_CHOICE.CUSTOM_EXPENSE]: Expensicons.ReceiptSearch,
    [TEAMS_EXPENSE_CHOICE.CARD_TRACKING]: Expensicons.CreditCard,
    [TEAMS_EXPENSE_CHOICE.ACCOUNTING]: Expensicons.Sync,
    [TEAMS_EXPENSE_CHOICE.RULE]: Expensicons.Gear,
};

function ManageTeamsExpensesModal() {
    const styles = useThemeStyles();
    const {isSmallScreenWidth, isExtraSmallScreenHeight} = useWindowDimensions();
    const canUseTouchScreen = DeviceCapabilities.canUseTouchScreen();
    const [isModalOpen, setIsModalOpen] = useState(true);
    const theme = useTheme();

    const closeModal = useCallback(() => {
        Report.dismissEngagementModal();
        setIsModalOpen(false);
    }, []);

    const menuItems: MenuItemProps[] = useMemo(
        () =>
            Object.values(TEAMS_EXPENSE_CHOICE).map((choice) => {
                const translationKey = `${choice}` as const;
                return {
                    key: translationKey,
                    title: translationKey,
                    icon: menuIcons[choice],
                    numberOfLinesTitle: 2,
                    interactive: false,
                };
            }),
        [],
    );

    return (
        <Modal
            type={isSmallScreenWidth ? CONST.MODAL.MODAL_TYPE.BOTTOM_DOCKED : CONST.MODAL.MODAL_TYPE.RIGHT_DOCKED}
            isVisible={isModalOpen}
            onClose={closeModal}
            innerContainerStyle={styles.pt5}
            shouldUseCustomBackdrop
        >
            <View style={[styles.flex1]}>
                <HeaderWithBackButton
                    shouldShowBackButton={true}
                    onBackButtonPress={closeModal}
                    iconFill={theme.iconColorfulBackground}
                />

                <ScrollView contentContainerStyle={styles.flex1}>
                    <View style={[styles.w100, styles.ph5]}>
                        <Text
                            style={[styles.textHeadline, styles.preWrap, styles.mb2]}
                            numberOfLines={2}
                        >
                            Do you require any of the following features
                        </Text>
                    </View>
                    <View style={[styles.ph5, styles.pb5]}>
                        <MenuItemList
                            menuItems={menuItems}
                            shouldUseSingleExecution
                        />
                    </View>
                </ScrollView>
                <View style={[styles.flexRow, styles.w100, styles.ph5]}>
                    <Button
                        medium={isExtraSmallScreenHeight}
                        style={[styles.flexGrow1, styles.mr1, canUseTouchScreen ? styles.mt5 : styles.mt3]}
                        onPress={() => {}}
                        text="No"
                    />
                    <Button
                        pressOnEnter
                        medium={isExtraSmallScreenHeight}
                        style={[styles.flexGrow1, styles.ml1, canUseTouchScreen ? styles.mt5 : styles.mt3]}
                        onPress={() => {}}
                        text="Yes"
                    />
                </View>
            </View>
        </Modal>
    );
}

ManageTeamsExpensesModal.displayName = 'ManageTeamsExpensesModal';

export default ManageTeamsExpensesModal;
