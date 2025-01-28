import React from 'react';
import {View} from 'react-native';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as ReportUtils from '@libs/ReportUtils';
import * as TaskUtils from '@libs/TaskUtils';
import * as Session from '@userActions/Session';
import * as Task from '@userActions/Task';
import CONST from '@src/CONST';
import type * as OnyxTypes from '@src/types/onyx';
import Button from './Button';
import {useSession} from './OnyxProvider';

type TaskHeaderActionButtonProps = {
    /** The report currently being looked at */
    report: OnyxTypes.Report;
};

function TaskHeaderActionButton({report}: TaskHeaderActionButtonProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const session = useSession();

    if (!ReportUtils.canWriteInReport(report)) {
        return null;
    }

    return (
        <View style={[styles.flexRow, styles.alignItemsCenter, styles.justifyContentEnd]}>
            <Button
                success
                isDisabled={!Task.canActionTask(report, session?.accountID ?? CONST.DEFAULT_NUMBER_ID)}
                text={translate(ReportUtils.isCompletedTaskReport(report) ? 'task.markAsIncomplete' : 'task.markAsComplete')}
                onPress={Session.checkIfActionIsAllowed(() => {
                    // If we're already navigating to these task editing pages, early return not to mark as completed, otherwise we would have not found page.
                    if (TaskUtils.isActiveTaskEditRoute(report.reportID)) {
                        return;
                    }
                    if (ReportUtils.isCompletedTaskReport(report)) {
                        Task.reopenTask(report);
                    } else {
                        Task.completeTask(report);
                    }
                })}
                style={styles.flex1}
            />
        </View>
    );
}

TaskHeaderActionButton.displayName = 'TaskHeaderActionButton';

export default TaskHeaderActionButton;
