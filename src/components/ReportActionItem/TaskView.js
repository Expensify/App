import React, {useEffect} from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import reportPropTypes from '../../pages/reportPropTypes';
import withLocalize, {withLocalizePropTypes} from '../withLocalize';
import withWindowDimensions from '../withWindowDimensions';
import withCurrentUserPersonalDetails, {withCurrentUserPersonalDetailsPropTypes} from '../withCurrentUserPersonalDetails';
import compose from '../../libs/compose';
import Navigation from '../../libs/Navigation/Navigation';
import ROUTES from '../../ROUTES';
import MenuItemWithTopDescription from '../MenuItemWithTopDescription';
import MenuItem from '../MenuItem';
import styles from '../../styles/styles';
import * as ReportUtils from '../../libs/ReportUtils';
import * as PersonalDetailsUtils from '../../libs/PersonalDetailsUtils';
import * as UserUtils from '../../libs/UserUtils';
import * as StyleUtils from '../../styles/StyleUtils';
import * as Task from '../../libs/actions/Task';
import CONST from '../../CONST';
import Checkbox from '../Checkbox';
import convertToLTR from '../../libs/convertToLTR';
import Text from '../Text';
import Icon from '../Icon';
import getButtonState from '../../libs/getButtonState';
import PressableWithSecondaryInteraction from '../PressableWithSecondaryInteraction';
import * as Session from '../../libs/actions/Session';
import * as Expensicons from '../Icon/Expensicons';

const propTypes = {
    /** The report currently being looked at */
    report: reportPropTypes.isRequired,

    /** Whether we should display the horizontal rule below the component */
    shouldShowHorizontalRule: PropTypes.bool.isRequired,

    ...withLocalizePropTypes,

    ...withCurrentUserPersonalDetailsPropTypes,
};

function TaskView(props) {
    useEffect(() => {
        Task.setTaskReport({...props.report, isExistingTaskReport: true});
    }, [props.report]);

    const taskTitle = convertToLTR(props.report.reportName || '');
    const isCompleted = ReportUtils.isCompletedTaskReport(props.report);
    const isOpen = ReportUtils.isOpenTaskReport(props.report);
    const isCanceled = ReportUtils.isCanceledTaskReport(props.report);

    return (
        <View>
            <PressableWithSecondaryInteraction
                onPress={Session.checkIfActionIsAllowed((e) => {
                    if (e && e.type === 'click') {
                        e.currentTarget.blur();
                    }

                    Navigation.navigate(ROUTES.getTaskReportTitleRoute(props.report.reportID));
                })}
                style={({hovered, pressed}) => [styles.ph5, styles.pv2, StyleUtils.getButtonBackgroundColorStyle(getButtonState(hovered, pressed, false, !isOpen), true)]}
                ref={props.forwardedRef}
                disabled={!isOpen}
                accessibilityLabel={taskTitle || props.translate('task.task')}
            >
                {({hovered, pressed}) => (
                    <>
                        <Text style={styles.taskTitleDescription}>Title</Text>
                        <View style={[styles.flexRow, styles.alignItemsTop, styles.flex1]}>
                            <Checkbox
                                onPress={() => (isCompleted ? Task.reopenTask(props.report.reportID, taskTitle) : Task.completeTask(props.report.reportID, taskTitle))}
                                isChecked={isCompleted}
                                style={styles.taskMenuItemCheckbox}
                                containerSize={24}
                                containerBorderRadius={8}
                                caretSize={16}
                                accessibilityLabel={taskTitle || props.translate('task.task')}
                                disabled={isCanceled}
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
                                        fill={StyleUtils.getIconFillColor(getButtonState(hovered, pressed, false, !isOpen))}
                                    />
                                </View>
                            )}
                        </View>
                    </>
                )}
            </PressableWithSecondaryInteraction>
            <MenuItemWithTopDescription
                description={props.translate('task.description')}
                title={props.report.description || ''}
                onPress={() => Navigation.navigate(ROUTES.getTaskReportDescriptionRoute(props.report.reportID))}
                shouldShowRightIcon={isOpen}
                disabled={!isOpen}
                wrapperStyle={[styles.pv2]}
                numberOfLinesTitle={3}
                shouldGreyOutWhenDisabled={false}
            />
            {props.report.managerID ? (
                <MenuItem
                    label={props.translate('task.assignee')}
                    title={ReportUtils.getDisplayNameForParticipant(props.report.managerID)}
                    icon={UserUtils.getAvatar(
                        PersonalDetailsUtils.getPersonalDetailsByIDs([props.report.managerID], props.currentUserPersonalDetails.accountID)[0].avatar,
                        props.report.managerID,
                    )}
                    iconType={CONST.ICON_TYPE_AVATAR}
                    avatarSize={CONST.AVATAR_SIZE.SMALLER}
                    titleStyle={styles.assigneeTextStyle}
                    onPress={() => Navigation.navigate(ROUTES.getTaskReportAssigneeRoute(props.report.reportID))}
                    shouldShowRightIcon={isOpen}
                    disabled={!isOpen}
                    wrapperStyle={[styles.pv2]}
                    isSmallAvatarSubscriptMenu
                    shouldGreyOutWhenDisabled={false}
                />
            ) : (
                <MenuItemWithTopDescription
                    description={props.translate('task.assignee')}
                    onPress={() => Navigation.navigate(ROUTES.getTaskReportAssigneeRoute(props.report.reportID))}
                    shouldShowRightIcon={isOpen}
                    disabled={!isOpen}
                    wrapperStyle={[styles.pv2]}
                    shouldGreyOutWhenDisabled={false}
                />
            )}

            {props.shouldShowHorizontalRule && <View style={styles.taskHorizontalRule} />}
        </View>
    );
}

TaskView.propTypes = propTypes;
TaskView.displayName = 'TaskView';

export default compose(withWindowDimensions, withLocalize, withCurrentUserPersonalDetails)(TaskView);
