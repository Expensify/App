import React from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import RenderHTML from '@components/RenderHTML';
import Text from '@components/Text';
import useThemeStyles from '@hooks/useThemeStyles';
import * as TaskUtils from '@libs/TaskUtils';
import type {ReportAction} from '@src/types/onyx';

type TaskActionProps = {
    /** Name of the reportAction action */
    action: OnyxEntry<ReportAction>;
};

function TaskAction({action}: TaskActionProps) {
    const styles = useThemeStyles();
    const message = TaskUtils.getTaskReportActionMessage(action);

    return (
        <View style={[styles.flex1, styles.flexRow, styles.alignItemsCenter, styles.breakWord, styles.preWrap]}>
            {message.html ? (
                <RenderHTML html={`<comment><muted-text>${message.html}</muted-text></comment>`} />
            ) : (
                <Text style={[styles.chatItemMessage, styles.colorMuted]}>{message.text}</Text>
            )}
        </View>
    );
}

TaskAction.displayName = 'TaskAction';

export default TaskAction;
