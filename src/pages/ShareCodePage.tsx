import React, {useMemo, useRef} from 'react';
import {View} from 'react-native';
import type {ImageSourcePropType} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import type {SvgProps} from 'react-native-svg';
import expensifyLogo from '@assets/images/expensify-logo-round-transparent.png';
import ContextMenuItem from '@components/ContextMenuItem';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Expensicons from '@components/Icon/Expensicons';
import MenuItem from '@components/MenuItem';
import QRShare from '@components/QRShare';
import type {QRShareHandle} from '@components/QRShare/types';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useEnvironment from '@hooks/useEnvironment';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import Clipboard from '@libs/Clipboard';
import Navigation from '@libs/Navigation/Navigation';
import type {BackToParams} from '@libs/Navigation/types';
import * as ReportUtils from '@libs/ReportUtils';
import * as Url from '@libs/Url';
import * as UserUtils from '@libs/UserUtils';
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
    const themeStyles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {translate} = useLocalize();
    const {environmentURL} = useEnvironment();
    const qrCodeRef = useRef<QRShareHandle>(null);
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();

    const isReport = !!report?.reportID;

    const subtitle = useMemo(() => {
        if (isReport) {
            if (ReportUtils.isExpenseReport(report)) {
                return ReportUtils.getPolicyName(report);
            }
            if (ReportUtils.isMoneyRequestReport(report)) {
                // generate subtitle from participants
                return ReportUtils.getParticipantsAccountIDsForDisplay(report, true)
                    .map((accountID) => ReportUtils.getDisplayNameForParticipant(accountID))
                    .join(' & ');
            }

            return ReportUtils.getParentNavigationSubtitle(report).workspaceName ?? ReportUtils.getChatRoomSubtitle(report);
        }

        return currentUserPersonalDetails.login;
    }, [report, currentUserPersonalDetails, isReport]);

    const title = isReport ? ReportUtils.getReportName(report) : currentUserPersonalDetails.displayName ?? '';
    const urlWithTrailingSlash = Url.addTrailingForwardSlash(environmentURL);
    const url = isReport
        ? `${urlWithTrailingSlash}${ROUTES.REPORT_WITH_ID.getRoute(report.reportID)}`
        : `${urlWithTrailingSlash}${ROUTES.PROFILE.getRoute(currentUserPersonalDetails.accountID ?? '-1')}`;

    const logo = isReport ? getLogoForWorkspace(report, policy) : (UserUtils.getAvatarUrl(currentUserPersonalDetails?.avatar, currentUserPersonalDetails?.accountID) as ImageSourcePropType);

    // Default logos (avatars) are SVG and they require some special logic to display correctly
    let svgLogo: React.FC<SvgProps> | undefined;
    let logoBackgroundColor: string | undefined;
    let svgLogoFillColor: string | undefined;

    if (!logo && policy && !policy.avatarURL) {
        svgLogo = ReportUtils.getDefaultWorkspaceAvatar(policy.name) || Expensicons.FallbackAvatar;

        const defaultWorkspaceAvatarColors = StyleUtils.getDefaultWorkspaceAvatarColor(policy.id ?? '');
        logoBackgroundColor = defaultWorkspaceAvatarColors.backgroundColor?.toString();
        svgLogoFillColor = defaultWorkspaceAvatarColors.fill;
    }

    return (
        <ScreenWrapper testID={ShareCodePage.displayName}>
            <HeaderWithBackButton
                title={translate('common.shareCode')}
                onBackButtonPress={() => Navigation.goBack(isReport ? ROUTES.REPORT_WITH_ID_DETAILS.getRoute(report?.reportID, backTo) : undefined)}
                shouldShowBackButton
            />
            <ScrollView style={[themeStyles.flex1, themeStyles.pt3]}>
                <View style={[themeStyles.workspaceSectionMobile, themeStyles.ph5]}>
                    {/* 
                    Right now QR code download button is not shown anymore
                    This is a temporary measure because right now it's broken because of the Fabric update.
                    We need to wait for react-native v0.74 to be released so react-native-view-shot gets fixed.
                    
                    Please see https://github.com/Expensify/App/issues/40110 to see if it can be re-enabled.
                */}
                    <QRShare
                        ref={qrCodeRef}
                        url={url}
                        title={title}
                        subtitle={subtitle}
                        logo={logo}
                        svgLogo={svgLogo}
                        logoBackgroundColor={logoBackgroundColor}
                        svgLogoFillColor={svgLogoFillColor}
                        logoRatio={CONST.QR.DEFAULT_LOGO_SIZE_RATIO}
                        logoMarginRatio={CONST.QR.DEFAULT_LOGO_MARGIN_RATIO}
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

                    <MenuItem
                        title={translate(`referralProgram.${CONST.REFERRAL_PROGRAM.CONTENT_TYPES.SHARE_CODE}.buttonText1`)}
                        icon={Expensicons.Cash}
                        onPress={() => Navigation.navigate(ROUTES.REFERRAL_DETAILS_MODAL.getRoute(CONST.REFERRAL_PROGRAM.CONTENT_TYPES.SHARE_CODE, Navigation.getActiveRoute()))}
                        shouldShowRightIcon
                    />
                </View>
            </ScrollView>
        </ScreenWrapper>
    );
}

ShareCodePage.displayName = 'ShareCodePage';

export default ShareCodePage;
