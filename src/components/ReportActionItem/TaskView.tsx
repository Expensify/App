import {delegateEmailSelector} from '@selectors/Account';
import {hasSeenTourSelector} from '@selectors/Onboarding';
import React, {useEffect, useMemo, useState} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {AttachmentContext} from '@components/AttachmentContext';
import Checkbox from '@components/Checkbox';
import Hoverable from '@components/Hoverable';
import Icon from '@components/Icon';
import MenuItem from '@components/MenuItem';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import {usePersonalDetails} from '@components/OnyxListItemProvider';
import PressableWithSecondaryInteraction from '@components/PressableWithSecondaryInteraction';
import RenderHTML from '@components/RenderHTML';
import {ShowContextMenuActionsContext, ShowContextMenuStateContext} from '@components/ShowContextMenuContext';
import Text from '@components/Text';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useHasOutstandingChildTask from '@hooks/useHasOutstandingChildTask';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useParentReportAction from '@hooks/useParentReportAction';
import useReportIsArchived from '@hooks/useReportIsArchived';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import Accessibility from '@libs/Accessibility';
import getButtonState from '@libs/getButtonState';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';
import {getPersonalDetailsForAccountIDs} from '@libs/OptionsListUtils';
import Parser from '@libs/Parser';
import {getDisplayNameForParticipant, getDisplayNamesWithTooltips, isCompletedTaskReport, isOpenTaskReport} from '@libs/ReportUtils';
import shouldBreakAccessibilityGrouping from '@libs/shouldBreakAccessibilityGrouping';
import StringUtils from '@libs/StringUtils';
import {isActiveTaskEditRoute} from '@libs/TaskUtils';
import {callFunctionIfActionIsAllowed} from '@userActions/Session';
import {canActionTask, canModifyTask, clearTaskErrors, completeTask, reopenTask, setTaskReport} from '@userActions/Task';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type {Report, ReportAction} from '@src/types/onyx';

type TaskViewProps = {
    /** The report currently being looked at */
    report: OnyxEntry<Report>;

    /** The parent report */
    parentReport: OnyxEntry<Report>;

    /** The task report action */
    action: OnyxEntry<ReportAction>;
};

function TaskView({report, parentReport, action}: TaskViewProps) {
    const icons = useMemoizedLazyExpensifyIcons(['ArrowRight']);
    const {translate, localeCompare, formatPhoneNumber} = useLocalize();
    const styles = useThemeStyles();
    const isScreenReaderActive = Accessibility.useScreenReaderStatus();
    const shouldBreakGrouping = shouldBreakAccessibilityGrouping();
    const StyleUtils = useStyleUtils();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const personalDetails = usePersonalDetails();
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const [betas] = useOnyx(ONYXKEYS.BETAS);
    const [isSelfTourViewed] = useOnyx(ONYXKEYS.NVP_ONBOARDING, {selector: hasSeenTourSelector});
    const [delegateEmail] = useOnyx(ONYXKEYS.ACCOUNT, {selector: delegateEmailSelector});

    useEffect(() => {
        setTaskReport(report);
    }, [report]);

    const taskTitleWithoutPre = StringUtils.removePreCodeBlock(report?.reportName);
    const titleWithoutImage = Parser.replace(Parser.htmlToMarkdown(taskTitleWithoutPre), {disabledRules: [...CONST.TASK_TITLE_DISABLED_RULES]});
    const taskTitle = `<task-title>${titleWithoutImage}</task-title>`;
    const taskTitlePlainText = Parser.htmlToText(taskTitleWithoutPre);
    const taskAccessibilityLabel = taskTitlePlainText ? `${translate('task.task')}: ${taskTitlePlainText}` : translate('task.task');

    const assigneeTooltipDetails = getDisplayNamesWithTooltips(
        getPersonalDetailsForAccountIDs(report?.managerID ? [report?.managerID] : [], personalDetails),
        false,
        localeCompare,
        formatPhoneNumber,
    );

    const isOpen = isOpenTaskReport(report);
    const isCompletedFromOnyx = isCompletedTaskReport(report);

    // Local state provides immediate feedback for VoiceOver after toggling the checkbox,
    // since Onyx updates asynchronously and the screen reader would announce the stale state.
    const [prevIsCompletedFromOnyx, setPrevIsCompletedFromOnyx] = useState(isCompletedFromOnyx);
    const [localIsCompleted, setLocalIsCompleted] = useState(isCompletedFromOnyx);

    if (prevIsCompletedFromOnyx !== isCompletedFromOnyx) {
        setPrevIsCompletedFromOnyx(isCompletedFromOnyx);
        setLocalIsCompleted(isCompletedFromOnyx);
    }

    const isCompleted = shouldBreakGrouping && isScreenReaderActive ? localIsCompleted : isCompletedFromOnyx;
    const isParentReportArchived = useReportIsArchived(parentReport?.reportID);
    const hasOutstandingChildTask = useHasOutstandingChildTask(report);
    const isTaskModifiable = canModifyTask(report, currentUserPersonalDetails.accountID, isParentReportArchived);
    const parentReportAction = useParentReportAction(report);
    const isTaskActionable = canActionTask(report, parentReportAction, currentUserPersonalDetails.accountID, parentReport, isParentReportArchived);

    const disableState = !isTaskModifiable;
    const isDisableInteractive = disableState || !isOpen;
    const accountID = currentUserPersonalDetails?.accountID ?? CONST.DEFAULT_NUMBER_ID;
    const contextMenuStateValue = useMemo(
        () => ({
            anchor: null,
            report,
            action,
            transactionThreadReport: undefined,
            isDisabled: true,
            shouldDisplayContextMenu: false,
        }),
        [report, action],
    );

    const contextMenuActionsValue = useMemo(
        () => ({
            checkIfContextMenuActive: () => {},
            onShowContextMenu: (callback: () => void) => callback(),
        }),
        [],
    );

    const attachmentContextValue = useMemo(() => ({type: CONST.ATTACHMENT_TYPE.ONBOARDING, accountID}), [accountID]);

    return (
        <ShowContextMenuStateContext.Provider value={contextMenuStateValue}>
            <ShowContextMenuActionsContext.Provider value={contextMenuActionsValue}>
                <AttachmentContext.Provider value={attachmentContextValue}>
                    <OfflineWithFeedback
                        shouldShowErrorMessages
                        errors={report?.errorFields?.editTask ?? report?.errorFields?.createTask}
                        onClose={() =>
                            clearTaskErrors(
                                report,
                                conciergeReportID,
                                accountID,
                                introSelected,
                                betas,
                                isSelfTourViewed,
                                report?.ownerAccountID ? (personalDetails?.[report.ownerAccountID] ?? undefined) : undefined,
                                currentUserPersonalDetails,
                                (personalDetails ? Object.values(personalDetails).find((detail) => detail?.login === CONST.EMAIL.CONCIERGE) : undefined) ?? undefined,
                            )
                        }
                        errorRowStyles={styles.ph5}
                    >
                        <Hoverable>
                            {(hovered) => (
                                <PressableWithSecondaryInteraction
                                    accessible={shouldBreakGrouping ? false : undefined}
                                    onPress={callFunctionIfActionIsAllowed(() => {
                                        if (isDisableInteractive) {
                                            return;
                                        }

                                        Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.TASK_TITLE.path));
                                    })}
                                    style={({pressed}) => [
                                        styles.ph5,
                                        styles.pv2,
                                        StyleUtils.getButtonBackgroundColorStyle(getButtonState(hovered, pressed, false, disableState, !isDisableInteractive), true),
                                        isDisableInteractive && styles.cursorDefault,
                                    ]}
                                    accessibilityLabel={taskAccessibilityLabel}
                                    disabled={isDisableInteractive}
                                    sentryLabel={CONST.SENTRY_LABEL.TASK.VIEW_TITLE}
                                >
                                    {({pressed}) => (
                                        <OfflineWithFeedback pendingAction={report?.pendingFields?.reportName}>
                                            <Text style={styles.taskTitleDescription}>{translate('task.title')}</Text>
                                            <View style={[styles.flexRow, styles.flex1]}>
                                                <Checkbox
                                                    onPress={callFunctionIfActionIsAllowed(() => {
                                                        // If we're already navigating to these task editing pages, early return not to mark as completed, otherwise we would have not found page.
                                                        if (isActiveTaskEditRoute(report?.reportID)) {
                                                            return;
                                                        }
                                                        if (shouldBreakGrouping && isScreenReaderActive) {
                                                            setLocalIsCompleted((prev) => !prev);
                                                        }
                                                        if (isCompleted) {
                                                            reopenTask(report, parentReport, currentUserPersonalDetails.accountID, delegateEmail);
                                                        } else {
                                                            completeTask(report, parentReport?.hasOutstandingChildTask ?? false, hasOutstandingChildTask, parentReportAction, delegateEmail);
                                                        }
                                                    })}
                                                    isChecked={isCompleted}
                                                    style={styles.taskMenuItemCheckbox}
                                                    containerSize={24}
                                                    containerBorderRadius={8}
                                                    caretSize={16}
                                                    accessibilityLabel={taskAccessibilityLabel}
                                                    disabled={!isTaskActionable}
                                                    sentryLabel={CONST.SENTRY_LABEL.TASK.VIEW_CHECKBOX}
                                                />
                                                {shouldBreakGrouping ? (
                                                    <View
                                                        accessible
                                                        accessibilityRole={CONST.ROLE.BUTTON}
                                                        accessibilityLabel={taskAccessibilityLabel}
                                                        accessibilityState={{disabled: isDisableInteractive}}
                                                        accessibilityActions={isDisableInteractive ? [] : [{name: 'activate'}]}
                                                        onAccessibilityAction={(event) => {
                                                            if (event.nativeEvent.actionName !== 'activate') {
                                                                return;
                                                            }
                                                            Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.TASK_TITLE.path));
                                                        }}
                                                        style={[styles.flexRow, styles.flex1]}
                                                    >
                                                        <View style={[styles.flexRow, styles.flex1]}>
                                                            <RenderHTML html={taskTitle} />
                                                        </View>
                                                        {!isDisableInteractive && (
                                                            <View style={styles.taskRightIconContainer}>
                                                                <Icon
                                                                    additionalStyles={[styles.alignItemsCenter]}
                                                                    src={icons.ArrowRight}
                                                                    fill={StyleUtils.getIconFillColor(getButtonState(hovered, pressed, false, disableState))}
                                                                />
                                                            </View>
                                                        )}
                                                    </View>
                                                ) : (
                                                    <>
                                                        <View style={[styles.flexRow, styles.flex1]}>
                                                            <RenderHTML html={taskTitle} />
                                                        </View>
                                                        {!isDisableInteractive && (
                                                            <View style={styles.taskRightIconContainer}>
                                                                <Icon
                                                                    additionalStyles={[styles.alignItemsCenter]}
                                                                    src={icons.ArrowRight}
                                                                    fill={StyleUtils.getIconFillColor(getButtonState(hovered, pressed, false, disableState))}
                                                                />
                                                            </View>
                                                        )}
                                                    </>
                                                )}
                                            </View>
                                        </OfflineWithFeedback>
                                    )}
                                </PressableWithSecondaryInteraction>
                            )}
                        </Hoverable>
                        <OfflineWithFeedback pendingAction={report?.pendingFields?.description}>
                            <MenuItemWithTopDescription
                                shouldRenderAsHTML
                                description={translate('task.description')}
                                title={report?.description ?? ''}
                                onPress={() => Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.REPORT_DESCRIPTION.path))}
                                shouldShowRightIcon={!isDisableInteractive}
                                disabled={disableState}
                                wrapperStyle={[styles.pv2, styles.taskDescriptionMenuItem]}
                                shouldGreyOutWhenDisabled={false}
                                numberOfLinesTitle={0}
                                interactive={!isDisableInteractive}
                                shouldUseDefaultCursorWhenDisabled
                                sentryLabel={CONST.SENTRY_LABEL.TASK.VIEW_DESCRIPTION}
                            />
                        </OfflineWithFeedback>
                        <OfflineWithFeedback pendingAction={report?.pendingFields?.managerID}>
                            {report?.managerID ? (
                                <MenuItem
                                    label={translate('task.assignee')}
                                    title={getDisplayNameForParticipant({accountID: report.managerID, formatPhoneNumber})}
                                    iconAccountID={report.managerID}
                                    iconType={CONST.ICON_TYPE_AVATAR}
                                    avatarSize={CONST.AVATAR_SIZE.SMALLER}
                                    titleStyle={styles.assigneeTextStyle}
                                    onPress={() => Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.TASK_ASSIGNEE.path))}
                                    shouldShowRightIcon={!isDisableInteractive}
                                    disabled={disableState}
                                    wrapperStyle={[styles.pv2]}
                                    isSmallAvatarSubscriptMenu
                                    shouldGreyOutWhenDisabled={false}
                                    interactive={!isDisableInteractive}
                                    titleWithTooltips={assigneeTooltipDetails}
                                    shouldUseDefaultCursorWhenDisabled
                                    sentryLabel={CONST.SENTRY_LABEL.TASK.VIEW_ASSIGNEE}
                                />
                            ) : (
                                <MenuItemWithTopDescription
                                    description={translate('task.assignee')}
                                    onPress={() => Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.TASK_ASSIGNEE.path))}
                                    shouldShowRightIcon={!isDisableInteractive}
                                    disabled={disableState}
                                    wrapperStyle={[styles.pv2]}
                                    shouldGreyOutWhenDisabled={false}
                                    interactive={!isDisableInteractive}
                                    shouldUseDefaultCursorWhenDisabled
                                    sentryLabel={CONST.SENTRY_LABEL.TASK.VIEW_ASSIGNEE}
                                />
                            )}
                        </OfflineWithFeedback>
                    </OfflineWithFeedback>
                </AttachmentContext.Provider>
            </ShowContextMenuActionsContext.Provider>
        </ShowContextMenuStateContext.Provider>
    );
}

export default TaskView;
