import React from 'react';
import {View} from 'react-native';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {canWriteInReport, isCompletedTaskReport} from '@libs/ReportUtils';
import {isActiveTaskEditRoute} from '@libs/TaskUtils';
import {callFnIfActionIsAllowed} from '@userActions/Session';
import {canActionTask, completeTask, reopenTask} from '@userActions/Task';
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

    if (!canWriteInReport(report)) {
        return null;
    }

    return (
        <View style={[styles.flexRow, styles.alignItemsCenter, styles.justifyContentEnd]}>
            <Button
                success
                isDisabled={!canActionTask(report, session?.accountID ?? CONST.DEFAULT_NUMBER_ID)}
                text={translate(isCompletedTaskReport(report) ? 'task.markAsIncomplete' : 'task.markAsComplete')}
                onPress={callFnIfActionIsAllowed(() => {
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
