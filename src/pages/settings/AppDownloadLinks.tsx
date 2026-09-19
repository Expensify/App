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

import React from 'react';

function AppDownloadLinksPage() {
    const icons = useMemoizedLazyExpensifyIcons(['Android', 'Apple']);
    const styles = useThemeStyles();
    const {translate} = useLocalize();

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
                <MenuItem.Root onPress={callFunctionIfActionIsAllowed(() => openExternalLink(CONST.APP_DOWNLOAD_LINKS.ANDROID))}>
                    <MenuItem.Row>
                        <MenuItem.Leading>
                            <MenuItem.Icon src={icons.Android} />
                        </MenuItem.Leading>
                        <MenuItem.Content>
                            <MenuItem.Title>{translate('initialSettingsPage.appDownloadLinks.android.label')}</MenuItem.Title>
                        </MenuItem.Content>
                        <MenuItem.Trailing>
                            <MenuItem.ExternalLink link={CONST.APP_DOWNLOAD_LINKS.ANDROID} />
                        </MenuItem.Trailing>
                    </MenuItem.Row>
                </MenuItem.Root>
                <MenuItem.Root onPress={callFunctionIfActionIsAllowed(() => openExternalLink(CONST.APP_DOWNLOAD_LINKS.IOS, true))}>
                    <MenuItem.Row>
                        <MenuItem.Leading>
                            <MenuItem.Icon src={icons.Apple} />
                        </MenuItem.Leading>
                        <MenuItem.Content>
                            <MenuItem.Title>{translate('initialSettingsPage.appDownloadLinks.ios.label')}</MenuItem.Title>
                        </MenuItem.Content>
                        <MenuItem.Trailing>
                            <MenuItem.ExternalLink link={CONST.APP_DOWNLOAD_LINKS.IOS} />
                        </MenuItem.Trailing>
                    </MenuItem.Row>
                </MenuItem.Root>
            </ScrollView>
        </ScreenWrapper>
    );
}

export default AppDownloadLinksPage;
