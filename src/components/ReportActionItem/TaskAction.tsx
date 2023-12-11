import React from 'react';
import {View} from 'react-native';
import Text from '@components/Text';
import * as TaskUtils from '@libs/TaskUtils';
import useThemeStyles from '@styles/useThemeStyles';

type TaskActionProps = {
    /** Name of the reportAction action */
    actionName: string;
};

function TaskAction({actionName}: TaskActionProps) {
    const styles = useThemeStyles();

    return (
        <View style={[styles.flex1, styles.flexRow, styles.alignItemsCenter]}>
            <Text style={[styles.chatItemMessage, styles.colorMuted]}>{TaskUtils.getTaskReportActionMessage(actionName)}</Text>
        </View>
    );
}

TaskAction.displayName = 'TaskAction';

export default TaskAction;
