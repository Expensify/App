import PropTypes from 'prop-types';
import React from 'react';
import {ScrollView, View} from 'react-native';
import _ from 'underscore';
import expensifyLogo from '@assets/images/expensify-logo-round-transparent.png';
import ContextMenuItem from '@components/ContextMenuItem';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Expensicons from '@components/Icon/Expensicons';
import MenuItem from '@components/MenuItem';
import QRShareWithDownload from '@components/QRShare/QRShareWithDownload';
import ScreenWrapper from '@components/ScreenWrapper';
import withCurrentUserPersonalDetails, {withCurrentUserPersonalDetailsDefaultProps, withCurrentUserPersonalDetailsPropTypes} from '@components/withCurrentUserPersonalDetails';
import withEnvironment from '@components/withEnvironment';
import withLocalize, {withLocalizePropTypes} from '@components/withLocalize';
import withThemeStyles, {withThemeStylesPropTypes} from '@components/withThemeStyles';
import Clipboard from '@libs/Clipboard';
import compose from '@libs/compose';
import getPlatform from '@libs/getPlatform';
import Navigation from '@libs/Navigation/Navigation';
import * as ReportUtils from '@libs/ReportUtils';
import * as Url from '@libs/Url';
import * as UserUtils from '@libs/UserUtils';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import reportPropTypes from './reportPropTypes';

const propTypes = {
    /** The report currently being looked at */
    report: reportPropTypes,

    /** The string value representing the URL of the current environment */
    environmentURL: PropTypes.string.isRequired,

    ...withLocalizePropTypes,
    ...withCurrentUserPersonalDetailsPropTypes,
    ...withThemeStylesPropTypes,
};

const defaultProps = {
    report: undefined,
    ...withCurrentUserPersonalDetailsDefaultProps,
};

// eslint-disable-next-line react/prefer-stateless-function
class ShareCodePage extends React.Component {
    qrCodeRef = React.createRef();

    /**
     * @param {Boolean} isReport
     * @return {String|string|*}
     */
    getSubtitle(isReport) {
        if (ReportUtils.isExpenseReport(this.props.report)) {
            return ReportUtils.getPolicyName(this.props.report);
        }
        if (ReportUtils.isMoneyRequestReport(this.props.report)) {
            // generate subtitle from participants
            return _.map(ReportUtils.getParticipantsIDs(this.props.report), (accountID) => ReportUtils.getDisplayNameForParticipant(accountID)).join(' & ');
        }

        if (isReport) {
            return ReportUtils.getParentNavigationSubtitle(this.props.report).workspaceName || ReportUtils.getChatRoomSubtitle(this.props.report);
        }

        return this.props.formatPhoneNumber(this.props.session.email);
    }

    render() {
        const isReport = this.props.report != null && this.props.report.reportID != null;
        const title = isReport ? ReportUtils.getReportName(this.props.report) : this.props.currentUserPersonalDetails.displayName;
        const subtitle = this.getSubtitle(isReport);
        const urlWithTrailingSlash = Url.addTrailingForwardSlash(this.props.environmentURL);
        const url = isReport
            ? `${urlWithTrailingSlash}${ROUTES.REPORT_WITH_ID.getRoute(this.props.report.reportID)}`
            : `${urlWithTrailingSlash}${ROUTES.PROFILE.getRoute(this.props.session.accountID)}`;

        const platform = getPlatform();
        const isNative = platform === CONST.PLATFORM.IOS || platform === CONST.PLATFORM.ANDROID;

        return (
            <ScreenWrapper testID={ShareCodePage.displayName}>
                <HeaderWithBackButton
                    title={this.props.translate('common.shareCode')}
                    onBackButtonPress={() => Navigation.goBack(isReport ? ROUTES.REPORT_WITH_ID_DETAILS.getRoute(this.props.report.reportID) : ROUTES.SETTINGS)}
                />

                <ScrollView style={[this.props.themeStyles.flex1, this.props.themeStyles.mt3]}>
                    <View style={this.props.themeStyles.shareCodePage}>
                        <QRShareWithDownload
                            ref={this.qrCodeRef}
                            url={url}
                            title={title}
                            subtitle={subtitle}
                            logo={isReport ? expensifyLogo : UserUtils.getAvatarUrl(this.props.currentUserPersonalDetails.avatar, this.props.currentUserPersonalDetails.accountID)}
                            logoRatio={isReport ? CONST.QR.EXPENSIFY_LOGO_SIZE_RATIO : CONST.QR.DEFAULT_LOGO_SIZE_RATIO}
                            logoMarginRatio={isReport ? CONST.QR.EXPENSIFY_LOGO_MARGIN_RATIO : CONST.QR.DEFAULT_LOGO_MARGIN_RATIO}
                        />
                    </View>

                    <View style={{marginTop: 36}}>
                        <ContextMenuItem
                            isAnonymousAction
                            text={this.props.translate('qrCodes.copyUrlToClipboard')}
                            shouldShowRightIcon
                            icon={Expensicons.Copy}
                            successIcon={Expensicons.Checkmark}
                            successText={this.props.translate('qrCodes.copied')}
                            onPress={() => Clipboard.setString(url)}
                        />

                        <MenuItem
                            title={this.props.translate(`referralProgram.${CONST.REFERRAL_PROGRAM.CONTENT_TYPES.SHARE_CODE}.buttonText1`)}
                            icon={Expensicons.Cash}
                            onPress={() => Navigation.navigate(ROUTES.REFERRAL_DETAILS_MODAL.getRoute(CONST.REFERRAL_PROGRAM.CONTENT_TYPES.SHARE_CODE))}
                        />

                        {isNative && (
                            <MenuItem
                                isAnonymousAction
                                title={this.props.translate('common.download')}
                                icon={Expensicons.Download}
                                // eslint-disable-next-line es/no-optional-chaining
                                onPress={() => this.qrCodeRef.current?.download()}
                            />
                        )}
                    </View>
                </ScrollView>
            </ScreenWrapper>
        );
    }
}

ShareCodePage.propTypes = propTypes;
ShareCodePage.defaultProps = defaultProps;
ShareCodePage.displayName = 'ShareCodePage';

export default compose(withEnvironment, withLocalize, withCurrentUserPersonalDetails, withThemeStyles)(ShareCodePage);
