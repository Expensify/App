import React, {useMemo, useRef} from 'react';
import {View} from 'react-native';
import type {ImageSourcePropType} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import type {SvgProps} from 'react-native-svg';
import expensifyLogo from '@assets/images/expensify-logo-round-transparent.png';
import ContextMenuItem from '@components/ContextMenuItem';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
// eslint-disable-next-line no-restricted-imports
import * as Expensicons from '@components/Icon/Expensicons';
import MenuItem from '@components/MenuItem';
import QRShareWithDownload from '@components/QRShare/QRShareWithDownload';
import type {QRShareWithDownloadHandle} from '@components/QRShare/QRShareWithDownload/types';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useEnvironment from '@hooks/useEnvironment';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useReportIsArchived from '@hooks/useReportIsArchived';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import Clipboard from '@libs/Clipboard';
import Navigation from '@libs/Navigation/Navigation';
import type {BackToParams} from '@libs/Navigation/types';
import {
    getChatRoomSubtitle,
    getDefaultWorkspaceAvatar,
    getDisplayNameForParticipant,
    getParentNavigationSubtitle,
    getParticipantsAccountIDsForDisplay,
    getPolicyName,
    getReportName,
    isExpenseReport,
    isMoneyRequestReport,
} from '@libs/ReportUtils';
import shouldAllowDownloadQRCode from '@libs/shouldAllowDownloadQRCode';
import addTrailingForwardSlash from '@libs/UrlUtils';
import {getAvatarURL} from '@libs/UserAvatarUtils';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {Policy, Report} from '@src/types/onyx';

type ShareCodePageOnyxProps = {
    /** The report currently being looked at */
    report?: OnyxEntry<Report>;

    /** The policy for the report currently being looked at */
    policy?: OnyxEntry<Policy>;
};

type ShareCodePageProps = ShareCodePageOnyxProps & BackToParams;

/**
 * When sharing a policy (workspace) only return user avatar that is user defined. Default ws avatars have separate logic.
 * In any other case default to expensify logo
 */

function getLogoForWorkspace(report: OnyxEntry<Report>, policy?: OnyxEntry<Policy>): ImageSourcePropType | undefined {
    if (!policy || !policy.id || report?.type !== 'chat') {
        return expensifyLogo;
    }

    if (!policy.avatarURL) {
        return undefined;
    }

    return policy.avatarURL as ImageSourcePropType;
}

function ShareCodePage({report, policy, backTo}: ShareCodePageProps) {
    const icons = useMemoizedLazyExpensifyIcons(['Download', 'Cash', 'FallbackAvatar']);
    const themeStyles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {translate, formatPhoneNumber} = useLocalize();
    const {environmentURL} = useEnvironment();
    const qrCodeRef = useRef<QRShareWithDownloadHandle>(null);

    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const isParentReportArchived = useReportIsArchived(report?.parentReportID);
    const isReportArchived = useReportIsArchived(report?.reportID);
    const isReport = !!report?.reportID;

    const subtitle = useMemo(() => {
        if (isReport) {
            if (isExpenseReport(report)) {
                return getPolicyName({report});
            }
            if (isMoneyRequestReport(report)) {
                // generate subtitle from participants
                return getParticipantsAccountIDsForDisplay(report, true)
                    .map((accountID) => getDisplayNameForParticipant({accountID, formatPhoneNumber}))
                    .join(' & ');
            }

            return getParentNavigationSubtitle(report, isParentReportArchived).workspaceName ?? getChatRoomSubtitle(report, false, isReportArchived);
        }

        return currentUserPersonalDetails.login;
    }, [report, currentUserPersonalDetails.login, isReport, isReportArchived, isParentReportArchived, formatPhoneNumber]);

    // eslint-disable-next-line @typescript-eslint/no-deprecated
    const title = isReport ? getReportName(report) : (currentUserPersonalDetails.displayName ?? '');
    const urlWithTrailingSlash = addTrailingForwardSlash(environmentURL);
    const url = isReport
        ? `${urlWithTrailingSlash}${ROUTES.REPORT_WITH_ID.getRoute(report.reportID)}`
        : `${urlWithTrailingSlash}${ROUTES.PROFILE.getRoute(currentUserPersonalDetails.accountID ?? CONST.DEFAULT_NUMBER_ID)}`;

    const logo = isReport
        ? getLogoForWorkspace(report, policy)
        : (getAvatarURL({avatarSource: currentUserPersonalDetails?.avatar, accountID: currentUserPersonalDetails?.accountID}) as ImageSourcePropType);

    // Default logos (avatars) are SVG and they require some special logic to display correctly
    let svgLogo: React.FC<SvgProps> | undefined;
    let logoBackgroundColor: string | undefined;
    let svgLogoFillColor: string | undefined;

    if (!logo && policy && !policy.avatarURL) {
        svgLogo = getDefaultWorkspaceAvatar(policy.name) || icons.FallbackAvatar;

        const defaultWorkspaceAvatarColors = StyleUtils.getDefaultWorkspaceAvatarColor(policy.id);
        logoBackgroundColor = defaultWorkspaceAvatarColors.backgroundColor?.toString();
        svgLogoFillColor = defaultWorkspaceAvatarColors.fill;
    }

    return (
        <ScreenWrapper testID="ShareCodePage">
            <HeaderWithBackButton
                title={translate('common.shareCode')}
                onBackButtonPress={() => Navigation.goBack(isReport ? ROUTES.REPORT_WITH_ID_DETAILS.getRoute(report?.reportID, backTo) : undefined)}
                shouldShowBackButton
            />
            <ScrollView style={[themeStyles.flex1, themeStyles.pt3]}>
                <View style={[themeStyles.workspaceSectionMobile, themeStyles.ph5]}>
                    <QRShareWithDownload
                        ref={qrCodeRef}
                        url={url}
                        title={title}
                        subtitle={subtitle}
                        logo={logo}
                        logoRatio={logo === expensifyLogo ? CONST.QR.EXPENSIFY_LOGO_SIZE_RATIO : CONST.QR.DEFAULT_LOGO_SIZE_RATIO}
                        logoMarginRatio={logo === expensifyLogo ? CONST.QR.EXPENSIFY_LOGO_MARGIN_RATIO : CONST.QR.DEFAULT_LOGO_MARGIN_RATIO}
                        svgLogo={svgLogo}
                        svgLogoFillColor={svgLogoFillColor}
                        logoBackgroundColor={logoBackgroundColor}
                    />
                </View>

                <View style={themeStyles.mt9}>
                    <ContextMenuItem
                        isAnonymousAction
                        text={translate('qrCodes.copy')}
                        icon={Expensicons.Copy}
                        successIcon={Expensicons.Checkmark}
                        successText={translate('qrCodes.copied')}
                        onPress={() => Clipboard.setString(url)}
                        shouldLimitWidth={false}
                    />
                    {/* Remove this platform specific condition once https://github.com/Expensify/App/issues/19834 is done.
                    We shouldn't introduce platform specific code in our codebase.
                    This is a temporary solution while Web is not supported for the QR code download feature */}
                    {shouldAllowDownloadQRCode && (
                        <MenuItem
                            isAnonymousAction
                            title={translate('common.download')}
                            icon={icons.Download}
                            // eslint-disable-next-line @typescript-eslint/no-misused-promises
                            onPress={() => qrCodeRef.current?.download?.()}
                        />
                    )}

                    <MenuItem
                        title={translate(`referralProgram.${CONST.REFERRAL_PROGRAM.CONTENT_TYPES.SHARE_CODE}.buttonText`)}
                        icon={icons.Cash}
                        onPress={() => Navigation.navigate(ROUTES.REFERRAL_DETAILS_MODAL.getRoute(CONST.REFERRAL_PROGRAM.CONTENT_TYPES.SHARE_CODE, Navigation.getActiveRoute()))}
                        shouldShowRightIcon
                    />
                </View>
            </ScrollView>
        </ScreenWrapper>
    );
}

export default ShareCodePage;
