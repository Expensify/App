import React from 'react';
import {View} from 'react-native';
import {OnyxEntry, withOnyx} from 'react-native-onyx';
import useLocalize from '@hooks/useLocalize';
import * as ReportUtils from '@libs/ReportUtils';
import useThemeStyles from '@styles/useThemeStyles';
import * as Task from '@userActions/Task';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, Session} from '@src/types/onyx';
import Button from './Button';

type TaskHeaderActionButtonOnyxProps = {
    /** Current user session */
    session: OnyxEntry<Session>;
};

type TaskHeaderActionButtonProps = TaskHeaderActionButtonOnyxProps & {
    /** The report currently being looked at */
    report: Report;
};

function TaskHeaderActionButton({report, session}: TaskHeaderActionButtonProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    return (
        <View style={[styles.flexRow, styles.alignItemsCenter, styles.justifyContentEnd]}>
            <Button
                success
                isDisabled={!Task.canModifyTask(report, session?.accountID ?? 0)}
                medium
                text={translate(ReportUtils.isCompletedTaskReport(report) ? 'task.markAsIncomplete' : 'task.markAsComplete')}
                onPress={() => (ReportUtils.isCompletedTaskReport(report) ? Task.reopenTask(report) : Task.completeTask(report))}
                style={styles.flex1}
            />
        </View>
    );
}

TaskHeaderActionButton.displayName = 'TaskHeaderActionButton';

export default withOnyx<TaskHeaderActionButtonProps, TaskHeaderActionButtonOnyxProps>({
    session: {
        key: ONYXKEYS.SESSION,
    },
})(TaskHeaderActionButton);
