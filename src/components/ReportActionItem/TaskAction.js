import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import withLocalize, {withLocalizePropTypes} from '../withLocalize';
import compose from '../../libs/compose';
import ONYXKEYS from '../../ONYXKEYS';
import Text from '../Text';
import styles from '../../styles/styles';
import CONST from '../../CONST';

const propTypes = {
    /** Name of the reportAction action */
    actionName: PropTypes.string.isRequired,

    /** The ID of the associated taskReport */
    // eslint-disable-next-line react/no-unused-prop-types -- This is used in the withOnyx HOC
    taskReportID: PropTypes.string.isRequired,

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
};

const defaultProps = {
    taskReport: {},
};
function TaskAction(props) {
    const taskReportName = props.taskReport.reportName || '';

    let messageLinkText = '';
    switch (props.actionName) {
        case CONST.REPORT.ACTIONS.TYPE.TASKCOMPLETED:
            messageLinkText = props.translate('task.messages.completed');
            break;
        case CONST.REPORT.ACTIONS.TYPE.TASKCANCELED:
            messageLinkText = props.translate('task.messages.canceled');
            break;
        case CONST.REPORT.ACTIONS.TYPE.TASKREOPENED:
            messageLinkText = props.translate('task.messages.reopened');
            break;
        default:
            messageLinkText = props.translate('task.task');
    }

    return (
        <>
            <View style={[styles.flex1, styles.flexRow, styles.alignItemsCenter]}>
                <Text>
                    <Text style={styles.chatItemMessageLink}>{messageLinkText}</Text>
                    <Text style={[styles.chatItemMessage]}>{` ${taskReportName}`}</Text>
                </Text>
            </View>
        </>
    );
}

TaskAction.propTypes = propTypes;
TaskAction.defaultProps = defaultProps;
TaskAction.displayName = 'TaskAction';

export default compose(
    withLocalize,
    withOnyx({
        taskReport: {
            key: ({taskReportID}) => `${ONYXKEYS.COLLECTION.REPORT}${taskReportID}`,
        },
    }),
)(TaskAction);
