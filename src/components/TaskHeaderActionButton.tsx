import React from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as ReportUtils from '@libs/ReportUtils';
import * as Session from '@userActions/Session';
import * as Task from '@userActions/Task';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';
import Button from './Button';

type TaskHeaderActionButtonOnyxProps = {
    /** Current user session */
    session: OnyxEntry<OnyxTypes.Session>;

    /** The policy of root parent report */
    policy: OnyxEntry<OnyxTypes.Policy>;
};

type TaskHeaderActionButtonProps = TaskHeaderActionButtonOnyxProps & {
    /** The report currently being looked at */
    report: OnyxTypes.Report;
};

function TaskHeaderActionButton({report, session, policy}: TaskHeaderActionButtonProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    return (
        <View style={[styles.flexRow, styles.alignItemsCenter, styles.justifyContentEnd]}>
            <Button
                success
                isDisabled={!Task.canModifyTask(report, session?.accountID ?? 0, policy?.role)}
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
    policy: {
        key: ({report}) => {
            const rootParentReport = ReportUtils.getRootParentReport(report);
            return `${ONYXKEYS.COLLECTION.POLICY}${rootParentReport ? rootParentReport.policyID : '0'}`;
        },
    },
})(TaskHeaderActionButton);
