import React, {useMemo, useRef} from 'react';
import {View} from 'react-native';
// eslint-disable-next-line no-restricted-imports
import type {GestureResponderEvent, Text as RNText} from 'react-native';
import Button from '@components/Button';
import FixedFooter from '@components/FixedFooter';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Expensicons from '@components/Icon/Expensicons';
import LottieAnimations from '@components/LottieAnimations';
import MenuItemList from '@components/MenuItemList';
import ScreenWrapper from '@components/ScreenWrapper';
import Section from '@components/Section';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import * as ReportActionContextMenu from '@pages/home/report/ContextMenu/ReportActionContextMenu';
import * as Link from '@userActions/Link';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

function IntacctPrerequisitesPage() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const popoverAnchor = useRef<View | RNText | null>(null);

    const menuItems = useMemo(
        () => [
            {
                translationKey: 'workspace.intacct.downloadExpensifyPackage',
                icon: Expensicons.Download,
                iconRight: Expensicons.NewWindow,
                action: () => {
                    Link.openExternalLink(CONST.EXPENSIFY_PACKAGE_FOR_SAGE_INTACCT);
                    return Promise.resolve();
                },
                onSecondaryInteraction: (event: GestureResponderEvent | MouseEvent) =>
                    ReportActionContextMenu.showContextMenu(CONST.CONTEXT_MENU_TYPES.LINK, event, CONST.EXPENSIFY_PACKAGE_FOR_SAGE_INTACCT, popoverAnchor.current),
            },
            {
                translationKey: 'workspace.intacct.followSteps',
                icon: Expensicons.Download,
                iconRight: Expensicons.NewWindow,
                action: () => {
                    Link.openExternalLink(CONST.HOW_TO_CONNECT_TO_SAGE_INTACCT);
                    return Promise.resolve();
                },
                onSecondaryInteraction: (event: GestureResponderEvent | MouseEvent) =>
                    ReportActionContextMenu.showContextMenu(CONST.CONTEXT_MENU_TYPES.LINK, event, CONST.HOW_TO_CONNECT_TO_SAGE_INTACCT, popoverAnchor.current),
            },
        ],
        [],
    );

    return (
        <ScreenWrapper
            shouldEnablePickerAvoiding={false}
            shouldShowOfflineIndicatorInWideScreen
            testID={IntacctPrerequisitesPage.displayName}
        >
            <HeaderWithBackButton
                title={translate('workspace.intacct.sageIntacctSetup')}
                shouldShowBackButton
                onBackButtonPress={() => Navigation.goBack(ROUTES.SETTINGS)}
            />
            <View style={[styles.flex1]}>
                <Section
                    title={translate('workspace.intacct.prerequisitesTitle')}
                    illustration={LottieAnimations.Coin}
                    titleStyles={styles.accountSettingsSectionTitle}
                >
                    <View style={[styles.flex1, styles.mt5]}>
                        <MenuItemList
                            menuItems={menuItems}
                            shouldUseSingleExecution
                        />
                    </View>
                </Section>

                <FixedFooter style={[styles.mtAuto]}>
                    <Button
                        success
                        text={translate('common.next')}
                        onPress={() => {}}
                        pressOnEnter
                        large
                    />
                </FixedFooter>
            </View>
        </ScreenWrapper>
    );
}

IntacctPrerequisitesPage.displayName = 'IntacctPrerequisitesPage';

export default IntacctPrerequisitesPage;
