import Str from 'expensify-common/lib/str';
import React from 'react';
// eslint-disable-next-line no-restricted-imports
import type {Text as RNText} from 'react-native';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import Checkbox from '@components/Checkbox';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import {usePersonalDetails} from '@components/OnyxProvider';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import RenderHTML from '@components/RenderHTML';
import {showContextMenuForReport} from '@components/ShowContextMenuContext';
import withCurrentUserPersonalDetails from '@components/withCurrentUserPersonalDetails';
import type {WithCurrentUserPersonalDetailsProps} from '@components/withCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import ControlSelection from '@libs/ControlSelection';
import * as DeviceCapabilities from '@libs/DeviceCapabilities';
import getButtonState from '@libs/getButtonState';
import * as LocalePhoneNumber from '@libs/LocalePhoneNumber';
import Navigation from '@libs/Navigation/Navigation';
import * as ReportUtils from '@libs/ReportUtils';
import * as TaskUtils from '@libs/TaskUtils';
import * as Session from '@userActions/Session';
import * as Task from '@userActions/Task';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Policy, Report, ReportAction} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

type PolicyRole = {
    /** The role of current user */
    role: Task.PolicyValue | undefined;
};

type TaskPreviewOnyxProps = {
    /* Onyx Props */

    /* current report of TaskPreview */
    taskReport: OnyxEntry<Report>;

    /** The policy of root parent report */
    rootParentReportpolicy: OnyxEntry<PolicyRole>;
};

type TaskPreviewProps = WithCurrentUserPersonalDetailsProps &
    TaskPreviewOnyxProps & {
        /** The ID of the associated policy */
        // eslint-disable-next-line react/no-unused-prop-types
        policyID: string;
        /** The ID of the associated taskReport */
        taskReportID: string;

        /** Whether the task preview is hovered so we can modify its style */
        isHovered: boolean;

        /** The linked reportAction */
        action: OnyxEntry<ReportAction>;

        /** The chat report associated with taskReport */
        chatReportID: string;

        /** Popover context menu anchor, used for showing context menu */
        contextMenuAnchor: RNText | null;

        /** Callback for updating context menu active state, used for showing context menu */
        checkIfContextMenuActive: () => void;
    };

function TaskPreview({
    taskReport,
    taskReportID,
    action,
    contextMenuAnchor,
    chatReportID,
    checkIfContextMenuActive,
    currentUserPersonalDetails,
    rootParentReportpolicy,
    isHovered = false,
}: TaskPreviewProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const personalDetails = usePersonalDetails() || CONST.EMPTY_OBJECT;
    const {translate} = useLocalize();

    // The reportAction might not contain details regarding the taskReport
    // Only the direct parent reportAction will contain details about the taskReport
    // Other linked reportActions will only contain the taskReportID and we will grab the details from there
    const isTaskCompleted = !isEmptyObject(taskReport)
        ? taskReport?.stateNum === CONST.REPORT.STATE_NUM.APPROVED && taskReport.statusNum === CONST.REPORT.STATUS_NUM.APPROVED
        : action?.childStateNum === CONST.REPORT.STATE_NUM.APPROVED && action?.childStatusNum === CONST.REPORT.STATUS_NUM.APPROVED;
    const taskTitle = Str.htmlEncode(TaskUtils.getTaskTitle(taskReportID, action?.childReportName ?? ''));
    const taskAssigneeAccountID = Task.getTaskAssigneeAccountID(taskReport) ?? action?.childManagerAccountID ?? '';
    const assigneeLogin = personalDetails[taskAssigneeAccountID]?.login ?? '';
    const assigneeDisplayName = personalDetails[taskAssigneeAccountID]?.displayName ?? '';
    const taskAssignee = assigneeDisplayName || LocalePhoneNumber.formatPhoneNumber(assigneeLogin);
    const htmlForTaskPreview =
        taskAssignee && taskAssigneeAccountID !== 0
            ? `<comment><mention-user accountid="${taskAssigneeAccountID}">@${taskAssignee}</mention-user> ${taskTitle}</comment>`
            : `<comment>${taskTitle}</comment>`;
    const isDeletedParentAction = ReportUtils.isCanceledTaskReport(taskReport, action);

    if (isDeletedParentAction) {
        return <RenderHTML html={`<comment>${translate('parentReportAction.deletedTask')}</comment>`} />;
    }

    return (
        <View style={[styles.chatItemMessage]}>
            <PressableWithoutFeedback
                onPress={() => Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(taskReportID))}
                onPressIn={() => DeviceCapabilities.canUseTouchScreen() && ControlSelection.block()}
                onPressOut={() => ControlSelection.unblock()}
                onLongPress={(event) => showContextMenuForReport(event, contextMenuAnchor, chatReportID, action, checkIfContextMenuActive)}
                style={[styles.flexRow, styles.justifyContentBetween]}
                role={CONST.ROLE.BUTTON}
                accessibilityLabel={translate('task.task')}
            >
                <View style={[styles.flex1, styles.flexRow, styles.alignItemsStart]}>
                    <Checkbox
                        style={[styles.mr2]}
                        containerStyle={[styles.taskCheckbox]}
                        isChecked={isTaskCompleted}
                        disabled={!Task.canModifyTask(taskReport, currentUserPersonalDetails.accountID, rootParentReportpolicy?.role)}
                        onPress={Session.checkIfActionIsAllowed(() => {
                            if (isTaskCompleted) {
                                Task.reopenTask(taskReport);
                            } else {
                                Task.completeTask(taskReport);
                            }
                        })}
                        accessibilityLabel={translate('task.task')}
                    />
                    <RenderHTML html={htmlForTaskPreview} />
                </View>
                <Icon
                    src={Expensicons.ArrowRight}
                    fill={StyleUtils.getIconFillColor(getButtonState(isHovered))}
                />
            </PressableWithoutFeedback>
        </View>
    );
}

TaskPreview.displayName = 'TaskPreview';

export default withCurrentUserPersonalDetails(
    withOnyx<TaskPreviewProps, TaskPreviewOnyxProps>({
        taskReport: {
            key: ({taskReportID}) => `${ONYXKEYS.COLLECTION.REPORT}${taskReportID}`,
        },
        rootParentReportpolicy: {
            key: ({policyID}) => `${ONYXKEYS.COLLECTION.POLICY}${policyID ?? '0'}`,
            selector: (policy: Policy | null) => ({role: policy?.role}),
        },
    })(TaskPreview),
);
