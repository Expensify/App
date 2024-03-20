import React, {useMemo} from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import FixedFooter from '@components/FixedFooter';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Expensicons from '@components/Icon/Expensicons';
import type {MenuItemProps} from '@components/MenuItem';
import MenuItemList from '@components/MenuItemList';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import Navigation from '@libs/Navigation/Navigation';
import * as Report from '@userActions/Report';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

const menuIcons = {
    [CONST.MANAGE_TEAMS_CHOICE.MULTI_LEVEL]: Expensicons.Task,
    [CONST.MANAGE_TEAMS_CHOICE.CUSTOM_EXPENSE]: Expensicons.ReceiptSearch,
    [CONST.MANAGE_TEAMS_CHOICE.CARD_TRACKING]: Expensicons.CreditCard,
    [CONST.MANAGE_TEAMS_CHOICE.ACCOUNTING]: Expensicons.Sync,
    [CONST.MANAGE_TEAMS_CHOICE.RULE]: Expensicons.Gear,
};

// This is not translated because it is a message coming from concierge, which only supports english
const messageCopy =
    "Here's how to manage your team's expenses:\n" +
    '\n' +
    '1. Click the green *+* > *New workspace*.\n' +
    '2. Your new workspace is now active.\n' +
    '3. To update your workspace name, click *Profile* > *Name*.\n' +
    '\n' +
    'Next, click *Members* to invite your team to your workspace, then add your business bank account to reimburse them!';

function ManageTeamsExpensesModal() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {isExtraSmallScreenHeight} = useWindowDimensions();

    const menuItems: MenuItemProps[] = useMemo(
        () =>
            Object.values(CONST.MANAGE_TEAMS_CHOICE).map((choice) => {
                const translationKey = `manageTeams.${choice}` as const;
                return {
                    key: translationKey,
                    title: translate(translationKey),
                    icon: menuIcons[choice],
                    numberOfLinesTitle: 2,
                    interactive: false,
                };
            }),
        [translate],
    );

    const completeEngagement = () => {
        Report.completeEngagementModal(messageCopy, CONST.INTRO_CHOICES.MANAGE_TEAM);
        Report.navigateToConciergeChat();
    };

    const navigateBack = () => {
        Navigation.goBack(ROUTES.ONBOARD);
    };

    const navigateToExpensifyClassicPage = () => {
        Navigation.navigate(ROUTES.ONBOARD_EXPENSIFY_CLASSIC);
    };

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom
            testID={ManageTeamsExpensesModal.displayName}
        >
            <View style={[styles.flex1]}>
                <HeaderWithBackButton
                    shouldShowBackButton
                    onBackButtonPress={navigateBack}
                />

                <ScrollView contentContainerStyle={styles.flex1}>
                    <View style={[styles.w100, styles.ph5]}>
                        <Text
                            style={[styles.textHeadline, styles.preWrap, styles.mb2]}
                            numberOfLines={2}
                        >
                            {translate('manageTeams.title')}
                        </Text>
                    </View>
                    <MenuItemList
                        menuItems={menuItems}
                        shouldUseSingleExecution
                    />
                </ScrollView>
                <FixedFooter>
                    <View style={styles.flexRow}>
                        <Button
                            medium={isExtraSmallScreenHeight}
                            large={!isExtraSmallScreenHeight}
                            style={[styles.flexGrow1, styles.mr1, styles.mtAuto]}
                            text={translate('common.no')}
                            onPress={completeEngagement}
                        />
                        <Button
                            pressOnEnter
                            medium={isExtraSmallScreenHeight}
                            large={!isExtraSmallScreenHeight}
                            style={[styles.flexGrow1, styles.ml1, styles.mtAuto]}
                            text={translate('common.yes')}
                            onPress={navigateToExpensifyClassicPage}
                        />
                    </View>
                </FixedFooter>
            </View>
        </ScreenWrapper>
    );
}

ManageTeamsExpensesModal.displayName = 'ManageTeamsExpensesModal';

export default ManageTeamsExpensesModal;
