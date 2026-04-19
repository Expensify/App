import React, {useMemo, useRef} from 'react';
import {View} from 'react-native';
// eslint-disable-next-line no-restricted-imports
import type {GestureResponderEvent, Text as RNText} from 'react-native';
import Button from '@components/Button';
import FixedFooter from '@components/FixedFooter';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ImageSVG from '@components/ImageSVG';
import MenuItemList from '@components/MenuItemList';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import useDynamicBackPath from '@hooks/useDynamicBackPath';
import {useMemoizedLazyExpensifyIcons, useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {openExternalLink} from '@libs/actions/Link';
import fileDownload from '@libs/fileDownload';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {showContextMenu} from '@pages/inbox/report/ContextMenu/ReportActionContextMenu';
import CONST from '@src/CONST';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type DynamicSageIntacctPrerequisitesPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.ACCOUNTING.DYNAMIC_SAGE_INTACCT_PREREQUISITES>;

function DynamicSageIntacctPrerequisitesPage({route}: DynamicSageIntacctPrerequisitesPageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const icons = useMemoizedLazyExpensifyIcons(['Download', 'NewWindow', 'Task']);
    const illustrations = useMemoizedLazyIllustrations(['Computer']);
    const popoverAnchor = useRef<View | RNText | null>(null);
    const policyID: string = route.params.policyID;
    const backPath = useDynamicBackPath(DYNAMIC_ROUTES.SAGE_INTACCT_PREREQUISITES.path);

    const menuItems = useMemo(
        () => [
            {
                title: translate('workspace.intacct.downloadExpensifyPackage'),
                key: 'workspace.intacct.downloadExpensifyPackage',
                icon: icons.Download,
                iconRight: icons.NewWindow,
                shouldShowRightIcon: true,
                onPress: () => {
                    fileDownload(translate, CONST.EXPENSIFY_PACKAGE_FOR_SAGE_INTACCT, CONST.EXPENSIFY_PACKAGE_FOR_SAGE_INTACCT_FILE_NAME, '', true);
                },
                onSecondaryInteraction: (event: GestureResponderEvent | MouseEvent) =>
                    showContextMenu({
                        type: CONST.CONTEXT_MENU_TYPES.LINK,
                        event,
                        selection: CONST.EXPENSIFY_PACKAGE_FOR_SAGE_INTACCT,
                        contextMenuAnchor: popoverAnchor.current,
                    }),
                shouldShowContextMenuHint: true,
                numberOfLinesTitle: 2,
            },
            {
                title: translate('workspace.intacct.followSteps'),
                key: 'workspace.intacct.followSteps',
                icon: icons.Task,
                iconRight: icons.NewWindow,
                shouldShowRightIcon: true,
                onPress: () => {
                    openExternalLink(CONST.HOW_TO_CONNECT_TO_SAGE_INTACCT);
                },
                onSecondaryInteraction: (event: GestureResponderEvent | MouseEvent) =>
                    showContextMenu({
                        type: CONST.CONTEXT_MENU_TYPES.LINK,
                        event,
                        selection: CONST.HOW_TO_CONNECT_TO_SAGE_INTACCT,
                        contextMenuAnchor: popoverAnchor.current,
                    }),
                shouldShowContextMenuHint: true,
                numberOfLinesTitle: 3,
            },
        ],
        [icons.Download, icons.NewWindow, translate, icons.Task],
    );

    return (
        <ScreenWrapper
            shouldEnablePickerAvoiding={false}
            shouldShowOfflineIndicatorInWideScreen
            testID="SageIntacctPrerequisitesPage"
            enableEdgeToEdgeBottomSafeAreaPadding
        >
            <HeaderWithBackButton
                title={translate('workspace.intacct.sageIntacctSetup')}
                shouldShowBackButton
                onBackButtonPress={() => Navigation.goBack(backPath)}
            />
            <ScrollView>
                <View style={[styles.alignSelfCenter, styles.computerIllustrationContainer]}>
                    <ImageSVG src={illustrations.Computer} />
                </View>

                <Text style={[styles.textHeadlineH1, styles.p5, styles.p6]}>{translate('workspace.intacct.prerequisitesTitle')}</Text>
                <MenuItemList
                    menuItems={menuItems}
                    shouldUseSingleExecution
                />
            </ScrollView>
            <FixedFooter
                style={[styles.mtAuto]}
                addBottomSafeAreaPadding
            >
                <Button
                    success
                    text={translate('common.next')}
                    onPress={() => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_SAGE_INTACCT_ENTER_CREDENTIALS.getRoute(policyID))}
                    pressOnEnter
                    large
                />
            </FixedFooter>
        </ScreenWrapper>
    );
}

export default DynamicSageIntacctPrerequisitesPage;
