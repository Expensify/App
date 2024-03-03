import {useRoute} from '@react-navigation/native';
import type {StackScreenProps} from '@react-navigation/stack';
import React, {useEffect, useMemo} from 'react';
import {ScrollView, View} from 'react-native';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import DisplayNames from '@components/DisplayNames';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Expensicons from '@components/Icon/Expensicons';
import MenuItem from '@components/MenuItem';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import MultipleAvatars from '@components/MultipleAvatars';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import ParentNavigationSubtitle from '@components/ParentNavigationSubtitle';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import RoomHeaderAvatars from '@components/RoomHeaderAvatars';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import type {ReportDetailsNavigatorParamList} from '@libs/Navigation/types';
import * as OptionsListUtils from '@libs/OptionsListUtils';
import * as PolicyUtils from '@libs/PolicyUtils';
import * as ReportUtils from '@libs/ReportUtils';
import * as Report from '@userActions/Report';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type * as OnyxTypes from '@src/types/onyx';
import type DeepValueOf from '@src/types/utils/DeepValueOf';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import type IconAsset from '@src/types/utils/IconAsset';
import type {WithReportOrNotFoundProps} from './home/report/withReportOrNotFound';
import withReportOrNotFound from './home/report/withReportOrNotFound';

type ReportDetailsPageMenuItem = {
    key: DeepValueOf<typeof CONST.REPORT_DETAILS_MENU_ITEM>;
    translationKey: TranslationPaths;
    icon: IconAsset;
    isAnonymousAction: boolean;
    action: () => void;
    brickRoadIndicator?: ValueOf<typeof CONST.BRICK_ROAD_INDICATOR_STATUS>;
    subtitle?: number;
};

type ReportDetailsPageOnyxProps = {
    /** Personal details of all the users */
    personalDetails: OnyxCollection<OnyxTypes.PersonalDetails>;

    /** Session info for the currently logged in user. */
    session: OnyxEntry<OnyxTypes.Session>;
};
type ReportDetailsPageProps = ReportDetailsPageOnyxProps & WithReportOrNotFoundProps & StackScreenProps<ReportDetailsNavigatorParamList, typeof SCREENS.REPORT_DETAILS.ROOT>;

function ReportDetailsPage({policies, report, session, personalDetails}: ReportDetailsPageProps) {
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const styles = useThemeStyles();
    const route = useRoute();
    const policy = useMemo(() => policies?.[`${ONYXKEYS.COLLECTION.POLICY}${report?.policyID ?? ''}`], [policies, report?.policyID]);
    const isPolicyAdmin = useMemo(() => PolicyUtils.isPolicyAdmin(policy ?? null), [policy]);
    const isPolicyMember = useMemo(() => PolicyUtils.isPolicyMember(report?.policyID ?? '', policies), [report?.policyID, policies]);
    const shouldUseFullTitle = useMemo(() => ReportUtils.shouldUseFullTitleToDisplay(report), [report]);
    const isChatRoom = useMemo(() => ReportUtils.isChatRoom(report), [report]);
    const isThread = useMemo(() => ReportUtils.isChatThread(report), [report]);
    const isUserCreatedPolicyRoom = useMemo(() => ReportUtils.isUserCreatedPolicyRoom(report), [report]);
    const isArchivedRoom = useMemo(() => ReportUtils.isArchivedRoom(report), [report]);
    const isMoneyRequestReport = useMemo(() => ReportUtils.isMoneyRequestReport(report), [report]);
    const canEditReportDescription = useMemo(() => ReportUtils.canEditReportDescription(report, policy), [report, policy]);
    const shouldShowReportDescription = isChatRoom && (canEditReportDescription || report.description !== '');

    // eslint-disable-next-line react-hooks/exhaustive-deps -- policy is a dependency because `getChatRoomSubtitle` calls `getPolicyName` which in turn retrieves the value from the `policy` value stored in Onyx
    const chatRoomSubtitle = useMemo(() => ReportUtils.getChatRoomSubtitle(report), [report, policy]);
    const parentNavigationSubtitleData = ReportUtils.getParentNavigationSubtitle(report);
    const participants = useMemo(() => ReportUtils.getVisibleMemberIDs(report), [report]);

    const isGroupDMChat = useMemo(() => ReportUtils.isDM(report) && participants.length > 1, [report, participants.length]);

    const isPrivateNotesFetchTriggered = report?.isLoadingPrivateNotes !== undefined;

    const isSelfDM = useMemo(() => ReportUtils.isSelfDM(report), [report]);

    useEffect(() => {
        // Do not fetch private notes if isLoadingPrivateNotes is already defined, or if the network is offline, or if the report is a self DM.
        if (isPrivateNotesFetchTriggered || isOffline || isSelfDM) {
            return;
        }

        Report.getReportPrivateNote(report?.reportID ?? '');
    }, [report?.reportID, isOffline, isPrivateNotesFetchTriggered, isSelfDM]);

    const menuItems: ReportDetailsPageMenuItem[] = useMemo(() => {
        const items: ReportDetailsPageMenuItem[] = [];

        if (isSelfDM) {
            return [];
        }

        if (!isGroupDMChat) {
            items.push({
                key: CONST.REPORT_DETAILS_MENU_ITEM.SHARE_CODE,
                translationKey: 'common.shareCode',
                icon: Expensicons.QrCode,
                isAnonymousAction: true,
                action: () => Navigation.navigate(ROUTES.REPORT_WITH_ID_DETAILS_SHARE_CODE.getRoute(report?.reportID ?? '')),
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
                    if (isUserCreatedPolicyRoom && !report?.parentReportID) {
                        Navigation.navigate(ROUTES.ROOM_MEMBERS.getRoute(report?.reportID ?? ''));
                    } else {
                        Navigation.navigate(ROUTES.REPORT_PARTICIPANTS.getRoute(report?.reportID ?? ''));
                    }
                },
            });
        } else if (isUserCreatedPolicyRoom && (!participants.length || !isPolicyMember) && !report?.parentReportID) {
            items.push({
                key: CONST.REPORT_DETAILS_MENU_ITEM.INVITE,
                translationKey: 'common.invite',
                icon: Expensicons.Users,
                isAnonymousAction: false,
                action: () => {
                    Navigation.navigate(ROUTES.ROOM_INVITE.getRoute(report?.reportID ?? ''));
                },
            });
        }

        items.push({
            key: CONST.REPORT_DETAILS_MENU_ITEM.SETTINGS,
            translationKey: 'common.settings',
            icon: Expensicons.Gear,
            isAnonymousAction: false,
            action: () => {
                Navigation.navigate(ROUTES.REPORT_SETTINGS.getRoute(report?.reportID ?? ''));
            },
        });

        // Prevent displaying private notes option for threads and task reports
        if (!isThread && !isMoneyRequestReport && !ReportUtils.isTaskReport(report)) {
            items.push({
                key: CONST.REPORT_DETAILS_MENU_ITEM.PRIVATE_NOTES,
                translationKey: 'privateNotes.title',
                icon: Expensicons.Pencil,
                isAnonymousAction: false,
                action: () => ReportUtils.navigateToPrivateNotes(report, session),
                brickRoadIndicator: Report.hasErrorInPrivateNotes(report) ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined,
            });
        }

        return items;
    }, [isArchivedRoom, participants.length, isThread, isMoneyRequestReport, report, isGroupDMChat, isPolicyMember, isUserCreatedPolicyRoom, session, isSelfDM]);

    const displayNamesWithTooltips = useMemo(() => {
        const hasMultipleParticipants = participants.length > 1;
        return ReportUtils.getDisplayNamesWithTooltips(OptionsListUtils.getPersonalDetailsForAccountIDs(participants, personalDetails), hasMultipleParticipants);
    }, [participants, personalDetails]);

    const icons = useMemo(() => ReportUtils.getIcons(report, personalDetails, null, '', -1, policy), [report, personalDetails, policy]);

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
            <FullPageNotFoundView shouldShow={isEmptyObject(report)}>
                <HeaderWithBackButton
                    title={translate('common.details')}
                    onBackButtonPress={Navigation.goBack}
                    shouldNavigateToTopMostReport={!(route.params && 'backTo' in route.params)}
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
                                    reportID={report?.reportID}
                                />
                            )}
                        </View>
                        <View style={[styles.reportDetailsRoomInfo, styles.mw100]}>
                            <View style={[styles.alignSelfCenter, styles.w100, styles.mt1]}>
                                <DisplayNames
                                    fullTitle={ReportUtils.getReportName(report)}
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
                                    disabled={policy?.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE}
                                    role={CONST.ROLE.BUTTON}
                                    accessibilityLabel={chatRoomSubtitle ?? ''}
                                    accessible
                                    onPress={() => {
                                        Navigation.navigate(ROUTES.WORKSPACE_INITIAL.getRoute(report?.policyID ?? ''));
                                    }}
                                >
                                    {chatRoomSubtitleText}
                                </PressableWithoutFeedback>
                            ) : (
                                chatRoomSubtitleText
                            )}
                            {!isEmptyObject(parentNavigationSubtitleData) && isMoneyRequestReport && (
                                <ParentNavigationSubtitle
                                    parentNavigationSubtitleData={parentNavigationSubtitleData}
                                    parentReportID={report?.parentReportID}
                                    pressableStyles={[styles.mt1, styles.mw100]}
                                />
                            )}
                        </View>
                    </View>
                    {shouldShowReportDescription && (
                        <OfflineWithFeedback pendingAction={report.pendingFields?.description}>
                            <MenuItemWithTopDescription
                                shouldShowRightIcon={canEditReportDescription}
                                interactive={canEditReportDescription}
                                title={report.description}
                                shouldRenderAsHTML
                                shouldCheckActionAllowedOnPress={false}
                                description={translate('reportDescriptionPage.roomDescription')}
                                onPress={() => Navigation.navigate(ROUTES.REPORT_DESCRIPTION.getRoute(report.reportID))}
                            />
                        </OfflineWithFeedback>
                    )}
                    {menuItems.map((item) => {
                        const brickRoadIndicator =
                            ReportUtils.hasReportNameError(report) && item.key === CONST.REPORT_DETAILS_MENU_ITEM.SETTINGS ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined;
                        return (
                            <MenuItem
                                key={item.key}
                                title={translate(item.translationKey)}
                                subtitle={item.subtitle}
                                icon={item.icon}
                                onPress={item.action}
                                isAnonymousAction={item.isAnonymousAction}
                                shouldShowRightIcon
                                brickRoadIndicator={brickRoadIndicator ?? item.brickRoadIndicator}
                            />
                        );
                    })}
                </ScrollView>
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

ReportDetailsPage.displayName = 'ReportDetailsPage';

export default withReportOrNotFound()(
    withOnyx<ReportDetailsPageProps, ReportDetailsPageOnyxProps>({
        personalDetails: {
            key: ONYXKEYS.PERSONAL_DETAILS_LIST,
        },
        session: {
            key: ONYXKEYS.SESSION,
        },
    })(ReportDetailsPage),
);
