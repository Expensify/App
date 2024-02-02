import PropTypes from 'prop-types';
import React, {useEffect, useMemo} from 'react';
import {ScrollView, View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import DisplayNames from '@components/DisplayNames';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Expensicons from '@components/Icon/Expensicons';
import MenuItem from '@components/MenuItem';
import MultipleAvatars from '@components/MultipleAvatars';
import {withNetwork} from '@components/OnyxProvider';
import ParentNavigationSubtitle from '@components/ParentNavigationSubtitle';
import participantPropTypes from '@components/participantPropTypes';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import RoomHeaderAvatars from '@components/RoomHeaderAvatars';
import ScreenWrapper from '@components/ScreenWrapper';
import withLocalize, {withLocalizePropTypes} from '@components/withLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import compose from '@libs/compose';
import Navigation from '@libs/Navigation/Navigation';
import * as OptionsListUtils from '@libs/OptionsListUtils';
import * as PolicyUtils from '@libs/PolicyUtils';
import * as ReportUtils from '@libs/ReportUtils';
import * as Report from '@userActions/Report';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import withReportOrNotFound from './home/report/withReportOrNotFound';
import reportPropTypes from './reportPropTypes';

const propTypes = {
    ...withLocalizePropTypes,

    /** The report currently being looked at */
    report: reportPropTypes.isRequired,

    /** The policies which the user has access to and which the report could be tied to */
    policies: PropTypes.shape({
        /** Name of the policy */
        name: PropTypes.string,
    }),

    /** Route params */
    route: PropTypes.shape({
        params: PropTypes.shape({
            /** Report ID passed via route r/:reportID/details */
            reportID: PropTypes.string,
        }),
    }).isRequired,

    /** Personal details of all the users */
    personalDetails: PropTypes.objectOf(participantPropTypes),
};

const defaultProps = {
    policies: {},
    personalDetails: {},
};

function ReportDetailsPage(props) {
    const styles = useThemeStyles();
    const policy = useMemo(() => props.policies[`${ONYXKEYS.COLLECTION.POLICY}${props.report.policyID}`], [props.policies, props.report.policyID]);
    const isPolicyAdmin = useMemo(() => PolicyUtils.isPolicyAdmin(policy), [policy]);
    const isPolicyMember = useMemo(() => PolicyUtils.isPolicyMember(props.report.policyID, props.policies), [props.report.policyID, props.policies]);
    const shouldUseFullTitle = useMemo(() => ReportUtils.shouldUseFullTitleToDisplay(props.report), [props.report]);
    const isChatRoom = useMemo(() => ReportUtils.isChatRoom(props.report), [props.report]);
    const isThread = useMemo(() => ReportUtils.isChatThread(props.report), [props.report]);
    const isUserCreatedPolicyRoom = useMemo(() => ReportUtils.isUserCreatedPolicyRoom(props.report), [props.report]);
    const isArchivedRoom = useMemo(() => ReportUtils.isArchivedRoom(props.report), [props.report]);
    const isMoneyRequestReport = useMemo(() => ReportUtils.isMoneyRequestReport(props.report), [props.report]);

    // eslint-disable-next-line react-hooks/exhaustive-deps -- policy is a dependency because `getChatRoomSubtitle` calls `getPolicyName` which in turn retrieves the value from the `policy` value stored in Onyx
    const chatRoomSubtitle = useMemo(() => ReportUtils.getChatRoomSubtitle(props.report), [props.report, policy]);
    const parentNavigationSubtitleData = ReportUtils.getParentNavigationSubtitle(props.report);
    const participants = useMemo(() => ReportUtils.getVisibleMemberIDs(props.report), [props.report]);

    const isGroupDMChat = useMemo(() => ReportUtils.isDM(props.report) && participants.length > 1, [props.report, participants.length]);

    const isPrivateNotesFetchTriggered = !_.isUndefined(props.report.isLoadingPrivateNotes);

    useEffect(() => {
        // Do not fetch private notes if isLoadingPrivateNotes is already defined, or if network is offline.
        if (isPrivateNotesFetchTriggered || props.network.isOffline) {
            return;
        }

        Report.getReportPrivateNote(props.report.reportID);
    }, [props.report.reportID, props.network.isOffline, isPrivateNotesFetchTriggered]);

    const menuItems = useMemo(() => {
        const items = [];

        if (!isGroupDMChat) {
            items.push({
                key: CONST.REPORT_DETAILS_MENU_ITEM.SHARE_CODE,
                translationKey: 'common.shareCode',
                icon: Expensicons.QrCode,
                isAnonymousAction: true,
                action: () => Navigation.navigate(ROUTES.REPORT_WITH_ID_DETAILS_SHARE_CODE.getRoute(props.report.reportID)),
            });
        }

        if (isArchivedRoom) {
            return items;
        }

        // The Members page is only shown when:
        // - The report is not a user created room with participants to show i.e. DM, Group Chat, etc
        // - The report is a user created room and the room and the current user is a workspace member i.e. non-workspace members should not see this option.
        if ((!isUserCreatedPolicyRoom && participants.length) || (isUserCreatedPolicyRoom && isPolicyMember)) {
            items.push({
                key: CONST.REPORT_DETAILS_MENU_ITEM.MEMBERS,
                translationKey: 'common.members',
                icon: Expensicons.Users,
                subtitle: participants.length,
                isAnonymousAction: false,
                action: () => {
                    if (isUserCreatedPolicyRoom && !props.report.parentReportID) {
                        Navigation.navigate(ROUTES.ROOM_MEMBERS.getRoute(props.report.reportID));
                    } else {
                        Navigation.navigate(ROUTES.REPORT_PARTICIPANTS.getRoute(props.report.reportID));
                    }
                },
            });
        } else if (isUserCreatedPolicyRoom && (!participants.length || !isPolicyMember) && !props.report.parentReportID) {
            items.push({
                key: CONST.REPORT_DETAILS_MENU_ITEM.INVITE,
                translationKey: 'common.invite',
                icon: Expensicons.Users,
                isAnonymousAction: false,
                action: () => {
                    Navigation.navigate(ROUTES.ROOM_INVITE.getRoute(props.report.reportID));
                },
            });
        }

        items.push({
            key: CONST.REPORT_DETAILS_MENU_ITEM.SETTINGS,
            translationKey: 'common.settings',
            icon: Expensicons.Gear,
            isAnonymousAction: false,
            action: () => {
                Navigation.navigate(ROUTES.REPORT_SETTINGS.getRoute(props.report.reportID));
            },
        });

        // Prevent displaying private notes option for threads and task reports
        if (!isThread && !isMoneyRequestReport && !ReportUtils.isTaskReport(props.report)) {
            items.push({
                key: CONST.REPORT_DETAILS_MENU_ITEM.PRIVATE_NOTES,
                translationKey: 'privateNotes.title',
                icon: Expensicons.Pencil,
                isAnonymousAction: false,
                action: () => ReportUtils.navigateToPrivateNotes(props.report, props.session),
                brickRoadIndicator: Report.hasErrorInPrivateNotes(props.report) ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : '',
            });
        }

        return items;
    }, [isArchivedRoom, participants.length, isThread, isMoneyRequestReport, props.report, isGroupDMChat, isPolicyMember, isUserCreatedPolicyRoom, props.session]);

    const displayNamesWithTooltips = useMemo(() => {
        const hasMultipleParticipants = participants.length > 1;
        return ReportUtils.getDisplayNamesWithTooltips(OptionsListUtils.getPersonalDetailsForAccountIDs(participants, props.personalDetails), hasMultipleParticipants);
    }, [participants, props.personalDetails]);

    const icons = useMemo(() => ReportUtils.getIcons(props.report, props.personalDetails, null, '', -1, policy), [props.report, props.personalDetails, policy]);

    const chatRoomSubtitleText = chatRoomSubtitle ? (
        <DisplayNames
            fullTitle={chatRoomSubtitle}
            tooltipEnabled
            numberOfLines={1}
            textStyles={[styles.sidebarLinkText, styles.textLabelSupporting, styles.pre, styles.mt1, styles.textAlignCenter]}
            shouldUseFullTitle
        />
    ) : null;

    return (
        <ScreenWrapper testID={ReportDetailsPage.displayName}>
            <FullPageNotFoundView shouldShow={_.isEmpty(props.report)}>
                <HeaderWithBackButton
                    title={props.translate('common.details')}
                    shouldNavigateToTopMostReport
                    onBackButtonPress={() => {
                        Navigation.goBack();
                        Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(props.report.reportID));
                    }}
                />
                <ScrollView style={[styles.flex1]}>
                    <View style={styles.reportDetailsTitleContainer}>
                        <View style={styles.mb3}>
                            {isMoneyRequestReport ? (
                                <MultipleAvatars
                                    icons={icons}
                                    size={CONST.AVATAR_SIZE.LARGE}
                                />
                            ) : (
                                <RoomHeaderAvatars
                                    icons={icons}
                                    reportID={props.report.reportID}
                                />
                            )}
                        </View>
                        <View style={[styles.reportDetailsRoomInfo, styles.mw100]}>
                            <View style={[styles.alignSelfCenter, styles.w100, styles.mt1]}>
                                <DisplayNames
                                    fullTitle={ReportUtils.getReportName(props.report)}
                                    displayNamesWithTooltips={displayNamesWithTooltips}
                                    tooltipEnabled
                                    numberOfLines={isChatRoom && !isThread ? 0 : 1}
                                    textStyles={[styles.textHeadline, styles.textAlignCenter, isChatRoom && !isThread ? undefined : styles.pre]}
                                    shouldUseFullTitle={shouldUseFullTitle}
                                />
                            </View>
                            {isPolicyAdmin ? (
                                <PressableWithoutFeedback
                                    style={[styles.w100]}
                                    disabled={policy.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE}
                                    role={CONST.ROLE.BUTTON}
                                    accessibilityLabel={chatRoomSubtitle}
                                    onPress={() => {
                                        Navigation.navigate(ROUTES.WORKSPACE_INITIAL.getRoute(props.report.policyID));
                                    }}
                                >
                                    {chatRoomSubtitleText}
                                </PressableWithoutFeedback>
                            ) : (
                                chatRoomSubtitleText
                            )}
                            {!_.isEmpty(parentNavigationSubtitleData) && isMoneyRequestReport && (
                                <ParentNavigationSubtitle
                                    parentNavigationSubtitleData={parentNavigationSubtitleData}
                                    parentReportID={props.report.parentReportID}
                                    pressableStyles={[styles.mt1, styles.mw100]}
                                />
                            )}
                        </View>
                    </View>
                    {_.map(menuItems, (item) => {
                        const brickRoadIndicator =
                            ReportUtils.hasReportNameError(props.report) && item.key === CONST.REPORT_DETAILS_MENU_ITEM.SETTINGS ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : '';
                        return (
                            <MenuItem
                                key={item.key}
                                title={props.translate(item.translationKey)}
                                subtitle={item.subtitle}
                                icon={item.icon}
                                onPress={item.action}
                                isAnonymousAction={item.isAnonymousAction}
                                shouldShowRightIcon
                                brickRoadIndicator={brickRoadIndicator || item.brickRoadIndicator}
                            />
                        );
                    })}
                </ScrollView>
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

ReportDetailsPage.displayName = 'ReportDetailsPage';
ReportDetailsPage.propTypes = propTypes;
ReportDetailsPage.defaultProps = defaultProps;

export default compose(
    withLocalize,
    withReportOrNotFound(),
    withNetwork(),
    withOnyx({
        personalDetails: {
            key: ONYXKEYS.PERSONAL_DETAILS_LIST,
        },
        policies: {
            key: ONYXKEYS.COLLECTION.POLICY,
        },
        session: {
            key: ONYXKEYS.SESSION,
        },
    }),
)(ReportDetailsPage);
