import React from 'react';
import {View, ScrollView} from 'react-native';
import ScreenWrapper from '../components/ScreenWrapper';
import HeaderWithCloseButton from '../components/HeaderWithCloseButton';
import Navigation from '../libs/Navigation/Navigation';
import withLocalize, {withLocalizePropTypes} from '../components/withLocalize';
import QRShareWithDownload from '../components/QRShare/QRShareWithDownload';
import compose from '../libs/compose';
import reportPropTypes from './reportPropTypes';
import withCurrentUserPersonalDetails, {withCurrentUserPersonalDetailsDefaultProps, withCurrentUserPersonalDetailsPropTypes} from '../components/withCurrentUserPersonalDetails';
import styles from '../styles/styles';
import roomAvatar from '../../assets/images/avatars/room.png';
import * as ReportUtils from '../libs/ReportUtils';
import MenuItem from '../components/MenuItem';
import Clipboard from '../libs/Clipboard';
import * as Expensicons from '../components/Icon/Expensicons';
import getPlatform from '../libs/getPlatform';
import CONST from '../CONST';

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

        const url = isReport ? `${CONST.NEW_EXPENSIFY_URL}r/${this.props.report.reportID}` : `${CONST.NEW_EXPENSIFY_URL}details?login=${this.props.session.email}`;

        const platform = getPlatform();
        const isNative = platform === CONST.PLATFORM.IOS || platform === CONST.PLATFORM.ANDROID;

        return (
            <ScreenWrapper>
                <HeaderWithCloseButton
                    title={this.props.translate('common.shareCode')}
                    shouldShowBackButton
                    onBackButtonPress={() => Navigation.goBack()}
                    onCloseButtonPress={() => Navigation.dismissModal(true)}
                />

                <ScrollView style={[styles.flex1, styles.mt3]}>
                    <View style={styles.shareCodePage}>
                        <QRShareWithDownload
                            ref={this.qrCodeRef}
                            url={url}
                            title={isReport ? this.props.report.reportName : this.props.currentUserPersonalDetails.displayName}
                            subtitle={isReport ? ReportUtils.getPolicyName(this.props.report) : this.props.session.email}
                            logo={isReport ? roomAvatar : this.props.currentUserPersonalDetails.avatar}
                        />
                    </View>

                    <View style={{marginTop: 36}}>
                        <MenuItem
                            title={this.props.translate('common.share')}
                            shouldShowRightIcon
                            icon={Expensicons.Link}
                            onPress={() => Clipboard.setString(url)}
                        />

                        {isNative && (
                            <MenuItem
                                title={this.props.translate('common.download')}
                                shouldShowRightIcon
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
