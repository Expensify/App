import React from 'react';
import {View, ScrollView} from 'react-native';
import _ from 'underscore';
import ScreenWrapper from '../components/ScreenWrapper';
import HeaderWithBackButton from '../components/HeaderWithBackButton';
import Navigation from '../libs/Navigation/Navigation';
import withLocalize, {withLocalizePropTypes} from '../components/withLocalize';
import QRShareWithDownload from '../components/QRShare/QRShareWithDownload';
import compose from '../libs/compose';
import reportPropTypes from './reportPropTypes';
import withCurrentUserPersonalDetails, {withCurrentUserPersonalDetailsDefaultProps, withCurrentUserPersonalDetailsPropTypes} from '../components/withCurrentUserPersonalDetails';
import styles from '../styles/styles';
import expensifyLogo from '../../assets/images/expensify-logo-round-transparent.png';
import * as ReportUtils from '../libs/ReportUtils';
import MenuItem from '../components/MenuItem';
import Clipboard from '../libs/Clipboard';
import * as Expensicons from '../components/Icon/Expensicons';
import getPlatform from '../libs/getPlatform';
import CONST from '../CONST';
import ContextMenuItem from '../components/ContextMenuItem';
import * as UserUtils from '../libs/UserUtils';
import ROUTES from '../ROUTES';
import withEnvironment, {environmentPropTypes} from '../components/withEnvironment';
import * as Url from '../libs/Url';

const propTypes = {
    /** The report currently being looked at */
    report: reportPropTypes,

    ...withLocalizePropTypes,
    ...withCurrentUserPersonalDetailsPropTypes,
    ...environmentPropTypes,
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

                <ScrollView style={[styles.flex1, styles.mt3]}>
                    <View style={styles.shareCodePage}>
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

export default compose(withEnvironment, withLocalize, withCurrentUserPersonalDetails)(ShareCodePage);
