import React from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {useOnyx} from 'react-native-onyx';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as ReportUtils from '@libs/ReportUtils';
import * as TaskUtils from '@libs/TaskUtils';
import * as Session from '@userActions/Session';
import * as Task from '@userActions/Task';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';
import Button from './Button';

type TaskHeaderActionButtonOnyxProps = {
    /** Current user session */
    session: OnyxEntry<OnyxTypes.Session>;
};

type TaskHeaderActionButtonProps = TaskHeaderActionButtonOnyxProps & {
    /** The report currently being looked at */
    report: OnyxTypes.Report;
};

function TaskHeaderActionButton({report, session}: TaskHeaderActionButtonProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    if (!ReportUtils.canWriteInReport(report)) {
        return null;
    }

    return (
        <View style={[styles.flexRow, styles.alignItemsCenter, styles.justifyContentEnd]}>
            <Button
                success
                isDisabled={!Task.canModifyTask(report, session?.accountID ?? -1)}
                medium
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

export default function TaskHeaderActionButtonOnyx(props: Omit<TaskHeaderActionButtonProps, keyof TaskHeaderActionButtonOnyxProps>) {
    const [session, sessionMetadata] = useOnyx(ONYXKEYS.SESSION);

    if (isLoadingOnyxValue(sessionMetadata)) {
        return null;
    }

    return (
        <TaskHeaderActionButton
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            session={session}
        />
    );
}
