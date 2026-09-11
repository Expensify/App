import expensifyLogo from '@assets/images/expensify-logo-round-transparent.png';

import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItem from '@components/MenuItem';
import QRShare from '@components/QRShare';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import {openExternalLink} from '@libs/actions/Link';
import Navigation from '@libs/Navigation/Navigation';

import {callFunctionIfActionIsAllowed} from '@userActions/Session';

import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import type IconAsset from '@src/types/utils/IconAsset';

import React from 'react';

type DownloadMenuItem = {
    translationKey: TranslationPaths;
    action: () => void;
    link: string;
    icon: IconAsset;
};

function AppDownloadLinksPage() {
    const icons = useMemoizedLazyExpensifyIcons(['Android', 'Apple']);
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const menuItems: DownloadMenuItem[] = [
        {
            translationKey: 'initialSettingsPage.appDownloadLinks.android.label',
            action: () => {
                openExternalLink(CONST.APP_DOWNLOAD_LINKS.ANDROID);
            },
            link: CONST.APP_DOWNLOAD_LINKS.ANDROID,
            icon: icons.Android,
        },
        {
            translationKey: 'initialSettingsPage.appDownloadLinks.ios.label',
            action: () => {
                openExternalLink(CONST.APP_DOWNLOAD_LINKS.IOS, true);
            },
            link: CONST.APP_DOWNLOAD_LINKS.IOS,
            icon: icons.Apple,
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
                {menuItems.map((item) => (
                    <MenuItem.Root
                        key={item.translationKey}
                        onPress={callFunctionIfActionIsAllowed(item.action)}
                    >
                        <MenuItem.Row>
                            <MenuItem.Leading>
                                <MenuItem.Icon src={item.icon} />
                            </MenuItem.Leading>
                            <MenuItem.Content>
                                <MenuItem.Title>{translate(item.translationKey)}</MenuItem.Title>
                            </MenuItem.Content>
                            <MenuItem.Trailing>
                                <MenuItem.ExternalLink link={item.link} />
                            </MenuItem.Trailing>
                        </MenuItem.Row>
                    </MenuItem.Root>
                ))}
            </ScrollView>
        </ScreenWrapper>
    );
}

export default AppDownloadLinksPage;
