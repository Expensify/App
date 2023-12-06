import React from 'react';
import {View} from 'react-native';
import Text from '@components/Text';
import useThemeStyles from '@styles/useThemeStyles';
import * as Task from '@userActions/Task';

type TaskActionProps = {
    /** Name of the reportAction action */
    actionName: string;

    /** The ID of the associated taskReport */
    taskReportID: string;
};

function TaskAction({actionName, taskReportID}: TaskActionProps) {
    const styles = useThemeStyles();

    return (
        <View style={[styles.flex1, styles.flexRow, styles.alignItemsCenter]}>
            <Text style={[styles.chatItemMessage, styles.colorMuted]}>{Task.getTaskReportActionMessage(actionName, taskReportID, false)}</Text>
        </View>
    );
}

TaskAction.displayName = 'TaskAction';

export default TaskAction;
