import React, {useRef} from 'react';
import {ScrollView, View} from 'react-native';
import type {ImageSourcePropType} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import expensifyLogo from '@assets/images/expensify-logo-round-transparent.png';
import ContextMenuItem from '@components/ContextMenuItem';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Expensicons from '@components/Icon/Expensicons';
import MenuItem from '@components/MenuItem';
import QRShareWithDownload from '@components/QRShare/QRShareWithDownload';
import type QRShareWithDownloadHandle from '@components/QRShare/QRShareWithDownload/types';
import ScreenWrapper from '@components/ScreenWrapper';
import withCurrentUserPersonalDetails from '@components/withCurrentUserPersonalDetails';
import type {WithCurrentUserPersonalDetailsProps} from '@components/withCurrentUserPersonalDetails';
import useEnvironment from '@hooks/useEnvironment';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import Clipboard from '@libs/Clipboard';
import getPlatform from '@libs/getPlatform';
import Navigation from '@libs/Navigation/Navigation';
import * as ReportUtils from '@libs/ReportUtils';
import * as Url from '@libs/Url';
import * as UserUtils from '@libs/UserUtils';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {Report, Session} from '@src/types/onyx';

type ShareCodePageOnyxProps = WithCurrentUserPersonalDetailsProps & {
    /** Session info for the currently logged in user. */
    session: OnyxEntry<Session>;

    /** The report currently being looked at */
    report?: OnyxEntry<Report>;
};

type ShareCodePageProps = ShareCodePageOnyxProps;

function ShareCodePage({report, session, currentUserPersonalDetails}: ShareCodePageProps) {
    const themeStyles = useThemeStyles();
    const {translate} = useLocalize();
    const {environmentURL} = useEnvironment();
    const qrCodeRef = useRef<QRShareWithDownloadHandle>(null);
    const {isSmallScreenWidth} = useWindowDimensions();

    const isReport = !!report?.reportID;

    const getSubtitle = () => {
        if (isReport) {
            if (ReportUtils.isExpenseReport(report)) {
                return ReportUtils.getPolicyName(report);
            }
            if (ReportUtils.isMoneyRequestReport(report)) {
                // generate subtitle from participants
                return ReportUtils.getVisibleMemberIDs(report)
                    .map((accountID) => ReportUtils.getDisplayNameForParticipant(accountID))
                    .join(' & ');
            }

            return ReportUtils.getParentNavigationSubtitle(report).workspaceName ?? ReportUtils.getChatRoomSubtitle(report);
        }

        return session?.email;
    };

    const title = isReport ? ReportUtils.getReportName(report) : currentUserPersonalDetails.displayName ?? '';
    const subtitle = getSubtitle();
    const urlWithTrailingSlash = Url.addTrailingForwardSlash(environmentURL);
    const url = isReport ? `${urlWithTrailingSlash}${ROUTES.REPORT_WITH_ID.getRoute(report.reportID)}` : `${urlWithTrailingSlash}${ROUTES.PROFILE.getRoute(session?.accountID ?? '')}`;
    const platform = getPlatform();
    const isNative = platform === CONST.PLATFORM.IOS || platform === CONST.PLATFORM.ANDROID;

    return (
        <ScreenWrapper
            testID={ShareCodePage.displayName}
            shouldShowOfflineIndicatorInWideScreen={!isReport}
        >
            <HeaderWithBackButton
                title={translate('common.shareCode')}
                onBackButtonPress={() => Navigation.goBack(isReport ? ROUTES.REPORT_WITH_ID_DETAILS.getRoute(report.reportID) : ROUTES.SETTINGS)}
                shouldShowBackButton={isReport || isSmallScreenWidth}
            />
            <ScrollView style={[themeStyles.flex1, themeStyles.mt3]}>
                <View style={[isSmallScreenWidth ? themeStyles.workspaceSectionMobile : themeStyles.workspaceSection, themeStyles.ph4]}>
                    <QRShareWithDownload
                        ref={qrCodeRef}
                        url={url}
                        title={title}
                        subtitle={subtitle}
                        logo={isReport ? expensifyLogo : (UserUtils.getAvatarUrl(currentUserPersonalDetails?.avatar, currentUserPersonalDetails?.accountID) as ImageSourcePropType)}
                        logoRatio={isReport ? CONST.QR.EXPENSIFY_LOGO_SIZE_RATIO : CONST.QR.DEFAULT_LOGO_SIZE_RATIO}
                        logoMarginRatio={isReport ? CONST.QR.EXPENSIFY_LOGO_MARGIN_RATIO : CONST.QR.DEFAULT_LOGO_MARGIN_RATIO}
                    />
                </View>

                <View style={{marginTop: 36}}>
                    <ContextMenuItem
                        isAnonymousAction
                        text={translate('qrCodes.copy')}
                        icon={Expensicons.Copy}
                        successIcon={Expensicons.Checkmark}
                        successText={translate('qrCodes.copied')}
                        onPress={() => Clipboard.setString(url)}
                        shouldLimitWidth={false}
                    />

                    {isNative && (
                        <MenuItem
                            isAnonymousAction
                            title={translate('common.download')}
                            icon={Expensicons.Download}
                            // eslint-disable-next-line @typescript-eslint/no-misused-promises
                            onPress={() => qrCodeRef.current?.download?.()}
                        />
                    )}

                    <MenuItem
                        title={translate(`referralProgram.${CONST.REFERRAL_PROGRAM.CONTENT_TYPES.SHARE_CODE}.buttonText1`)}
                        icon={Expensicons.Cash}
                        onPress={() => Navigation.navigate(ROUTES.REFERRAL_DETAILS_MODAL.getRoute(CONST.REFERRAL_PROGRAM.CONTENT_TYPES.SHARE_CODE))}
                    />
                </View>
            </ScrollView>
        </ScreenWrapper>
    );
}

ShareCodePage.displayName = 'ShareCodePage';

export default withCurrentUserPersonalDetails(ShareCodePage);
