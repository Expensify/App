import React, {useMemo, useRef} from 'react';
import {View} from 'react-native';
import type {ImageSourcePropType} from 'react-native';
import expensifyLogo from '@assets/images/expensify-logo-round-transparent.png';
import ContextMenuItem from '@components/ContextMenuItem';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Expensicons from '@components/Icon/Expensicons';
import MenuItem from '@components/MenuItem';
import {useSession} from '@components/OnyxProvider';
import QRShare from '@components/QRShare';
import QRShareWithDownload from '@components/QRShare/QRShareWithDownload';
import QRShareWithDownloadHandle from '@components/QRShare/QRShareWithDownload/types';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import useEnvironment from '@hooks/useEnvironment';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import Clipboard from '@libs/Clipboard';
import Navigation from '@libs/Navigation/Navigation';
import * as ReportUtils from '@libs/ReportUtils';
import shouldAllowDownloadQRCode from '@libs/shouldAllowDownloadQRCode';
import * as Url from '@libs/Url';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import AccessOrNotFoundWrapper from './AccessOrNotFoundWrapper';
import withPolicy from './withPolicy';
import type {WithPolicyProps} from './withPolicy';

function WorkspaceProfileSharePage({policy}: WithPolicyProps) {
    const themeStyles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {translate} = useLocalize();
    const {environmentURL} = useEnvironment();
    const qrCodeRef = useRef<QRShareWithDownloadHandle>(null);
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const session = useSession();

    const policyName = policy?.name ?? '';
    const policyID = policy?.id ?? '-1';
    const adminEmail = session?.email ?? '';
    const urlWithTrailingSlash = Url.addTrailingForwardSlash(environmentURL);

    const url = `${urlWithTrailingSlash}${ROUTES.WORKSPACE_JOIN_USER.getRoute(policyID, adminEmail)}`;

    const hasAvatar = !!policy?.avatarURL;
    const logo = hasAvatar ? (policy?.avatarURL as ImageSourcePropType) : undefined;

    const defaultWorkspaceAvatar = ReportUtils.getDefaultWorkspaceAvatar(policyName) || Expensicons.FallbackAvatar;
    const defaultWorkspaceAvatarColors = StyleUtils.getDefaultWorkspaceAvatarColor(policyID);

    const svgLogo = !hasAvatar ? defaultWorkspaceAvatar : undefined;
    const logoBackgroundColor = !hasAvatar ? defaultWorkspaceAvatarColors.backgroundColor?.toString() : undefined;
    const svgLogoFillColor = !hasAvatar ? defaultWorkspaceAvatarColors.fill : undefined;

    const adminRoom = useMemo(() => {
        if (!policy?.id) {
            return undefined;
        }
        return ReportUtils.getRoom(CONST.REPORT.CHAT_TYPE.POLICY_ADMINS, policy?.id);
    }, [policy?.id]);

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN]}
        >
            <ScreenWrapper
                testID={WorkspaceProfileSharePage.displayName}
                shouldShowOfflineIndicatorInWideScreen
            >
                <HeaderWithBackButton
                    title={translate('common.share')}
                    onBackButtonPress={Navigation.goBack}
                />
                <ScrollView style={[themeStyles.flex1, themeStyles.pt3]}>
                    <View style={[themeStyles.flex1, shouldUseNarrowLayout ? themeStyles.workspaceSectionMobile : themeStyles.workspaceSection]}>
                        <View style={[themeStyles.mh5]}>
                            <Text style={[themeStyles.textHeadlineH1, themeStyles.mb2]}>{translate('workspace.common.shareNote.header')}</Text>
                        </View>
                        <View style={[themeStyles.mh5, themeStyles.mb9]}>
                            <Text style={[themeStyles.textNormal]}>
                                {translate('workspace.common.shareNote.content.firstPart')}{' '}
                                <TextLink
                                    style={themeStyles.link}
                                    onPress={() => {
                                        if (!adminRoom?.reportID) {
                                            return;
                                        }
                                        Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(adminRoom.reportID));
                                    }}
                                >
                                    {CONST.REPORT.WORKSPACE_CHAT_ROOMS.ADMINS}
                                </TextLink>{' '}
                                {translate('workspace.common.shareNote.content.secondPart')}
                            </Text>
                        </View>

                        <View style={[themeStyles.workspaceSectionMobile, themeStyles.ph9]}>
                            <QRShareWithDownload
                                ref={qrCodeRef}
                                url={url}
                                title={policyName}
                                logo={logo ?? expensifyLogo}
                                svgLogo={svgLogo}
                                svgLogoFillColor={svgLogoFillColor}
                                logoBackgroundColor={logoBackgroundColor}
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
        </AccessOrNotFoundWrapper>
    );
}

WorkspaceProfileSharePage.displayName = 'WorkspaceProfileSharePage';

export default withPolicy(WorkspaceProfileSharePage);
