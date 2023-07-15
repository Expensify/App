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
import * as Policy from '../../../libs/actions/Policy';
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
    const {translate} = useLocalize();
    // The workspace the report is on, null if the user isn't a member of the workspace
    const linkedWorkspace = useMemo(() => _.find(props.policies, (policy) => policy && policy.id === props.report.policyID), [props.policies, props.report.policyID]);
    const shouldDisableRename = useMemo(() => {
        if (ReportUtils.isDefaultRoom(props.report) || ReportUtils.isArchivedRoom(props.report) || ReportUtils.isChatThread(props.report)) {
            return true;
        }

        // The remaining checks only apply to public rooms
        if (!ReportUtils.isPublicRoom(props.report)) {
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
    }, [props.report, linkedWorkspace]);

    // We only want policy owners and admins to be able to modify the welcome message.
    const shouldDisableWelcomeMessage =
        ReportUtils.isArchivedRoom(props.report) || !ReportUtils.isChatRoom(props.report) || _.isEmpty(linkedWorkspace) || linkedWorkspace.role !== CONST.POLICY.ROLE.ADMIN;

    const shouldShowRoomName = !ReportUtils.isPolicyExpenseChat(props.report) && !ReportUtils.isChatThread(props.report);
    const notificationPreference = translate(`notificationPreferencesPage.notificationPreferences.${props.report.notificationPreference}`);
    const writeCapability = ReportUtils.isAdminRoom(props.report) ? CONST.REPORT.WRITE_CAPABILITIES.ADMINS : props.report.writeCapability || CONST.REPORT.WRITE_CAPABILITIES.ALL;

    const writeCapabilityText = translate(`writeCapabilityPage.writeCapability.${writeCapability}`);
    const shouldAllowWriteCapabilityEditing = lodashGet(linkedWorkspace, 'role', '') === CONST.POLICY.ROLE.ADMIN && !ReportUtils.isAdminRoom(props.report);

    return (
        <ScreenWrapper>
            <FullPageNotFoundView shouldShow={_.isEmpty(props.report)}>
                <HeaderWithBackButton
                    title={translate('common.settings')}
                    onBackButtonPress={() => Navigation.goBack(ROUTES.getReportDetailsRoute(props.report.reportID))}
                />
                <ScrollView style={[styles.flex1]}>
                    <MenuItemWithTopDescription
                        shouldShowRightIcon
                        title={notificationPreference}
                        description={translate('notificationPreferencesPage.label')}
                        onPress={() => Navigation.navigate(ROUTES.getReportSettingsNotificationPreferencesRoute(props.report.reportID))}
                    />
                    {shouldShowRoomName && (
                        <OfflineWithFeedback
                            pendingAction={lodashGet(props.report, 'pendingFields.reportName', null)}
                            errors={lodashGet(props.report, 'errorFields.reportName', null)}
                            errorRowStyles={[styles.ph5]}
                            onClose={() => Report.clearPolicyRoomNameErrors(props.report.reportID)}
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
                                        {props.report.reportName}
                                    </Text>
                                </View>
                            ) : (
                                <MenuItemWithTopDescription
                                    shouldShowRightIcon
                                    title={props.report.reportName}
                                    description={translate('newRoomPage.roomName')}
                                    onPress={() => Navigation.navigate(ROUTES.getReportSettingsRoomNameRoute(props.report.reportID))}
                                />
                            )}
                        </OfflineWithFeedback>
                    )}
                    {shouldAllowWriteCapabilityEditing ? (
                        <MenuItemWithTopDescription
                            shouldShowRightIcon
                            title={writeCapabilityText}
                            description={translate('writeCapabilityPage.label')}
                            onPress={() => Navigation.navigate(ROUTES.getReportSettingsWriteCapabilityRoute(props.report.reportID))}
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
                        {Boolean(props.report.visibility) && (
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
                                    {translate(`newRoomPage.visibilityOptions.${props.report.visibility}`)}
                                </Text>
                                <Text style={[styles.textLabelSupporting, styles.mt1]}>{translate(`newRoomPage.${props.report.visibility}Description`)}</Text>
                            </View>
                        )}
                    </View>
                    {!shouldDisableWelcomeMessage && (
                        <MenuItem
                            title={translate('welcomeMessagePage.welcomeMessage')}
                            icon={Expensicons.ChatBubble}
                            onPress={() => Navigation.navigate(ROUTES.getReportWelcomeMessageRoute(props.report.reportID))}
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
