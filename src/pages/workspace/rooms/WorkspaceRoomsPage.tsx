import Button from '@components/ButtonComposed';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import {usePersonalDetails} from '@components/OnyxListItemProvider';
import ScreenWrapper from '@components/ScreenWrapper';
import type {SortOrder} from '@components/Table/middlewares/sorting';
import WorkspaceRoomsTable from '@components/Tables/WorkspaceRoomsTable';
import type {WorkspaceRoomRowData} from '@components/Tables/WorkspaceRoomsTable';

import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDebouncedState from '@hooks/useDebouncedState';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import {useDerivedReportNamesByReportIDs} from '@hooks/useReportAttributes';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import useWorkspaceDocumentTitle from '@hooks/useWorkspaceDocumentTitle';

import {openPolicyRoomsPage} from '@libs/actions/Policy/Room';
import {openReport} from '@libs/actions/Report';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import {isArchivedPolicy, isPolicyAdmin} from '@libs/PolicyUtils';
import {getReportName} from '@libs/ReportNameUtils';
import {getParticipantsAccountIDsForDisplay} from '@libs/ReportUtils';

import type {WorkspaceSplitNavigatorParamList} from '@navigation/types';

import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

import {useIsFocused} from '@react-navigation/native';
import {guidedSetupAndTourStatusSelector} from '@selectors/Onboarding';
import {policyChatRoomsSelector} from '@selectors/Report';
import React, {useEffect, useState} from 'react';
import {View} from 'react-native';

type WorkspaceRoomsPageProps = PlatformStackScreenProps<WorkspaceSplitNavigatorParamList, typeof SCREENS.WORKSPACE.ROOMS>;

type WorkspaceRoomsTableSortColumn = 'name' | 'members';

function WorkspaceRoomsPage({route}: WorkspaceRoomsPageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {isOffline} = useNetwork();
    const isFocused = useIsFocused();
    const headerIcons = useMemoizedLazyExpensifyIcons(['Plus']);
    const policyID = route.params.policyID;
    const policy = usePolicy(policyID);
    const isAdmin = isPolicyAdmin(policy);
    const isArchived = isArchivedPolicy(policy);
    useWorkspaceDocumentTitle(policy?.name, 'workspace.common.rooms');

    const [reportNameValuePairs] = useOnyx(ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS);
    const personalDetails = usePersonalDetails();
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const [betas] = useOnyx(ONYXKEYS.BETAS);
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const [conciergeChat] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${conciergeReportID}`);
    const [guidedSetupAndTourStatus] = useOnyx(ONYXKEYS.NVP_ONBOARDING, {selector: guidedSetupAndTourStatusSelector});
    const {accountID: currentUserAccountID} = useCurrentUserPersonalDetails();
    const [, debouncedSearchTerm, setSearchTerm] = useDebouncedState('');
    const [roomSort, setRoomSort] = useState<{columnKey: WorkspaceRoomsTableSortColumn; order: SortOrder}>({
        columnKey: 'name',
        order: 'asc',
    });
    const [roomsMetadata] = useOnyx(ONYXKEYS.POLICY_ROOMS_METADATA, {selector: (metadata) => metadata?.[policyID]});

    const searchValue = debouncedSearchTerm.trim();
    const sortBy = roomSort.columnKey;

    // The backend applies the search term and the sorting, so a change to either produces a different result set that
    // has to restart at the first page.
    const roomsQueryKey = `${policyID}|${searchValue}|${sortBy}|${roomSort.order}`;
    const [pagination, setPagination] = useState({queryKey: roomsQueryKey, pageNumber: 1});

    // When the roomsMetadata doesn't exist and pageNumber > 1, it means we have the stale data and need to reset.
    if (pagination.queryKey !== roomsQueryKey || (!roomsMetadata && pagination.pageNumber !== 1)) {
        setPagination({queryKey: roomsQueryKey, pageNumber: 1});
    }
    const pageNumber = pagination.pageNumber;

    const [policyReports] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {selector: policyChatRoomsSelector(policyID, reportNameValuePairs)});
    const [hasReportActions] = useOnyx(ONYXKEYS.COLLECTION.REPORT_ACTIONS, {
        selector: (reportActions) => {
            return policyReports?.reduce(
                (acc, curr) => {
                    acc[curr.reportID] = !!reportActions?.[curr.reportID];
                    return acc;
                },
                {} as Record<string, boolean>,
            );
        },
    });
    const policyReportIDs = (policyReports ?? []).map((report) => report.reportID);
    const derivedNames = useDerivedReportNamesByReportIDs(policyReportIDs);

    // The newly created room reportID is stored in Onyx right before navigating back here so its row can play the highlight animation.
    // It is cleared by the create page once the navigation transition ends (see WorkspaceNewRoomPage), so the animation doesn't replay on a later visit.
    const [roomIDToHighlight] = useOnyx(ONYXKEYS.ROOM_ID_HIGHLIGHT_ON_ROOMS_PAGE);
    const highlightedReportID = roomIDToHighlight ?? undefined;

    const rooms: WorkspaceRoomRowData[] = (policyReports ?? []).map((report) => ({
        keyForList: report.reportID,
        reportID: report.reportID,
        name: getReportName(report, derivedNames?.[report.reportID]),
        memberCount: getParticipantsAccountIDsForDisplay(report, true, false, false, undefined, personalDetails).length,
        action: () => {
            if (isAdmin) {
                // Admins open the details RHP directly instead of the room report, so the report is never fetched via ReportScreen.
                // Fetch it here so the RHP has full data (participants, metadata) for Join, Invite and renaming.
                // shouldMarkAsRead is false because the user only views the room details, not the conversation itself.
                openReport({
                    reportID: report.reportID,
                    introSelected,
                    conciergeChat,
                    betas,
                    shouldMarkAsRead: false,
                    hasReportActions: !!hasReportActions?.[report.reportID],
                    currentUserAccountID,
                    isSelfTourViewed: guidedSetupAndTourStatus?.isSelfTourViewed,
                    hasCompletedGuidedSetupFlow: guidedSetupAndTourStatus?.hasCompletedGuidedSetupFlow,
                });
                Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.REPORT_DETAILS.getRoute(report.reportID)));
                return;
            }
            Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(report.reportID));
        },
    }));

    // The fetch is driven by the requested page: loading more only bumps `pageNumber` and this effect issues the
    // request, the same way Search drives its own pagination from `offset`. Refocusing and coming back online refetch
    // the page that is currently displayed.
    useEffect(() => {
        if (!isFocused || isOffline) {
            return;
        }

        openPolicyRoomsPage(policyID, pageNumber, sortBy, roomSort.order, searchValue);
    }, [isFocused, isOffline, pageNumber, policyID, roomSort.order, searchValue, sortBy]);

    const loadMoreRooms = () => {
        // The requested page is only bumped once the previous one has landed, so repeated end-reached events while
        // a page is in flight cannot skip a page.
        if (!roomsMetadata?.hasMoreResults || roomsMetadata?.isLoading || roomsMetadata?.pageNumber !== pageNumber || isOffline) {
            return;
        }
        // Storing the query alongside the page discards a bump that raced with a search or sort change instead of
        // applying it to the new result set.
        setPagination({queryKey: roomsQueryKey, pageNumber: pageNumber + 1});
    };

    const roomsTableHeader =
        shouldUseNarrowLayout && !isArchived ? (
            <View style={[styles.ph5, styles.pb3]}>
                <Button
                    variant={CONST.BUTTON_VARIANT.SUCCESS}
                    onPress={() => Navigation.navigate(ROUTES.WORKSPACE_ROOM_CREATE.getRoute(policyID))}
                    style={styles.w100}
                >
                    <Button.Icon src={headerIcons.Plus} />
                    <Button.Text>{translate('common.create')}</Button.Text>
                </Button>
            </View>
        ) : undefined;

    return (
        <AccessOrNotFoundWrapper policyID={policyID}>
            <ScreenWrapper
                testID={WorkspaceRoomsPage.displayName}
                style={[styles.defaultModalContainer]}
                shouldEnableMaxHeight
                shouldShowOfflineIndicatorInWideScreen
                enableEdgeToEdgeBottomSafeAreaPadding
            >
                <HeaderWithBackButton
                    title={translate('workspace.common.rooms')}
                    shouldUseHeadlineHeader
                    shouldShowBackButton={shouldUseNarrowLayout}
                    onBackButtonPress={Navigation.goBack}
                    shouldDisplayHelpButton
                >
                    {!shouldUseNarrowLayout && !isArchived && (
                        <Button
                            variant={CONST.BUTTON_VARIANT.SUCCESS}
                            onPress={() => Navigation.navigate(ROUTES.WORKSPACE_ROOM_CREATE.getRoute(policyID))}
                        >
                            <Button.Icon src={headerIcons.Plus} />
                            <Button.Text>{translate('common.create')}</Button.Text>
                        </Button>
                    )}
                </HeaderWithBackButton>

                <WorkspaceRoomsTable
                    rooms={rooms}
                    policyID={policyID}
                    highlightedReportID={highlightedReportID}
                    onSearchStringChange={setSearchTerm}
                    onEndReached={loadMoreRooms}
                    onSortingChange={(sorting) => setRoomSort({columnKey: sorting.columnKey === 'members' ? 'members' : 'name', order: sorting.order})}
                    headerComponent={roomsTableHeader}
                />
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

WorkspaceRoomsPage.displayName = 'WorkspaceRoomsPage';

export default WorkspaceRoomsPage;
