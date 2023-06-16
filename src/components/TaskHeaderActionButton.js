import React from 'react';
import {View} from 'react-native';
import reportPropTypes from '../pages/reportPropTypes';
import withLocalize, {withLocalizePropTypes} from './withLocalize';
import styles from '../styles/styles';
import Navigation from '../libs/Navigation/Navigation';
import ROUTES from '../ROUTES';
import Button from './Button';
import * as Task from '../libs/actions/Task';
import PressableWithFeedback from './Pressable/PressableWithFeedback';
import * as ReportUtils from '../libs/ReportUtils';

const propTypes = {
    /** The report currently being looked at */
    report: reportPropTypes.isRequired,

    ...withLocalizePropTypes,
};

function TaskHeaderActionButton(props) {
    return (
        <PressableWithFeedback
            onPress={() => Navigation.navigate(ROUTES.getTaskReportAssigneeRoute(props.report.reportID))}
            disabled={!ReportUtils.isOpenTaskReport(props.report)}
            accessibilityRole="button"
            accessibilityLabel={props.translate('task.assignee')}
            hoverDimmingValue={1}
            pressDimmingValue={0.2}
        >
            <View style={[styles.flexRow, styles.alignItemsCenter, styles.justifyContentEnd]}>
                <Button
                    success
                    isDisabled={ReportUtils.isCanceledTaskReport(props.report)}
                    medium
                    text={props.translate(ReportUtils.isCompletedTaskReport(props.report) ? 'newTaskPage.markAsIncomplete' : 'newTaskPage.markAsDone')}
                    onPress={() =>
                        ReportUtils.isCompletedTaskReport(props.report)
                            ? Task.reopenTask(props.report.reportID, props.report.reportName)
                            : Task.completeTask(props.report.reportID, props.report.reportName)
                    }
                    style={[styles.flex1]}
                />
            </View>
        </PressableWithFeedback>
    );
}

TaskHeaderActionButton.propTypes = propTypes;
TaskHeaderActionButton.displayName = 'TaskHeaderActionButton';

export default withLocalize(TaskHeaderActionButton);
