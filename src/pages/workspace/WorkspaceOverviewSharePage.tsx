import React, {useMemo, useRef} from 'react';
import {View} from 'react-native';
import type {ImageSourcePropType} from 'react-native';
import expensifyLogo from '@assets/images/expensify-logo-round-transparent.png';
import ContextMenuItem from '@components/ContextMenuItem';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItem from '@components/MenuItem';
import {useSession} from '@components/OnyxListItemProvider';
import QRShareWithDownload from '@components/QRShare/QRShareWithDownload';
import type {QRShareWithDownloadHandle} from '@components/QRShare/QRShareWithDownload/types';
import RenderHTML from '@components/RenderHTML';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import useEnvironment from '@hooks/useEnvironment';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import Clipboard from '@libs/Clipboard';
import Navigation from '@libs/Navigation/Navigation';
import {getDefaultWorkspaceAvatar, getRoom} from '@libs/ReportUtils';
import shouldAllowDownloadQRCode from '@libs/shouldAllowDownloadQRCode';
import addTrailingForwardSlash from '@libs/UrlUtils';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import AccessOrNotFoundWrapper from './AccessOrNotFoundWrapper';
import withPolicy from './withPolicy';
import type {WithPolicyProps} from './withPolicy';

function WorkspaceOverviewSharePage({policy}: WithPolicyProps) {
    const icons = useMemoizedLazyExpensifyIcons(['Download', 'Copy', 'Checkmark', 'FallbackAvatar'] as const);
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {translate} = useLocalize();
    const {environmentURL} = useEnvironment();
    const qrCodeRef = useRef<QRShareWithDownloadHandle>(null);
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const session = useSession();

    const policyName = policy?.name ?? '';
    const policyID = policy?.id;
    const adminEmail = session?.email ?? '';
    const urlWithTrailingSlash = addTrailingForwardSlash(environmentURL);

    const url = policyID ? `${urlWithTrailingSlash}${ROUTES.WORKSPACE_JOIN_USER.getRoute(policyID, adminEmail)}` : '';

    const hasAvatar = !!policy?.avatarURL;
    const logo = hasAvatar ? (policy?.avatarURL as ImageSourcePropType) : undefined;

    const defaultWorkspaceAvatar = getDefaultWorkspaceAvatar(policyName) || icons.FallbackAvatar;
    const defaultWorkspaceAvatarColors = policyID ? StyleUtils.getDefaultWorkspaceAvatarColor(policyID) : StyleUtils.getDefaultWorkspaceAvatarColor('');

    const svgLogo = !hasAvatar ? defaultWorkspaceAvatar : undefined;
    const logoBackgroundColor = !hasAvatar ? defaultWorkspaceAvatarColors.backgroundColor?.toString() : undefined;
    const svgLogoFillColor = !hasAvatar ? defaultWorkspaceAvatarColors.fill : undefined;

    const adminRoomReportID = useMemo(() => {
        if (!policy?.id) {
            return undefined;
        }
        return getRoom(CONST.REPORT.CHAT_TYPE.POLICY_ADMINS, policy?.id)?.reportID ?? String(policy?.chatReportIDAdmins);
    }, [policy?.chatReportIDAdmins, policy?.id]);

    const adminsRoomLink = adminRoomReportID ? `${urlWithTrailingSlash}${ROUTES.REPORT_WITH_ID.getRoute(adminRoomReportID)}` : '';

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN]}
        >
            <ScreenWrapper
                testID="WorkspaceOverviewSharePage"
                shouldShowOfflineIndicatorInWideScreen
                enableEdgeToEdgeBottomSafeAreaPadding
            >
                <HeaderWithBackButton
                    title={translate('common.share')}
                    onBackButtonPress={Navigation.goBack}
                />
                <ScrollView
                    style={[styles.flex1, styles.pt3]}
                    addBottomSafeAreaPadding
                >
                    <View style={[styles.flex1, shouldUseNarrowLayout ? styles.workspaceSectionMobile : styles.workspaceSection]}>
                        <View style={[styles.mh5]}>
                            <Text style={[styles.textHeadlineH1, styles.mb2]}>{translate('workspace.common.shareNote.header')}</Text>
                        </View>
                        <View style={[styles.renderHTML, styles.mh5, styles.mb9]}>
                            <RenderHTML html={translate('workspace.common.shareNote.content', {adminsRoomLink})} />
                        </View>

                        <View style={[styles.workspaceSectionMobile, styles.ph9]}>
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
                        <View style={[styles.mt3, styles.ph4]}>
                            <ContextMenuItem
                                isAnonymousAction
                                text={translate('qrCodes.copy')}
                                icon={icons.Copy}
                                successIcon={icons.Checkmark}
                                successText={translate('qrCodes.copied')}
                                onPress={() => Clipboard.setString(url)}
                                shouldLimitWidth={false}
                                wrapperStyle={styles.sectionMenuItemTopDescription}
                            />
                            {/* Remove this once https://github.com/Expensify/App/issues/19834 is done.
                            We shouldn't introduce platform specific code in our codebase.
                            This is a temporary solution while Web is not supported for the QR code download feature */}
                            {shouldAllowDownloadQRCode && (
                                <MenuItem
                                    isAnonymousAction
                                    title={translate('common.download')}
                                    icon={icons.Download}
                                    onPress={() => qrCodeRef.current?.download?.()}
                                    wrapperStyle={styles.sectionMenuItemTopDescription}
                                />
                            )}
                        </View>
                    </View>
                </ScrollView>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default withPolicy(WorkspaceOverviewSharePage);
