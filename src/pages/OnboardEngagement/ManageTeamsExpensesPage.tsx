import React, {useCallback, useMemo} from 'react';
import {ScrollView, View} from 'react-native';
import Button from '@components/Button';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Expensicons from '@components/Icon/Expensicons';
import type {MenuItemProps} from '@components/MenuItem';
import MenuItemList from '@components/MenuItemList';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import * as DeviceCapabilities from '@libs/DeviceCapabilities';
import Navigation from '@libs/Navigation/Navigation';
import * as Report from '@userActions/Report';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

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

// This is not translated because it is a message coming from concierge, which only supports english
const messageCopy = {
    [CONST.INTRO_CHOICES.MANAGE_TEAM]:
        "Great! To manage your team's expenses, create a workspace to keep everything contained:\n" +
        '\n' +
        '1. Press your avatar icon\n' +
        '2. Choose Workspaces\n' +
        '3. Choose New Workspace\n' +
        '4. Name your workspace something meaningful (eg, "Galaxy Food Inc.")\n' +
        '\n' +
        'Once you have your workspace set up, you can invite your team to it via the Members pane and connect a business bank account to reimburse them!',
};

function ManageTeamsExpensesModal() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {isExtraSmallScreenHeight} = useWindowDimensions();
    const canUseTouchScreen = DeviceCapabilities.canUseTouchScreen();
    const theme = useTheme();

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

    const completeEngagement = useCallback(() => {
        Report.completeEngagementModal(messageCopy[CONST.INTRO_CHOICES.MANAGE_TEAM], CONST.INTRO_CHOICES.MANAGE_TEAM);
        Report.navigateToConciergeChat();
    }, []);

    const navigateBack = () => {
        Navigation.goBack(ROUTES.ONBOARD);
    };

    const navigateToExpensifyClassicPage = () => {
        Navigation.navigate(ROUTES.ONBOARD_EXPENSIFY_CLASSIC);
    };

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            testID={ManageTeamsExpensesModal.displayName}
        >
            <View style={[styles.flex1]}>
                <HeaderWithBackButton
                    shouldShowBackButton
                    onBackButtonPress={navigateBack}
                    iconFill={theme.iconColorfulBackground}
                />

                <ScrollView contentContainerStyle={[styles.flex1, styles.ph5]}>
                    <View style={styles.w100}>
                        <Text
                            style={[styles.textHeadline, styles.preWrap, styles.mb2]}
                            numberOfLines={2}
                        >
                            Do you require any of the following features
                        </Text>
                    </View>
                    <MenuItemList
                        menuItems={menuItems}
                        shouldUseSingleExecution
                    />
                </ScrollView>
                <View style={[styles.flexRow, styles.ph5, styles.pv4]}>
                    <Button
                        medium={isExtraSmallScreenHeight}
                        style={[styles.flexGrow1, styles.mr1, canUseTouchScreen ? styles.mt5 : styles.mt3]}
                        text={translate('common.no')}
                        onPress={completeEngagement}
                    />
                    <Button
                        pressOnEnter
                        medium={isExtraSmallScreenHeight}
                        style={[styles.flexGrow1, styles.ml1, canUseTouchScreen ? styles.mt5 : styles.mt3]}
                        text={translate('common.yes')}
                        onPress={navigateToExpensifyClassicPage}
                    />
                </View>
            </View>
        </ScreenWrapper>
    );
}

ManageTeamsExpensesModal.displayName = 'ManageTeamsExpensesModal';

export default ManageTeamsExpensesModal;
