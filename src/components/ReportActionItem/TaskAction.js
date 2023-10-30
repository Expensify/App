import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import withLocalize, {withLocalizePropTypes} from '../withLocalize';
import Text from '../Text';
import styles from '../../styles/styles';
import * as Task from '../../libs/actions/Task';

const propTypes = {
    /** Name of the reportAction action */
    actionName: PropTypes.string.isRequired,

    /** The ID of the associated taskReport */
    // eslint-disable-next-line react/no-unused-prop-types -- This is used in the withOnyx HOC
    taskReportID: PropTypes.string.isRequired,

    ...withLocalizePropTypes,
};

function TaskAction(props) {
    return (
        <>
            <View style={[styles.flex1, styles.flexRow, styles.alignItemsCenter]}>
                <Text style={[styles.chatItemMessage, styles.colorMuted]}>{Task.getTaskReportActionMessage(props.actionName, props.taskReportID, false)}</Text>
            </View>
        </>
    );
}

TaskAction.propTypes = propTypes;
TaskAction.displayName = 'TaskAction';

export default withLocalize(TaskAction);
