import Button from '@components/Button';
import FixedFooter from '@components/FixedFooter';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ImageSVG from '@components/ImageSVG';
import MenuItemList from '@components/MenuItemList';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';

import {useMemoizedLazyExpensifyIcons, useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import {openExternalLink} from '@libs/actions/Link';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';

import {showContextMenu} from '@pages/inbox/report/ContextMenu/ReportActionContextMenu';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

import type {GestureResponderEvent} from 'react-native';

import React, {useRef} from 'react';
import {View} from 'react-native';

type BusinessCentralPrerequisitesPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.ACCOUNTING.BUSINESS_CENTRAL_PREREQUISITES>;

function BusinessCentralPrerequisitesPage({route}: BusinessCentralPrerequisitesPageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const icons = useMemoizedLazyExpensifyIcons(['NewWindow', 'Task']);
    const illustrations = useMemoizedLazyIllustrations(['Computer']);
    const popoverAnchor = useRef<View>(null);
    const policyID: string = route.params.policyID;

    const menuItems = [
        {
            title: translate('workspace.businessCentral.followSteps'),
            key: 'workspace.businessCentral.followSteps',
            icon: icons.Task,
            iconRight: icons.NewWindow,
            shouldShowRightIcon: true,
            onPress: () => {
                openExternalLink(CONST.BUSINESS_CENTRAL_HELP_URL);
            },
            onSecondaryInteraction: (event: GestureResponderEvent | MouseEvent) =>
                showContextMenu({
                    type: CONST.CONTEXT_MENU_TYPES.LINK,
                    event,
                    selection: CONST.BUSINESS_CENTRAL_HELP_URL,
                    contextMenuAnchor: popoverAnchor.current,
                }),
            shouldShowContextMenuHint: true,
            numberOfLinesTitle: 3,
        },
    ];

    return (
        <ScreenWrapper
            shouldEnablePickerAvoiding={false}
            shouldShowOfflineIndicatorInWideScreen
            testID="BusinessCentralPrerequisitesPage"
            enableEdgeToEdgeBottomSafeAreaPadding
        >
            <HeaderWithBackButton
                title={translate('workspace.businessCentral.businessCentralSetup')}
                shouldShowBackButton
                onBackButtonPress={() => Navigation.goBack()}
            />
            <ScrollView>
                <View style={[styles.alignSelfCenter, styles.computerIllustrationContainer]}>
                    <ImageSVG src={illustrations.Computer} />
                </View>

                <Text style={[styles.textHeadlineH1, styles.p5, styles.p6]}>{translate('workspace.businessCentral.prerequisitesTitle')}</Text>
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
                    variant={CONST.BUTTON_VARIANT.SUCCESS}
                    onPress={() => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_BUSINESS_CENTRAL_SETUP.getRoute(policyID))}
                    size={CONST.BUTTON_SIZE.LARGE}
                >
                    <Button.KeyboardShortcut />
                    <Button.Text>{translate('common.next')}</Button.Text>
                </Button>
            </FixedFooter>
        </ScreenWrapper>
    );
}

export default BusinessCentralPrerequisitesPage;
