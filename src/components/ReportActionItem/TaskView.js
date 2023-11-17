import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import React, {useEffect} from 'react';
import {View} from 'react-native';
import Checkbox from '@components/Checkbox';
import Hoverable from '@components/Hoverable';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import MenuItem from '@components/MenuItem';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import PressableWithSecondaryInteraction from '@components/PressableWithSecondaryInteraction';
import SpacerView from '@components/SpacerView';
import Text from '@components/Text';
import withCurrentUserPersonalDetails, {withCurrentUserPersonalDetailsPropTypes} from '@components/withCurrentUserPersonalDetails';
import withLocalize, {withLocalizePropTypes} from '@components/withLocalize';
import withWindowDimensions from '@components/withWindowDimensions';
import compose from '@libs/compose';
import convertToLTR from '@libs/convertToLTR';
import getButtonState from '@libs/getButtonState';
import Navigation from '@libs/Navigation/Navigation';
import * as OptionsListUtils from '@libs/OptionsListUtils';
import * as ReportUtils from '@libs/ReportUtils';
import reportPropTypes from '@pages/reportPropTypes';
import * as StyleUtils from '@styles/StyleUtils';
import useThemeStyles from '@styles/useThemeStyles';
import * as Session from '@userActions/Session';
import * as Task from '@userActions/Task';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

const propTypes = {
    /** The report currently being looked at */
    report: reportPropTypes.isRequired,

    /** Whether we should display the horizontal rule below the component */
    shouldShowHorizontalRule: PropTypes.bool.isRequired,

    ...withLocalizePropTypes,

    ...withCurrentUserPersonalDetailsPropTypes,
};

function TaskView(props) {
    const styles = useThemeStyles();
    useEffect(() => {
        Task.setTaskReport({...props.report});
    }, [props.report]);

    const taskTitle = convertToLTR(props.report.reportName || '');
    const assigneeTooltipDetails = ReportUtils.getDisplayNamesWithTooltips(OptionsListUtils.getPersonalDetailsForAccountIDs([props.report.managerID], props.personalDetails), false);
    const isCompleted = ReportUtils.isCompletedTaskReport(props.report);
    const isOpen = ReportUtils.isOpenTaskReport(props.report);
    const canModifyTask = Task.canModifyTask(props.report, props.currentUserPersonalDetails.accountID);
    const disableState = !canModifyTask;
    const isDisableInteractive = !canModifyTask || !isOpen;

    return (
        <View>
            <OfflineWithFeedback
                shouldShowErrorMessages
                errors={lodashGet(props, 'report.errorFields.editTask') || lodashGet(props, 'report.errorFields.createTask')}
                onClose={() => Task.clearTaskErrors(props.report.reportID)}
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
                                    e.currentTarget.blur();
                                }

                                Navigation.navigate(ROUTES.TASK_TITLE.getRoute(props.report.reportID));
                            })}
                            style={({pressed}) => [
                                styles.ph5,
                                styles.pv2,
                                StyleUtils.getButtonBackgroundColorStyle(getButtonState(hovered, pressed, false, disableState, !isDisableInteractive), true),
                                isDisableInteractive && !disableState && styles.cursorDefault,
                            ]}
                            ref={props.forwardedRef}
                            disabled={disableState}
                            accessibilityLabel={taskTitle || props.translate('task.task')}
                        >
                            {({pressed}) => (
                                <OfflineWithFeedback pendingAction={lodashGet(props, 'report.pendingFields.reportName')}>
                                    <Text style={styles.taskTitleDescription}>{props.translate('task.title')}</Text>
                                    <View style={[styles.flexRow, styles.alignItemsTop, styles.flex1]}>
                                        <Checkbox
                                            onPress={Session.checkIfActionIsAllowed(() => {
                                                if (isCompleted) {
                                                    Task.reopenTask(props.report);
                                                } else {
                                                    Task.completeTask(props.report);
                                                }
                                            })}
                                            isChecked={isCompleted}
                                            style={styles.taskMenuItemCheckbox}
                                            containerSize={24}
                                            containerBorderRadius={8}
                                            caretSize={16}
                                            accessibilityLabel={taskTitle || props.translate('task.task')}
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
                <OfflineWithFeedback pendingAction={lodashGet(props, 'report.pendingFields.description')}>
                    <MenuItemWithTopDescription
                        shouldParseTitle
                        description={props.translate('task.description')}
                        title={props.report.description || ''}
                        onPress={() => Navigation.navigate(ROUTES.TASK_DESCRIPTION.getRoute(props.report.reportID))}
                        shouldShowRightIcon={isOpen}
                        disabled={disableState}
                        wrapperStyle={[styles.pv2, styles.taskDescriptionMenuItem]}
                        shouldGreyOutWhenDisabled={false}
                        numberOfLinesTitle={0}
                        interactive={!isDisableInteractive}
                    />
                </OfflineWithFeedback>
                {props.report.managerID ? (
                    <OfflineWithFeedback pendingAction={lodashGet(props, 'report.pendingFields.managerID')}>
                        <MenuItem
                            label={props.translate('task.assignee')}
                            title={ReportUtils.getDisplayNameForParticipant(props.report.managerID)}
                            icon={OptionsListUtils.getAvatarsForAccountIDs([props.report.managerID], props.personalDetails)}
                            iconType={CONST.ICON_TYPE_AVATAR}
                            avatarSize={CONST.AVATAR_SIZE.SMALLER}
                            titleStyle={styles.assigneeTextStyle}
                            onPress={() => Navigation.navigate(ROUTES.TASK_ASSIGNEE.getRoute(props.report.reportID))}
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
                        description={props.translate('task.assignee')}
                        onPress={() => Navigation.navigate(ROUTES.TASK_ASSIGNEE.getRoute(props.report.reportID))}
                        shouldShowRightIcon={isOpen}
                        disabled={disableState}
                        wrapperStyle={[styles.pv2]}
                        shouldGreyOutWhenDisabled={false}
                        interactive={!isDisableInteractive}
                    />
                )}
            </OfflineWithFeedback>
            <SpacerView
                shouldShow={props.shouldShowHorizontalRule}
                style={[props.shouldShowHorizontalRule ? styles.reportHorizontalRule : {}]}
            />
        </View>
    );
}

TaskView.propTypes = propTypes;
TaskView.displayName = 'TaskView';

export default compose(withWindowDimensions, withLocalize, withCurrentUserPersonalDetails)(TaskView);
