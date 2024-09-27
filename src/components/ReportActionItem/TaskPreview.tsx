import {Str} from 'expensify-common';
import React from 'react';
import {View} from 'react-native';
import type {StyleProp, ViewStyle} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import Avatar from '@components/Avatar';
import Checkbox from '@components/Checkbox';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import {usePersonalDetails} from '@components/OnyxProvider';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import RenderHTML from '@components/RenderHTML';
import {showContextMenuForReport} from '@components/ShowContextMenuContext';
import Text from '@components/Text';
import withCurrentUserPersonalDetails from '@components/withCurrentUserPersonalDetails';
import type {WithCurrentUserPersonalDetailsProps} from '@components/withCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import ControlSelection from '@libs/ControlSelection';
import * as DeviceCapabilities from '@libs/DeviceCapabilities';
import getButtonState from '@libs/getButtonState';
import Navigation from '@libs/Navigation/Navigation';
import * as ReportUtils from '@libs/ReportUtils';
import * as TaskUtils from '@libs/TaskUtils';
import type {ContextMenuAnchor} from '@pages/home/report/ContextMenu/ReportActionContextMenu';
import * as Session from '@userActions/Session';
import * as Task from '@userActions/Task';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {ReportAction} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

type TaskPreviewProps = WithCurrentUserPersonalDetailsProps & {
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
    contextMenuAnchor: ContextMenuAnchor;

    /** Callback for updating context menu active state, used for showing context menu */
    checkIfContextMenuActive: () => void;

    /** Style for the task preview container */
    style: StyleProp<ViewStyle>;
};

function TaskPreview({taskReportID, action, contextMenuAnchor, chatReportID, checkIfContextMenuActive, currentUserPersonalDetails, isHovered = false, style}: TaskPreviewProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {translate} = useLocalize();
    const theme = useTheme();
    const [taskReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${taskReportID}`);

    // The reportAction might not contain details regarding the taskReport
    // Only the direct parent reportAction will contain details about the taskReport
    // Other linked reportActions will only contain the taskReportID and we will grab the details from there
    const isTaskCompleted = !isEmptyObject(taskReport)
        ? taskReport?.stateNum === CONST.REPORT.STATE_NUM.APPROVED && taskReport.statusNum === CONST.REPORT.STATUS_NUM.APPROVED
        : action?.childStateNum === CONST.REPORT.STATE_NUM.APPROVED && action?.childStatusNum === CONST.REPORT.STATUS_NUM.APPROVED;
    const taskTitle = Str.htmlEncode(TaskUtils.getTaskTitle(taskReportID, action?.childReportName ?? ''));
    const taskAssigneeAccountID = Task.getTaskAssigneeAccountID(taskReport) ?? action?.childManagerAccountID ?? -1;
    const hasAssignee = taskAssigneeAccountID > 0;
    const personalDetails = usePersonalDetails();
    const avatar = personalDetails?.[taskAssigneeAccountID]?.avatar ?? Expensicons.FallbackAvatar;
    const avatarSize = CONST.AVATAR_SIZE.SMALL;
    const isDeletedParentAction = ReportUtils.isCanceledTaskReport(taskReport, action);
    const iconWrapperStyle = StyleUtils.getTaskPreviewIconWrapper(hasAssignee ? avatarSize : undefined);

    const shouldShowGreenDotIndicator = ReportUtils.isOpenTaskReport(taskReport, action) && ReportUtils.isReportManager(taskReport);
    if (isDeletedParentAction) {
        return <RenderHTML html={`<comment>${translate('parentReportAction.deletedTask')}</comment>`} />;
    }

    return (
        <View style={[styles.chatItemMessage, !hasAssignee && styles.mv1]}>
            <PressableWithoutFeedback
                onPress={() => Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(taskReportID))}
                onPressIn={() => DeviceCapabilities.canUseTouchScreen() && ControlSelection.block()}
                onPressOut={() => ControlSelection.unblock()}
                onLongPress={(event) => showContextMenuForReport(event, contextMenuAnchor, chatReportID, action, checkIfContextMenuActive)}
                shouldUseHapticsOnLongPress
                style={[styles.flexRow, styles.justifyContentBetween, style]}
                role={CONST.ROLE.BUTTON}
                accessibilityLabel={translate('task.task')}
            >
                <View style={[styles.flex1, styles.flexRow, styles.alignItemsStart, styles.mr2]}>
                    <View style={iconWrapperStyle}>
                        <Checkbox
                            style={[styles.mr2]}
                            isChecked={isTaskCompleted}
                            disabled={!Task.canModifyTask(taskReport, currentUserPersonalDetails.accountID) || !Task.canActionTask(taskReport, currentUserPersonalDetails.accountID)}
                            onPress={Session.checkIfActionIsAllowed(() => {
                                if (isTaskCompleted) {
                                    Task.reopenTask(taskReport);
                                } else {
                                    Task.completeTask(taskReport);
                                }
                            })}
                            accessibilityLabel={translate('task.task')}
                        />
                    </View>
                    {hasAssignee && (
                        <Avatar
                            containerStyles={[styles.mr2, isTaskCompleted ? styles.opacitySemiTransparent : undefined]}
                            source={avatar}
                            size={avatarSize}
                            avatarID={taskAssigneeAccountID}
                            type={CONST.ICON_TYPE_AVATAR}
                        />
                    )}
                    <Text style={[styles.flex1, styles.alignSelfCenter, isTaskCompleted ? [styles.textSupporting, styles.textLineThrough] : {}]}>{taskTitle}</Text>
                </View>
                {shouldShowGreenDotIndicator && (
                    <View style={styles.ml2}>
                        <Icon
                            src={Expensicons.DotIndicator}
                            fill={theme.success}
                        />
                    </View>
                )}
                <Icon
                    src={Expensicons.ArrowRight}
                    fill={StyleUtils.getIconFillColor(getButtonState(isHovered))}
                    additionalStyles={iconWrapperStyle}
                />
            </PressableWithoutFeedback>
        </View>
    );
}

TaskPreview.displayName = 'TaskPreview';

export default withCurrentUserPersonalDetails(TaskPreview);
