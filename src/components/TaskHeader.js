import React, {useEffect} from 'react';
import {View} from 'react-native';
<<<<<<< HEAD
=======
import PropTypes from 'prop-types';
import lodashGet from 'lodash/get';
>>>>>>> 7b00c47ee7debf7137417ac768efe8d4c6b872d0
import reportPropTypes from '../pages/reportPropTypes';
import withLocalize, {withLocalizePropTypes} from './withLocalize';
import styles from '../styles/styles';
import themeColors from '../styles/themes/default';
import withWindowDimensions, {windowDimensionsPropTypes} from './withWindowDimensions';
import compose from '../libs/compose';
import * as Task from '../libs/actions/Task';
import TaskHeaderActionButton from './TaskHeaderActionButton';

const propTypes = {
    /** The report currently being looked at */
    report: reportPropTypes.isRequired,

    ...withLocalizePropTypes,

    ...windowDimensionsPropTypes,
};

function TaskHeader(props) {
<<<<<<< HEAD
=======
    const title = ReportUtils.getReportName(props.report);
    const assigneeName = ReportUtils.getDisplayNameForParticipant(props.report.managerID);
    const assigneeAvatar = UserUtils.getAvatar(lodashGet(props.personalDetails, [props.report.managerID, 'avatar']), props.report.managerID);
    const isOpen = props.report.stateNum === CONST.REPORT.STATE_NUM.OPEN && props.report.statusNum === CONST.REPORT.STATUS.OPEN;
    const isCompleted = ReportUtils.isCompletedTaskReport(props.report);

>>>>>>> 7b00c47ee7debf7137417ac768efe8d4c6b872d0
    useEffect(() => {
        Task.setTaskReport(props.report);
    }, [props.report]);

    return (
        <View style={styles.borderBottom}>
            <View style={[{backgroundColor: themeColors.highlightBG}, styles.pl0]}>
                <View style={[styles.ph5, styles.pb5]}>
<<<<<<< HEAD
                    <TaskHeaderActionButton report={props.report} />
=======
                    <Text style={[styles.textLabelSupporting, styles.lh16]}>{props.translate('common.to')}</Text>
                    <PressableWithFeedback
                        onPress={() => Navigation.navigate(ROUTES.getTaskReportAssigneeRoute(props.report.reportID))}
                        disabled={!isOpen}
                        accessibilityRole="button"
                        accessibilityLabel={props.translate('newTaskPage.assignee')}
                        hoverDimmingValue={1}
                        pressDimmingValue={0.2}
                    >
                        <View style={[styles.flexRow, styles.alignItemsCenter, styles.justifyContentBetween, styles.pv3]}>
                            <View style={[styles.flexRow, styles.alignItemsCenter, styles.justifyContentBetween]}>
                                {props.report.managerID && props.report.managerID > 0 && (
                                    <>
                                        <Avatar
                                            source={assigneeAvatar}
                                            type={CONST.ICON_TYPE_AVATAR}
                                            name={assigneeName}
                                            size={CONST.AVATAR_SIZE.HEADER}
                                        />
                                        <View style={[styles.flexColumn, styles.ml3]}>
                                            <Text
                                                style={[styles.headerText, styles.pre]}
                                                numberOfLines={1}
                                            >
                                                {assigneeName}
                                            </Text>
                                        </View>
                                    </>
                                )}
                            </View>
                            <View style={[styles.flexRow]}>
                                {isCompleted ? (
                                    <>
                                        <Text>{props.translate('task.completed')}</Text>
                                        <View style={styles.moneyRequestHeaderCheckmark}>
                                            <Icon
                                                src={Expensicons.Checkmark}
                                                fill={themeColors.iconSuccessFill}
                                            />
                                        </View>
                                    </>
                                ) : (
                                    <Button
                                        success
                                        isDisabled={TaskUtils.isTaskCanceled(props.report)}
                                        medium
                                        text={props.translate('newTaskPage.markAsDone')}
                                        onPress={() => TaskUtils.completeTask(props.report.reportID, title)}
                                    />
                                )}
                            </View>
                        </View>
                    </PressableWithFeedback>
>>>>>>> 7b00c47ee7debf7137417ac768efe8d4c6b872d0
                </View>
            </View>
        </View>
    );
}

TaskHeader.propTypes = propTypes;
TaskHeader.displayName = 'TaskHeader';

export default compose(withWindowDimensions, withLocalize)(TaskHeader);
