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
import fileDownload from '@libs/fileDownload';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import * as ReportActionContextMenu from '@pages/home/report/ContextMenu/ReportActionContextMenu';
import * as Link from '@userActions/Link';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type SageIntacctPrerequisitesPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.ACCOUNTING.SAGE_INTACCT_PREREQUISITES>;

function SageIntacctPrerequisitesPage({route}: SageIntacctPrerequisitesPageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const popoverAnchor = useRef<View | RNText | null>(null);
    const policyID: string = route.params.policyID;

    const menuItems = useMemo(
        () => [
            {
                title: translate('workspace.intacct.downloadExpensifyPackage'),
                key: 'workspace.intacct.downloadExpensifyPackage',
                icon: Expensicons.Download,
                iconRight: Expensicons.NewWindow,
                shouldShowRightIcon: true,
                onPress: () => {
                    fileDownload(CONST.EXPENSIFY_PACKAGE_FOR_SAGE_INTACCT, CONST.EXPENSIFY_PACKAGE_FOR_SAGE_INTACCT_FILE_NAME);
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
                onPress: () => {
                    Link.openExternalLink(CONST.HOW_TO_CONNECT_TO_SAGE_INTACCT);
                },
                onSecondaryInteraction: (event: GestureResponderEvent | MouseEvent) =>
                    ReportActionContextMenu.showContextMenu(CONST.CONTEXT_MENU_TYPES.LINK, event, CONST.HOW_TO_CONNECT_TO_SAGE_INTACCT, popoverAnchor.current),
                numberOfLinesTitle: 3,
            },
        ],
        [translate],
    );

    return (
        <ScreenWrapper
            shouldEnablePickerAvoiding={false}
            shouldShowOfflineIndicatorInWideScreen
            testID={SageIntacctPrerequisitesPage.displayName}
        >
            <HeaderWithBackButton
                title={translate('workspace.intacct.sageIntacctSetup')}
                shouldShowBackButton
                onBackButtonPress={() => Navigation.dismissModal()}
            />
            <View style={styles.flex1}>
                <View style={[styles.alignSelfCenter, styles.computerIllustrationContainer]}>
                    <ImageSVG src={Computer} />
                </View>

                <Text style={[styles.textHeadlineH1, styles.p5, styles.p6]}>{translate('workspace.intacct.prerequisitesTitle')}</Text>
                <MenuItemList
                    menuItems={menuItems}
                    shouldUseSingleExecution
                />

                <FixedFooter style={[styles.mtAuto]}>
                    <Button
                        success
                        text={translate('common.next')}
                        onPress={() => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_SAGE_INTACCT_ENTER_CREDENTIALS.getRoute(policyID))}
                        pressOnEnter
                        large
                    />
                </FixedFooter>
            </View>
        </ScreenWrapper>
    );
}

SageIntacctPrerequisitesPage.displayName = 'SageIntacctPrerequisitesPage';

export default SageIntacctPrerequisitesPage;
