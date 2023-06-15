import React, {useEffect} from 'react';
import {View} from 'react-native';
import reportPropTypes from '../pages/reportPropTypes';
import withLocalize, {withLocalizePropTypes} from './withLocalize';
import * as ReportUtils from '../libs/ReportUtils';
import styles from '../styles/styles';
import themeColors from '../styles/themes/default';
import withWindowDimensions, {windowDimensionsPropTypes} from './withWindowDimensions';
import compose from '../libs/compose';
import Navigation from '../libs/Navigation/Navigation';
import ROUTES from '../ROUTES';
import Button from './Button';
import * as Task from '../libs/actions/Task';
import PressableWithFeedback from './Pressable/PressableWithFeedback';

const propTypes = {
    /** The report currently being looked at */
    report: reportPropTypes.isRequired,

    ...withLocalizePropTypes,

    ...windowDimensionsPropTypes,
};

function TaskHeader(props) {
    const title = ReportUtils.getReportName(props.report);
    const isOpen = ReportUtils.isOpenTaskReport(props.report);
    const isCompleted = ReportUtils.isCompletedTaskReport(props.report);
    const isCanceled = ReportUtils.isCanceledTaskReport(props.report);

    useEffect(() => {
        Task.setTaskReport(props.report);
    }, [props.report]);

    return (
        <View style={styles.borderBottom}>
            <View style={[{backgroundColor: themeColors.highlightBG}, styles.pl0]}>
                <View style={[styles.ph5, styles.pb5]}>
                    <PressableWithFeedback
                        onPress={() => Navigation.navigate(ROUTES.getTaskReportAssigneeRoute(props.report.reportID))}
                        disabled={!isOpen}
                        accessibilityRole="button"
                        accessibilityLabel={props.translate('task.assignee')}
                        hoverDimmingValue={1}
                        pressDimmingValue={0.2}
                    >
                        <View style={[styles.flexRow, styles.alignItemsCenter, styles.justifyContentEnd]}>
                            <Button
                                success
                                isDisabled={isCanceled}
                                medium
                                text={props.translate(isCompleted ? 'newTaskPage.markAsIncomplete' : 'newTaskPage.markAsDone')}
                                onPress={() => isCompleted ? TaskUtils.reopenTask(props.report.reportID, title) : TaskUtils.completeTask(props.report.reportID, title)}
                                style={props.isSmallScreenWidth && styles.flex1}
                            />
                        </View>
                    </PressableWithFeedback>
                </View>
            </View>
        </View>
    );
}

TaskHeader.propTypes = propTypes;
TaskHeader.displayName = 'TaskHeader';

export default compose(withWindowDimensions, withLocalize)(TaskHeader);
