import {useRoute} from '@react-navigation/native';
import {isPast} from 'date-fns';
import React, {memo, useMemo} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import Button from '@components/Button';
import CaretWrapper from '@components/CaretWrapper';
import ConfirmModal from '@components/ConfirmModal';
import DisplayNames from '@components/DisplayNames';
import Icon from '@components/Icon';
// eslint-disable-next-line no-restricted-imports
import {BackArrow, DotIndicator} from '@components/Icon/Expensicons';
import LoadingBar from '@components/LoadingBar';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import OnboardingHelpDropdownButton from '@components/OnboardingHelpDropdownButton';
import ParentNavigationSubtitle from '@components/ParentNavigationSubtitle';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import ReportActionAvatars from '@components/ReportActionAvatars';
import ReportHeaderSkeletonView from '@components/ReportHeaderSkeletonView';
import SearchButton from '@components/Search/SearchRouter/SearchButton';
import HelpButton from '@components/SidePanel/HelpComponents/HelpButton';
import TaskHeaderActionButton from '@components/TaskHeaderActionButton';
import Text from '@components/Text';
import Tooltip from '@components/Tooltip';
import useAncestors from '@hooks/useAncestors';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useHasTeam2025Pricing from '@hooks/useHasTeam2025Pricing';
import useLoadingBarVisibility from '@hooks/useLoadingBarVisibility';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import useReportIsArchived from '@hooks/useReportIsArchived';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSubscriptionPlan from '@hooks/useSubscriptionPlan';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import FS from '@libs/Fullstory';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import Navigation from '@libs/Navigation/Navigation';
import {getPersonalDetailsForAccountIDs} from '@libs/OptionsListUtils';
import Parser from '@libs/Parser';
import {
    canJoinChat,
    canUserPerformWriteAction,
    getChatRoomSubtitle,
    getDisplayNamesWithTooltips,
    getParentNavigationSubtitle,
    getParticipantsAccountIDsForDisplay,
    getPolicyDescriptionText,
    getPolicyName,
    getReportDescription,
    getReportName,
    hasReportNameError,
    isAdminRoom,
    isArchivedReport,
    isChatRoom as isChatRoomReportUtils,
    isChatThread as isChatThreadReportUtils,
    isChatUsedForOnboarding as isChatUsedForOnboardingReportUtils,
    isCurrentUserSubmitter,
    isDeprecatedGroupDM,
    isExpenseRequest,
    isGroupChat as isGroupChatReportUtils,
    isInvoiceRoom,
    isOneTransactionThread,
    isOpenTaskReport,
    isPolicyExpenseChat as isPolicyExpenseChatReportUtils,
    isSelfDM as isSelfDMReportUtils,
    isTaskReport as isTaskReportReportUtils,
    navigateToDetailsPage,
    shouldDisableDetailPage as shouldDisableDetailPageReportUtils,
    shouldReportShowSubscript,
} from '@libs/ReportUtils';
import {shouldShowDiscountBanner} from '@libs/SubscriptionUtils';
import EarlyDiscountBanner from '@pages/settings/Subscription/CardSection/BillingBanner/EarlyDiscountBanner';
import FreeTrial from '@pages/settings/Subscription/FreeTrial';
import {joinRoom} from '@userActions/Report';
import {callFunctionIfActionIsAllowed} from '@userActions/Session';
import {deleteTask} from '@userActions/Task';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import type {Report, ReportAction} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

type HeaderViewProps = {
    /** Toggles the navigationMenu open and closed */
    onNavigationMenuButtonClicked: () => void;

    /** The report currently being looked at */
    report: OnyxEntry<Report>;

    /** The report action the transaction is tied to from the parent report */
    parentReportAction: OnyxEntry<ReportAction> | null;

    /** The reportID of the current report */
    reportID: string | undefined;

    /** Whether we should display the header as in narrow layout */
    shouldUseNarrowLayout?: boolean;
};

function HeaderView({report, parentReportAction, onNavigationMenuButtonClicked, shouldUseNarrowLayout = false}: HeaderViewProps) {
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();
    const route = useRoute();
    const [isDeleteTaskConfirmModalVisible, setIsDeleteTaskConfirmModalVisible] = React.useState(false);
    const invoiceReceiverPolicyID = report?.invoiceReceiver && 'policyID' in report.invoiceReceiver ? report.invoiceReceiver.policyID : undefined;
    const [invoiceReceiverPolicy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${invoiceReceiverPolicyID}`, {canBeMissing: true});
    const [parentReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(report?.parentReportID) ?? getNonEmptyStringOnyxID(report?.reportID)}`, {canBeMissing: true});
    const [grandParentReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(parentReport?.parentReportID)}`, {canBeMissing: true});
    const [grandParentReportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${getNonEmptyStringOnyxID(parentReport?.parentReportID)}`, {canBeMissing: true});
    const policy = usePolicy(report?.policyID);
    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {canBeMissing: true});
    const [userBillingFundID] = useOnyx(ONYXKEYS.NVP_BILLING_FUND_ID, {canBeMissing: true});
    const shouldShowLoadingBar = useLoadingBarVisibility();
    const [firstDayFreeTrial] = useOnyx(ONYXKEYS.NVP_FIRST_DAY_FREE_TRIAL, {canBeMissing: true});
    const [lastDayFreeTrial] = useOnyx(ONYXKEYS.NVP_LAST_DAY_FREE_TRIAL, {canBeMissing: true});
    const [account] = useOnyx(ONYXKEYS.ACCOUNT, {canBeMissing: true});
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const [reportNameValuePairs] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${report?.reportID}`, {canBeMissing: true});
    const [reportMetadata] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_METADATA}${report?.reportID}`, {canBeMissing: true});
    const isReportArchived = isArchivedReport(reportNameValuePairs);

    const {translate, localeCompare} = useLocalize();
    const theme = useTheme();
    const styles = useThemeStyles();
    const isSelfDM = isSelfDMReportUtils(report);
    const isGroupChat = isGroupChatReportUtils(report) || isDeprecatedGroupDM(report, isReportArchived);
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED, {canBeMissing: true});
    const allParticipants = getParticipantsAccountIDsForDisplay(report, false, true, undefined, reportMetadata);
    const shouldAddEllipsis = allParticipants?.length > CONST.DISPLAY_PARTICIPANTS_LIMIT;
    const participants = allParticipants.slice(0, CONST.DISPLAY_PARTICIPANTS_LIMIT);
    const isMultipleParticipant = participants.length > 1;

    const participantPersonalDetails = getPersonalDetailsForAccountIDs(participants, personalDetails);
    const displayNamesWithTooltips = getDisplayNamesWithTooltips(participantPersonalDetails, isMultipleParticipant, localeCompare, undefined, isSelfDM);

    const isChatThread = isChatThreadReportUtils(report);
    const isChatRoom = isChatRoomReportUtils(report);
    const isPolicyExpenseChat = isPolicyExpenseChatReportUtils(report);
    const isTaskReport = isTaskReportReportUtils(report);
    const reportHeaderData = !isTaskReport && !isChatThread && report?.parentReportID ? parentReport : report;
    const isParentOneTransactionThread = isOneTransactionThread(parentReport, grandParentReport, grandParentReportActions?.[`${parentReport?.parentReportActionID}`]);
    const parentNavigationReport = isParentOneTransactionThread ? parentReport : reportHeaderData;
    const isReportHeaderDataArchived = useReportIsArchived(reportHeaderData?.reportID);
    // Use sorted display names for the title for group chats on native small screen widths
    const title = getReportName(reportHeaderData, policy, parentReportAction, personalDetails, invoiceReceiverPolicy, undefined, undefined, isReportHeaderDataArchived);
    const subtitle = getChatRoomSubtitle(reportHeaderData, false, isReportHeaderDataArchived);
    const isParentReportHeaderDataArchived = useReportIsArchived(reportHeaderData?.parentReportID);
    const parentNavigationSubtitleData = getParentNavigationSubtitle(parentNavigationReport, isParentReportHeaderDataArchived);
    const reportDescription = Parser.htmlToText(getReportDescription(report));
    const policyName = getPolicyName({report, returnEmptyIfNotFound: true});
    const policyDescription = getPolicyDescriptionText(policy);
    const isPersonalExpenseChat = isPolicyExpenseChat && isCurrentUserSubmitter(report);
    const hasTeam2025Pricing = useHasTeam2025Pricing();
    const subscriptionPlan = useSubscriptionPlan();
    const ancestors = useAncestors(report);
    const displayNamesFSClass = FS.getChatFSClass(personalDetails, report);

    const shouldShowSubtitle = () => {
        if (!subtitle) {
            return false;
        }
        if (isInvoiceRoom(reportHeaderData)) {
            return true;
        }
        if (isChatRoom) {
            return !reportDescription;
        }
        if (isPolicyExpenseChat) {
            return !policyDescription;
        }
        return true;
    };

    const shouldShowGuideBooking =
        !!account &&
        account?.guideDetails?.email !== CONST.EMAIL.CONCIERGE &&
        !!account?.guideDetails?.calendarLink &&
        isAdminRoom(report) &&
        !!canUserPerformWriteAction(report, isReportArchived) &&
        !isChatThread &&
        introSelected?.companySize !== CONST.ONBOARDING_COMPANY_SIZE.MICRO;

    const join = callFunctionIfActionIsAllowed(() => joinRoom(report));

    const canJoin = canJoinChat(report, parentReportAction, policy, isReportArchived);

    const joinButton = (
        <Button
            success
            text={translate('common.join')}
            onPress={join}
        />
    );

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

    // If the onboarding report is directly loaded, shouldShowDiscountBanner can return wrong value as it is not
    // linked to the react lifecycle directly. Wait for trial dates to load, before calculating.
    const shouldShowDiscount = useMemo(
        () => shouldShowDiscountBanner(hasTeam2025Pricing, subscriptionPlan, firstDayFreeTrial, lastDayFreeTrial, userBillingFundID) && !isReportArchived,
        // eslint-disable-next-line react-compiler/react-compiler
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [firstDayFreeTrial, lastDayFreeTrial, hasTeam2025Pricing, reportNameValuePairs, subscriptionPlan, userBillingFundID],
    );

    const shouldShowSubscript = shouldReportShowSubscript(report, isReportArchived);
    const defaultSubscriptSize = isExpenseRequest(report) ? CONST.AVATAR_SIZE.SMALL_NORMAL : CONST.AVATAR_SIZE.DEFAULT;
    const brickRoadIndicator = hasReportNameError(report) ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : '';
    const shouldDisableDetailPage = shouldDisableDetailPageReportUtils(report);
    const shouldUseGroupTitle = isGroupChat && (!!report?.reportName || !isMultipleParticipant);
    const isLoading = !report?.reportID || !title;
    const isParentReportLoading = !!report?.parentReportID && !parentReport;

    const isReportInRHP = route.name === SCREENS.SEARCH.REPORT_RHP;
    const shouldDisplaySearchRouter = !isReportInRHP || isSmallScreenWidth;
    const [onboardingPurposeSelected] = useOnyx(ONYXKEYS.ONBOARDING_PURPOSE_SELECTED, {canBeMissing: true});
    const isChatUsedForOnboarding = isChatUsedForOnboardingReportUtils(report, onboardingPurposeSelected);
    const shouldShowRegisterForWebinar = introSelected?.companySize === CONST.ONBOARDING_COMPANY_SIZE.MICRO && (isChatUsedForOnboarding || (isAdminRoom(report) && !isChatThread));
    const shouldShowOnBoardingHelpDropdownButton = (shouldShowRegisterForWebinar || shouldShowGuideBooking) && !isReportArchived;
    const shouldShowEarlyDiscountBanner = shouldShowDiscount && isChatUsedForOnboarding;
    const latestScheduledCall = reportNameValuePairs?.calendlyCalls?.at(-1);
    const hasActiveScheduledCall = latestScheduledCall && !isPast(latestScheduledCall.eventTime) && latestScheduledCall.status !== CONST.SCHEDULE_CALL_STATUS.CANCELLED;

    const onboardingHelpDropdownButton = (
        <OnboardingHelpDropdownButton
            reportID={report?.reportID}
            shouldUseNarrowLayout={shouldUseNarrowLayout}
            shouldShowRegisterForWebinar={shouldShowRegisterForWebinar}
            shouldShowGuideBooking={shouldShowGuideBooking}
            hasActiveScheduledCall={hasActiveScheduledCall}
        />
    );

    const multipleAvatars = (
        <ReportActionAvatars
            reportID={report?.reportID}
            size={shouldShowSubscript ? defaultSubscriptSize : undefined}
            singleAvatarContainerStyle={[styles.actionAvatar, styles.mr3]}
        />
    );

    return (
        <>
            <View
                style={[styles.borderBottom]}
                dataSet={{dragArea: true}}
            >
                <View style={[styles.appContentHeader, styles.pr3]}>
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
                                                src={BackArrow}
                                                fill={theme.icon}
                                            />
                                        </View>
                                    </Tooltip>
                                </PressableWithoutFeedback>
                            )}
                            <View style={[styles.flex1, styles.flexRow, styles.alignItemsCenter, styles.justifyContentBetween]}>
                                <PressableWithoutFeedback
                                    onPress={() => navigateToDetailsPage(report, Navigation.getReportRHPActiveRoute(), true)}
                                    style={[styles.flexRow, styles.alignItemsCenter, styles.flex1]}
                                    disabled={shouldDisableDetailPage}
                                    accessibilityLabel={title}
                                    role={CONST.ROLE.BUTTON}
                                >
                                    {shouldShowSubscript ? multipleAvatars : <OfflineWithFeedback pendingAction={report?.pendingFields?.avatar}>{multipleAvatars}</OfflineWithFeedback>}
                                    <View
                                        fsClass={CONST.FULLSTORY.CLASS.UNMASK}
                                        style={[styles.flex1, styles.flexColumn]}
                                    >
                                        <CaretWrapper>
                                            <DisplayNames
                                                fullTitle={title}
                                                displayNamesWithTooltips={displayNamesWithTooltips}
                                                tooltipEnabled
                                                numberOfLines={1}
                                                textStyles={[styles.headerText, styles.pre]}
                                                shouldUseFullTitle={isChatRoom || isPolicyExpenseChat || isChatThread || isTaskReport || shouldUseGroupTitle || isReportArchived}
                                                renderAdditionalText={renderAdditionalText}
                                                shouldAddEllipsis={shouldAddEllipsis}
                                                forwardedFSClass={displayNamesFSClass}
                                            />
                                        </CaretWrapper>
                                        {!isEmptyObject(parentNavigationSubtitleData) && (
                                            <ParentNavigationSubtitle
                                                parentNavigationSubtitleData={parentNavigationSubtitleData}
                                                parentReportID={parentNavigationReport?.parentReportID}
                                                parentReportActionID={isParentOneTransactionThread ? undefined : parentNavigationReport?.parentReportActionID}
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
                                        {isChatRoom && !isInvoiceRoom(reportHeaderData) && !!reportDescription && isEmptyObject(parentNavigationSubtitleData) && (
                                            <View style={[styles.alignSelfStart, styles.mw100]}>
                                                <Text
                                                    style={[styles.sidebarLinkText, styles.optionAlternateText, styles.textLabelSupporting]}
                                                    numberOfLines={1}
                                                >
                                                    {reportDescription}
                                                </Text>
                                            </View>
                                        )}
                                        {isPolicyExpenseChat && !!policyDescription && isEmptyObject(parentNavigationSubtitleData) && (
                                            <View style={[styles.alignSelfStart, styles.mw100]}>
                                                <Text
                                                    style={[styles.sidebarLinkText, styles.optionAlternateText, styles.textLabelSupporting]}
                                                    numberOfLines={1}
                                                >
                                                    {policyDescription}
                                                </Text>
                                            </View>
                                        )}
                                    </View>
                                    {brickRoadIndicator === CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR && (
                                        <View style={[styles.alignItemsCenter, styles.justifyContentCenter]}>
                                            <Icon
                                                src={DotIndicator}
                                                fill={theme.danger}
                                            />
                                        </View>
                                    )}
                                </PressableWithoutFeedback>
                                <View style={[styles.reportOptions, styles.flexRow, styles.alignItemsCenter, styles.gap2]}>
                                    {shouldShowOnBoardingHelpDropdownButton && !shouldUseNarrowLayout && onboardingHelpDropdownButton}
                                    {!shouldUseNarrowLayout && !shouldShowDiscount && isChatUsedForOnboarding && (
                                        <FreeTrial
                                            pressable
                                            success={!hasActiveScheduledCall}
                                        />
                                    )}
                                    {!shouldUseNarrowLayout && isOpenTaskReport(report, parentReportAction) && <TaskHeaderActionButton report={report} />}
                                    {!isParentReportLoading && canJoin && !shouldUseNarrowLayout && joinButton}
                                </View>
                                <HelpButton style={styles.ml2} />
                                {shouldDisplaySearchRouter && <SearchButton />}
                            </View>
                            <ConfirmModal
                                isVisible={isDeleteTaskConfirmModalVisible}
                                onConfirm={() => {
                                    setIsDeleteTaskConfirmModalVisible(false);
                                    deleteTask(report, isReportArchived, currentUserPersonalDetails.accountID, ancestors);
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
                {!isParentReportLoading && !isLoading && canJoin && shouldUseNarrowLayout && <View style={[styles.ph5, styles.pb2]}>{joinButton}</View>}
                <View style={shouldShowOnBoardingHelpDropdownButton && [styles.flexRow, styles.alignItemsCenter, styles.gap1, styles.ph5]}>
                    {!shouldShowEarlyDiscountBanner && shouldShowOnBoardingHelpDropdownButton && shouldUseNarrowLayout && (
                        <View style={[styles.flex1, styles.pb3]}>{onboardingHelpDropdownButton}</View>
                    )}
                    {!isLoading && !shouldShowDiscount && isChatUsedForOnboarding && shouldUseNarrowLayout && (
                        <FreeTrial
                            pressable
                            addSpacing
                            success={!hasActiveScheduledCall}
                            inARow={shouldShowOnBoardingHelpDropdownButton}
                        />
                    )}
                </View>
                {!!report && shouldUseNarrowLayout && isOpenTaskReport(report, parentReportAction) && (
                    <View style={[styles.appBG, styles.pl0]}>
                        <View style={[styles.ph5, styles.pb3]}>
                            <TaskHeaderActionButton report={report} />
                        </View>
                    </View>
                )}
                <LoadingBar shouldShow={shouldShowLoadingBar && shouldUseNarrowLayout} />
            </View>
            {shouldShowEarlyDiscountBanner && (
                <EarlyDiscountBanner
                    onboardingHelpDropdownButton={shouldUseNarrowLayout && shouldShowOnBoardingHelpDropdownButton ? onboardingHelpDropdownButton : undefined}
                    isSubscriptionPage={false}
                    hasActiveScheduledCall={hasActiveScheduledCall}
                />
            )}
        </>
    );
}

HeaderView.displayName = 'HeaderView';

export default memo(HeaderView);
