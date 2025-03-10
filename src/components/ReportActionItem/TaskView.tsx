import React, {useEffect, useMemo} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {AttachmentContext} from '@components/AttachmentContext';
import Checkbox from '@components/Checkbox';
import Hoverable from '@components/Hoverable';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import MenuItem from '@components/MenuItem';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import {usePersonalDetails} from '@components/OnyxProvider';
import PressableWithSecondaryInteraction from '@components/PressableWithSecondaryInteraction';
import RenderHTML from '@components/RenderHTML';
import {ShowContextMenuContext} from '@components/ShowContextMenuContext';
import Text from '@components/Text';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import convertToLTR from '@libs/convertToLTR';
import getButtonState from '@libs/getButtonState';
import Navigation from '@libs/Navigation/Navigation';
import {getAvatarsForAccountIDs, getPersonalDetailsForAccountIDs} from '@libs/OptionsListUtils';
import {getDisplayNameForParticipant, getDisplayNamesWithTooltips, isCompletedTaskReport, isOpenTaskReport} from '@libs/ReportUtils';
import {isActiveTaskEditRoute} from '@libs/TaskUtils';
import {callFunctionIfActionIsAllowed} from '@userActions/Session';
import {canActionTask as canActionTaskUtil, canModifyTask as canModifyTaskUtil, clearTaskErrors, completeTask, reopenTask, setTaskReport} from '@userActions/Task';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {Report} from '@src/types/onyx';

type TaskViewProps = {
    /** The report currently being looked at */
    report: OnyxEntry<Report>;
};

function TaskView({report}: TaskViewProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const personalDetails = usePersonalDetails();

    useEffect(() => {
        setTaskReport(report);
    }, [report]);
    const taskTitle = `<task-title>${convertToLTR(report?.reportName ?? '')}</task-title>`;
    const assigneeTooltipDetails = getDisplayNamesWithTooltips(getPersonalDetailsForAccountIDs(report?.managerID ? [report?.managerID] : [], personalDetails), false);

    const isOpen = isOpenTaskReport(report);
    const isCompleted = isCompletedTaskReport(report);
    const canModifyTask = canModifyTaskUtil(report, currentUserPersonalDetails.accountID);
    const canActionTask = canActionTaskUtil(report, currentUserPersonalDetails.accountID);

    const disableState = !canModifyTask;
    const isDisableInteractive = !canModifyTask || !isOpen;
    const {translate} = useLocalize();
    const accountID = currentUserPersonalDetails?.accountID ?? CONST.DEFAULT_NUMBER_ID;
    const contextValue = useMemo(
        () => ({
            anchor: null,
            report,
            reportNameValuePairs: undefined,
            action: undefined,
            transactionThreadReport: undefined,
            checkIfContextMenuActive: () => {},
            isDisabled: true,
        }),
        [report],
    );

    const attachmentContextValue = useMemo(() => ({type: CONST.ATTACHMENT_TYPE.ONBOARDING, accountID}), [accountID]);

    return (
        <ShowContextMenuContext.Provider value={contextValue}>
            <AttachmentContext.Provider value={attachmentContextValue}>
                <OfflineWithFeedback
                    shouldShowErrorMessages
                    errors={report?.errorFields?.editTask ?? report?.errorFields?.createTask}
                    onClose={() => clearTaskErrors(report?.reportID)}
                    errorRowStyles={styles.ph5}
                >
                    <Hoverable>
                        {(hovered) => (
                            <PressableWithSecondaryInteraction
                                onPress={callFunctionIfActionIsAllowed((e) => {
                                    if (isDisableInteractive) {
                                        return;
                                    }
                                    if (e && e.type === 'click') {
                                        (e.currentTarget as HTMLElement).blur();
                                    }

                                    Navigation.navigate(ROUTES.TASK_TITLE.getRoute(report?.reportID, Navigation.getReportRHPActiveRoute()));
                                })}
                                style={({pressed}) => [
                                    styles.ph5,
                                    styles.pv2,
                                    StyleUtils.getButtonBackgroundColorStyle(getButtonState(hovered, pressed, false, disableState, !isDisableInteractive), true),
                                    isDisableInteractive && styles.cursorDefault,
                                ]}
                                accessibilityLabel={taskTitle || translate('task.task')}
                                disabled={isDisableInteractive}
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
                                                    if (isCompleted) {
                                                        reopenTask(report);
                                                    } else {
                                                        completeTask(report);
                                                    }
                                                })}
                                                isChecked={isCompleted}
                                                style={styles.taskMenuItemCheckbox}
                                                containerSize={24}
                                                containerBorderRadius={8}
                                                caretSize={16}
                                                accessibilityLabel={taskTitle || translate('task.task')}
                                                disabled={!canActionTask}
                                            />
                                            <View style={[styles.flexRow, styles.flex1]}>
                                                <RenderHTML html={taskTitle} />
                                            </View>
                                            {!isDisableInteractive && (
                                                <View style={styles.taskRightIconContainer}>
                                                    <Icon
                                                        additionalStyles={[styles.alignItemsCenter]}
                                                        src={Expensicons.ArrowRight}
                                                        fill={StyleUtils.getIconFillColor(getButtonState(hovered, pressed, false, disableState))}
                                                    />
                                                </View>
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
                            onPress={() => Navigation.navigate(ROUTES.REPORT_DESCRIPTION.getRoute(report?.reportID, Navigation.getReportRHPActiveRoute()))}
                            shouldShowRightIcon={!isDisableInteractive}
                            disabled={disableState}
                            wrapperStyle={[styles.pv2, styles.taskDescriptionMenuItem]}
                            shouldGreyOutWhenDisabled={false}
                            numberOfLinesTitle={0}
                            interactive={!isDisableInteractive}
                            shouldUseDefaultCursorWhenDisabled
                        />
                    </OfflineWithFeedback>
                    <OfflineWithFeedback pendingAction={report?.pendingFields?.managerID}>
                        {report?.managerID ? (
                            <MenuItem
                                label={translate('task.assignee')}
                                title={getDisplayNameForParticipant({accountID: report.managerID})}
                                icon={getAvatarsForAccountIDs([report?.managerID ?? CONST.DEFAULT_NUMBER_ID], personalDetails)}
                                iconType={CONST.ICON_TYPE_AVATAR}
                                avatarSize={CONST.AVATAR_SIZE.SMALLER}
                                titleStyle={styles.assigneeTextStyle}
                                onPress={() => Navigation.navigate(ROUTES.TASK_ASSIGNEE.getRoute(report?.reportID, Navigation.getReportRHPActiveRoute()))}
                                shouldShowRightIcon={!isDisableInteractive}
                                disabled={disableState}
                                wrapperStyle={[styles.pv2]}
                                isSmallAvatarSubscriptMenu
                                shouldGreyOutWhenDisabled={false}
                                interactive={!isDisableInteractive}
                                titleWithTooltips={assigneeTooltipDetails}
                                shouldUseDefaultCursorWhenDisabled
                            />
                        ) : (
                            <MenuItemWithTopDescription
                                description={translate('task.assignee')}
                                onPress={() => Navigation.navigate(ROUTES.TASK_ASSIGNEE.getRoute(report?.reportID, Navigation.getReportRHPActiveRoute()))}
                                shouldShowRightIcon={!isDisableInteractive}
                                disabled={disableState}
                                wrapperStyle={[styles.pv2]}
                                shouldGreyOutWhenDisabled={false}
                                interactive={!isDisableInteractive}
                                shouldUseDefaultCursorWhenDisabled
                            />
                        )}
                    </OfflineWithFeedback>
                </OfflineWithFeedback>
            </AttachmentContext.Provider>
        </ShowContextMenuContext.Provider>
    );
}

TaskView.displayName = 'TaskView';

export default TaskView;
