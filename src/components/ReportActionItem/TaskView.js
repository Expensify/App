import React, {useEffect} from 'react';
import {View} from 'react-native';
import reportPropTypes from '../../pages/reportPropTypes';
import withLocalize, {withLocalizePropTypes} from '../withLocalize';
import withWindowDimensions from '../withWindowDimensions';
import compose from '../../libs/compose';
import Navigation from '../../libs/Navigation/Navigation';
import ROUTES from '../../ROUTES';
import MenuItemWithTopDescription from '../MenuItemWithTopDescription';
import styles from '../../styles/styles';
import * as ReportUtils from '../../libs/ReportUtils';
import * as Task from '../../libs/actions/Task';
import personalDetailsPropType from '../../pages/personalDetailsPropType';
import CONST from '../../CONST';

const propTypes = {
    /** The report currently being looked at */
    report: reportPropTypes.isRequired,

    ...withLocalizePropTypes,

    personalDetails: personalDetailsPropType.isRequired,
};

function TaskView(props) {
    useEffect(() => {
        Task.setTaskReport({...props.report, isExistingTaskReport: true});
    }, [props.report]);

    const taskTitle = props.report.reportName;
    const isCompleted = ReportUtils.isCompletedTaskReport(props.report);

    return (
        <View style={[styles.borderBottom]}>
            <MenuItemWithTopDescription
                label={props.translate('task.title')}
                title={taskTitle}
                onPress={() => Navigation.navigate(ROUTES.getTaskReportTitleRoute(props.report.reportID))}
                shouldShowRightIcon
                shouldShowSelectedState
                shouldShowSelectedStateBeforeTitle
                shouldUseSquareSelectedState
                titleStyle={styles.newKansasLarge}
                isSelected={isCompleted}
                onPressSelection={() => (isCompleted ? Task.reopenTask(props.report.reportID, taskTitle) : Task.completeTask(props.report.reportID, taskTitle))}
            />
            <MenuItemWithTopDescription
                label={props.translate('task.description')}
                title={props.report.description}
                onPress={() => Navigation.navigate(ROUTES.getTaskReportDescriptionRoute(props.report.reportID))}
                shouldShowRightIcon
            />
            <MenuItemWithTopDescription
                label={props.translate('task.createdBy')}
                title={ReportUtils.getDisplayNameForParticipant(props.report.ownerAccountID)}
                icon={ReportUtils.getIconsForParticipants([props.report.ownerEmail], props.personalDetails)[0].source}
                iconType={CONST.ICON_TYPE_AVATAR}
                avatarSize={CONST.AVATAR_SIZE.SMALL}
                titleStyle={styles.textStrong}
                interactive={false}
            />
            <MenuItemWithTopDescription
                label={props.translate('task.assignee')}
                title={ReportUtils.getDisplayNameForParticipant(props.report.managerID)}
                icon={ReportUtils.getIconsForParticipants([props.report.managerEmail], props.personalDetails)[0].source}
                iconType={CONST.ICON_TYPE_AVATAR}
                avatarSize={CONST.AVATAR_SIZE.SMALL}
                titleStyle={styles.textStrong}
                onPress={() => Navigation.navigate(ROUTES.getTaskReportAssigneeRoute(props.report.reportID))}
                shouldShowRightIcon
            />
        </View>
    );
}

TaskView.propTypes = propTypes;
TaskView.displayName = 'TaskView';

export default compose(withWindowDimensions, withLocalize)(TaskView);
