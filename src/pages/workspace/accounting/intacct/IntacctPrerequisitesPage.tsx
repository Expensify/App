import React, {useMemo, useRef} from 'react';
import {View} from 'react-native';
// eslint-disable-next-line no-restricted-imports
import type {GestureResponderEvent, Text as RNText} from 'react-native';
import Computer from '@assets/images/computer.svg';
import Button from '@components/Button';
import FixedFooter from '@components/FixedFooter';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Expensicons from '@components/Icon/Expensicons';
import ImageSVG from '@components/ImageSVG';
import MenuItemList from '@components/MenuItemList';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import * as ReportActionContextMenu from '@pages/home/report/ContextMenu/ReportActionContextMenu';
import * as Link from '@userActions/Link';
import CONST from '@src/CONST';

function IntacctPrerequisitesPage() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const popoverAnchor = useRef<View | RNText | null>(null);

    const menuItems = useMemo(
        () => [
            {
                title: translate('workspace.intacct.downloadExpensifyPackage'),
                key: 'workspace.intacct.downloadExpensifyPackage',
                icon: Expensicons.Download,
                iconRight: Expensicons.NewWindow,
                shouldShowRightIcon: true,
                action: () => {
                    Link.openExternalLink(CONST.EXPENSIFY_PACKAGE_FOR_SAGE_INTACCT);
                    return Promise.resolve();
                },
                onSecondaryInteraction: (event: GestureResponderEvent | MouseEvent) =>
                    ReportActionContextMenu.showContextMenu(CONST.CONTEXT_MENU_TYPES.LINK, event, CONST.EXPENSIFY_PACKAGE_FOR_SAGE_INTACCT, popoverAnchor.current),
                numberOfLinesTitle: 2,
            },
            {
                title: translate('workspace.intacct.followSteps'),
                key: 'workspace.intacct.followSteps',
                icon: Expensicons.Task,
                iconRight: Expensicons.NewWindow,
                shouldShowRightIcon: true,
                action: () => {
                    Link.openExternalLink(CONST.HOW_TO_CONNECT_TO_SAGE_INTACCT);
                    return Promise.resolve();
                },
                onSecondaryInteraction: (event: GestureResponderEvent | MouseEvent) =>
                    ReportActionContextMenu.showContextMenu(CONST.CONTEXT_MENU_TYPES.LINK, event, CONST.HOW_TO_CONNECT_TO_SAGE_INTACCT, popoverAnchor.current),
                numberOfLinesTitle: 3,
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
                onBackButtonPress={() => Navigation.goBack()}
            />
            <View style={[styles.flex1]}>
                <View style={{width: 'auto', height: 188}}>
                    <ImageSVG src={Computer} />
                </View>

                <Text style={[styles.textHeadlineH1, styles.p5, styles.pb6]}>{translate('workspace.intacct.prerequisitesTitle')}</Text>
                <MenuItemList
                    menuItems={menuItems}
                    shouldUseSingleExecution
                />

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
