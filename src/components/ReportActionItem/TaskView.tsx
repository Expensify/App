import React, {useEffect} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import Checkbox from '@components/Checkbox';
import Hoverable from '@components/Hoverable';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import MenuItem from '@components/MenuItem';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import {usePersonalDetails} from '@components/OnyxProvider';
import PressableWithSecondaryInteraction from '@components/PressableWithSecondaryInteraction';
import SpacerView from '@components/SpacerView';
import Text from '@components/Text';
import withCurrentUserPersonalDetails from '@components/withCurrentUserPersonalDetails';
import type {WithCurrentUserPersonalDetailsProps} from '@components/withCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import convertToLTR from '@libs/convertToLTR';
import getButtonState from '@libs/getButtonState';
import Navigation from '@libs/Navigation/Navigation';
import * as OptionsListUtils from '@libs/OptionsListUtils';
import * as ReportUtils from '@libs/ReportUtils';
import * as Session from '@userActions/Session';
import * as Task from '@userActions/Task';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {PersonalDetailsList, Policy, Report} from '@src/types/onyx';

type TaskViewOnyxProps = {
    /** All of the personal details for everyone */
    personalDetails: OnyxEntry<PersonalDetailsList>;

    /** The policy for the current route */
    policy: Pick<Policy, 'role'> | null;
};

type TaskViewProps = TaskViewOnyxProps &
    WithCurrentUserPersonalDetailsProps & {
        /** The report currently being looked at */
        report: Report;

        /** Whether we should display the horizontal rule below the component */
        shouldShowHorizontalRule: boolean;
    };

function TaskView({report, policy, shouldShowHorizontalRule, ...props}: TaskViewProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    useEffect(() => {
        Task.setTaskReport(report);
    }, [report]);

    const taskTitle = convertToLTR(report.reportName ?? '');
    const assigneeTooltipDetails = ReportUtils.getDisplayNamesWithTooltips(
        OptionsListUtils.getPersonalDetailsForAccountIDs(report.managerID ? [report.managerID] : [], props.personalDetails),
        false,
    );
    const isCompleted = ReportUtils.isCompletedTaskReport(report);
    const isOpen = ReportUtils.isOpenTaskReport(report);
    const canModifyTask = Task.canModifyTask(report, props.currentUserPersonalDetails.accountID, policy?.role);
    const disableState = !canModifyTask;
    const isDisableInteractive = !canModifyTask || !isOpen;
    const personalDetails = usePersonalDetails() || CONST.EMPTY_OBJECT;
    const {translate} = useLocalize();

    return (
        <View>
            <OfflineWithFeedback
                shouldShowErrorMessages
                errors={report.errorFields?.editTask ?? report.errorFields?.createTask}
                onClose={() => Task.clearTaskErrors(report.reportID)}
                errorRowStyles={styles.ph5}
            >
                <Hoverable>
                    {(hovered) => (
                        <PressableWithSecondaryInteraction
                            onPress={Session.checkIfActionIsAllowed((e) => {
                                if (isDisableInteractive) {
                                    return;
                                }
                                if (e && e.type === 'click') {
                                    (e.currentTarget as HTMLElement).blur();
                                }

                                Navigation.navigate(ROUTES.TASK_TITLE.getRoute(report.reportID));
                            })}
                            style={({pressed}) => [
                                styles.ph5,
                                styles.pv2,
                                StyleUtils.getButtonBackgroundColorStyle(getButtonState(hovered, pressed, false, disableState, !isDisableInteractive), true),
                                isDisableInteractive && !disableState && styles.cursorDefault,
                            ]}
                            disabled={disableState}
                            accessibilityLabel={taskTitle || translate('task.task')}
                        >
                            {({pressed}) => (
                                <OfflineWithFeedback pendingAction={report.pendingFields?.reportName}>
                                    <Text style={styles.taskTitleDescription}>{translate('task.title')}</Text>
                                    <View style={[styles.flexRow, styles.flex1]}>
                                        <Checkbox
                                            onPress={Session.checkIfActionIsAllowed(() => {
                                                if (isCompleted) {
                                                    Task.reopenTask(report);
                                                } else {
                                                    Task.completeTask(report);
                                                }
                                            })}
                                            isChecked={isCompleted}
                                            style={styles.taskMenuItemCheckbox}
                                            containerSize={24}
                                            containerBorderRadius={8}
                                            caretSize={16}
                                            accessibilityLabel={taskTitle || translate('task.task')}
                                            disabled={!canModifyTask}
                                        />
                                        <View style={[styles.flexRow, styles.flex1]}>
                                            <Text
                                                numberOfLines={3}
                                                style={styles.taskTitleMenuItem}
                                            >
                                                {taskTitle}
                                            </Text>
                                        </View>
                                        {isOpen && (
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
                <OfflineWithFeedback pendingAction={report.pendingFields?.description}>
                    <MenuItemWithTopDescription
                        shouldParseTitle
                        description={translate('task.description')}
                        title={report.description ?? ''}
                        onPress={() => Navigation.navigate(ROUTES.TASK_DESCRIPTION.getRoute(report.reportID))}
                        shouldShowRightIcon={isOpen}
                        disabled={disableState}
                        wrapperStyle={[styles.pv2, styles.taskDescriptionMenuItem]}
                        shouldGreyOutWhenDisabled={false}
                        numberOfLinesTitle={0}
                        interactive={!isDisableInteractive}
                    />
                </OfflineWithFeedback>
                {report.managerID ? (
                    <OfflineWithFeedback pendingAction={report.pendingFields?.managerID}>
                        <MenuItem
                            label={translate('task.assignee')}
                            title={ReportUtils.getDisplayNameForParticipant(report.managerID)}
                            icon={OptionsListUtils.getAvatarsForAccountIDs(report.managerID ? [report.managerID] : [], personalDetails)}
                            iconType={CONST.ICON_TYPE_AVATAR}
                            avatarSize={CONST.AVATAR_SIZE.SMALLER}
                            titleStyle={styles.assigneeTextStyle}
                            onPress={() => Navigation.navigate(ROUTES.TASK_ASSIGNEE.getRoute(report.reportID))}
                            shouldShowRightIcon={isOpen}
                            disabled={disableState}
                            wrapperStyle={[styles.pv2]}
                            isSmallAvatarSubscriptMenu
                            shouldGreyOutWhenDisabled={false}
                            interactive={!isDisableInteractive}
                            titleWithTooltips={assigneeTooltipDetails}
                        />
                    </OfflineWithFeedback>
                ) : (
                    <MenuItemWithTopDescription
                        description={translate('task.assignee')}
                        onPress={() => Navigation.navigate(ROUTES.TASK_ASSIGNEE.getRoute(report.reportID))}
                        shouldShowRightIcon={isOpen}
                        disabled={disableState}
                        wrapperStyle={[styles.pv2]}
                        shouldGreyOutWhenDisabled={false}
                        interactive={!isDisableInteractive}
                    />
                )}
            </OfflineWithFeedback>
            <SpacerView
                shouldShow={shouldShowHorizontalRule}
                style={shouldShowHorizontalRule && styles.reportHorizontalRule}
            />
        </View>
    );
}

TaskView.displayName = 'TaskView';

const TaskViewWithOnyx = withOnyx<TaskViewProps, TaskViewOnyxProps>({
    personalDetails: {
        key: ONYXKEYS.PERSONAL_DETAILS_LIST,
    },
    policy: {
        key: ({report}) => {
            const rootParentReport = ReportUtils.getRootParentReport(report);
            return `${ONYXKEYS.COLLECTION.POLICY}${rootParentReport ? rootParentReport.policyID : '0'}`;
        },
        selector: (policy: OnyxEntry<Policy>) => (policy ? {role: policy.role} : null),
    },
})(TaskView);

export default withCurrentUserPersonalDetails(TaskViewWithOnyx);
