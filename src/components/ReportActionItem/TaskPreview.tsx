import React from 'react';
import {View} from 'react-native';
import {OnyxEntry, withOnyx} from 'react-native-onyx';
import Checkbox from '@components/Checkbox';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import {usePersonalDetails} from '@components/OnyxProvider';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import RenderHTML from '@components/RenderHTML';
import {showContextMenuForReport} from '@components/ShowContextMenuContext';
import withCurrentUserPersonalDetails, {WithCurrentUserPersonalDetailsProps} from '@components/withCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import compose from '@libs/compose';
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
import {isNotEmptyObject} from '@src/types/utils/EmptyObject';

type TaskPreviewOnyxProps = {
    /* Onyx Props */

    taskReport: OnyxEntry<Report>;

    /** The policy of root parent report */
    rootParentReportpolicy: OnyxEntry<Partial<Policy> | null>;
};

type TaskPreviewProps = WithCurrentUserPersonalDetailsProps &
    TaskPreviewOnyxProps & {
        /** The ID of the associated policy */
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
        contextMenuAnchor: Element;

        /** Callback for updating context menu active state, used for showing context menu */
        checkIfContextMenuActive: () => void;
    };

function TaskPreview(props: TaskPreviewProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const personalDetails = usePersonalDetails() || CONST.EMPTY_OBJECT;
    const {translate} = useLocalize();
    // The reportAction might not contain details regarding the taskReport
    // Only the direct parent reportAction will contain details about the taskReport
    // Other linked reportActions will only contain the taskReportID and we will grab the details from there
    const isTaskCompleted = isNotEmptyObject(props.taskReport)
        ? props.taskReport?.stateNum === CONST.REPORT.STATE_NUM.SUBMITTED && props.taskReport.statusNum === CONST.REPORT.STATUS.APPROVED
        : props.action?.childStateNum === CONST.REPORT.STATE_NUM.SUBMITTED && props.action?.childStatusNum === CONST.REPORT.STATUS.APPROVED;
    const taskTitle = _.escape(TaskUtils.getTaskTitle(props.taskReportID, props.action?.childReportName ?? ''));
    const taskAssigneeAccountID = Task.getTaskAssigneeAccountID(props.taskReport ?? {}) ?? props.action?.childManagerAccountID ?? '';
    const assigneeLogin = taskAssigneeAccountID ? personalDetails[taskAssigneeAccountID]?.login ?? '' : '';
    const assigneeDisplayName = taskAssigneeAccountID ? personalDetails[taskAssigneeAccountID]?.displayName ?? '' : '';
    const taskAssignee = assigneeDisplayName || LocalePhoneNumber.formatPhoneNumber(assigneeLogin);
    const htmlForTaskPreview =
        taskAssignee && taskAssigneeAccountID !== 0
            ? `<comment><mention-user accountid="${taskAssigneeAccountID}">@${taskAssignee}</mention-user> ${taskTitle}</comment>`
            : `<comment>${taskTitle}</comment>`;
    const isDeletedParentAction = ReportUtils.isCanceledTaskReport(props.taskReport, props.action);

    if (isDeletedParentAction) {
        return <RenderHTML html={`<comment>${translate('parentReportAction.deletedTask')}</comment>`} />;
    }

    return (
        <View style={[styles.chatItemMessage]}>
            <PressableWithoutFeedback
                onPress={() => Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(props.taskReportID))}
                onPressIn={() => DeviceCapabilities.canUseTouchScreen() && ControlSelection.block()}
                onPressOut={() => ControlSelection.unblock()}
                onLongPress={(event) => showContextMenuForReport(event, props.contextMenuAnchor, props.chatReportID, props.action ?? {}, props.checkIfContextMenuActive)}
                style={[styles.flexRow, styles.justifyContentBetween]}
                role={CONST.ROLE.BUTTON}
                accessibilityLabel={translate('task.task')}
            >
                <View style={[styles.flex1, styles.flexRow, styles.alignItemsStart]}>
                    <Checkbox
                        style={[styles.mr2]}
                        containerStyle={[styles.taskCheckbox]}
                        isChecked={isTaskCompleted}
                        disabled={!Task.canModifyTask(props.taskReport ?? {}, props.currentUserPersonalDetails.accountID, props.rootParentReportpolicy?.role ?? '')}
                        onPress={Session.checkIfActionIsAllowed(() => {
                            if (isTaskCompleted) {
                                Task.reopenTask(props.taskReport ?? {});
                            } else {
                                Task.completeTask(props.taskReport ?? {});
                            }
                        })}
                        accessibilityLabel={translate('task.task')}
                    />
                    <RenderHTML html={htmlForTaskPreview} />
                </View>
                <Icon
                    src={Expensicons.ArrowRight}
                    fill={StyleUtils.getIconFillColor(getButtonState(props.isHovered))}
                />
            </PressableWithoutFeedback>
        </View>
    );
}

TaskPreview.displayName = 'TaskPreview';

export default compose(
    withOnyx<TaskPreviewProps, TaskPreviewOnyxProps>({
        taskReport: {
            key: ({taskReportID}) => `${ONYXKEYS.COLLECTION.REPORT}${taskReportID}`,
        },
        rootParentReportpolicy: {
            key: ({policyID}) => `${ONYXKEYS.COLLECTION.POLICY}${policyID ?? '0'}`,
            selector: (policy: Policy | null) => _.pick(policy, ['role']),
        },
    }),
    withCurrentUserPersonalDetails,
)(TaskPreview);
