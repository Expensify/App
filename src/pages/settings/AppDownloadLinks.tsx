import React, {useRef} from 'react';
import {ScrollView} from 'react-native';
import type {View} from 'react-native';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Expensicons from '@components/Icon/Expensicons';
import MenuItem from '@components/MenuItem';
import type {MenuItemProps} from '@components/MenuItem';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import * as ReportActionContextMenu from '@pages/home/report/ContextMenu/ReportActionContextMenu';
import * as Link from '@userActions/Link';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ROUTES from '@src/ROUTES';

type DownloadMenuItem = MenuItemProps & {
    translationKey: TranslationPaths;
    openAppDownloadLink: () => void;
    downloadLink: string;
};

function AppDownloadLinksPage() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const popoverAnchor = useRef<View>(null);

    const menuItems: DownloadMenuItem[] = [
        {
            translationKey: 'initialSettingsPage.appDownloadLinks.android.label',
            openAppDownloadLink: () => {
                Link.openExternalLink(CONST.APP_DOWNLOAD_LINKS.ANDROID);
            },
            downloadLink: CONST.APP_DOWNLOAD_LINKS.ANDROID,
            icon: Expensicons.Android,
            iconRight: Expensicons.NewWindow,
        },
        {
            translationKey: 'initialSettingsPage.appDownloadLinks.ios.label',
            openAppDownloadLink: () => {
                Link.openExternalLink(CONST.APP_DOWNLOAD_LINKS.IOS, true);
            },
            downloadLink: CONST.APP_DOWNLOAD_LINKS.IOS,
            icon: Expensicons.Apple,
            iconRight: Expensicons.NewWindow,
        },
        {
            translationKey: 'initialSettingsPage.appDownloadLinks.desktop.label',
            openAppDownloadLink: () => {
                Link.openExternalLink(CONST.APP_DOWNLOAD_LINKS.DESKTOP);
            },
            downloadLink: CONST.APP_DOWNLOAD_LINKS.DESKTOP,
            icon: Expensicons.Monitor,
            iconRight: Expensicons.NewWindow,
        },
    ];

    return (
        <ScreenWrapper testID={AppDownloadLinksPage.displayName}>
            <HeaderWithBackButton
                title={translate('initialSettingsPage.aboutPage.appDownloadLinks')}
                onBackButtonPress={() => Navigation.goBack(ROUTES.SETTINGS_ABOUT)}
            />
            <ScrollView style={[styles.mt3]}>
                {menuItems.map((item: DownloadMenuItem) => (
                    <MenuItem
                        key={item.translationKey}
                        onPress={item.openAppDownloadLink}
                        onSecondaryInteraction={(e) => ReportActionContextMenu.showContextMenu(CONST.CONTEXT_MENU_TYPES.LINK, e, item.downloadLink, popoverAnchor.current)}
                        ref={popoverAnchor}
                        title={translate(item.translationKey)}
                        icon={item.icon}
                        iconRight={item.iconRight}
                        shouldBlockSelection
                        shouldShowRightIcon
                    />
                ))}
            </ScrollView>
        </ScreenWrapper>
    );
}

AppDownloadLinksPage.displayName = 'AppDownloadLinksPage';

export default AppDownloadLinksPage;
