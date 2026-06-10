import {delegateEmailSelector} from '@selectors/Account';
import React, {useState} from 'react';
import {View} from 'react-native';
import type {StyleProp, ViewStyle} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import Avatar from '@components/Avatar';
import Checkbox from '@components/Checkbox';
import Icon from '@components/Icon';
import {usePersonalDetails} from '@components/OnyxListItemProvider';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import RenderHTML from '@components/RenderHTML';
import {showContextMenuForReport, useShowContextMenuActions, useShowContextMenuState} from '@components/ShowContextMenuContext';
import UserDetailsTooltip from '@components/UserDetailsTooltip';
import withCurrentUserPersonalDetails from '@components/withCurrentUserPersonalDetails';
import type {WithCurrentUserPersonalDetailsProps} from '@components/withCurrentUserPersonalDetails';
import useHasOutstandingChildTask from '@hooks/useHasOutstandingChildTask';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useParentReport from '@hooks/useParentReport';
import useParentReportAction from '@hooks/useParentReportAction';
import useReportIsArchived from '@hooks/useReportIsArchived';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import Accessibility from '@libs/Accessibility';
import {callFunctionIfActionIsAllowed} from '@libs/actions/Session';
import {canActionTask, completeTask, getTaskAssigneeAccountID, reopenTask} from '@libs/actions/Task';
import ControlSelection from '@libs/ControlSelection';
import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import getButtonState from '@libs/getButtonState';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import getReportRouteForCurrentContext from '@libs/Navigation/helpers/getReportRouteForCurrentContext';
import Navigation from '@libs/Navigation/Navigation';
import Parser from '@libs/Parser';
import {getOriginalMessage} from '@libs/ReportActionsUtils';
import {isCanceledTaskReport, isOpenTaskReport, isReportManager} from '@libs/ReportUtils';
import shouldBreakAccessibilityGrouping from '@libs/shouldBreakAccessibilityGrouping';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, ReportAction} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

type TaskPreviewProps = WithCurrentUserPersonalDetailsProps & {
    /** The ID of the associated policy */
    // eslint-disable-next-line react/no-unused-prop-types
    policyID: string | undefined;

    /** Whether the task preview is hovered so we can modify its style */
    isHovered: boolean;

    /** The linked reportAction */
    action: OnyxEntry<ReportAction>;

    /** The chat report associated with taskReport */
    chatReportID: string | undefined;

    /** Style for the task preview container */
    style: StyleProp<ViewStyle>;
};

function TaskPreview({action, chatReportID, currentUserPersonalDetails, isHovered = false, style}: TaskPreviewProps) {
    const icons = useMemoizedLazyExpensifyIcons(['ArrowRight', 'DotIndicator', 'FallbackAvatar']);
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {translate} = useLocalize();
    const theme = useTheme();
    const isScreenReaderActive = Accessibility.useScreenReaderStatus();
    const shouldBreakGrouping = shouldBreakAccessibilityGrouping();
    const {originalReportID, anchor: contextMenuAnchorRef, shouldDisplayContextMenu = true} = useShowContextMenuState();
    const {checkIfContextMenuActive, onShowContextMenu} = useShowContextMenuActions();
    const originalMessage = getOriginalMessage(action);
    const taskReportIDFromOriginalMessage = originalMessage && 'taskReportID' in originalMessage ? originalMessage.taskReportID : undefined;
    const [taskReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(taskReportIDFromOriginalMessage)}`);
    const taskReportID = taskReport?.reportID ?? action?.childReportID;
    // Prefer the live task report name so offline title edits are reflected immediately.
    const taskTitle = taskReport?.reportName ?? action?.childReportName ?? '';
    const taskContextReport =
        taskReport ??
        ({
            reportID: taskReportID,
            parentReportID: chatReportID,
            parentReportActionID: action?.reportActionID,
            ownerAccountID: action?.childOwnerAccountID,
            managerID: action?.childManagerAccountID,
            stateNum: action?.childStateNum,
            statusNum: action?.childStatusNum,
        } as Report);

    const taskTitleWithoutImage = Parser.replace(Parser.htmlToMarkdown(taskTitle), {disabledRules: [...CONST.TASK_TITLE_DISABLED_RULES]});

    // The reportAction might not contain details regarding the taskReport
    // Only the direct parent reportAction will contain details about the taskReport
    // Other linked reportActions will only contain the taskReportID and we will grab the details from there
    const isTaskCompletedFromOnyx = !isEmptyObject(taskReport)
        ? taskReport?.stateNum === CONST.REPORT.STATE_NUM.APPROVED && taskReport.statusNum === CONST.REPORT.STATUS_NUM.APPROVED
        : action?.childStateNum === CONST.REPORT.STATE_NUM.APPROVED && action?.childStatusNum === CONST.REPORT.STATUS_NUM.APPROVED;

    // Local state provides immediate feedback for VoiceOver after toggling the checkbox,
    // since Onyx updates asynchronously and the screen reader would announce the stale state.
    const [prevIsTaskCompletedFromOnyx, setPrevIsTaskCompletedFromOnyx] = useState(isTaskCompletedFromOnyx);
    const [localIsTaskCompleted, setLocalIsTaskCompleted] = useState(isTaskCompletedFromOnyx);

    if (prevIsTaskCompletedFromOnyx !== isTaskCompletedFromOnyx) {
        setPrevIsTaskCompletedFromOnyx(isTaskCompletedFromOnyx);
        setLocalIsTaskCompleted(isTaskCompletedFromOnyx);
    }

    const isTaskCompleted = shouldBreakGrouping && isScreenReaderActive ? localIsTaskCompleted : isTaskCompletedFromOnyx;

    const parentReportAction = useParentReportAction(taskContextReport);
    const taskAssigneeAccountID = getTaskAssigneeAccountID(taskContextReport, parentReportAction) ?? action?.childManagerAccountID ?? CONST.DEFAULT_NUMBER_ID;
    const parentReport = useParentReport(taskContextReport?.reportID);
    const isParentReportArchived = useReportIsArchived(parentReport?.reportID);
    const hasOutstandingChildTask = useHasOutstandingChildTask(taskContextReport);
    const [delegateEmail] = useOnyx(ONYXKEYS.ACCOUNT, {selector: delegateEmailSelector});
    const isTaskActionable = canActionTask(taskContextReport, parentReportAction, currentUserPersonalDetails.accountID, parentReport, isParentReportArchived);
    const hasAssignee = taskAssigneeAccountID > 0;
    const personalDetails = usePersonalDetails();
    const avatar = personalDetails?.[taskAssigneeAccountID]?.avatar ?? icons.FallbackAvatar;
    const avatarSize = CONST.AVATAR_SIZE.SMALL;
    const isDeletedParentAction = isCanceledTaskReport(taskReport, action);
    const iconWrapperStyle = StyleUtils.getTaskPreviewIconWrapper(hasAssignee ? avatarSize : undefined);

    const shouldShowGreenDotIndicator = isOpenTaskReport(taskContextReport, action) && isReportManager(taskContextReport);
    const taskTitlePlainText = Parser.htmlToText(taskTitle);
    const taskAccessibilityLabel = taskTitlePlainText ? `${translate('task.task')}: ${taskTitlePlainText}` : translate('task.task');
    if (isDeletedParentAction) {
        return <RenderHTML html={`<deleted-action>${translate('parentReportAction.deletedTask')}</deleted-action>`} />;
    }

    const getTaskHTML = () => {
        if (isTaskCompleted) {
            return `<del><comment center>${taskTitleWithoutImage}</comment></del>`;
        }

        return `<comment center>${taskTitleWithoutImage}</comment>`;
    };

    const taskPreviewContent = (
        <>
            {hasAssignee && (
                <UserDetailsTooltip accountID={taskAssigneeAccountID}>
                    <View>
                        <Avatar
                            containerStyles={[styles.mr2, isTaskCompleted ? styles.opacitySemiTransparent : undefined]}
                            source={avatar}
                            size={avatarSize}
                            avatarID={taskAssigneeAccountID}
                            type={CONST.ICON_TYPE_AVATAR}
                        />
                    </View>
                </UserDetailsTooltip>
            )}
            <View style={[styles.alignSelfCenter, styles.flex1]}>
                <RenderHTML html={getTaskHTML()} />
            </View>
        </>
    );

    return (
        <View style={[styles.chatItemMessage, !hasAssignee && styles.mv1]}>
            <PressableWithoutFeedback
                accessible={shouldBreakGrouping ? false : undefined}
                onPress={() => Navigation.navigate(getReportRouteForCurrentContext({reportID: taskReportID}))}
                onPressIn={() => canUseTouchScreen() && ControlSelection.block()}
                onPressOut={() => ControlSelection.unblock()}
                onLongPress={(event) =>
                    onShowContextMenu(() => {
                        if (!shouldDisplayContextMenu) {
                            return;
                        }
                        return showContextMenuForReport(event, contextMenuAnchorRef, chatReportID, action, checkIfContextMenuActive, originalReportID);
                    })
                }
                shouldUseHapticsOnLongPress
                style={[styles.flexRow, styles.justifyContentBetween, style]}
                role={CONST.ROLE.BUTTON}
                accessibilityLabel={taskAccessibilityLabel}
                sentryLabel={CONST.SENTRY_LABEL.TASK.PREVIEW_CARD}
            >
                <View style={[styles.flex1, styles.flexRow, styles.alignItemsStart, styles.mr2]}>
                    <View style={iconWrapperStyle}>
                        <Checkbox
                            style={[styles.mr2]}
                            isChecked={isTaskCompleted}
                            disabled={!isTaskActionable}
                            shouldSelectOnPressEnter
                            onPress={callFunctionIfActionIsAllowed(() => {
                                if (shouldBreakGrouping && isScreenReaderActive) {
                                    setLocalIsTaskCompleted((prev) => !prev);
                                }
                                if (isTaskCompleted) {
                                    reopenTask(taskContextReport, parentReport, currentUserPersonalDetails.accountID, delegateEmail, taskReportID);
                                } else {
                                    completeTask(taskContextReport, parentReport?.hasOutstandingChildTask ?? false, hasOutstandingChildTask, parentReportAction, delegateEmail, taskReportID);
                                }
                            })}
                            accessibilityLabel={taskAccessibilityLabel}
                            sentryLabel={CONST.SENTRY_LABEL.TASK.PREVIEW_CHECKBOX}
                        />
                    </View>
                    {shouldBreakGrouping ? (
                        <PressableWithoutFeedback
                            accessible
                            accessibilityRole={CONST.ROLE.BUTTON}
                            accessibilityLabel={taskAccessibilityLabel}
                            onPress={() => Navigation.navigate(getReportRouteForCurrentContext({reportID: taskReportID}))}
                            onPressIn={() => canUseTouchScreen() && ControlSelection.block()}
                            onPressOut={() => ControlSelection.unblock()}
                            onLongPress={(event) =>
                                onShowContextMenu(() => {
                                    if (!shouldDisplayContextMenu) {
                                        return;
                                    }
                                    return showContextMenuForReport(event, contextMenuAnchorRef, chatReportID, action, checkIfContextMenuActive, originalReportID);
                                })
                            }
                            shouldUseHapticsOnLongPress
                            style={[styles.flex1, styles.flexRow, styles.alignItemsStart]}
                            sentryLabel={CONST.SENTRY_LABEL.TASK.PREVIEW_CARD}
                        >
                            {taskPreviewContent}
                        </PressableWithoutFeedback>
                    ) : (
                        taskPreviewContent
                    )}
                </View>
                {shouldShowGreenDotIndicator && (
                    <View style={iconWrapperStyle}>
                        <Icon
                            src={icons.DotIndicator}
                            fill={theme.success}
                        />
                    </View>
                )}
                <Icon
                    src={icons.ArrowRight}
                    fill={StyleUtils.getIconFillColor(getButtonState(isHovered))}
                    additionalStyles={iconWrapperStyle}
                />
            </PressableWithoutFeedback>
        </View>
    );
}

export default withCurrentUserPersonalDetails(TaskPreview);
