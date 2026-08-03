import Button from '@components/Button';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import {usePersonalDetails} from '@components/OnyxListItemProvider';
import ScreenWrapper from '@components/ScreenWrapper';
import type {SortOrder} from '@components/Table/middlewares/sorting';
import WorkspaceRoomsTable from '@components/Tables/WorkspaceRoomsTable';
import type {WorkspaceRoomRowData} from '@components/Tables/WorkspaceRoomsTable';

import useDebouncedState from '@hooks/useDebouncedState';
import {useMemoizedLazyExpensifyIcons, useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import useReportAttributes from '@hooks/useReportAttributes';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import useWorkspaceDocumentTitle from '@hooks/useWorkspaceDocumentTitle';

import {openPolicyRoomsPage} from '@libs/actions/Policy/Room';
import {openReport} from '@libs/actions/Report';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import {isPolicyAdmin} from '@libs/PolicyUtils';
import {deprecatedGetReportName} from '@libs/ReportNameUtils';
import {getParticipantsAccountIDsForDisplay} from '@libs/ReportUtils';

import type {WorkspaceSplitNavigatorParamList} from '@navigation/types';

import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';

import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

import {useFocusEffect} from '@react-navigation/native';
import {policyChatRoomsSelector} from '@selectors/Report';
import React, {useCallback, useMemo, useRef, useState} from 'react';
import {View} from 'react-native';

type WorkspaceRoomsPageProps = PlatformStackScreenProps<WorkspaceSplitNavigatorParamList, typeof SCREENS.WORKSPACE.ROOMS>;

type WorkspaceRoomsTableSortColumn = 'name' | 'members';

const ROOMS_PAGE_SIZE = 25;

function WorkspaceRoomsPage({route}: WorkspaceRoomsPageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const headerIcons = useMemoizedLazyExpensifyIcons(['Plus']);
    const illustrations = useMemoizedLazyIllustrations(['Hashtag']);
    const policyID = route.params.policyID;
    const policy = usePolicy(policyID);
    const isAdmin = isPolicyAdmin(policy);
    useWorkspaceDocumentTitle(policy?.name, 'workspace.common.rooms');

    const reportAttributes = useReportAttributes();
    const [reportNameValuePairs] = useOnyx(ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS);
    const personalDetails = usePersonalDetails();
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const [betas] = useOnyx(ONYXKEYS.BETAS);
    const [, debouncedSearchTerm, setSearchTerm] = useDebouncedState('');
    const [roomSort, setRoomSort] = useState<{columnKey: WorkspaceRoomsTableSortColumn; order: SortOrder}>({
        columnKey: 'name',
        order: 'asc',
    });
    const [hasMoreResults, setHasMoreResults] = useState(false);
    const [isLoadingMoreRooms, setIsLoadingMoreRooms] = useState(false);

    // The highest page that the backend has returned for the active search and sorting. It is a ref because it only
    // feeds the next request and must not re-trigger the fetch effect.
    const loadedPageNumberRef = useRef(0);
    const requestIDRef = useRef(0);

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

    // The newly created room reportID is stored in Onyx right before navigating back here so its row can play the highlight animation.
    // It is cleared by the create page once the navigation transition ends (see WorkspaceNewRoomPage), so the animation doesn't replay on a later visit.
    const [roomIDToHighlight] = useOnyx(ONYXKEYS.ROOM_ID_HIGHLIGHT_ON_ROOMS_PAGE);
    const highlightedReportID = roomIDToHighlight ?? undefined;

    const rooms: WorkspaceRoomRowData[] = useMemo(
        () =>
            (policyReports ?? []).map((report) => ({
                keyForList: report.reportID,
                reportID: report.reportID,
                name: deprecatedGetReportName(report, reportAttributes),
                memberCount: getParticipantsAccountIDsForDisplay(report, true, false, false, undefined, personalDetails).length,
                action: () => {
                    if (isAdmin) {
                        // Admins open the details RHP directly instead of the room report, so the report is never fetched via ReportScreen.
                        // Fetch it here so the RHP has full data (participants, metadata) for Join, Invite and renaming.
                        // shouldMarkAsRead is false because the user only views the room details, not the conversation itself.
                        openReport({reportID: report.reportID, introSelected, betas, shouldMarkAsRead: false, hasReportActions: !!hasReportActions?.[report.reportID]});
                        Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.REPORT_DETAILS.getRoute(report.reportID)));
                        return;
                    }
                    Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(report.reportID));
                },
            })),
        [betas, hasReportActions, introSelected, isAdmin, personalDetails, policyReports, reportAttributes],
    );

    const fetchRoomsPage = useCallback(
        (pageNumber: number) => {
            requestIDRef.current += 1;
            const requestID = requestIDRef.current;
            setIsLoadingMoreRooms(pageNumber > 1);

            openPolicyRoomsPage(policyID, {
                pageNumber,
                pageSize: ROOMS_PAGE_SIZE,
                searchValue: debouncedSearchTerm.trim(),
                sortBy: roomSort.columnKey === 'members' ? 'memberCount' : 'name',
                sortOrder: roomSort.order,
            })
                .then((response) => {
                    // A newer request (another search, sort or page) was fired while this one was in flight, so its
                    // result no longer describes the list that is being displayed.
                    if (requestID !== requestIDRef.current) {
                        return;
                    }
                    loadedPageNumberRef.current = pageNumber;
                    setHasMoreResults(!!response?.hasMoreResults);
                    setIsLoadingMoreRooms(false);
                })
                .catch(() => {
                    // The last successfully loaded page is left untouched so scrolling to the end again retries this page.
                    if (requestID !== requestIDRef.current) {
                        return;
                    }
                    setIsLoadingMoreRooms(false);
                });
        },
        [debouncedSearchTerm, policyID, roomSort.columnKey, roomSort.order],
    );

    // Fetching happens on focus (which also covers the initial mount) and whenever the search term or the sorting
    // changes, since both are applied by the backend and restart the pagination from the first page.
    useFocusEffect(
        useCallback(() => {
            loadedPageNumberRef.current = 0;
            setHasMoreResults(false);
            fetchRoomsPage(1);
        }, [fetchRoomsPage]),
    );

    const loadMoreRooms = () => {
        if (!hasMoreResults || isLoadingMoreRooms || loadedPageNumberRef.current === 0) {
            return;
        }
        fetchRoomsPage(loadedPageNumberRef.current + 1);
    };

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
                    icon={illustrations.Hashtag}
                    shouldUseHeadlineHeader
                    shouldShowBackButton={shouldUseNarrowLayout}
                    onBackButtonPress={Navigation.goBack}
                    shouldDisplayHelpButton
                >
                    {!shouldUseNarrowLayout && (
                        <Button
                            success
                            onPress={() => Navigation.navigate(ROUTES.WORKSPACE_ROOM_CREATE.getRoute(policyID))}
                            icon={headerIcons.Plus}
                            text={translate('common.create')}
                        />
                    )}
                </HeaderWithBackButton>

                {shouldUseNarrowLayout && (
                    <View style={[styles.ph5, styles.pb3]}>
                        <Button
                            success
                            onPress={() => Navigation.navigate(ROUTES.WORKSPACE_ROOM_CREATE.getRoute(policyID))}
                            icon={headerIcons.Plus}
                            text={translate('common.create')}
                            style={styles.w100}
                        />
                    </View>
                )}

                <WorkspaceRoomsTable
                    rooms={rooms}
                    policyID={policyID}
                    highlightedReportID={highlightedReportID}
                    onSearchStringChange={setSearchTerm}
                    isLoadingMoreRooms={isLoadingMoreRooms}
                    onEndReached={loadMoreRooms}
                    onSortingChange={(sorting: {columnKey: string | undefined; order: SortOrder}) => {
                        if (!sorting.columnKey || sorting.columnKey === 'name') {
                            setRoomSort({columnKey: 'name', order: sorting.order});
                            return;
                        }

                        setRoomSort({columnKey: 'members', order: sorting.order});
                    }}
                />
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

WorkspaceRoomsPage.displayName = 'WorkspaceRoomsPage';

export default WorkspaceRoomsPage;
