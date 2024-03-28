import React, {useRef} from 'react';
import {View} from 'react-native';
import type {ImageSourcePropType} from 'react-native';
import expensifyLogo from '@assets/images/expensify-logo-round-transparent.png';
import ContextMenuItem from '@components/ContextMenuItem';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Expensicons from '@components/Icon/Expensicons';
import MenuItem from '@components/MenuItem';
import {useSession} from '@components/OnyxProvider';
import QRShareWithDownload from '@components/QRShare/QRShareWithDownload';
import type QRShareWithDownloadHandle from '@components/QRShare/QRShareWithDownload/types';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import useEnvironment from '@hooks/useEnvironment';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import Clipboard from '@libs/Clipboard';
import Navigation from '@libs/Navigation/Navigation';
import shouldAllowDownloadQRCode from '@libs/shouldAllowDownloadQRCode';
import * as Url from '@libs/Url';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import withPolicy from './withPolicy';
import type {WithPolicyProps} from './withPolicy';

function WorkspaceProfileSharePage({policy}: WithPolicyProps) {
    const themeStyles = useThemeStyles();
    const {translate} = useLocalize();
    const {environmentURL} = useEnvironment();
    const qrCodeRef = useRef<QRShareWithDownloadHandle>(null);
    const {isSmallScreenWidth} = useWindowDimensions();
    const session = useSession();

    const policyName = policy?.name ?? '';
    const id = policy?.id ?? '';
    const adminEmail = session?.email ?? '';
    const urlWithTrailingSlash = Url.addTrailingForwardSlash(environmentURL);

    const url = `${urlWithTrailingSlash}${ROUTES.WORKSPACE_JOIN_USER.getRoute(id, adminEmail)}`;

    return (
        <ScreenWrapper
            testID={WorkspaceProfileSharePage.displayName}
            shouldShowOfflineIndicatorInWideScreen
        >
            <HeaderWithBackButton
                title={translate('common.share')}
                onBackButtonPress={Navigation.goBack}
            />
            <ScrollView style={[themeStyles.flex1, themeStyles.pt2]}>
                <View style={[themeStyles.flex1, isSmallScreenWidth ? themeStyles.workspaceSectionMobile : themeStyles.workspaceSection]}>
                    <View style={[themeStyles.workspaceSectionMobile, themeStyles.ph9]}>
                        <QRShareWithDownload
                            ref={qrCodeRef}
                            url={url}
                            title={policyName}
                            logo={(policy?.avatar ? policy.avatar : expensifyLogo) as ImageSourcePropType}
                            logoRatio={CONST.QR.DEFAULT_LOGO_SIZE_RATIO}
                            logoMarginRatio={CONST.QR.DEFAULT_LOGO_MARGIN_RATIO}
                        />
                    </View>

                    <View style={[themeStyles.mt3, themeStyles.ph4]}>
                        <ContextMenuItem
                            isAnonymousAction
                            text={translate('qrCodes.copy')}
                            icon={Expensicons.Copy}
                            successIcon={Expensicons.Checkmark}
                            successText={translate('qrCodes.copied')}
                            onPress={() => Clipboard.setString(url)}
                            shouldLimitWidth={false}
                            wrapperStyle={themeStyles.sectionMenuItemTopDescription}
                        />
                        {shouldAllowDownloadQRCode && (
                            <MenuItem
                                isAnonymousAction
                                title={translate('common.download')}
                                icon={Expensicons.Download}
                                onPress={() => qrCodeRef.current?.download?.()}
                                wrapperStyle={themeStyles.sectionMenuItemTopDescription}
                            />
                        )}
                    </View>
                </View>
            </ScrollView>
        </ScreenWrapper>
    );
}

WorkspaceProfileSharePage.displayName = 'WorkspaceProfileSharePage';

export default withPolicy(WorkspaceProfileSharePage);
