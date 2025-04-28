import React from 'react';
import {View} from 'react-native';
import useLocalize from '@hooks/useLocalize';
import useParentReport from '@hooks/useParentReport';
import useReportIsArchived from '@hooks/useReportIsArchived';
import useThemeStyles from '@hooks/useThemeStyles';
import {canWriteInReport, isCompletedTaskReport} from '@libs/ReportUtils';
import {isActiveTaskEditRoute} from '@libs/TaskUtils';
import {callFunctionIfActionIsAllowed} from '@userActions/Session';
import {canActionTask, completeTask, reopenTask} from '@userActions/Task';
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
    const parentReport = useParentReport(report.reportID);
    const isParentReportArchived = useReportIsArchived(parentReport?.reportID);
    const isTaskActionable = canActionTask(report, session?.accountID, parentReport, isParentReportArchived);

    if (!canWriteInReport(report)) {
        return null;
    }

    return (
        <View style={[styles.flexRow, styles.alignItemsCenter, styles.justifyContentEnd]}>
            <Button
                success
                isDisabled={!isTaskActionable}
                text={translate(isCompletedTaskReport(report) ? 'task.markAsIncomplete' : 'task.markAsComplete')}
                onPress={callFunctionIfActionIsAllowed(() => {
                    // If we're already navigating to these task editing pages, early return not to mark as completed, otherwise we would have not found page.
                    if (isActiveTaskEditRoute(report.reportID)) {
                        return;
                    }
                    if (isCompletedTaskReport(report)) {
                        reopenTask(report);
                    } else {
                        completeTask(report);
                    }
                })}
                style={styles.flex1}
            />
        </View>
    );
}

TaskHeaderActionButton.displayName = 'TaskHeaderActionButton';

export default TaskHeaderActionButton;
