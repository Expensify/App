import React, {useEffect} from 'react';
import {View} from 'react-native';
import _ from 'lodash';
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

    ...withLocalizePropTypes,

    ...withCurrentUserPersonalDetailsPropTypes,
};

function TaskView(props) {
    useEffect(() => {
        Task.setTaskReport({...props.report, isExistingTaskReport: true});
    }, [props.report]);

    const taskTitle = props.report.reportName;
    const isCompleted = ReportUtils.isCompletedTaskReport(props.report);
    const isOpen = ReportUtils.isOpenTaskReport(props.report);

    const titleTextStyle = StyleUtils.combineStyles([
        styles.pre,
        styles.ltr,
        styles.newKansasLarge,
        styles.flexWrap,
        styles.flex1,
        {maxWidth: '100%', wordBreak: 'break-word'},
    ]);
    const descriptionTextStyle = StyleUtils.combineStyles([styles.textLabelSupporting, styles.lineHeightNormal, styles.mb1, props.descriptionTextStyle]);

    return (
        <View style={[styles.borderBottom]}>
            <PressableWithSecondaryInteraction
                onPress={Session.checkIfActionIsAllowed((e) => {
                    if (e && e.type === 'click') {
                        e.currentTarget.blur();
                    }

                    Navigation.navigate(ROUTES.getTaskReportTitleRoute(props.report.reportID));
                })}
                style={({hovered, pressed}) => [
                    styles.ph5,
                    styles.pv2,
                    StyleUtils.getButtonBackgroundColorStyle(getButtonState(hovered, pressed), true),
                ]}
                ref={props.forwardedRef}
                disabled={!isOpen}
            >
                {({hovered, pressed}) => (
                    <>
                        <Text style={descriptionTextStyle}>Title</Text>
                        <View style={[styles.flexRow, styles.alignItemsTop, styles.flex1]}>
                            <Checkbox
                                onPress={() => (isCompleted ? Task.reopenTask(props.report.reportID, taskTitle) : Task.completeTask(props.report.reportID, taskTitle))}
                                isChecked={isCompleted}
                                style={[styles.mr3, styles.mt1]}
                            />
                            <View style={[styles.flexRow, styles.flex1]}>
                                <Text
                                    numberOfLines={1}
                                    style={titleTextStyle}
                                >
                                    {convertToLTR(taskTitle)}
                                </Text>
                            </View>
                            <View style={[styles.popoverMenuIcon, styles.pointerEventsAuto, props.disabled && styles.cursorDisabled, {marginLeft: 'auto'}]}>
                                <Icon
                                    src={Expensicons.ArrowRight}
                                    fill={StyleUtils.getIconFillColor(getButtonState(hovered, pressed))}
                                />
                            </View>
                        </View>
                    </>
                )}
            </PressableWithSecondaryInteraction>
            <MenuItemWithTopDescription
                description={props.translate('task.description')}
                title={props.report.description}
                onPress={() => Navigation.navigate(ROUTES.getTaskReportDescriptionRoute(props.report.reportID))}
                shouldShowRightIcon
                disabled={!isOpen}
                wrapperStyle={[styles.pv2]}
            />
            <MenuItem
                label={props.translate('task.assignee')}
                title={ReportUtils.getDisplayNameForParticipant(props.report.managerID)}
                icon={UserUtils.getAvatar(
                    PersonalDetailsUtils.getPersonalDetailsByIDs([props.report.managerID], props.currentUserPersonalDetails.accountID)[0].avatar,
                    props.report.managerID,
                )}
                iconType={CONST.ICON_TYPE_AVATAR}
                avatarSize={CONST.AVATAR_SIZE.SMALL}
                titleStyle={styles.textStrong}
                onPress={() => Navigation.navigate(ROUTES.getTaskReportAssigneeRoute(props.report.reportID))}
                shouldShowRightIcon
                disabled={!isOpen}
                wrapperStyle={[styles.pv2]}
            />
        </View>
    );
}

TaskView.propTypes = propTypes;
TaskView.displayName = 'TaskView';

export default compose(withWindowDimensions, withLocalize, withCurrentUserPersonalDetails)(TaskView);
