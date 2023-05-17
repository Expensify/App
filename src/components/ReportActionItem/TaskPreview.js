import React from 'react';
import {View, Pressable} from 'react-native';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import compose from '../../libs/compose';
import styles from '../../styles/styles';
import ONYXKEYS from '../../ONYXKEYS';
import withLocalize, {withLocalizePropTypes} from '../withLocalize';
import Icon from '../Icon';
import CONST from '../../CONST';
import * as Expensicons from '../Icon/Expensicons';
import Text from '../Text';
import Checkbox from '../Checkbox';
import * as StyleUtils from '../../styles/StyleUtils';
import getButtonState from '../../libs/getButtonState';
import Navigation from '../../libs/Navigation/Navigation';
import ROUTES from '../../ROUTES';
import reportActionPropTypes from '../../pages/home/report/reportActionPropTypes';
import * as TaskUtils from '../../libs/actions/Task';

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

        /** Email address of the manager in this iou report */
        managerEmail: PropTypes.string,

        /** Email address of the creator of this iou report */
        ownerEmail: PropTypes.string,
    }),

    ...withLocalizePropTypes,
};

const defaultProps = {
    taskReport: {},
    isHovered: false,
};

const TaskPreview = (props) => {
    // The reportAction might not contain details regarding the taskReport
    // Only the direct parent reportAction will contain details about the taskReport
    // Other linked reportActions will only contain the taskReportID and we will grab the details from there
    const isTaskCompleted =
        (props.taskReport.stateNum === CONST.REPORT.STATE_NUM.SUBMITTED && props.taskReport.statusNum === CONST.REPORT.STATUS.APPROVED) ||
        (props.action.childStateNum === CONST.REPORT.STATE_NUM.SUBMITTED && props.action.childStatusNum === CONST.REPORT.STATUS.APPROVED);
    const taskTitle = props.action.taskTitle || props.taskReport.reportName;
    const parentReportID = props.action.parentReportID || props.taskReport.parentReportID;

    return (
        <Pressable
            onPress={() => Navigation.navigate(ROUTES.getReportRoute(props.taskReportID))}
            style={[styles.flexRow, styles.justifyContentBetween]}
        >
            <View style={[styles.flex1, styles.flexRow, styles.alignItemsCenter]}>
                <Checkbox
                    style={[styles.mr2]}
                    containerStyle={[styles.taskCheckbox]}
                    isChecked={isTaskCompleted}
                    disabled={TaskUtils.isTaskCanceled(props.taskReport)}
                    onPress={() => {
                        if (isTaskCompleted) {
                            TaskUtils.reopenTask(props.taskReportID, parentReportID, taskTitle);
                        } else {
                            TaskUtils.completeTask(props.taskReportID, parentReportID, taskTitle);
                        }
                    }}
                />
                <Text>{taskTitle}</Text>
            </View>
            <Icon
                src={Expensicons.ArrowRight}
                fill={StyleUtils.getIconFillColor(getButtonState(props.isHovered))}
            />
        </Pressable>
    );
};

TaskPreview.propTypes = propTypes;
TaskPreview.defaultProps = defaultProps;
TaskPreview.displayName = 'TaskPreview';

export default compose(
    withLocalize,
    withOnyx({
        taskReport: {
            key: ({taskReportID}) => `${ONYXKEYS.COLLECTION.REPORT}${taskReportID}`,
        },
    }),
)(TaskPreview);
