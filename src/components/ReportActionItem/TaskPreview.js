import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import React from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import Checkbox from '@components/Checkbox';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import RenderHTML from '@components/RenderHTML';
import withCurrentUserPersonalDetails, {withCurrentUserPersonalDetailsDefaultProps, withCurrentUserPersonalDetailsPropTypes} from '@components/withCurrentUserPersonalDetails';
import withLocalize, {withLocalizePropTypes} from '@components/withLocalize';
import compose from '@libs/compose';
import getButtonState from '@libs/getButtonState';
import * as LocalePhoneNumber from '@libs/LocalePhoneNumber';
import Navigation from '@libs/Navigation/Navigation';
import * as ReportUtils from '@libs/ReportUtils';
import reportActionPropTypes from '@pages/home/report/reportActionPropTypes';
import personalDetailsPropType from '@pages/personalDetailsPropType';
import styles from '@styles/styles';
import * as StyleUtils from '@styles/StyleUtils';
import * as Session from '@userActions/Session';
import * as Task from '@userActions/Task';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

const propTypes = {
    /** All personal details asssociated with user */
    personalDetailsList: PropTypes.objectOf(personalDetailsPropType),

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

    ...withLocalizePropTypes,

    ...withCurrentUserPersonalDetailsPropTypes,
};

const defaultProps = {
    ...withCurrentUserPersonalDetailsDefaultProps,
    personalDetailsList: {},
    taskReport: {},
    isHovered: false,
};

function TaskPreview(props) {
    // The reportAction might not contain details regarding the taskReport
    // Only the direct parent reportAction will contain details about the taskReport
    // Other linked reportActions will only contain the taskReportID and we will grab the details from there
    const isTaskCompleted = !_.isEmpty(props.taskReport)
        ? props.taskReport.stateNum === CONST.REPORT.STATE_NUM.SUBMITTED && props.taskReport.statusNum === CONST.REPORT.STATUS.APPROVED
        : props.action.childStateNum === CONST.REPORT.STATE_NUM.SUBMITTED && props.action.childStatusNum === CONST.REPORT.STATUS.APPROVED;
    const taskTitle = props.taskReport.reportName || props.action.childReportName;
    const taskAssigneeAccountID = Task.getTaskAssigneeAccountID(props.taskReport) || props.action.childManagerAccountID;
    const assigneeLogin = lodashGet(props.personalDetailsList, [taskAssigneeAccountID, 'login'], '');
    const assigneeDisplayName = lodashGet(props.personalDetailsList, [taskAssigneeAccountID, 'displayName'], '');
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
                style={[styles.flexRow, styles.justifyContentBetween]}
                accessibilityRole={CONST.ACCESSIBILITY_ROLE.BUTTON}
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
        personalDetailsList: {
            key: ONYXKEYS.PERSONAL_DETAILS_LIST,
            initialValue: {},
        },
    }),
)(TaskPreview);
