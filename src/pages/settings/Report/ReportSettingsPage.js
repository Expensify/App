import React, {useMemo} from 'react';
import PropTypes from 'prop-types';
import {View, ScrollView} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import lodashGet from 'lodash/get';
import CONST from '../../../CONST';
import ONYXKEYS from '../../../ONYXKEYS';
import styles from '../../../styles/styles';
import compose from '../../../libs/compose';
import Navigation from '../../../libs/Navigation/Navigation';
import * as Report from '../../../libs/actions/Report';
import * as ReportUtils from '../../../libs/ReportUtils';
import HeaderWithBackButton from '../../../components/HeaderWithBackButton';
import ScreenWrapper from '../../../components/ScreenWrapper';
import useLocalize from '../../../hooks/useLocalize';
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

function ReportSettingsPage(props) {
    const {report, policies} = props;
    const {translate} = useLocalize();
    // The workspace the report is on, null if the user isn't a member of the workspace
    const linkedWorkspace = useMemo(() => _.find(policies, (policy) => policy && policy.id === report.policyID), [policies, report.policyID]);
    const shouldDisableRename = useMemo(() => ReportUtils.shouldDisableRename(report, linkedWorkspace), [report, linkedWorkspace]);

    // We only want policy owners and admins to be able to modify the welcome message.
    const shouldDisableWelcomeMessage =
        ReportUtils.isArchivedRoom(report) || !ReportUtils.isChatRoom(report) || _.isEmpty(linkedWorkspace) || linkedWorkspace.role !== CONST.POLICY.ROLE.ADMIN;

    const shouldDisableSettings = _.isEmpty(report) || ReportUtils.shouldDisableSettings(report);
    const shouldShowRoomName = !ReportUtils.isPolicyExpenseChat(report) && !ReportUtils.isChatThread(report);
    const notificationPreference = translate(`notificationPreferencesPage.notificationPreferences.${report.notificationPreference}`);
    const writeCapability = ReportUtils.isAdminRoom(report) ? CONST.REPORT.WRITE_CAPABILITIES.ADMINS : report.writeCapability || CONST.REPORT.WRITE_CAPABILITIES.ALL;

    const writeCapabilityText = translate(`writeCapabilityPage.writeCapability.${writeCapability}`);
    const shouldAllowWriteCapabilityEditing = lodashGet(linkedWorkspace, 'role', '') === CONST.POLICY.ROLE.ADMIN && !ReportUtils.isAdminRoom(report);

    return (
        <ScreenWrapper>
            <FullPageNotFoundView shouldShow={shouldDisableSettings}>
                <HeaderWithBackButton
                    title={translate('common.settings')}
                    onBackButtonPress={() => Navigation.goBack(ROUTES.getReportDetailsRoute(report.reportID))}
                />
                <ScrollView style={[styles.flex1]}>
                    <MenuItemWithTopDescription
                        shouldShowRightIcon
                        title={notificationPreference}
                        description={translate('notificationPreferencesPage.label')}
                        onPress={() => Navigation.navigate(ROUTES.getReportSettingsNotificationPreferencesRoute(report.reportID))}
                    />
                    {shouldShowRoomName && (
                        <OfflineWithFeedback
                            pendingAction={lodashGet(report, 'pendingFields.reportName', null)}
                            errors={lodashGet(report, 'errorFields.reportName', null)}
                            errorRowStyles={[styles.ph5]}
                            onClose={() => Report.clearPolicyRoomNameErrors(report.reportID)}
                        >
                            {shouldDisableRename ? (
                                <View style={[styles.ph5, styles.pv3]}>
                                    <Text
                                        style={[styles.textLabelSupporting, styles.lh16, styles.mb1]}
                                        numberOfLines={1}
                                    >
                                        {translate('newRoomPage.roomName')}
                                    </Text>
                                    <Text
                                        numberOfLines={1}
                                        style={[styles.optionAlternateText, styles.pre]}
                                    >
                                        {report.reportName}
                                    </Text>
                                </View>
                            ) : (
                                <MenuItemWithTopDescription
                                    shouldShowRightIcon
                                    title={report.reportName}
                                    description={translate('newRoomPage.roomName')}
                                    onPress={() => Navigation.navigate(ROUTES.getReportSettingsRoomNameRoute(report.reportID))}
                                />
                            )}
                        </OfflineWithFeedback>
                    )}
                    {shouldAllowWriteCapabilityEditing ? (
                        <MenuItemWithTopDescription
                            shouldShowRightIcon
                            title={writeCapabilityText}
                            description={translate('writeCapabilityPage.label')}
                            onPress={() => Navigation.navigate(ROUTES.getReportSettingsWriteCapabilityRoute(report.reportID))}
                        />
                    ) : (
                        <View style={[styles.ph5, styles.pv3]}>
                            <Text
                                style={[styles.textLabelSupporting, styles.lh16, styles.mb1]}
                                numberOfLines={1}
                            >
                                {translate('writeCapabilityPage.label')}
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
                                    {translate('workspace.common.workspace')}
                                </Text>
                                <Text
                                    numberOfLines={1}
                                    style={[styles.optionAlternateText, styles.pre]}
                                >
                                    {linkedWorkspace.name}
                                </Text>
                            </View>
                        )}
                        {Boolean(report.visibility) && (
                            <View style={[styles.pv3]}>
                                <Text
                                    style={[styles.textLabelSupporting, styles.lh16, styles.mb1]}
                                    numberOfLines={1}
                                >
                                    {translate('newRoomPage.visibility')}
                                </Text>
                                <Text
                                    numberOfLines={1}
                                    style={[styles.reportSettingsVisibilityText]}
                                >
                                    {translate(`newRoomPage.visibilityOptions.${report.visibility}`)}
                                </Text>
                                <Text style={[styles.textLabelSupporting, styles.mt1]}>{translate(`newRoomPage.${report.visibility}Description`)}</Text>
                            </View>
                        )}
                    </View>
                    {!shouldDisableWelcomeMessage && (
                        <MenuItem
                            title={translate('welcomeMessagePage.welcomeMessage')}
                            icon={Expensicons.ChatBubble}
                            onPress={() => Navigation.navigate(ROUTES.getReportWelcomeMessageRoute(report.reportID))}
                            shouldShowRightIcon
                        />
                    )}
                </ScrollView>
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

ReportSettingsPage.propTypes = propTypes;
ReportSettingsPage.defaultProps = defaultProps;
ReportSettingsPage.displayName = 'ReportSettingsPage';
export default compose(
    withReportOrNotFound,
    withOnyx({
        policies: {
            key: ONYXKEYS.COLLECTION.POLICY,
        },
    }),
)(ReportSettingsPage);
