import _ from 'underscore';
import React from 'react';
import {View, Pressable} from 'react-native';
import PropTypes from 'prop-types';
import lodashGet from 'lodash/get';
import {withOnyx} from 'react-native-onyx';
import styles from '../../styles/styles';
import themeColors from '../../styles/themes/default';
import Icon from '../../components/Icon';
import * as Expensicons from '../../components/Icon/Expensicons';
import compose from '../../libs/compose';
import withWindowDimensions, {windowDimensionsPropTypes} from '../../components/withWindowDimensions';
import MultipleAvatars from '../../components/MultipleAvatars';
import SubscriptAvatar from '../../components/SubscriptAvatar';
import DisplayNames from '../../components/DisplayNames';
import * as OptionsListUtils from '../../libs/OptionsListUtils';
import participantPropTypes from '../../components/participantPropTypes';
import VideoChatButtonAndMenu from '../../components/VideoChatButtonAndMenu';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import CONST from '../../CONST';
import * as ReportUtils from '../../libs/ReportUtils';
import Text from '../../components/Text';
import Tooltip from '../../components/Tooltip';
import colors from '../../styles/colors';
import reportPropTypes from '../reportPropTypes';
import ONYXKEYS from '../../ONYXKEYS';
import ThreeDotsMenu from '../../components/ThreeDotsMenu';
import * as Task from '../../libs/actions/Task';
import reportActionPropTypes from './report/reportActionPropTypes';
import PinButton from '../../components/PinButton';

const propTypes = {
    /** Toggles the navigationMenu open and closed */
    onNavigationMenuButtonClicked: PropTypes.func.isRequired,

    /** The report currently being looked at */
    report: reportPropTypes,

    /** Personal details of all the users */
    personalDetails: PropTypes.objectOf(participantPropTypes),

    /** Onyx Props */
    parentReport: reportPropTypes,

    /** The details about the account that the user is signing in with */
    account: PropTypes.shape({
        /** URL to the assigned guide's appointment booking calendar */
        guideCalendarLink: PropTypes.string,
    }),

    /** The report actions from the parent report */
    // TO DO: Replace with HOC https://github.com/Expensify/App/issues/18769.
    // eslint-disable-next-line react/no-unused-prop-types
    parentReportActions: PropTypes.objectOf(PropTypes.shape(reportActionPropTypes)),

    ...windowDimensionsPropTypes,
    ...withLocalizePropTypes,
};

const defaultProps = {
    personalDetails: {},
    parentReportActions: {},
    report: null,
    account: {
        guideCalendarLink: null,
    },
    parentReport: {},
};

const HeaderView = (props) => {
    const participants = lodashGet(props.report, 'participants', []);
    const participantPersonalDetails = OptionsListUtils.getPersonalDetailsForLogins(participants, props.personalDetails);
    const isMultipleParticipant = participants.length > 1;
    const displayNamesWithTooltips = ReportUtils.getDisplayNamesWithTooltips(participantPersonalDetails, isMultipleParticipant);
    const isThread = ReportUtils.isThread(props.report);
    const isChatRoom = ReportUtils.isChatRoom(props.report);
    const isPolicyExpenseChat = ReportUtils.isPolicyExpenseChat(props.report);
    const isTaskReport = ReportUtils.isTaskReport(props.report);
    const reportHeaderData = (isTaskReport || !isThread) && props.report.parentReportID ? props.parentReport : props.report;
    const title = ReportUtils.getReportName(reportHeaderData);
    const subtitle = ReportUtils.getChatRoomSubtitle(reportHeaderData, props.parentReport);
    const isConcierge = participants.length === 1 && _.contains(participants, CONST.EMAIL.CONCIERGE);
    const isAutomatedExpensifyAccount = participants.length === 1 && ReportUtils.hasAutomatedExpensifyEmails(participants);
    const guideCalendarLink = lodashGet(props.account, 'guideCalendarLink');

    // We hide the button when we are chatting with an automated Expensify account since it's not possible to contact
    // these users via alternative means. It is possible to request a call with Concierge so we leave the option for them.
    const shouldShowCallButton = (isConcierge && guideCalendarLink) || (!isAutomatedExpensifyAccount && !isTaskReport);
    const threeDotMenuItems = [];
    if (isTaskReport) {
        if (props.report.stateNum === CONST.REPORT.STATE_NUM.OPEN && props.report.statusNum === CONST.REPORT.STATUS.OPEN) {
            threeDotMenuItems.push({
                icon: Expensicons.Checkmark,
                text: props.translate('newTaskPage.markAsDone'),
                onSelected: () => Task.completeTask(props.report.reportID, title),
            });
        }

        // Task is marked as completed
        if (props.report.stateNum === CONST.REPORT.STATE_NUM.SUBMITTED && props.report.statusNum === CONST.REPORT.STATUS.APPROVED) {
            threeDotMenuItems.push({
                icon: Expensicons.Checkmark,
                text: props.translate('newTaskPage.markAsIncomplete'),
                onSelected: () => Task.reopenTask(props.report.reportID, title),
            });
        }

        // Task is not closed
        if (props.report.stateNum !== CONST.REPORT.STATE_NUM.SUBMITTED && props.report.statusNum !== CONST.REPORT.STATUS.CLOSED) {
            threeDotMenuItems.push({
                icon: Expensicons.Trashcan,
                text: props.translate('common.cancel'),
                onSelected: () => Task.cancelTask(props.report.reportID, props.report.reportName, props.report.stateNum, props.report.statusNum),
            });
        }
    }
    const shouldShowThreeDotsButton = !!threeDotMenuItems.length;

    const shouldShowSubscript = isPolicyExpenseChat && !props.report.isOwnPolicyExpenseChat && !ReportUtils.isArchivedRoom(props.report) && !isTaskReport;
    const icons = ReportUtils.getIcons(reportHeaderData, props.personalDetails);
    const brickRoadIndicator = ReportUtils.hasReportNameError(props.report) ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : '';
    return (
        <View
            style={[styles.appContentHeader, isTaskReport && {backgroundColor: themeColors.highlightBG, borderBottomWidth: 0}]}
            nativeID="drag-area"
        >
            <View style={[styles.appContentHeaderTitle, !props.isSmallScreenWidth && styles.pl5]}>
                {props.isSmallScreenWidth && (
                    <Pressable
                        onPress={props.onNavigationMenuButtonClicked}
                        style={[styles.LHNToggle]}
                        accessibilityHint={props.translate('accessibilityHints.navigateToChatsList')}
                    >
                        <Tooltip
                            text={props.translate('common.back')}
                            shiftVertical={4}
                        >
                            <View>
                                <Icon src={Expensicons.BackArrow} />
                            </View>
                        </Tooltip>
                    </Pressable>
                )}
                {Boolean(props.report && title) && (
                    <View style={[styles.flex1, styles.flexRow, styles.alignItemsCenter, styles.justifyContentBetween]}>
                        <Pressable
                            onPress={() => ReportUtils.navigateToDetailsPage(props.report)}
                            style={[styles.flexRow, styles.alignItemsCenter, styles.flex1]}
                            disabled={isTaskReport}
                        >
                            {shouldShowSubscript ? (
                                <SubscriptAvatar
                                    mainAvatar={icons[0]}
                                    secondaryAvatar={icons[1]}
                                    mainTooltip={props.report.ownerEmail}
                                    secondaryTooltip={subtitle}
                                />
                            ) : (
                                <MultipleAvatars
                                    icons={icons}
                                    shouldShowTooltip={!isChatRoom}
                                />
                            )}
                            <View style={[styles.flex1, styles.flexColumn]}>
                                <DisplayNames
                                    fullTitle={title}
                                    displayNamesWithTooltips={displayNamesWithTooltips}
                                    tooltipEnabled
                                    numberOfLines={1}
                                    textStyles={[styles.headerText, styles.pre]}
                                    shouldUseFullTitle={isChatRoom || isPolicyExpenseChat || isThread || isTaskReport}
                                />
                                {(isChatRoom || isPolicyExpenseChat || isThread) && !_.isEmpty(subtitle) && (
                                    <Text
                                        style={[styles.sidebarLinkText, styles.optionAlternateText, styles.textLabelSupporting, styles.pre]}
                                        numberOfLines={1}
                                    >
                                        {subtitle}
                                    </Text>
                                )}
                            </View>
                            {brickRoadIndicator === CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR && (
                                <View style={[styles.alignItemsCenter, styles.justifyContentCenter]}>
                                    <Icon
                                        src={Expensicons.DotIndicator}
                                        fill={colors.red}
                                    />
                                </View>
                            )}
                        </Pressable>
                        <View style={[styles.reportOptions, styles.flexRow, styles.alignItemsCenter]}>
                            {shouldShowCallButton && (
                                <VideoChatButtonAndMenu
                                    isConcierge={isConcierge}
                                    guideCalendarLink={guideCalendarLink}
                                />
                            )}
                            <PinButton report={props.report} />
                            {shouldShowThreeDotsButton && (
                                <ThreeDotsMenu
                                    anchorPosition={styles.threeDotsPopoverOffset(props.windowWidth)}
                                    menuItems={threeDotMenuItems}
                                />
                            )}
                        </View>
                    </View>
                )}
            </View>
        </View>
    );
};
HeaderView.propTypes = propTypes;
HeaderView.displayName = 'HeaderView';
HeaderView.defaultProps = defaultProps;

export default compose(
    withWindowDimensions,
    withLocalize,
    withOnyx({
        account: {
            key: ONYXKEYS.ACCOUNT,
            selector: (account) =>
                account && {
                    guideCalendarLink: account.guideCalendarLink,
                    primaryLogin: account.primaryLogin,
                },
        },
        parentReportActions: {
            key: ({report}) => `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.parentReportID}`,
            canEvict: false,
        },
        parentReport: {
            key: ({report}) => `${ONYXKEYS.COLLECTION.REPORT}${report.parentReportID || report.reportID}`,
        },
    }),
)(HeaderView);
