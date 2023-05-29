import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import lodashGet from 'lodash/get';
import CONST from '../../../CONST';
import ONYXKEYS from '../../../ONYXKEYS';
import styles from '../../../styles/styles';
import compose from '../../../libs/compose';
import Navigation from '../../../libs/Navigation/Navigation';
import * as Report from '../../../libs/actions/Report';
import * as Policy from '../../../libs/actions/Policy';
import * as ReportUtils from '../../../libs/ReportUtils';
import HeaderWithCloseButton from '../../../components/HeaderWithCloseButton';
import ScreenWrapper from '../../../components/ScreenWrapper';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import Text from '../../../components/Text';
import OfflineWithFeedback from '../../../components/OfflineWithFeedback';
import reportPropTypes from '../../reportPropTypes';
import withReportOrNotFound from '../../home/report/withReportOrNotFound';
import FullPageNotFoundView from '../../../components/BlockingViews/FullPageNotFoundView';
import MenuItemWithTopDescription from '../../../components/MenuItemWithTopDescription';
import ROUTES from '../../../ROUTES';
import * as Expensicons from '../../../components/Icon/Expensicons';
import MenuItem from '../../../components/MenuItem';

const propTypes = {
    /** Route params */
    route: PropTypes.shape({
        params: PropTypes.shape({
            /** Report ID passed via route r/:reportID/settings */
            reportID: PropTypes.string,
        }),
    }).isRequired,

    ...withLocalizePropTypes,

    /* Onyx Props */

    /** The active report */
    report: reportPropTypes.isRequired,

    /** The policies which the user has access to and which the report could be tied to */
    policies: PropTypes.shape({
        /** The policy name */
        name: PropTypes.string,

        /** ID of the policy */
        id: PropTypes.string,
    }),
};

const defaultProps = {
    policies: {},
};

class ReportSettingsPage extends Component {
    /**
     * @param {Object|null} linkedWorkspace - the workspace the report is on, null if the user isn't a member of the workspace
     * @returns {Boolean}
     */
    shouldDisableRename(linkedWorkspace) {
        if (ReportUtils.isDefaultRoom(this.props.report) || ReportUtils.isArchivedRoom(this.props.report)) {
            return true;
        }

        // The remaining checks only apply to public rooms
        if (!ReportUtils.isPublicRoom(this.props.report)) {
            return false;
        }

        // if the linked workspace is null, that means the person isn't a member of the workspace the report is in
        // which means this has to be a public room we want to disable renaming for
        if (!linkedWorkspace) {
            return true;
        }

        // If there is a linked workspace, that means the user is a member of the workspace the report is in.
        // Still, we only want policy owners and admins to be able to modify the name.
        return !Policy.isPolicyOwner(linkedWorkspace) && linkedWorkspace.role !== CONST.POLICY.ROLE.ADMIN;
    }

    /**
     * We only want policy owners and admins to be able to modify the welcome message.
     *
     * @param {Object|null} linkedWorkspace - the workspace the report is on, null if the user isn't a member of the workspace
     * @returns {Boolean}
     */
    shouldDisableWelcomeMessage(linkedWorkspace) {
        return !ReportUtils.isArchivedRoom(this.props.report) && !_.isEmpty(linkedWorkspace) && Policy.isPolicyOwner(linkedWorkspace) && linkedWorkspace.role === CONST.POLICY.ROLE.ADMIN;
    }

    render() {
        const shouldShowRoomName = !ReportUtils.isPolicyExpenseChat(this.props.report) && !ReportUtils.isThread(this.props.report);
        const linkedWorkspace = _.find(this.props.policies, (policy) => policy && policy.id === this.props.report.policyID);
        const shouldDisableRename = this.shouldDisableRename(linkedWorkspace) || ReportUtils.isThread(this.props.report);
        const notificationPreference = this.props.translate(`notificationPreferencesPage.notificationPreferences.${this.props.report.notificationPreference}`);
        const shouldDisableWelcomeMessage = this.shouldDisableRename(linkedWorkspace);
        const writeCapability = this.props.report.writeCapability || CONST.REPORT.WRITE_CAPABILITIES.ALL;
        const writeCapabilityText = this.props.translate(`writeCapabilityPage.writeCapability.${writeCapability}`);
        const shouldAllowWriteCapabilityEditing = lodashGet(linkedWorkspace, 'role', '') === CONST.POLICY.ROLE.ADMIN;

        return (
            <ScreenWrapper>
                <FullPageNotFoundView shouldShow={_.isEmpty(this.props.report)}>
                    <HeaderWithCloseButton
                        title={this.props.translate('common.settings')}
                        shouldShowBackButton
                        onBackButtonPress={() => Navigation.navigate(ROUTES.getReportDetailsRoute(this.props.report.reportID))}
                        onCloseButtonPress={() => Navigation.dismissModal(true)}
                    />
                    <MenuItemWithTopDescription
                        shouldShowRightIcon
                        title={notificationPreference}
                        description={this.props.translate('notificationPreferencesPage.label')}
                        onPress={() => Navigation.navigate(ROUTES.getReportSettingsNotificationPreferencesRoute(this.props.report.reportID))}
                    />
                    {shouldShowRoomName && (
                        <OfflineWithFeedback
                            pendingAction={lodashGet(this.props.report, 'pendingFields.reportName', null)}
                            errors={lodashGet(this.props.report, 'errorFields.reportName', null)}
                            onClose={() => Report.clearPolicyRoomNameErrors(this.props.report.reportID)}
                        >
                            {shouldDisableRename ? (
                                <View style={[styles.ph5, styles.pv3]}>
                                    <Text
                                        style={[styles.textLabelSupporting, styles.lh16, styles.mb1]}
                                        numberOfLines={1}
                                    >
                                        {this.props.translate('newRoomPage.roomName')}
                                    </Text>
                                    <Text
                                        numberOfLines={1}
                                        style={[styles.optionAlternateText, styles.pre]}
                                    >
                                        {this.props.report.reportName}
                                    </Text>
                                </View>
                            ) : (
                                <MenuItemWithTopDescription
                                    shouldShowRightIcon
                                    title={this.props.report.reportName}
                                    description={this.props.translate('newRoomPage.roomName')}
                                    onPress={() => Navigation.navigate(ROUTES.getReportSettingsRoomNameRoute(this.props.report.reportID))}
                                />
                            )}
                        </OfflineWithFeedback>
                    )}
                    {shouldAllowWriteCapabilityEditing ? (
                        <MenuItemWithTopDescription
                            shouldShowRightIcon
                            title={writeCapabilityText}
                            description={this.props.translate('writeCapabilityPage.label')}
                            onPress={() => Navigation.navigate(ROUTES.getReportSettingsWriteCapabilityRoute(this.props.report.reportID))}
                        />
                    ) : (
                        <View style={[styles.ph5, styles.pv3]}>
                            <Text
                                style={[styles.textLabelSupporting, styles.lh16, styles.mb1]}
                                numberOfLines={1}
                            >
                                {this.props.translate('writeCapabilityPage.label')}
                            </Text>
                            <Text
                                numberOfLines={1}
                                style={[styles.optionAlternateText, styles.pre]}
                            >
                                {writeCapabilityText}
                            </Text>
                        </View>
                    )}
                    <View style={[styles.ph5]}>
                        {Boolean(linkedWorkspace) && (
                            <View style={[styles.pv3]}>
                                <Text
                                    style={[styles.textLabelSupporting, styles.lh16, styles.mb1]}
                                    numberOfLines={1}
                                >
                                    {this.props.translate('workspace.common.workspace')}
                                </Text>
                                <Text
                                    numberOfLines={1}
                                    style={[styles.optionAlternateText, styles.pre]}
                                >
                                    {linkedWorkspace.name}
                                </Text>
                            </View>
                        )}
                        {Boolean(this.props.report.visibility) && (
                            <View style={[styles.pv3]}>
                                <Text
                                    style={[styles.textLabelSupporting, styles.lh16, styles.mb1]}
                                    numberOfLines={1}
                                >
                                    {this.props.translate('newRoomPage.visibility')}
                                </Text>
                                <Text
                                    numberOfLines={1}
                                    style={[styles.reportSettingsVisibilityText]}
                                >
                                    {this.props.translate(`newRoomPage.visibilityOptions.${this.props.report.visibility}`)}
                                </Text>
                                <Text style={[styles.textLabelSupporting, styles.mt1]}>
                                    {this.props.report.visibility === CONST.REPORT.VISIBILITY.RESTRICTED
                                        ? this.props.translate('newRoomPage.restrictedDescription')
                                        : this.props.translate('newRoomPage.privateDescription')}
                                </Text>
                            </View>
                        )}
                    </View>
                    {!shouldDisableWelcomeMessage && (
                        <MenuItem
                            title={this.props.translate('welcomeMessagePage.welcomeMessage')}
                            icon={Expensicons.ChatBubble}
                            onPress={() => Navigation.navigate(ROUTES.getReportWelcomeMessageRoute(this.props.report.reportID))}
                            shouldShowRightIcon
                        />
                    )}
                </FullPageNotFoundView>
            </ScreenWrapper>
        );
    }
}

ReportSettingsPage.propTypes = propTypes;
ReportSettingsPage.defaultProps = defaultProps;
export default compose(
    withLocalize,
    withReportOrNotFound,
    withOnyx({
        policies: {
            key: ONYXKEYS.COLLECTION.POLICY,
        },
    }),
)(ReportSettingsPage);
