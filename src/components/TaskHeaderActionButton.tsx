import React from 'react';
import {View} from 'react-native';
import {OnyxEntry, withOnyx} from 'react-native-onyx';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as ReportUtils from '@libs/ReportUtils';
import * as Session from '@userActions/Session';
import * as Task from '@userActions/Task';
import ONYXKEYS from '@src/ONYXKEYS';
import * as OnyxTypes from '@src/types/onyx';
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

    return (
        <View style={[styles.flexRow, styles.alignItemsCenter, styles.justifyContentEnd]}>
            <Button
                success
                isDisabled={!Task.canModifyTask(report, session?.accountID ?? 0)}
                medium
                text={translate(ReportUtils.isCompletedTaskReport(report) ? 'task.markAsIncomplete' : 'task.markAsComplete')}
                onPress={Session.checkIfActionIsAllowed(() => (ReportUtils.isCompletedTaskReport(report) ? Task.reopenTask(report) : Task.completeTask(report)))}
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
