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
import DisplayNames from '../../../components/DisplayNames';

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
    const isMoneyRequestReport = ReportUtils.isMoneyRequestReport(report);

    // We only want policy owners and admins to be able to modify the welcome message.
    const shouldDisableWelcomeMessage =
        isMoneyRequestReport || ReportUtils.isArchivedRoom(report) || !ReportUtils.isChatRoom(report) || _.isEmpty(linkedWorkspace) || linkedWorkspace.role !== CONST.POLICY.ROLE.ADMIN;

    const shouldDisableSettings = _.isEmpty(report) || ReportUtils.isArchivedRoom(report);
    const shouldShowRoomName = !ReportUtils.isPolicyExpenseChat(report) && !ReportUtils.isChatThread(report);
    const notificationPreference =
        report.notificationPreference !== CONST.REPORT.NOTIFICATION_PREFERENCE.HIDDEN
            ? translate(`notificationPreferencesPage.notificationPreferences.${report.notificationPreference}`)
            : '';
    const writeCapability = ReportUtils.isAdminRoom(report) ? CONST.REPORT.WRITE_CAPABILITIES.ADMINS : report.writeCapability || CONST.REPORT.WRITE_CAPABILITIES.ALL;

    const writeCapabilityText = translate(`writeCapabilityPage.writeCapability.${writeCapability}`);
    const shouldAllowWriteCapabilityEditing = lodashGet(linkedWorkspace, 'role', '') === CONST.POLICY.ROLE.ADMIN && !ReportUtils.isAdminRoom(report) && !isMoneyRequestReport;

    const shouldShowNotificationPref = !isMoneyRequestReport && report.notificationPreference !== CONST.REPORT.NOTIFICATION_PREFERENCE.HIDDEN;
    const roomNameLabel = translate(isMoneyRequestReport ? 'workspace.editor.nameInputLabel' : 'newRoomPage.roomName');
    const reportName = ReportUtils.getReportName(props.report);

    const shouldShowWriteCapability = !isMoneyRequestReport;

    return (
        <ScreenWrapper testID={ReportSettingsPage.displayName}>
            <FullPageNotFoundView shouldShow={shouldDisableSettings}>
                <HeaderWithBackButton
                    title={translate('common.settings')}
                    onBackButtonPress={() => Navigation.goBack(ROUTES.REPORT_WITH_ID_DETAILS.getRoute(report.reportID))}
                />
                <ScrollView style={[styles.flex1]}>
                    {shouldShowNotificationPref && (
                        <MenuItemWithTopDescription
                            shouldShowRightIcon
                            title={notificationPreference}
                            description={translate('notificationPreferencesPage.label')}
                            onPress={() => Navigation.navigate(ROUTES.REPORT_SETTINGS_NOTIFICATION_PREFERENCES.getRoute(report.reportID))}
                        />
                    )}
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
                                        {roomNameLabel}
                                    </Text>
                                    <DisplayNames
                                        fullTitle={reportName}
                                        tooltipEnabled
                                        numberOfLines={1}
                                        textStyles={[styles.optionAlternateText, styles.pre]}
                                        shouldUseFullTitle
                                    />
                                </View>
                            ) : (
                                <MenuItemWithTopDescription
                                    shouldShowRightIcon
                                    title={report.reportName}
                                    description={translate('newRoomPage.roomName')}
                                    onPress={() => Navigation.navigate(ROUTES.REPORT_SETTINGS_ROOM_NAME.getRoute(report.reportID))}
                                />
                            )}
                        </OfflineWithFeedback>
                    )}
                    {shouldShowWriteCapability &&
                        (shouldAllowWriteCapabilityEditing ? (
                            <MenuItemWithTopDescription
                                shouldShowRightIcon
                                title={writeCapabilityText}
                                description={translate('writeCapabilityPage.label')}
                                onPress={() => Navigation.navigate(ROUTES.REPORT_SETTINGS_WRITE_CAPABILITY.getRoute(report.reportID))}
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
                        ))}
                    <View style={[styles.ph5]}>
                        {Boolean(linkedWorkspace) && (
                            <View style={[styles.pv3]}>
                                <Text
                                    style={[styles.textLabelSupporting, styles.lh16, styles.mb1]}
                                    numberOfLines={1}
                                >
                                    {translate('workspace.common.workspace')}
                                </Text>
                                <DisplayNames
                                    fullTitle={linkedWorkspace.name}
                                    tooltipEnabled
                                    numberOfLines={1}
                                    textStyles={[styles.optionAlternateText, styles.pre]}
                                    shouldUseFullTitle
                                />
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
                            onPress={() => Navigation.navigate(ROUTES.REPORT_WELCOME_MESSAGE.getRoute(report.reportID))}
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
    withReportOrNotFound(),
    withOnyx({
        policies: {
            key: ONYXKEYS.COLLECTION.POLICY,
        },
    }),
)(ReportSettingsPage);
