import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import reportPropTypes from '../pages/reportPropTypes';
import withLocalize, {withLocalizePropTypes} from './withLocalize';
import styles from '../styles/styles';
import Navigation from '../libs/Navigation/Navigation';
import ROUTES from '../ROUTES';
import Button from './Button';
import * as Task from '../libs/actions/Task';
import PressableWithFeedback from './Pressable/PressableWithFeedback';
import * as ReportUtils from '../libs/ReportUtils';
import CONST from '../CONST';
import compose from '../libs/compose';
import ONYXKEYS from '../ONYXKEYS';

const propTypes = {
    /** The report currently being looked at */
    report: reportPropTypes.isRequired,

    /** Current user session */
    session: PropTypes.shape({
        accountID: PropTypes.number,
    }),

    ...withLocalizePropTypes,
};

const defaultProps = {
    session: {
        accountID: 0,
    },
};

function TaskHeaderActionButton(props) {
    return (
        <PressableWithFeedback
            onPress={() => Navigation.navigate(ROUTES.getTaskReportAssigneeRoute(props.report.reportID))}
            disabled={!ReportUtils.isOpenTaskReport(props.report)}
            accessibilityRole={CONST.ACCESSIBILITY_ROLE.BUTTON}
            accessibilityLabel={props.translate('task.assignee')}
            hoverDimmingValue={1}
            pressDimmingValue={0.2}
        >
            <View style={[styles.flexRow, styles.alignItemsCenter, styles.justifyContentEnd]}>
                <Button
                    success
                    isDisabled={ReportUtils.isCanceledTaskReport(props.report) || !Task.canModifyTask(props.report, props.session.accountID)}
                    medium
                    text={props.translate(ReportUtils.isCompletedTaskReport(props.report) ? 'task.markAsIncomplete' : 'task.markAsDone')}
                    onPress={() =>
                        ReportUtils.isCompletedTaskReport(props.report) ? Task.reopenTask(props.report, props.report.reportName) : Task.completeTask(props.report, props.report.reportName)
                    }
                    style={[styles.flex1]}
                />
            </View>
        </PressableWithFeedback>
    );
}

TaskHeaderActionButton.propTypes = propTypes;
TaskHeaderActionButton.defaultProps = defaultProps;
TaskHeaderActionButton.displayName = 'TaskHeaderActionButton';

export default compose(
    withLocalize,
    withOnyx({
        session: {
            key: ONYXKEYS.SESSION,
        },
    }),
)(TaskHeaderActionButton);
