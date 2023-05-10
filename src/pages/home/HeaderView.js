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
import * as Report from '../../libs/actions/Report';
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

const propTypes = {
    /** Toggles the navigationMenu open and closed */
    onNavigationMenuButtonClicked: PropTypes.func.isRequired,

    /* Onyx Props */

    /** The report currently being looked at */
    report: reportPropTypes,

    /** Personal details of all the users */
    personalDetails: PropTypes.objectOf(participantPropTypes),

    /** The details about the account that the user is signing in with */
    account: PropTypes.shape({
        /** URL to the assigned guide's appointment booking calendar */
        guideCalendarLink: PropTypes.string,
    }),

    ...windowDimensionsPropTypes,
    ...withLocalizePropTypes,
};

const defaultProps = {
    personalDetails: {},
    report: null,
    account: {
        guideCalendarLink: null,
    },
};

const HeaderView = (props) => {
    const participants = lodashGet(props.report, 'participants', []);
    const participantPersonalDetails = OptionsListUtils.getPersonalDetailsForLogins(participants, props.personalDetails);
    const isMultipleParticipant = participants.length > 1;
    const displayNamesWithTooltips = ReportUtils.getDisplayNamesWithTooltips(participantPersonalDetails, isMultipleParticipant);
    const isChatRoom = ReportUtils.isChatRoom(props.report);
    const isPolicyExpenseChat = ReportUtils.isPolicyExpenseChat(props.report);
    const isTaskReport = ReportUtils.isTaskReport(props.report);
    const title = ReportUtils.getReportName(props.report);

    const subtitle = ReportUtils.getChatRoomSubtitle(props.report);
    const isConcierge = participants.length === 1 && _.contains(participants, CONST.EMAIL.CONCIERGE);
    const isAutomatedExpensifyAccount = participants.length === 1 && ReportUtils.hasAutomatedExpensifyEmails(participants);
    const guideCalendarLink = lodashGet(props.account, 'guideCalendarLink');

    // We hide the button when we are chatting with an automated Expensify account since it's not possible to contact
    // these users via alternative means. It is possible to request a call with Concierge so we leave the option for them.
    const shouldShowCallButton = (isConcierge && guideCalendarLink) || !isAutomatedExpensifyAccount;
    const shouldShowThreeDotsButton = isTaskReport;
    const threeDotMenuItems = [];

    if (shouldShowThreeDotsButton) {
        if (props.report.stateNum === CONST.REPORT.STATE_NUM.OPEN && props.report.statusNum === CONST.REPORT.STATUS.OPEN) {
            threeDotMenuItems.push({
                icon: Expensicons.Checkmark,
                text: props.translate('newTaskPage.markAsComplete'),

                // Implementing in https://github.com/Expensify/App/issues/16858
                onSelected: () => {},
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
    }

    const avatarTooltip = isChatRoom ? undefined : _.pluck(displayNamesWithTooltips, 'tooltip');
    const shouldShowSubscript = isPolicyExpenseChat && !props.report.isOwnPolicyExpenseChat && !ReportUtils.isArchivedRoom(props.report);
    const icons = ReportUtils.getIcons(props.report, props.personalDetails);
    const brickRoadIndicator = ReportUtils.hasReportNameError(props.report) ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : '';
    return (
        <View
            style={[styles.appContentHeader]}
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
                            <Icon src={Expensicons.BackArrow} />
                        </Tooltip>
                    </Pressable>
                )}
                {Boolean(props.report && title) && (
                    <View style={[styles.flex1, styles.flexRow, styles.alignItemsCenter, styles.justifyContentBetween]}>
                        <Pressable
                            onPress={() => ReportUtils.navigateToDetailsPage(props.report)}
                            style={[styles.flexRow, styles.alignItemsCenter, styles.flex1]}
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
                                    avatarTooltips={avatarTooltip}
                                />
                            )}
                            <View style={[styles.flex1, styles.flexColumn]}>
                                <DisplayNames
                                    fullTitle={title}
                                    displayNamesWithTooltips={displayNamesWithTooltips}
                                    tooltipEnabled
                                    numberOfLines={1}
                                    textStyles={[styles.headerText, styles.pre]}
                                    shouldUseFullTitle={isChatRoom || isPolicyExpenseChat}
                                />
                                {(isChatRoom || isPolicyExpenseChat) && (
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
                            <Tooltip text={props.report.isPinned ? props.translate('common.unPin') : props.translate('common.pin')}>
                                <Pressable
                                    onPress={() => Report.togglePinnedState(props.report)}
                                    style={[styles.touchableButtonImage]}
                                >
                                    <Icon
                                        src={Expensicons.Pin}
                                        fill={props.report.isPinned ? themeColors.heading : themeColors.icon}
                                    />
                                </Pressable>
                            </Tooltip>
                            {shouldShowThreeDotsButton && (
                                <ThreeDotsMenu
                                    anchorPosition={styles.threeDotsPopoverOffset}
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
            selector: (account) => account && {guideCalendarLink: account.guideCalendarLink},
        },
    }),
)(HeaderView);
