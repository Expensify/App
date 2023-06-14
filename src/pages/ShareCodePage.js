import React from 'react';
import {View, ScrollView} from 'react-native';
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

const propTypes = {
    /** The report currently being looked at */
    report: reportPropTypes,

    ...withLocalizePropTypes,
    ...withCurrentUserPersonalDetailsPropTypes,
};

const defaultProps = {
    report: undefined,
    ...withCurrentUserPersonalDetailsDefaultProps,
};

// eslint-disable-next-line react/prefer-stateless-function
class ShareCodePage extends React.Component {
    qrCodeRef = React.createRef();

    render() {
        const isReport = this.props.report != null && this.props.report.reportID != null;
        const subtitle = ReportUtils.getChatRoomSubtitle(this.props.report);

        const url = isReport ? `${CONST.NEW_EXPENSIFY_URL}r/${this.props.report.reportID}` : `${CONST.NEW_EXPENSIFY_URL}details?login=${encodeURIComponent(this.props.session.email)}`;

        const platform = getPlatform();
        const isNative = platform === CONST.PLATFORM.IOS || platform === CONST.PLATFORM.ANDROID;

        return (
            <ScreenWrapper>
                <HeaderWithBackButton
                    title={this.props.translate('common.shareCode')}
                    onBackButtonPress={() => Navigation.goBack(isReport ? ROUTES.getReportDetailsRoute(this.props.report.reportID) : ROUTES.SETTINGS)}
                />

                <ScrollView style={[styles.flex1, styles.mt3]}>
                    <View style={styles.shareCodePage}>
                        <QRShareWithDownload
                            ref={this.qrCodeRef}
                            url={url}
                            title={isReport ? this.props.report.reportName : this.props.currentUserPersonalDetails.displayName}
                            subtitle={isReport ? subtitle : this.props.session.email}
                            logo={isReport ? expensifyLogo : UserUtils.getAvatarUrl(this.props.currentUserPersonalDetails.avatar, this.props.currentUserPersonalDetails.login)}
                            logoRatio={isReport ? CONST.QR.EXPENSIFY_LOGO_SIZE_RATIO : CONST.QR.DEFAULT_LOGO_SIZE_RATIO}
                            logoMarginRatio={isReport ? CONST.QR.EXPENSIFY_LOGO_MARGIN_RATIO : CONST.QR.DEFAULT_LOGO_MARGIN_RATIO}
                        />
                    </View>

                    <View style={{marginTop: 36}}>
                        <ContextMenuItem
                            text={this.props.translate('qrCodes.copyUrlToClipboard')}
                            shouldShowRightIcon
                            icon={Expensicons.Copy}
                            successIcon={Expensicons.Checkmark}
                            successText={this.props.translate('qrCodes.copied')}
                            onPress={() => Clipboard.setString(url)}
                        />

                        {isNative && (
                            <MenuItem
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

export default compose(withLocalize, withCurrentUserPersonalDetails)(ShareCodePage);
