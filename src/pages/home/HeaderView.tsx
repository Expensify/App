import {useRoute} from '@react-navigation/native';
import React, {memo, useEffect, useMemo, useState} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {useOnyx} from 'react-native-onyx';
import Button from '@components/Button';
import CaretWrapper from '@components/CaretWrapper';
import ConfirmModal from '@components/ConfirmModal';
import DisplayNames from '@components/DisplayNames';
import Icon from '@components/Icon';
import {BackArrow, CalendarSolid, DotIndicator, FallbackAvatar} from '@components/Icon/Expensicons';
import LoadingBar from '@components/LoadingBar';
import MultipleAvatars from '@components/MultipleAvatars';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import ParentNavigationSubtitle from '@components/ParentNavigationSubtitle';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import ReportHeaderSkeletonView from '@components/ReportHeaderSkeletonView';
import SearchButton from '@components/Search/SearchRouter/SearchButton';
import HelpButton from '@components/SidePane/HelpButton';
import SubscriptAvatar from '@components/SubscriptAvatar';
import TaskHeaderActionButton from '@components/TaskHeaderActionButton';
import Text from '@components/Text';
import Tooltip from '@components/Tooltip';
import useLocalize from '@hooks/useLocalize';
import usePolicy from '@hooks/usePolicy';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {openExternalLink} from '@libs/actions/Link';
import {getAssignedSupportData} from '@libs/actions/Policy/Policy';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import Navigation from '@libs/Navigation/Navigation';
import {getPersonalDetailsForAccountIDs} from '@libs/OptionsListUtils';
import Parser from '@libs/Parser';
import {
    canJoinChat,
    getChatRoomSubtitle,
    getDisplayNamesWithTooltips,
    getIcons,
    getParentNavigationSubtitle,
    getParticipantsAccountIDsForDisplay,
    getPolicyDescriptionText,
    getPolicyName,
    getReportDescription,
    getReportName,
    hasReportNameError,
    isArchivedReport,
    isChatRoom as isChatRoomReportUtils,
    isChatThread as isChatThreadReportUtils,
    isChatUsedForOnboarding as isChatUsedForOnboardingReportUtils,
    isCurrentUserSubmitter,
    isDeprecatedGroupDM,
    isExpenseRequest,
    isGroupChat as isGroupChatReportUtils,
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
import type {Icon as IconType} from '@src/types/onyx/OnyxCommon';
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

const fallbackIcon: IconType = {
    source: FallbackAvatar,
    type: CONST.ICON_TYPE_AVATAR,
    name: '',
    id: -1,
};

function HeaderView({report, parentReportAction, onNavigationMenuButtonClicked, shouldUseNarrowLayout = false}: HeaderViewProps) {
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();
    const route = useRoute();
    const [isDeleteTaskConfirmModalVisible, setIsDeleteTaskConfirmModalVisible] = React.useState(false);
    const invoiceReceiverPolicyID = report?.invoiceReceiver && 'policyID' in report.invoiceReceiver ? report.invoiceReceiver.policyID : undefined;
    const [invoiceReceiverPolicy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${invoiceReceiverPolicyID}`);
    const [parentReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(report?.parentReportID) ?? getNonEmptyStringOnyxID(report?.reportID)}`);
    const policy = usePolicy(report?.policyID);
    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST);
    const [isLoadingReportData] = useOnyx(ONYXKEYS.IS_LOADING_REPORT_DATA);
    const [firstDayFreeTrial] = useOnyx(ONYXKEYS.NVP_FIRST_DAY_FREE_TRIAL);
    const [lastDayFreeTrial] = useOnyx(ONYXKEYS.NVP_LAST_DAY_FREE_TRIAL);
    const [account] = useOnyx(ONYXKEYS.ACCOUNT);
    const [reportNameValuePairs] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${report?.reportID}`);
    const [isDismissedDiscountBanner, setIsDismissedDiscountBanner] = useState(false);

    const {translate} = useLocalize();
    const theme = useTheme();
    const styles = useThemeStyles();
    const isSelfDM = isSelfDMReportUtils(report);
    const isGroupChat = isGroupChatReportUtils(report) || isDeprecatedGroupDM(report);

    const allParticipants = getParticipantsAccountIDsForDisplay(report, false, true);
    const shouldAddEllipsis = allParticipants?.length > CONST.DISPLAY_PARTICIPANTS_LIMIT;
    const participants = allParticipants.slice(0, CONST.DISPLAY_PARTICIPANTS_LIMIT);
    const isMultipleParticipant = participants.length > 1;

    const participantPersonalDetails = getPersonalDetailsForAccountIDs(participants, personalDetails);
    const displayNamesWithTooltips = getDisplayNamesWithTooltips(participantPersonalDetails, isMultipleParticipant, undefined, isSelfDM);

    const isChatThread = isChatThreadReportUtils(report);
    const isChatRoom = isChatRoomReportUtils(report);
    const isPolicyExpenseChat = isPolicyExpenseChatReportUtils(report);
    const isTaskReport = isTaskReportReportUtils(report);
    const reportHeaderData = !isTaskReport && !isChatThread && report?.parentReportID ? parentReport : report;
    // Use sorted display names for the title for group chats on native small screen widths
    const title = getReportName(reportHeaderData, policy, parentReportAction, personalDetails, invoiceReceiverPolicy);
    const subtitle = getChatRoomSubtitle(reportHeaderData);
    const parentNavigationSubtitleData = getParentNavigationSubtitle(reportHeaderData);
    const reportDescription = Parser.htmlToText(getReportDescription(report));
    const policyName = getPolicyName({report, returnEmptyIfNotFound: true});
    const policyDescription = getPolicyDescriptionText(policy);
    const isPersonalExpenseChat = isPolicyExpenseChat && isCurrentUserSubmitter(report?.reportID);
    const policyID = report?.policyID;
    useEffect(() => {
        if (!policyID) {
            return;
        }
        getAssignedSupportData(policyID);
    }, [policyID]);

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

    const shouldShowGuideBooking = !!account && report?.reportID === account?.adminsRoomReportID && !!account?.guideDetails?.calendarLink;

    const join = callFunctionIfActionIsAllowed(() => joinRoom(report));

    const canJoin = canJoinChat(report, parentReportAction, policy);

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
    // eslint-disable-next-line react-compiler/react-compiler
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const shouldShowDiscount = useMemo(() => shouldShowDiscountBanner() && !isArchivedReport(reportNameValuePairs), [firstDayFreeTrial, lastDayFreeTrial, reportNameValuePairs]);

    const shouldShowSubscript = shouldReportShowSubscript(report);
    const defaultSubscriptSize = isExpenseRequest(report) ? CONST.AVATAR_SIZE.SMALL_NORMAL : CONST.AVATAR_SIZE.DEFAULT;
    const icons = getIcons(reportHeaderData, personalDetails, null, '', -1, policy, invoiceReceiverPolicy);
    const brickRoadIndicator = hasReportNameError(report) ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : '';
    const shouldDisableDetailPage = shouldDisableDetailPageReportUtils(report);
    const shouldUseGroupTitle = isGroupChat && (!!report?.reportName || !isMultipleParticipant);
    const isLoading = !report?.reportID || !title;
    const isParentReportLoading = !!report?.parentReportID && !parentReport;

    const isReportInRHP = route.name === SCREENS.SEARCH.REPORT_RHP;
    const shouldDisplaySearchRouter = !isReportInRHP || isSmallScreenWidth;
    const [onboardingPurposeSelected] = useOnyx(ONYXKEYS.ONBOARDING_PURPOSE_SELECTED);
    const isChatUsedForOnboarding = isChatUsedForOnboardingReportUtils(report, onboardingPurposeSelected);
    const shouldShowEarlyDiscountBanner = shouldShowDiscount && isChatUsedForOnboarding;
    const shouldShowGuideBookingButtonInEarlyDiscountBanner = shouldShowGuideBooking && shouldShowEarlyDiscountBanner && !isDismissedDiscountBanner;

    const guideBookingButton = (
        <Button
            success={!shouldShowGuideBookingButtonInEarlyDiscountBanner}
            text={translate('getAssistancePage.scheduleADemo')}
            onPress={() => {
                openExternalLink(account?.guideDetails?.calendarLink ?? '');
            }}
            style={shouldUseNarrowLayout && shouldShowGuideBookingButtonInEarlyDiscountBanner && [styles.flex1]}
            icon={CalendarSolid}
        />
    );

    const getGuideBookButtonStyles = () => {
        if (isChatUsedForOnboarding && !shouldShowDiscount) {
            return [styles.pb3, styles.pl5, styles.w50, styles.pr1];
        }
        return [styles.pb3, styles.ph5];
    };

    return (
        <>
            <View
                style={[styles.borderBottom]}
                dataSet={{dragArea: true}}
            >
                <View style={[styles.appContentHeader, styles.pr3, !shouldUseNarrowLayout && styles.headerBarDesktopHeight]}>
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
                                    onPress={() => navigateToDetailsPage(report, Navigation.getReportRHPActiveRoute())}
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
                                                shouldAddEllipsis={shouldAddEllipsis}
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
                                    {!shouldShowGuideBookingButtonInEarlyDiscountBanner && shouldShowGuideBooking && !shouldUseNarrowLayout && guideBookingButton}
                                    {!shouldUseNarrowLayout && !shouldShowDiscount && isChatUsedForOnboarding && (
                                        <FreeTrial
                                            pressable
                                            success={!shouldShowGuideBooking}
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
                                    deleteTask(report);
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
                <View style={isChatUsedForOnboarding && !shouldShowDiscount && shouldShowGuideBooking && [styles.dFlex, styles.flexRow]}>
                    {!shouldShowGuideBookingButtonInEarlyDiscountBanner && !isLoading && shouldShowGuideBooking && shouldUseNarrowLayout && (
                        <View style={getGuideBookButtonStyles()}>{guideBookingButton}</View>
                    )}
                    {!isLoading && !shouldShowDiscount && isChatUsedForOnboarding && shouldUseNarrowLayout && (
                        <FreeTrial
                            pressable
                            addSpacing
                            success={!shouldShowGuideBooking}
                            inARow={shouldShowGuideBooking}
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
                <LoadingBar shouldShow={(isLoadingReportData && shouldUseNarrowLayout) ?? false} />
            </View>
            {shouldShowEarlyDiscountBanner && (
                <EarlyDiscountBanner
                    GuideBookingButton={shouldShowGuideBookingButtonInEarlyDiscountBanner ? guideBookingButton : undefined}
                    isSubscriptionPage={false}
                    onDismissedDiscountBanner={() => setIsDismissedDiscountBanner(true)}
                />
            )}
        </>
    );
}

HeaderView.displayName = 'HeaderView';

export default memo(HeaderView);
