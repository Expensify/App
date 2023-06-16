import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import _ from 'underscore';
import reportPropTypes from '../../pages/reportPropTypes';
import withLocalize, {withLocalizePropTypes} from '../withLocalize';
import participantPropTypes from '../participantPropTypes';
import withWindowDimensions from '../withWindowDimensions';
import compose from '../../libs/compose';
import Navigation from '../../libs/Navigation/Navigation';
import ROUTES from '../../ROUTES';
import MenuItemWithTopDescription from '../MenuItemWithTopDescription';
import styles from '../../styles/styles';
import * as ReportUtils from '../../libs/ReportUtils';
import * as Task from '../../libs/actions/Task';

const propTypes = {
    /** The report currently being looked at */
    report: reportPropTypes.isRequired,

    ...withLocalizePropTypes,
};

function TaskView(props) {
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
        </View>
    );
}

TaskView.propTypes = propTypes;
TaskView.displayName = 'TaskView';

export default compose(withWindowDimensions, withLocalize)(TaskView);
