import React, {useRef} from 'react';
import type {View} from 'react-native';
import expensifyLogo from '@assets/images/expensify-logo-round-transparent.png';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItem from '@components/MenuItem';
import type {MenuItemProps} from '@components/MenuItem';
import QRShare from '@components/QRShare';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
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
    const icons = useMemoizedLazyExpensifyIcons(['Monitor', 'NewWindow', 'Android', 'Apple'] as const);
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
            icon: icons.Android,
            iconRight: icons.NewWindow,
        },
        {
            translationKey: 'initialSettingsPage.appDownloadLinks.ios.label',
            action: () => {
                openExternalLink(CONST.APP_DOWNLOAD_LINKS.IOS, true);
            },
            link: CONST.APP_DOWNLOAD_LINKS.IOS,
            icon: icons.Apple,
            iconRight: icons.NewWindow,
        },
    ];

    return (
        <ScreenWrapper testID="AppDownloadLinksPage">
            <HeaderWithBackButton
                title={translate('initialSettingsPage.aboutPage.appDownloadLinks')}
                onBackButtonPress={() => Navigation.goBack()}
            />

            <QRShare
                url={CONST.EXPENSIFY_MOBILE_URL}
                logo={expensifyLogo}
                logoRatio={CONST.QR.EXPENSIFY_LOGO_SIZE_RATIO}
                logoMarginRatio={CONST.QR.EXPENSIFY_LOGO_MARGIN_RATIO}
                shouldShowExpensifyLogo={false}
                additionalStyles={[styles.qrCodeAppDownloadLinksStyles, styles.shareCodeContainerDownloadPadding]}
                size={CONST.QR_CODE_SIZE.APP_DOWNLOAD_LINKS}
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
                        role={CONST.ROLE.LINK}
                    />
                ))}
            </ScrollView>
        </ScreenWrapper>
    );
}

export default AppDownloadLinksPage;
