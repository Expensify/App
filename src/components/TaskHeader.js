import React, {useEffect} from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import lodashGet from 'lodash/get';
import {withOnyx} from 'react-native-onyx';
import reportPropTypes from '../pages/reportPropTypes';
import withLocalize, {withLocalizePropTypes} from './withLocalize';
import * as ReportUtils from '../libs/ReportUtils';
import * as Expensicons from './Icon/Expensicons';
import Text from './Text';
import participantPropTypes from './participantPropTypes';
import Avatar from './Avatar';
import styles from '../styles/styles';
import themeColors from '../styles/themes/default';
import CONST from '../CONST';
import withWindowDimensions from './withWindowDimensions';
import compose from '../libs/compose';
import Navigation from '../libs/Navigation/Navigation';
import ROUTES from '../ROUTES';
import Icon from './Icon';
import MenuItemWithTopDescription from './MenuItemWithTopDescription';
import Button from './Button';
import * as TaskUtils from '../libs/actions/Task';
import * as UserUtils from '../libs/UserUtils';
import PressableWithFeedback from './Pressable/PressableWithFeedback';
import ONYXKEYS from '../ONYXKEYS';
import withNavigationFocus from './withNavigationFocus';

const propTypes = {
    /** The report currently being looked at */
    report: reportPropTypes.isRequired,

    /** Personal details so we can get the ones for the report participants */
    personalDetails: PropTypes.objectOf(participantPropTypes).isRequired,

    /** Current user session */
    session: PropTypes.shape({
        accountID: PropTypes.number,
    }),

    /** Whether the screen is focused */
    isFocused: PropTypes.bool.isRequired,

    ...withLocalizePropTypes,
};

const defaultProps = {
    session: {
        accountID: 0,
    },
};

function TaskHeader(props) {
    const title = ReportUtils.getReportName(props.report);
    const assigneeAccountID = TaskUtils.getTaskAssigneeAccountID(props.report);
    const assigneeName = ReportUtils.getDisplayNameForParticipant(assigneeAccountID);
    const assigneeAvatar = UserUtils.getAvatar(lodashGet(props.personalDetails, [assigneeAccountID, 'avatar']), assigneeAccountID);
    const isOpen = props.report.stateNum === CONST.REPORT.STATE_NUM.OPEN && props.report.statusNum === CONST.REPORT.STATUS.OPEN;
    const isCompleted = ReportUtils.isTaskCompleted(props.report);

    useEffect(() => {
        if (!props.isFocused) {
            return;
        }
        TaskUtils.setTaskReport(props.report);
    }, [props.report, props.isFocused]);

    return (
        <View style={styles.borderBottom}>
            <View style={[{backgroundColor: themeColors.highlightBG}, styles.pl0]}>
                <View style={[styles.ph5, styles.pb5]}>
                    <Text style={[styles.textLabelSupporting, styles.lh16]}>{props.translate('common.to')}</Text>
                    <PressableWithFeedback
                        onPress={() => Navigation.navigate(ROUTES.getTaskReportAssigneeRoute(props.report.reportID))}
                        disabled={!isOpen}
                        accessibilityRole={CONST.ACCESSIBILITY_ROLE.BUTTON}
                        accessibilityLabel={props.translate('newTaskPage.assignee')}
                        hoverDimmingValue={1}
                        pressDimmingValue={0.2}
                    >
                        <View style={[styles.flexRow, styles.alignItemsCenter, styles.justifyContentBetween, styles.pv3]}>
                            <View style={[styles.flexRow, styles.alignItemsCenter, styles.justifyContentBetween]}>
                                {assigneeAccountID && assigneeAccountID > 0 && (
                                    <>
                                        <Avatar
                                            source={assigneeAvatar}
                                            type={CONST.ICON_TYPE_AVATAR}
                                            name={assigneeName}
                                            size={CONST.AVATAR_SIZE.HEADER}
                                        />
                                        <View style={[styles.flexColumn, styles.ml3]}>
                                            <Text
                                                style={[styles.headerText, styles.pre]}
                                                numberOfLines={1}
                                            >
                                                {assigneeName}
                                            </Text>
                                        </View>
                                    </>
                                )}
                            </View>
                            <View style={[styles.flexRow]}>
                                {isCompleted ? (
                                    <>
                                        <Text>{props.translate('task.completed')}</Text>
                                        <View style={styles.defaultCheckmarkWrapper}>
                                            <Icon
                                                src={Expensicons.Checkmark}
                                                fill={themeColors.iconSuccessFill}
                                            />
                                        </View>
                                    </>
                                ) : (
                                    <Button
                                        success
                                        isDisabled={TaskUtils.isTaskCanceled(props.report) || !TaskUtils.isTaskAssigneeOrTaskOwner(props.report, props.session.accountID)}
                                        medium
                                        text={props.translate('newTaskPage.markAsDone')}
                                        onPress={() => TaskUtils.completeTask(props.report.reportID, title)}
                                    />
                                )}
                            </View>
                        </View>
                    </PressableWithFeedback>
                </View>
            </View>
            <MenuItemWithTopDescription
                shouldShowHeaderTitle
                title={props.report.reportName}
                description={props.translate('newTaskPage.task')}
                onPress={() => Navigation.navigate(ROUTES.getTaskReportTitleRoute(props.report.reportID))}
                disabled={!isOpen}
                interactive={isOpen}
            />
            <MenuItemWithTopDescription
                title={lodashGet(props.report, 'description', '')}
                description={props.translate('newTaskPage.description')}
                onPress={() => Navigation.navigate(ROUTES.getTaskReportDescriptionRoute(props.report.reportID))}
                disabled={!isOpen}
                interactive={isOpen}
            />
        </View>
    );
}

TaskHeader.propTypes = propTypes;
TaskHeader.defaultProps = defaultProps;
TaskHeader.displayName = 'TaskHeader';

export default compose(
    withWindowDimensions,
    withLocalize,
    withNavigationFocus,
    withOnyx({
        session: {
            key: ONYXKEYS.SESSION,
        },
    }),
)(TaskHeader);
