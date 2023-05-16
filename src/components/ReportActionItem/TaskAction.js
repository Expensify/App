import React from 'react';
import {View, Pressable} from 'react-native';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import Navigation from '../../libs/Navigation/Navigation';
import withLocalize, {withLocalizePropTypes} from '../withLocalize';
import ROUTES from '../../ROUTES';
import compose from '../../libs/compose';
import ONYXKEYS from '../../ONYXKEYS';
import Text from '../Text';
import styles from '../../styles/styles';
import Icon from '../Icon';
import * as Expensicons from '../Icon/Expensicons';
import * as StyleUtils from '../../styles/StyleUtils';
import getButtonState from '../../libs/getButtonState';
import CONST from '../../CONST';

const propTypes = {
    /** The ID of the associated taskReport */
    taskReportID: PropTypes.string.isRequired,

    /** Whether the task preview is hovered so we can modify its style */
    isHovered: PropTypes.bool,

    /** Name of the reportAction action */
    actionName: PropTypes.string.isRequired,

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
const TaskAction = (props) => {
    const taskReportID = props.taskReportID;
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
            messageLinkText = props.translate('newTaskPage.task');
    }

    return (
        <Pressable
            onPress={() => Navigation.navigate(ROUTES.getReportRoute(taskReportID))}
            style={[styles.flexRow, styles.justifyContentBetween]}
        >
            <View style={[styles.flex1, styles.flexRow, styles.alignItemsCenter]}>
                <Text style={styles.chatItemMessageLink}>{messageLinkText}</Text>
                <Text style={[styles.chatItemMessage]}>{` ${taskReportName}`}</Text>
            </View>
            <Icon
                src={Expensicons.ArrowRight}
                fill={StyleUtils.getIconFillColor(getButtonState(props.isHovered))}
            />
        </Pressable>
    );
};

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
