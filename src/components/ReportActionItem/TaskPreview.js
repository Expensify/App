import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import React from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import Checkbox from '@components/Checkbox';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import {usePersonalDetails} from '@components/OnyxProvider';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import refPropTypes from '@components/refPropTypes';
import RenderHTML from '@components/RenderHTML';
import {showContextMenuForReport} from '@components/ShowContextMenuContext';
import withCurrentUserPersonalDetails, {withCurrentUserPersonalDetailsDefaultProps, withCurrentUserPersonalDetailsPropTypes} from '@components/withCurrentUserPersonalDetails';
import withLocalize, {withLocalizePropTypes} from '@components/withLocalize';
import compose from '@libs/compose';
import ControlSelection from '@libs/ControlSelection';
import * as DeviceCapabilities from '@libs/DeviceCapabilities';
import getButtonState from '@libs/getButtonState';
import * as LocalePhoneNumber from '@libs/LocalePhoneNumber';
import Navigation from '@libs/Navigation/Navigation';
import * as ReportUtils from '@libs/ReportUtils';
import reportActionPropTypes from '@pages/home/report/reportActionPropTypes';
import * as StyleUtils from '@styles/StyleUtils';
import useThemeStyles from '@styles/useThemeStyles';
import * as Session from '@userActions/Session';
import * as Task from '@userActions/Task';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

const propTypes = {
    /** The ID of the associated taskReport */
    taskReportID: PropTypes.string.isRequired,

    /** Whether the task preview is hovered so we can modify its style */
    isHovered: PropTypes.bool,

    /** The linked reportAction */
    action: PropTypes.shape(reportActionPropTypes).isRequired,

    /* Onyx Props */

    taskReport: PropTypes.shape({
        /** Title of the task */
        reportName: PropTypes.string,

        /** AccountID of the manager in this iou report */
        managerID: PropTypes.number,

        /** AccountID of the creator of this iou report */
        ownerAccountID: PropTypes.number,
    }),

    /** The chat report associated with taskReport */
    chatReportID: PropTypes.string.isRequired,

    /** Popover context menu anchor, used for showing context menu */
    contextMenuAnchor: refPropTypes,

    /** Callback for updating context menu active state, used for showing context menu */
    checkIfContextMenuActive: PropTypes.func,

    /* Onyx Props */
    ...withLocalizePropTypes,

    ...withCurrentUserPersonalDetailsPropTypes,
};

const defaultProps = {
    ...withCurrentUserPersonalDetailsDefaultProps,
    taskReport: {},
    isHovered: false,
};

function TaskPreview(props) {
    const styles = useThemeStyles();
    const personalDetails = usePersonalDetails() || CONST.EMPTY_OBJECT;
    // The reportAction might not contain details regarding the taskReport
    // Only the direct parent reportAction will contain details about the taskReport
    // Other linked reportActions will only contain the taskReportID and we will grab the details from there
    const isTaskCompleted = !_.isEmpty(props.taskReport)
        ? props.taskReport.stateNum === CONST.REPORT.STATE_NUM.SUBMITTED && props.taskReport.statusNum === CONST.REPORT.STATUS.APPROVED
        : props.action.childStateNum === CONST.REPORT.STATE_NUM.SUBMITTED && props.action.childStatusNum === CONST.REPORT.STATUS.APPROVED;
    const taskTitle = props.taskReport.reportName || props.action.childReportName;
    const taskAssigneeAccountID = Task.getTaskAssigneeAccountID(props.taskReport) || props.action.childManagerAccountID;
    const assigneeLogin = lodashGet(personalDetails, [taskAssigneeAccountID, 'login'], '');
    const assigneeDisplayName = lodashGet(personalDetails, [taskAssigneeAccountID, 'displayName'], '');
    const taskAssignee = assigneeDisplayName || LocalePhoneNumber.formatPhoneNumber(assigneeLogin);
    const htmlForTaskPreview =
        taskAssignee && taskAssigneeAccountID !== 0
            ? `<comment><mention-user accountid="${taskAssigneeAccountID}">@${taskAssignee}</mention-user> ${taskTitle}</comment>`
            : `<comment>${taskTitle}</comment>`;
    const isDeletedParentAction = ReportUtils.isCanceledTaskReport(props.taskReport, props.action);

    if (isDeletedParentAction) {
        return <RenderHTML html={`<comment>${props.translate('parentReportAction.deletedTask')}</comment>`} />;
    }

    return (
        <View style={[styles.chatItemMessage]}>
            <PressableWithoutFeedback
                onPress={() => Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(props.taskReportID))}
                onPressIn={() => DeviceCapabilities.canUseTouchScreen() && ControlSelection.block()}
                onPressOut={() => ControlSelection.unblock()}
                onLongPress={(event) => showContextMenuForReport(event, props.contextMenuAnchor, props.chatReportID, props.action, props.checkIfContextMenuActive)}
                style={[styles.flexRow, styles.justifyContentBetween]}
                role={CONST.ACCESSIBILITY_ROLE.BUTTON}
                accessibilityLabel={props.translate('task.task')}
            >
                <View style={[styles.flex1, styles.flexRow, styles.alignItemsStart]}>
                    <Checkbox
                        style={[styles.mr2]}
                        containerStyle={[styles.taskCheckbox]}
                        isChecked={isTaskCompleted}
                        disabled={!Task.canModifyTask(props.taskReport, props.currentUserPersonalDetails.accountID)}
                        onPress={Session.checkIfActionIsAllowed(() => {
                            if (isTaskCompleted) {
                                Task.reopenTask(props.taskReport);
                            } else {
                                Task.completeTask(props.taskReport);
                            }
                        })}
                        accessibilityLabel={props.translate('task.task')}
                    />
                    <RenderHTML html={htmlForTaskPreview} />
                </View>
                <Icon
                    src={Expensicons.ArrowRight}
                    fill={StyleUtils.getIconFillColor(getButtonState(props.isHovered))}
                />
            </PressableWithoutFeedback>
        </View>
    );
}

TaskPreview.propTypes = propTypes;
TaskPreview.defaultProps = defaultProps;
TaskPreview.displayName = 'TaskPreview';

export default compose(
    withLocalize,
    withCurrentUserPersonalDetails,
    withOnyx({
        taskReport: {
            key: ({taskReportID}) => `${ONYXKEYS.COLLECTION.REPORT}${taskReportID}`,
            initialValue: {},
        },
    }),
)(TaskPreview);
