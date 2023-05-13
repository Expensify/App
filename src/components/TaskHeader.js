import React from 'react';
import {View, TouchableWithoutFeedback} from 'react-native';
import PropTypes from 'prop-types';
import lodashGet from 'lodash/get';
import {withOnyx} from 'react-native-onyx';
import HeaderWithCloseButton from './HeaderWithCloseButton';
import reportPropTypes from '../pages/reportPropTypes';
import withLocalize, {withLocalizePropTypes} from './withLocalize';
import ONYXKEYS from '../ONYXKEYS';
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
import * as CurrencyUtils from '../libs/CurrencyUtils';
import MenuItemWithTopDescription from './MenuItemWithTopDescription';
import Button from './Button';
import * as TaskUtils from '../libs/actions/Task';

const propTypes = {
    /** The report currently being looked at */
    report: reportPropTypes.isRequired,

    /** The parent report of the currently looked at report */
    parentReport: reportPropTypes,

    /** Personal details so we can get the ones for the report participants */
    personalDetails: PropTypes.objectOf(participantPropTypes).isRequired,

    ...withLocalizePropTypes,
};

const defaultProps = {
    parentReport: {},
};

function TaskHeader(props) {
    const formattedAmount = CurrencyUtils.convertToDisplayString(ReportUtils.getMoneyRequestTotal(props.report), props.report.currency);
    const isSettled = ReportUtils.isSettled(props.report.reportID);
    console.log('report', props.report);
    console.log('parentReport', props.parentReport);
    const title = ReportUtils.getReportName(props.report);
    const assigneeName = ReportUtils.getDisplayNameForParticipant(props.report.managerEmail);
    const assigneeAvatar = ReportUtils.getAvatar(lodashGet(props.personalDetails, [props.report.managerEmail, 'avatar']), props.report.managerEmail);
    const isCompleted = props.report.stateNum === CONST.REPORT.STATE_NUM.SUBMITTED && props.report.statusNum === CONST.REPORT.STATUS.APPROVED;
    const parentReportID = props.report.parentReportID;
    const threeDotMenuItems = [];

    if (props.report.stateNum === CONST.REPORT.STATE_NUM.OPEN && props.report.statusNum === CONST.REPORT.STATUS.OPEN) {
        threeDotMenuItems.push({
            icon: Expensicons.Checkmark,
            text: props.translate('newTaskPage.markAsComplete'),
            onSelected: () => {
                TaskUtils.completeTask(props.report.reportID, parentReportID, title);
            },
        });
    }

    // Task is marked as completed
    if (props.report.stateNum === CONST.REPORT.STATE_NUM.SUBMITTED && props.report.statusNum === CONST.REPORT.STATUS.APPROVED) {
        threeDotMenuItems.push({
            icon: Expensicons.Checkmark,
            text: props.translate('newTaskPage.markAsIncomplete'),

            // Implementing in https://github.com/Expensify/App/issues/16858
            onSelected: () => {},
        });
    }

    // Task is not closed
    if (props.report.stateNum !== CONST.REPORT.STATE_NUM.SUBMITTED && props.report.statusNum !== CONST.REPORT.STATUS.CLOSED) {
        threeDotMenuItems.push({
            icon: Expensicons.Trashcan,
            text: props.translate('common.cancel'),

            // Implementing in https://github.com/Expensify/App/issues/16857
            onSelected: () => {},
        });
    }
    console.log('assigneeAvatar', assigneeAvatar);
    console.log('assigneeName', assigneeName);

    return (
        <View style={styles.borderBottom}>
            <View style={[{backgroundColor: themeColors.highlightBG}, styles.pl0]}>
                <View style={[styles.ph5, styles.pb5]}>
                    <Text style={[styles.textLabelSupporting, styles.lh16]}>{props.translate('common.to')}</Text>
                    <View style={[styles.flexRow, styles.alignItemsCenter, styles.justifyContentBetween, styles.pv3]}>
                        <TouchableWithoutFeedback onPress={() => Navigation.navigate(ROUTES.getTaskReportAssigneeRoute(props.report.reportID))}>
                            <View style={[styles.flexRow, styles.alignItemsCenter, styles.justifyContentBetween]}>
                                {assigneeName && (
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
                        </TouchableWithoutFeedback>
                        <View style={[styles.flexRow]}>
                            {isCompleted ? (
                                <>
                                    <Text>Completed</Text>
                                    <View style={styles.moneyRequestHeaderCheckmark}>
                                        <Icon
                                            src={Expensicons.Checkmark}
                                            fill={themeColors.iconSuccessFill}
                                        />
                                    </View>
                                </>
                            ) : (
                                <Button
                                    success
                                    medium
                                    text="Mark as Done"
                                    onPress={() => TaskUtils.completeTask(props.report.reportID, parentReportID, title)}
                                />
                            )}
                        </View>
                    </View>
                </View>
            </View>
            <MenuItemWithTopDescription
                shouldShowHeaderTitle
                title={props.report.reportName}
                description="Task"
                onPress={() => Navigation.navigate(ROUTES.getTaskReportTitleRoute(props.report.reportID))}
            />
            <MenuItemWithTopDescription
                title={lodashGet(props.report, 'description', '')}
                description="Description"
                onPress={() => Navigation.navigate(ROUTES.getTaskReportDescriptionRoute(props.report.reportID))}
            />
        </View>
    );
}

TaskHeader.propTypes = propTypes;
TaskHeader.displayName = 'TaskHeader';
TaskHeader.defaultProps = defaultProps;

export default compose(
    withWindowDimensions,
    withLocalize,
    withOnyx({
        parentReport: {
            key: ({report}) => `${ONYXKEYS.COLLECTION.REPORT}${report.parentReportID}`,
        },
    }),
)(TaskHeader);
