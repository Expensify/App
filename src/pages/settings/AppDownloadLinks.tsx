import React, {useRef} from 'react';
import type {View} from 'react-native';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Expensicons from '@components/Icon/Expensicons';
import MenuItem from '@components/MenuItem';
import type {MenuItemProps} from '@components/MenuItem';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {openExternalLink} from '@libs/actions/Link';
import Navigation from '@libs/Navigation/Navigation';
import {showContextMenu} from '@pages/home/report/ContextMenu/ReportActionContextMenu';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';

type DownloadMenuItem = MenuItemProps & {
    translationKey: TranslationPaths;
    action: () => void;
    link: string;
};

function AppDownloadLinksPage() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const popoverAnchor = useRef<View>(null);

    const menuItems: DownloadMenuItem[] = [
        {
            translationKey: 'initialSettingsPage.appDownloadLinks.android.label',
            action: () => {
                openExternalLink(CONST.APP_DOWNLOAD_LINKS.ANDROID);
            },
            link: CONST.APP_DOWNLOAD_LINKS.ANDROID,
            icon: Expensicons.Android,
            iconRight: Expensicons.NewWindow,
        },
        {
            translationKey: 'initialSettingsPage.appDownloadLinks.ios.label',
            action: () => {
                openExternalLink(CONST.APP_DOWNLOAD_LINKS.IOS, true);
            },
            link: CONST.APP_DOWNLOAD_LINKS.IOS,
            icon: Expensicons.Apple,
            iconRight: Expensicons.NewWindow,
        },
        {
            translationKey: 'initialSettingsPage.appDownloadLinks.desktop.label',
            action: () => {
                openExternalLink(CONST.APP_DOWNLOAD_LINKS.DESKTOP, true);
            },
            link: CONST.APP_DOWNLOAD_LINKS.DESKTOP,
            icon: Expensicons.Monitor,
            iconRight: Expensicons.NewWindow,
        },
    ];

    return (
        <ScreenWrapper testID={AppDownloadLinksPage.displayName}>
            <HeaderWithBackButton
                title={translate('initialSettingsPage.aboutPage.appDownloadLinks')}
                onBackButtonPress={() => Navigation.goBack()}
            />
            <ScrollView style={[styles.mt3]}>
                {menuItems.map((item: DownloadMenuItem) => (
                    <MenuItem
                        key={item.translationKey}
                        onPress={item.action}
                        onSecondaryInteraction={(e) =>
                            showContextMenu({
                                type: CONST.CONTEXT_MENU_TYPES.LINK,
                                event: e,
                                selection: item.link,
                                contextMenuAnchor: popoverAnchor.current,
                            })
                        }
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
