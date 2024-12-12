import {useRoute} from '@react-navigation/native';
import React, {memo} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {useOnyx} from 'react-native-onyx';
import Button from '@components/Button';
import CaretWrapper from '@components/CaretWrapper';
import ConfirmModal from '@components/ConfirmModal';
import DisplayNames from '@components/DisplayNames';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import {FallbackAvatar} from '@components/Icon/Expensicons';
import MultipleAvatars from '@components/MultipleAvatars';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import ParentNavigationSubtitle from '@components/ParentNavigationSubtitle';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import ReportHeaderSkeletonView from '@components/ReportHeaderSkeletonView';
import SearchButton from '@components/Search/SearchRouter/SearchButton';
import SubscriptAvatar from '@components/SubscriptAvatar';
import TaskHeaderActionButton from '@components/TaskHeaderActionButton';
import Text from '@components/Text';
import Tooltip from '@components/Tooltip';
import useLocalize from '@hooks/useLocalize';
import usePolicy from '@hooks/usePolicy';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import * as OptionsListUtils from '@libs/OptionsListUtils';
import Parser from '@libs/Parser';
import * as ReportUtils from '@libs/ReportUtils';
import FreeTrial from '@pages/settings/Subscription/FreeTrial';
import * as Report from '@userActions/Report';
import * as Session from '@userActions/Session';
import * as Task from '@userActions/Task';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type * as OnyxTypes from '@src/types/onyx';
import type {Icon as IconType} from '@src/types/onyx/OnyxCommon';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

type HeaderViewProps = {
    /** Toggles the navigationMenu open and closed */
    onNavigationMenuButtonClicked: () => void;

    /** The report currently being looked at */
    report: OnyxEntry<OnyxTypes.Report>;

    /** The report action the transaction is tied to from the parent report */
    parentReportAction: OnyxEntry<OnyxTypes.ReportAction> | null;

    /** The reportID of the current report */
    reportID: string;

    /** Whether we should display the header as in narrow layout */
    shouldUseNarrowLayout?: boolean;
};

const fallbackIcon: IconType = {
    source: FallbackAvatar,
    type: CONST.ICON_TYPE_AVATAR,
    name: '',
    id: -1,
};

function HeaderView({report, parentReportAction, reportID, onNavigationMenuButtonClicked, shouldUseNarrowLayout = false}: HeaderViewProps) {
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();
    const route = useRoute();
    const [isDeleteTaskConfirmModalVisible, setIsDeleteTaskConfirmModalVisible] = React.useState(false);
    const [invoiceReceiverPolicy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${report?.invoiceReceiver && 'policyID' in report.invoiceReceiver ? report.invoiceReceiver.policyID : -1}`);
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const [parentReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${report?.parentReportID || report?.reportID || '-1'}`);
    const policy = usePolicy(report?.policyID);
    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST);

    const {translate} = useLocalize();
    const theme = useTheme();
    const styles = useThemeStyles();
    const isSelfDM = ReportUtils.isSelfDM(report);
    const isGroupChat = ReportUtils.isGroupChat(report) || ReportUtils.isDeprecatedGroupDM(report);

    const participants = ReportUtils.getParticipantsAccountIDsForDisplay(report, false, true).slice(0, 5);
    const isMultipleParticipant = participants.length > 1;

    const participantPersonalDetails = OptionsListUtils.getPersonalDetailsForAccountIDs(participants, personalDetails);
    const displayNamesWithTooltips = ReportUtils.getDisplayNamesWithTooltips(participantPersonalDetails, isMultipleParticipant, undefined, isSelfDM);

    const isChatThread = ReportUtils.isChatThread(report);
    const isChatRoom = ReportUtils.isChatRoom(report);
    const isPolicyExpenseChat = ReportUtils.isPolicyExpenseChat(report);
    const isTaskReport = ReportUtils.isTaskReport(report);
    const reportHeaderData = !isTaskReport && !isChatThread && report?.parentReportID ? parentReport : report;
    // Use sorted display names for the title for group chats on native small screen widths
    const title = ReportUtils.getReportName(reportHeaderData, policy, parentReportAction, personalDetails, invoiceReceiverPolicy);
    const subtitle = ReportUtils.getChatRoomSubtitle(reportHeaderData);
    const parentNavigationSubtitleData = ReportUtils.getParentNavigationSubtitle(reportHeaderData);
    const reportDescription = Parser.htmlToText(ReportUtils.getReportDescription(report));
    const policyName = ReportUtils.getPolicyName(report, true);
    const policyDescription = ReportUtils.getPolicyDescriptionText(policy);
    const isPersonalExpenseChat = isPolicyExpenseChat && ReportUtils.isCurrentUserSubmitter(report?.reportID ?? '');
    const shouldShowSubtitle = () => {
        if (!subtitle) {
            return false;
        }
        if (isChatRoom) {
            return !reportDescription;
        }
        if (isPolicyExpenseChat) {
            return !policyDescription;
        }
        return true;
    };

    const join = Session.checkIfActionIsAllowed(() => Report.joinRoom(report));

    const canJoin = ReportUtils.canJoinChat(report, parentReportAction, policy);

    const joinButton = (
        <Button
            success
            text={translate('common.join')}
            onPress={join}
        />
    );

    const freeTrialButton = <FreeTrial pressable />;

    const renderAdditionalText = () => {
        if (shouldShowSubtitle() || isPersonalExpenseChat || !policyName || !isEmptyObject(parentNavigationSubtitleData) || isSelfDM) {
            return null;
        }
        return (
            <>
                <Text style={[styles.sidebarLinkText, styles.textLabelSupporting]}> {translate('threads.in')} </Text>
                <Text style={[styles.sidebarLinkText, styles.textLabelSupporting, styles.textStrong]}>{policyName}</Text>
            </>
        );
    };

    const shouldShowSubscript = ReportUtils.shouldReportShowSubscript(report);
    const defaultSubscriptSize = ReportUtils.isExpenseRequest(report) ? CONST.AVATAR_SIZE.SMALL_NORMAL : CONST.AVATAR_SIZE.DEFAULT;
    const icons = ReportUtils.getIcons(reportHeaderData, personalDetails, null, '', -1, policy, invoiceReceiverPolicy);
    const brickRoadIndicator = ReportUtils.hasReportNameError(report) ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : '';
    const shouldShowBorderBottom = !isTaskReport || !shouldUseNarrowLayout;
    const shouldDisableDetailPage = ReportUtils.shouldDisableDetailPage(report);
    const shouldUseGroupTitle = isGroupChat && (!!report?.reportName || !isMultipleParticipant);
    const isLoading = !report?.reportID || !title;

    const isReportInRHP = route.name === SCREENS.SEARCH.REPORT_RHP;
    const shouldDisplaySearchRouter = !isReportInRHP || isSmallScreenWidth;
    const isChatUsedForOnboarding = ReportUtils.isChatUsedForOnboarding(report);

    return (
        <View
            style={[shouldShowBorderBottom && styles.borderBottom]}
            dataSet={{dragArea: true}}
        >
            <View style={[styles.appContentHeader, !shouldUseNarrowLayout && styles.headerBarDesktopHeight]}>
                {isLoading ? (
                    <ReportHeaderSkeletonView onBackButtonPress={onNavigationMenuButtonClicked} />
                ) : (
                    <View style={[styles.appContentHeaderTitle, !shouldUseNarrowLayout && !isLoading && styles.pl5]}>
                        {shouldUseNarrowLayout && (
                            <PressableWithoutFeedback
                                onPress={onNavigationMenuButtonClicked}
                                style={styles.LHNToggle}
                                accessibilityHint={translate('accessibilityHints.navigateToChatsList')}
                                accessibilityLabel={translate('common.back')}
                                role={CONST.ROLE.BUTTON}
                            >
                                <Tooltip
                                    text={translate('common.back')}
                                    shiftVertical={4}
                                >
                                    <View>
                                        <Icon
                                            src={Expensicons.BackArrow}
                                            fill={theme.icon}
                                        />
                                    </View>
                                </Tooltip>
                            </PressableWithoutFeedback>
                        )}
                        <View style={[styles.flex1, styles.flexRow, styles.alignItemsCenter, styles.justifyContentBetween]}>
                            <PressableWithoutFeedback
                                onPress={() => ReportUtils.navigateToDetailsPage(report, Navigation.getReportRHPActiveRoute())}
                                style={[styles.flexRow, styles.alignItemsCenter, styles.flex1]}
                                disabled={shouldDisableDetailPage}
                                accessibilityLabel={title}
                                role={CONST.ROLE.BUTTON}
                            >
                                {shouldShowSubscript ? (
                                    <SubscriptAvatar
                                        mainAvatar={icons.at(0) ?? fallbackIcon}
                                        secondaryAvatar={icons.at(1)}
                                        size={defaultSubscriptSize}
                                    />
                                ) : (
                                    <OfflineWithFeedback pendingAction={report?.pendingFields?.avatar}>
                                        <MultipleAvatars icons={icons} />
                                    </OfflineWithFeedback>
                                )}
                                <View
                                    fsClass="fs-unmask"
                                    style={[styles.flex1, styles.flexColumn]}
                                >
                                    <CaretWrapper>
                                        <DisplayNames
                                            fullTitle={title}
                                            displayNamesWithTooltips={displayNamesWithTooltips}
                                            tooltipEnabled
                                            numberOfLines={1}
                                            textStyles={[styles.headerText, styles.pre]}
                                            shouldUseFullTitle={isChatRoom || isPolicyExpenseChat || isChatThread || isTaskReport || shouldUseGroupTitle}
                                            renderAdditionalText={renderAdditionalText}
                                        />
                                    </CaretWrapper>
                                    {!isEmptyObject(parentNavigationSubtitleData) && (
                                        <ParentNavigationSubtitle
                                            parentNavigationSubtitleData={parentNavigationSubtitleData}
                                            parentReportID={report?.parentReportID}
                                            parentReportActionID={report?.parentReportActionID}
                                            pressableStyles={[styles.alignSelfStart, styles.mw100]}
                                        />
                                    )}
                                    {shouldShowSubtitle() && (
                                        <Text
                                            style={[styles.sidebarLinkText, styles.optionAlternateText, styles.textLabelSupporting]}
                                            numberOfLines={1}
                                        >
                                            {subtitle}
                                        </Text>
                                    )}
                                    {isChatRoom && !!reportDescription && isEmptyObject(parentNavigationSubtitleData) && (
                                        <PressableWithoutFeedback
                                            onPress={() => {
                                                const activeRoute = Navigation.getReportRHPActiveRoute();
                                                if (ReportUtils.canEditReportDescription(report, policy)) {
                                                    Navigation.navigate(ROUTES.REPORT_DESCRIPTION.getRoute(reportID, activeRoute));
                                                    return;
                                                }
                                                Navigation.navigate(ROUTES.REPORT_WITH_ID_DETAILS.getRoute(reportID, activeRoute));
                                            }}
                                            style={[styles.alignSelfStart, styles.mw100]}
                                            accessibilityLabel={translate('reportDescriptionPage.roomDescription')}
                                        >
                                            <Text
                                                style={[styles.sidebarLinkText, styles.optionAlternateText, styles.textLabelSupporting]}
                                                numberOfLines={1}
                                            >
                                                {reportDescription}
                                            </Text>
                                        </PressableWithoutFeedback>
                                    )}
                                    {isPolicyExpenseChat && !!policyDescription && isEmptyObject(parentNavigationSubtitleData) && (
                                        <PressableWithoutFeedback
                                            onPress={() => {
                                                if (ReportUtils.canEditPolicyDescription(policy)) {
                                                    Navigation.navigate(ROUTES.WORKSPACE_PROFILE_DESCRIPTION.getRoute(report.policyID ?? '-1'));
                                                    return;
                                                }
                                                Navigation.navigate(ROUTES.REPORT_WITH_ID_DETAILS.getRoute(reportID, Navigation.getReportRHPActiveRoute()));
                                            }}
                                            style={[styles.alignSelfStart, styles.mw100]}
                                            accessibilityLabel={translate('workspace.editor.descriptionInputLabel')}
                                        >
                                            <Text
                                                style={[styles.sidebarLinkText, styles.optionAlternateText, styles.textLabelSupporting]}
                                                numberOfLines={1}
                                            >
                                                {policyDescription}
                                            </Text>
                                        </PressableWithoutFeedback>
                                    )}
                                </View>
                                {brickRoadIndicator === CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR && (
                                    <View style={[styles.alignItemsCenter, styles.justifyContentCenter]}>
                                        <Icon
                                            src={Expensicons.DotIndicator}
                                            fill={theme.danger}
                                        />
                                    </View>
                                )}
                            </PressableWithoutFeedback>
                            <View style={[styles.reportOptions, styles.flexRow, styles.alignItemsCenter]}>
                                {!shouldUseNarrowLayout && isChatUsedForOnboarding && freeTrialButton}
                                {isTaskReport && !shouldUseNarrowLayout && ReportUtils.isOpenTaskReport(report, parentReportAction) && <TaskHeaderActionButton report={report} />}
                                {canJoin && !shouldUseNarrowLayout && joinButton}
                            </View>
                            {shouldDisplaySearchRouter && <SearchButton style={styles.ml2} />}
                        </View>
                        <ConfirmModal
                            isVisible={isDeleteTaskConfirmModalVisible}
                            onConfirm={() => {
                                setIsDeleteTaskConfirmModalVisible(false);
                                Task.deleteTask(report);
                            }}
                            onCancel={() => setIsDeleteTaskConfirmModalVisible(false)}
                            title={translate('task.deleteTask')}
                            prompt={translate('task.deleteConfirmation')}
                            confirmText={translate('common.delete')}
                            cancelText={translate('common.cancel')}
                            danger
                            shouldEnableNewFocusManagement
                        />
                    </View>
                )}
            </View>
            {!isLoading && canJoin && shouldUseNarrowLayout && <View style={[styles.ph5, styles.pb2]}>{joinButton}</View>}
            {!isLoading && isChatUsedForOnboarding && shouldUseNarrowLayout && <View style={[styles.pb3, styles.ph5]}>{freeTrialButton}</View>}
        </View>
    );
}

HeaderView.displayName = 'HeaderView';

export default memo(HeaderView);
